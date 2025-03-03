import express from "express";
import { auth } from "../middleware/auth.js";
import {
    sendMessage,
    getChatMessages,
    getRecentChats,
    markMessagesAsRead,
    deleteMessage,
    getUnreadCount
} from "../controllers/messageController.js";

const router = express.Router();

router.use(auth);

// Message routes
router.post("/", sendMessage);
router.get("/chats", getRecentChats);
router.get("/unread/count", getUnreadCount);

// Direct message routes
router.get("/user/:userId", getChatMessages);
router.put("/user/:userId/read", markMessagesAsRead);

// Project/Team chat routes
router.get("/project/:projectId", getChatMessages);
router.put("/project/:projectId/read", markMessagesAsRead);

// Common routes
router.delete("/:id", deleteMessage);

export default router; 