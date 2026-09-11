import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  updateMemberRole,
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import {
  createProjectValidationRules,
  updateProjectValidationRules,
  addMemberValidationRules,
  validateRequest,
} from '../middleware/validator.js';

const router = express.Router();

// Apply protect middleware to all project routes
router.use(protect);

router
  .route('/')
  .post(createProjectValidationRules(), validateRequest, createProject)
  .get(getProjects);

router
  .route('/:id')
  .get(getProjectById)
  .put(updateProjectValidationRules(), validateRequest, updateProject)
  .delete(deleteProject);

// Member management routes with validation
router
  .route('/:id/members')
  .post(addMemberValidationRules(), validateRequest, addProjectMember);

router
  .route('/:id/members/:memberId')
  .delete(removeProjectMember)
  .put(updateMemberRole);

export default router;
