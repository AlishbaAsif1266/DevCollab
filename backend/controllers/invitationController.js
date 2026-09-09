import crypto from 'crypto';
import Invitation from '../models/Invitation.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Send Project Email Invitation
// @route   POST /api/projects/:id/invite
// @access  Private (Owner or Lead)
export const sendInvitation = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const projectId = req.params.id;

    const project = await Project.findById(projectId);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Check permissions (Owner or Lead)
    const requesterMember = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!requesterMember || !['Owner', 'Lead'].includes(requesterMember.role)) {
      res.status(403);
      throw new Error('Not authorized to send project invitations');
    }

    // Check if recipient is already a member
    const recipientUser = await User.findOne({ email: email.toLowerCase() });

    if (recipientUser) {
      const alreadyMember = project.members.some(
        (m) => m.user.toString() === recipientUser._id.toString()
      );
      if (alreadyMember) {
        res.status(400);
        throw new Error('User is already a member of this project');
      }
    }

    // Check existing pending invitation
    let invitation = await Invitation.findOne({
      project: projectId,
      email: email.toLowerCase(),
      status: 'Pending',
    });

    // Generate unique crypto token
    const token = crypto.randomBytes(32).toString('hex');

    if (invitation) {
      // Renew token & expiration if existing pending invite
      invitation.token = token;
      invitation.role = role || 'Developer';
      invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await invitation.save();
    } else {
      invitation = await Invitation.create({
        project: projectId,
        invitedBy: req.user._id,
        email: email.toLowerCase(),
        role: role || 'Developer',
        token,
      });
    }

    // Prepare Acceptance URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const acceptUrl = `${clientUrl}/invitations/accept/${token}`;

    // HTML Email Template
    const htmlMessage = `
      <div style="font-family: system-ui, sans-serif; background-color: #0b0f19; color: #f3f4f6; padding: 30px; border-radius: 16px; max-width: 600px; margin: auto;">
        <h2 style="color: #818cf8; margin-top: 0;">Project Workspace Invitation</h2>
        <p>Hello,</p>
        <p><strong>${req.user.name}</strong> has invited you to collaborate on the project <strong>"${project.title}"</strong> as a <strong>${role || 'Developer'}</strong>.</p>
        <div style="margin: 30px 0;">
          <a href="${acceptUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">
            Accept Invitation & Join Workspace
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 12px;">Link valid for 7 days. If button doesn't work, copy this link: <br/><a href="${acceptUrl}" style="color: #818cf8;">${acceptUrl}</a></p>
      </div>
    `;

    await sendEmail({
      email: email.toLowerCase(),
      subject: `Invitation to collaborate on "${project.title}" - DevCollab`,
      html: htmlMessage,
      acceptUrl,
    });

    // Real-Time Socket Notification if recipient is registered and online
    if (recipientUser && req.io) {
      req.io.to(`user_${recipientUser._id}`).emit('project_invite', {
        invitationId: invitation._id,
        token,
        projectTitle: project.title,
        invitedBy: req.user.name,
        role: role || 'Developer',
      });
    }

    res.status(200).json({
      success: true,
      message: `Invitation email sent to ${email}`,
      invitation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Invitation details by token
// @route   GET /api/invitations/token/:token
// @access  Public
export const getInvitationByToken = async (req, res, next) => {
  try {
    const invitation = await Invitation.findOne({ token: req.params.token })
      .populate('project', 'title description category techStack status')
      .populate('invitedBy', 'name email avatar');

    if (!invitation) {
      res.status(404);
      throw new Error('Invitation not found or invalid token');
    }

    if (invitation.status !== 'Pending') {
      res.status(400);
      throw new Error(`Invitation has already been ${invitation.status.toLowerCase()}`);
    }

    if (new Date() > invitation.expiresAt) {
      invitation.status = 'Expired';
      await invitation.save();
      res.status(400);
      throw new Error('Invitation link has expired');
    }

    res.json({
      success: true,
      invitation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept Invitation
// @route   POST /api/invitations/accept/:token
// @access  Private
export const acceptInvitation = async (req, res, next) => {
  try {
    const invitation = await Invitation.findOne({ token: req.params.token });

    if (!invitation) {
      res.status(404);
      throw new Error('Invitation not found');
    }

    if (invitation.status !== 'Pending') {
      res.status(400);
      throw new Error(`Invitation has already been ${invitation.status.toLowerCase()}`);
    }

    if (new Date() > invitation.expiresAt) {
      invitation.status = 'Expired';
      await invitation.save();
      res.status(400);
      throw new Error('Invitation link has expired');
    }

    const project = await Project.findById(invitation.project);

    if (!project) {
      res.status(404);
      throw new Error('Project workspace no longer exists');
    }

    // Add user to project members
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!alreadyMember) {
      project.members.push({
        user: req.user._id,
        role: invitation.role || 'Developer',
      });
      await project.save();
    }

    invitation.status = 'Accepted';
    await invitation.save();

    res.json({
      success: true,
      message: `You have joined "${project.title}" as ${invitation.role}!`,
      projectId: project._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Decline Invitation
// @route   POST /api/invitations/decline/:token
// @access  Private
export const declineInvitation = async (req, res, next) => {
  try {
    const invitation = await Invitation.findOne({ token: req.params.token });

    if (!invitation) {
      res.status(404);
      throw new Error('Invitation not found');
    }

    invitation.status = 'Declined';
    await invitation.save();

    res.json({
      success: true,
      message: 'Invitation declined',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's pending invitations
// @route   GET /api/invitations/my-invitations
// @access  Private
export const getUserInvitations = async (req, res, next) => {
  try {
    const invitations = await Invitation.find({
      email: req.user.email.toLowerCase(),
      status: 'Pending',
      expiresAt: { $gt: new Date() },
    })
      .populate('project', 'title category status')
      .populate('invitedBy', 'name email avatar');

    res.json({
      success: true,
      count: invitations.length,
      invitations,
    });
  } catch (error) {
    next(error);
  }
};
