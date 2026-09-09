import Message from '../models/Message.js';
import Project from '../models/Project.js';

// @desc    Get project chat messages history
// @route   GET /api/projects/:projectId/messages
// @access  Private
export const getProjectMessages = async (req, res, next) => {
  try {
    const { projectId } = req.params;

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
      throw new Error('Access denied to project chat');
    }

    const messages = await Message.find({ project: projectId })
      .populate('sender', 'name email avatar role')
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send chat message in project room
// @route   POST /api/projects/:projectId/messages
// @access  Private
export const sendProjectMessage = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { text, attachments } = req.body;

    if (!text || !text.trim()) {
      res.status(400);
      throw new Error('Message text cannot be empty');
    }

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
      throw new Error('Access denied to project chat');
    }

    const message = await Message.create({
      project: projectId,
      sender: req.user._id,
      text: text.trim(),
      attachments: attachments || [],
    });

    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'name email avatar role'
    );

    // Real-Time Socket.IO Broadcast to Project Room
    if (req.io) {
      req.io.to(`project_${projectId}`).emit('receive_message', populatedMessage);
    }

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};
