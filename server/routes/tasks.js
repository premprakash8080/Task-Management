import express from "express";
import { auth } from "../middleware/auth.js";
import {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    addTaskComment,
    getTaskStats
} from "../controllers/taskController.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Task CRUD operations
router.post("/", createTask);
router.get("/", getAllTasks);
router.get("/stats", getTaskStats);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

// Task comments
router.post("/:id/comments", addTaskComment);

export default router;