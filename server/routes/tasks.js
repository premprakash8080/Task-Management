import express from "express";
import auth from "../middleware/auth.js";
import {
    createTask,
    getTaskCounter,
    getTasksByStoryId,
    getTaskById,
    updateTask,
    deleteTask,
    getAllTasks
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/", createTask);
router.get("/counter", getTaskCounter);
router.get("/:id", getTasksByStoryId);
router.get("/task/:id", getTaskById);
router.put("/update/:id", updateTask);
router.delete("/delete/:id", deleteTask);
router.get("/", getAllTasks);

export default router;