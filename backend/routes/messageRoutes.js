import express from 'express';
import {
  getProjectMessages,
  sendProjectMessage,
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply protect middleware to all message routes
router.use(protect);

router
  .route('/projects/:projectId/messages')
  .get(getProjectMessages)
  .post(sendProjectMessage);

export default router;
