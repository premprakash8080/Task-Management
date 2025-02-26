import express from 'express';
const router = express.Router();
import { registerUser, loginUser, createUser, getAllUsers, deleteUser } from '../controllers/userController.js';

// User Authentication Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/', createUser);
router.get('/', getAllUsers);
router.delete('/delete/:id', deleteUser);

export default router;