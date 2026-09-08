import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getDevelopers,
  getDeveloperById,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/developers', getDevelopers);
router.get('/developers/:id', getDeveloperById);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
