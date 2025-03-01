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

router.post("/", sendMessage);
router.get("/chats", getRecentChats);
router.get("/unread/count", getUnreadCount);
router.get("/:userId", getChatMessages);
router.put("/:userId/read", markMessagesAsRead);
router.delete("/:id", deleteMessage);

export default router; 