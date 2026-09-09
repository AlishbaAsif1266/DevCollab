import express from 'express';
import {
  sendInvitation,
  getInvitationByToken,
  acceptInvitation,
  declineInvitation,
  getUserInvitations,
} from '../controllers/invitationController.js';
import { protect } from '../middleware/auth.js';
import { addMemberValidationRules, validateRequest } from '../middleware/validator.js';

const router = express.Router();

// Public route to view invite details by token
router.get('/token/:token', getInvitationByToken);

// Protected routes
router.post('/projects/:id/invite', protect, addMemberValidationRules(), validateRequest, sendInvitation);
router.post('/accept/:token', protect, acceptInvitation);
router.post('/decline/:token', protect, declineInvitation);
router.get('/my-invitations', protect, getUserInvitations);

export default router;
