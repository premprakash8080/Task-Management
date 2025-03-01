import mongoose from "mongoose";
import Message from "../models/Message.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Send Message
const sendMessage = asyncHandler(async (req, res) => {
    const { recipient, content, attachments } = req.body;

    if (!recipient || !content) {
        throw new ApiError(400, "Recipient and content are required");
    }

    if (!mongoose.Types.ObjectId.isValid(recipient)) {
        throw new ApiError(400, "Invalid recipient ID");
    }

    const message = await Message.create({
        sender: req.user._id,
        recipient,
        content,
        attachments
    });

    const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name email')
        .populate('recipient', 'name email');

    res.status(201).json(
        new ApiResponse(201, populatedMessage, "Message sent successfully")
    );
});

// Get Chat Messages
const getChatMessages = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const messages = await Message.find({
        $or: [
            { sender: req.user._id, recipient: userId },
            { sender: userId, recipient: req.user._id }
        ],
        deletedFor: { $ne: req.user._id }
    })
    .populate('sender', 'name email')
    .populate('recipient', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

    const total = await Message.countDocuments({
        $or: [
            { sender: req.user._id, recipient: userId },
            { sender: userId, recipient: req.user._id }
        ],
        deletedFor: { $ne: req.user._id }
    });

    res.status(200).json(
        new ApiResponse(200, {
            messages: messages.reverse(), // Return in chronological order
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        }, "Messages retrieved successfully")
    );
});

// Get Recent Chats
const getRecentChats = asyncHandler(async (req, res) => {
    const recentChats = await Message.aggregate([
        {
            $match: {
                $or: [
                    { sender: req.user._id },
                    { recipient: req.user._id }
                ],
                deletedFor: { $ne: req.user._id }
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $group: {
                _id: {
                    $cond: [
                        { $eq: ["$sender", req.user._id] },
                        "$recipient",
                        "$sender"
                    ]
                },
                lastMessage: { $first: "$$ROOT" }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $unwind: "$user"
        },
        {
            $project: {
                user: {
                    _id: 1,
                    name: 1,
                    email: 1
                },
                lastMessage: {
                    content: 1,
                    createdAt: 1,
                    isRead: 1
                }
            }
        }
    ]);

    res.status(200).json(
        new ApiResponse(200, recentChats, "Recent chats retrieved successfully")
    );
});

// Mark Messages as Read
const markMessagesAsRead = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    await Message.updateMany(
        {
            sender: userId,
            recipient: req.user._id,
            isRead: false
        },
        { isRead: true }
    );

    res.status(200).json(
        new ApiResponse(200, null, "Messages marked as read")
    );
});

// Delete Message
const deleteMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid message ID");
    }

    const message = await Message.findById(id);
    if (!message) {
        throw new ApiError(404, "Message not found");
    }

    // Check if user is sender or recipient
    if (message.sender.toString() !== req.user._id.toString() && 
        message.recipient.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to delete this message");
    }

    // Add user to deletedFor array
    message.deletedFor.push(req.user._id);
    await message.save();

    res.status(200).json(
        new ApiResponse(200, null, "Message deleted successfully")
    );
});

// Get Unread Message Count
const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Message.countDocuments({
        recipient: req.user._id,
        isRead: false,
        deletedFor: { $ne: req.user._id }
    });

    res.status(200).json(
        new ApiResponse(200, { count }, "Unread message count retrieved")
    );
});

export {
    sendMessage,
    getChatMessages,
    getRecentChats,
    markMessagesAsRead,
    deleteMessage,
    getUnreadCount
}; 