import express from 'express';
import {
  createResource,
  getProjectResources,
  deleteResource,
} from '../controllers/resourceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route('/')
  .get(getProjectResources)
  .post(createResource);

router.route('/:resourceId')
  .delete(deleteResource);

export default router;
