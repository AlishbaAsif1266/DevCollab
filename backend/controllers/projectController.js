import Project from '../models/Project.js';
import User from '../models/User.js';

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res, next) => {
  try {
    const { title, description, category, repositoryUrl, demoUrl, techStack, status } = req.body;

    let parsedTechStack = [];
    if (techStack) {
      if (Array.isArray(techStack)) {
        parsedTechStack = techStack;
      } else if (typeof techStack === 'string') {
        parsedTechStack = techStack.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    const project = await Project.create({
      title,
      description,
      category: category || 'Web Development',
      repositoryUrl: repositoryUrl || '',
      demoUrl: demoUrl || '',
      techStack: parsedTechStack,
      status: status || 'Active',
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'Owner',
        },
      ],
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar role skills')
      .populate('members.user', 'name email avatar role skills experienceLevel');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: populatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects (User's projects & public search)
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res, next) => {
  try {
    const { search, category, filter } = req.query;

    let query = {};

    if (filter === 'mine') {
      // Projects where user is owner or member
      query.$or = [{ owner: req.user._id }, { 'members.user': req.user._id }];
    } else {
      // Default: User's projects or all matching query
      query.$or = [{ owner: req.user._id }, { 'members.user': req.user._id }];
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    const projects = await Project.find(query)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar role skills githubUrl linkedinUrl')
      .populate('members.user', 'name email avatar role skills experienceLevel githubUrl');

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Check if user is a member or owner
    const isMember = project.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );

    if (!isMember && project.owner._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Access denied to this project workspace');
    }

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project details
// @route   PUT /api/projects/:id
// @access  Private (Owner or Lead)
export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Check permissions (Owner or Lead)
    const userMember = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!userMember || !['Owner', 'Lead'].includes(userMember.role)) {
      res.status(403);
      throw new Error('Only project Owner or Lead can update project settings');
    }

    const { title, description, category, repositoryUrl, demoUrl, techStack, status } = req.body;

    if (title) project.title = title;
    if (description) project.description = description;
    if (category) project.category = category;
    if (repositoryUrl !== undefined) project.repositoryUrl = repositoryUrl;
    if (demoUrl !== undefined) project.demoUrl = demoUrl;
    if (status) project.status = status;

    if (techStack) {
      if (Array.isArray(techStack)) {
        project.techStack = techStack;
      } else if (typeof techStack === 'string') {
        project.techStack = techStack.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role skills experienceLevel');

    res.json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Owner only)
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Only the Project Owner can delete this project');
    }

    await project.deleteOne();

    res.json({
      success: true,
      message: 'Project removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (Owner or Lead)
export const addProjectMember = async (req, res, next) => {
  try {
    const { userId, email, role } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Check permissions
    const requesterMember = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!requesterMember || !['Owner', 'Lead'].includes(requesterMember.role)) {
      res.status(403);
      throw new Error('Not authorized to add members to this project');
    }

    let targetUser;
    if (userId) {
      targetUser = await User.findById(userId);
    } else if (email) {
      targetUser = await User.findOne({ email });
    }

    if (!targetUser) {
      res.status(404);
      throw new Error('User to be added not found');
    }

    // Check if user is already a member
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === targetUser._id.toString()
    );

    if (alreadyMember) {
      res.status(400);
      throw new Error('User is already a member of this project');
    }

    project.members.push({
      user: targetUser._id,
      role: role || 'Developer',
    });

    await project.save();

    // Broadcast real-time Socket.IO notification to target user
    if (req.io) {
      req.io.to(`user_${targetUser._id}`).emit('project_invite', {
        projectId: project._id,
        projectTitle: project.title,
        invitedBy: req.user.name,
      });
    }

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role skills experienceLevel');

    res.json({
      success: true,
      message: `${targetUser.name} added to project as ${role || 'Developer'}`,
      project: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:memberId
// @access  Private (Owner or Lead)
export const removeProjectMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Check permissions
    const requesterMember = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!requesterMember || !['Owner', 'Lead'].includes(requesterMember.role)) {
      res.status(403);
      throw new Error('Not authorized to remove members');
    }

    const targetUserId = req.params.memberId;

    // Cannot remove project owner
    if (project.owner.toString() === targetUserId) {
      res.status(400);
      throw new Error('Cannot remove the Project Owner');
    }

    project.members = project.members.filter((m) => m.user.toString() !== targetUserId);

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role skills experienceLevel');

    res.json({
      success: true,
      message: 'Member removed from project',
      project: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update member role in project
// @route   PUT /api/projects/:id/members/:memberId
// @access  Private (Owner only)
export const updateMemberRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Only the Project Owner can change member roles');
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.params.memberId
    );

    if (!member) {
      res.status(404);
      throw new Error('Member not found in project');
    }

    member.role = role || member.role;

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role skills experienceLevel');

    res.json({
      success: true,
      message: 'Member role updated successfully',
      project: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};
