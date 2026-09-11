import Resource from '../models/Resource.js';
import Project from '../models/Project.js';
import { logActivity } from './activityController.js';

// @desc    Create project resource (link, snippet, doc, file)
// @route   POST /api/projects/:projectId/resources
// @access  Private
export const createResource = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, type, url, content, language, description, tags } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isMember =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some((m) => m.user.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Not authorized to add resources to this project' });
    }

    const processedTags = tags
      ? Array.isArray(tags)
        ? tags
        : tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const resource = await Resource.create({
      project: projectId,
      title,
      type: type || 'link',
      url,
      content,
      language: language || 'javascript',
      description,
      tags: processedTags,
      createdBy: req.user._id,
    });

    const populatedResource = await Resource.findById(resource._id).populate(
      'createdBy',
      'name email experienceLevel'
    );

    // Emit Socket.IO event to room
    const io = req.app.get('io');
    if (io) {
      io.to(projectId.toString()).emit('resource_created', populatedResource);
    }

    // Log Activity
    await logActivity({
      projectId,
      userId: req.user._id,
      action: 'resource_added',
      details: `Added ${type || 'link'} resource "${title}"`,
      targetType: 'Resource',
      targetId: resource._id,
      io,
    });

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      resource: populatedResource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project resources
// @route   GET /api/projects/:projectId/resources
// @access  Private
export const getProjectResources = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { type, search } = req.query;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isMember =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some((m) => m.user.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Not authorized to view project resources' });
    }

    let filter = { project: projectId };

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const resources = await Resource.find(filter)
      .populate('createdBy', 'name email experienceLevel')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      resources,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resource
// @route   DELETE /api/projects/:projectId/resources/:resourceId
// @access  Private (Creator, Project Lead, or Owner)
export const deleteResource = async (req, res, next) => {
  try {
    const { projectId, resourceId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isCreator = resource.createdBy.toString() === req.user._id.toString();
    const userMember = project.members.find((m) => m.user.toString() === req.user._id.toString());
    const isLead = userMember?.role === 'Lead';

    if (!isOwner && !isCreator && !isLead) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this resource' });
    }

    const titleToDelete = resource.title;
    await resource.deleteOne();

    const io = req.app.get('io');
    if (io) {
      io.to(projectId.toString()).emit('resource_deleted', resourceId);
    }

    // Log Activity
    await logActivity({
      projectId,
      userId: req.user._id,
      action: 'resource_deleted',
      details: `Removed resource "${titleToDelete}"`,
      targetType: 'Resource',
      targetId: resourceId,
      io,
    });

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully',
      resourceId,
    });
  } catch (error) {
    next(error);
  }
};
