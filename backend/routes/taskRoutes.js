import express from 'express';
import {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addTaskComment,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { createTaskValidationRules, validateRequest } from '../middleware/validator.js';

const router = express.Router({ mergeParams: true });

// Protect all task routes
router.use(protect);

// Project specific task routes (/api/projects/:projectId/tasks)
router
  .route('/projects/:projectId/tasks')
  .post(createTaskValidationRules(), validateRequest, createTask)
  .get(getProjectTasks);

// Single task routes (/api/tasks/:id)
router
  .route('/tasks/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

// Task comments route (/api/tasks/:id/comments)
router.route('/tasks/:id/comments').post(addTaskComment);

export default router;
