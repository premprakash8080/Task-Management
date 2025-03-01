import express from 'express';
import {
    registerUser,
    loginUser,
    getCurrentUser,
    updateProfile,
    changePassword,
    getAllUsers,
    deleteUser
} from '../controllers/userController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.use(auth); // Apply authentication middleware to all routes below

// User profile routes
router.get('/profile', getCurrentUser);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

// Admin only routes
router.get('/all', authorize('admin'), getAllUsers);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;