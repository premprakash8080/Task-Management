import express from "express";
import {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addProjectMember,
    removeProjectMember,
    getProjectStats,
    getAccessibleProjectNames
} from "../controllers/ProjectController.js";
import { auth, authorize } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Get accessible project names
router.get("/names", getAccessibleProjectNames);

// Project CRUD routes
router.route("/")
    .post(createProject)
    .get(getAllProjects);

router.route("/:id")
    .get(getProjectById)
    .put(updateProject)
    .delete(deleteProject);

// Project member management
router.post("/:id/members", addProjectMember);
router.delete("/:id/members/:userId", removeProjectMember);

// Project statistics
router.get("/:id/stats", getProjectStats);

export default router;