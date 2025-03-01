import express from "express";
import { auth } from "../middleware/auth.js";
import {
    createLabel,
    getLabels,
    updateLabel,
    deleteLabel
} from "../controllers/labelController.js";

const router = express.Router();

router.use(auth);

router.post("/", createLabel);
router.get("/", getLabels);
router.put("/:id", updateLabel);
router.delete("/:id", deleteLabel);

export default router; 