import express from 'express';
import {
  getPlatformStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { authorizeAdmin } from '../middleware/admin.js';

const router = express.Router();

// Apply authentication and admin role enforcement to all admin routes
router.use(protect);
router.use(authorizeAdmin);

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.put('/users/:userId/role', updateUserRole);
router.delete('/users/:userId', deleteUser);

export default router;
