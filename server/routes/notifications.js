import express from "express";
import { auth } from "../middleware/auth.js";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    getUnreadCount
} from "../controllers/notificationController.js";

const router = express.Router();

router.use(auth);

router.get("/", getNotifications);
router.get("/unread/count", getUnreadCount);
router.put("/mark-all-read", markAllAsRead);
router.put("/:id/read", markAsRead);
router.put("/:id/archive", archiveNotification);
router.delete("/:id", deleteNotification);

export default router; 