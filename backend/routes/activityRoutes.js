import express from 'express';
import { getProjectActivities } from '../controllers/activityController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/', getProjectActivities);

export default router;
