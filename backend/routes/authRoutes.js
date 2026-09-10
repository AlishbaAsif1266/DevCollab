import express from 'express';
import {
  registerUser,
  loginUser,
  refreshTokenController,
  logoutUser,
  getMe,
  updateProfile,
  getDevelopers,
  getDeveloperById,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  registerValidationRules,
  loginValidationRules,
  updateProfileValidationRules,
  validateRequest,
} from '../middleware/validator.js';

const router = express.Router();

// Public routes with validation
router.post('/register', registerValidationRules(), validateRequest, registerUser);
router.post('/login', loginValidationRules(), validateRequest, loginUser);
router.post('/refresh-token', refreshTokenController);
router.get('/developers', getDevelopers);
router.get('/developers/:id', getDeveloperById);

// Protected routes with validation
router.get('/me', protect, getMe);
router.post('/logout', protect, logoutUser);
router.put('/profile', protect, updateProfileValidationRules(), validateRequest, updateProfile);

export default router;
