import express from "express";
import { auth } from "../middleware/auth.js";
import {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    addTaskComment,
    getTaskStats,
    getTasksByProjectId,
    getMyTasks,
    markTaskComplete,
    getAccessibleProjectsWithTasks
} from "../controllers/taskController.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Task CRUD operations
router.post("/", createTask);
router.get("/", getAllTasks);
router.get("/stats", getTaskStats);
router.get("/my-tasks", getMyTasks);
router.get("/project/:projectId", getTasksByProjectId);
router.get("/projects-with-tasks", getAccessibleProjectsWithTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);


// Task completion
router.put("/:id/complete", markTaskComplete);

// Task comments
router.post("/:id/comments", addTaskComment);

export default router;