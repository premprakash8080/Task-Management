import express from 'express';
import { auth } from '../middleware/auth.js';
import {
    getAnalyticsOverview,
    getTaskAnalytics,
    getProjectAnalytics,
    getUserEngagement,
    getCustomAnalytics
} from '../controllers/analyticsController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Analytics routes
router.get('/', getAnalyticsOverview);
router.get('/tasks', getTaskAnalytics);
router.get('/projects', getProjectAnalytics);
router.get('/user-engagement', getUserEngagement);
router.get('/custom', getCustomAnalytics);

export default router; 