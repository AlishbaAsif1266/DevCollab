import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @desc    Create new task in project
// @route   POST /api/projects/:projectId/tasks
// @access  Private
export const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignees, status, priority, dueDate, tags } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Check membership
    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!isMember && project.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Access denied to this project workspace');
    }

    let parsedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        parsedTags = tags;
      } else if (typeof tags === 'string') {
        parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    const task = await Task.create({
      title,
      description: description || '',
      project: projectId,
      assignees: assignees || [],
      createdBy: req.user._id,
      status: status || 'To Do',
      priority: priority || 'Medium',
      dueDate: dueDate || undefined,
      tags: parsedTags,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email avatar')
      .populate('assignees', 'name email avatar role');

    // Real-Time Socket Broadcast to Project Room
    if (req.io) {
      req.io.to(`project_${projectId}`).emit('task_created', populatedTask);

      // Also notify assigned members individually
      if (assignees && assignees.length > 0) {
        assignees.forEach((assigneeId) => {
          req.io.to(`user_${assigneeId}`).emit('task_assigned', {
            taskId: task._id,
            taskTitle: task.title,
            projectTitle: project.title,
            assignedBy: req.user.name,
          });
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
export const getProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, priority, search } = req.query;

    const project = await Project.findById(projectId);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    let query = { project: projectId };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const tasks = await Task.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('assignees', 'name email avatar role')
      .populate('comments.author', 'name email avatar')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task details
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('assignees', 'name email avatar role')
      .populate('comments.author', 'name email avatar');

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    res.json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details / Kanban drag & drop
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const { title, description, assignees, status, priority, dueDate, tags } = req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignees) task.assignees = assignees;

    if (tags) {
      if (Array.isArray(tags)) {
        task.tags = tags;
      } else if (typeof tags === 'string') {
        task.tags = tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email avatar')
      .populate('assignees', 'name email avatar role')
      .populate('comments.author', 'name email avatar');

    // Real-Time Socket Broadcast
    if (req.io) {
      req.io.to(`project_${task.project}`).emit('task_updated', updatedTask);
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const projectId = task.project;

    await task.deleteOne();

    // Real-Time Socket Broadcast
    if (req.io) {
      req.io.to(`project_${projectId}`).emit('task_deleted', req.params.id);
    }

    res.json({
      success: true,
      message: 'Task removed successfully',
      taskId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment thread to task
// @route   POST /api/tasks/:id/comments
// @access  Private
export const addTaskComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      res.status(400);
      throw new Error('Comment text cannot be empty');
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    task.comments.push({
      author: req.user._id,
      text: text.trim(),
    });

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email avatar')
      .populate('assignees', 'name email avatar role')
      .populate('comments.author', 'name email avatar');

    // Real-Time Socket Broadcast
    if (req.io) {
      req.io.to(`project_${task.project}`).emit('task_comment_added', {
        taskId: task._id,
        task: updatedTask,
        comment: updatedTask.comments[updatedTask.comments.length - 1],
      });
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};
