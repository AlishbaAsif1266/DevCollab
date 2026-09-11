import Activity from '../models/Activity.js';
import Project from '../models/Project.js';

// Helper function to log activity and stream via WebSockets
export const logActivity = async ({
  projectId,
  userId,
  action,
  details,
  targetType = 'Task',
  targetId = null,
  io = null,
}) => {
  try {
    const newActivity = await Activity.create({
      project: projectId,
      user: userId,
      action,
      details,
      targetType,
      targetId,
    });

    const populatedActivity = await Activity.findById(newActivity._id).populate(
      'user',
      'name email avatar experienceLevel'
    );

    if (io) {
      io.to(projectId.toString()).emit('activity_logged', populatedActivity);
    }

    return populatedActivity;
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// @desc    Get project activity audit log history
// @route   GET /api/projects/:projectId/activities
// @access  Private
export const getProjectActivities = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // Check project access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isMember =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some((m) => m.user.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Not authorized to view project audit log' });
    }

    const activities = await Activity.find({ project: projectId })
      .populate('user', 'name email experienceLevel')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    next(error);
  }
};
