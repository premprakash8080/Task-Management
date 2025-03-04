import express from "express";
import { auth } from "../middleware/auth.js";
import {
    getDashboardOverview,
    getRecentActivity,
    getProjectOverview,
    getTaskCompletionStats
} from "../controllers/dashboardController.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Dashboard routes
router.get("/overview", getDashboardOverview);
router.get("/activity", getRecentActivity);
router.get("/projects", getProjectOverview);
router.get("/task-stats", getTaskCompletionStats);

export default router; 