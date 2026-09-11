import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Resource from '../models/Resource.js';

// @desc    Get platform overview stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalTasks = await Task.countDocuments();
    const totalResources = await Resource.countDocuments();

    const activeProjects = await Project.countDocuments({ status: 'Active' });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProjects,
        activeProjects,
        totalTasks,
        totalResources,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered platform users
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (Promote/Demote)
// @route   PUT /api/admin/users/:userId/role
// @access  Private (Admin only)
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;

    if (!['developer', 'project_owner', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.name}'s role updated to ${role}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/admin/users/:userId
// @access  Private (Admin only)
export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Admin cannot delete own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User account removed from platform',
      userId,
    });
  } catch (error) {
    next(error);
  }
};
