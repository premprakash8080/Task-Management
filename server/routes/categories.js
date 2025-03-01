import express from "express";
import { auth } from "../middleware/auth.js";
import {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
} from "../controllers/categoryController.js";

const router = express.Router();

router.use(auth);

router.post("/", createCategory);
router.get("/", getCategories);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router; 