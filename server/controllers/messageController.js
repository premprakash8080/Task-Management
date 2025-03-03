import mongoose from "mongoose";
import Message from "../models/Message.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import moment from 'moment';

// Send Message
const sendMessage = asyncHandler(async (req, res) => {
    const { recipient, content, attachments, isGroupMessage, projectId } = req.body;

    if ((!recipient && !projectId) || !content) {
        throw new ApiError(400, "Recipient/Project and content are required");
    }

    if (recipient && !mongoose.Types.ObjectId.isValid(recipient)) {
        throw new ApiError(400, "Invalid recipient ID");
    }

    if (projectId && !mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid project ID");
    }

    // Create message data object conditionally
    const messageData = {
        sender: req.user._id,
        content,
        attachments,
        isGroupMessage: projectId ? true : isGroupMessage || false,
    };

    // Handle project/team chat message
    if (projectId) {
        messageData.projectId = projectId;
        
        // Verify project exists and user is a member
        const Project = mongoose.model('Project');
        const project = await Project.findById(projectId);
        if (!project) {
            throw new ApiError(404, "Project not found");
        }

        // Check if user is a member of the project
        const isMember = project.members.some(member => 
            member.user.toString() === req.user._id.toString()
        );
        if (!isMember) {
            throw new ApiError(403, "You are not a member of this project");
        }
    } else {
        messageData.recipient = recipient;
    }

    const message = await Message.create(messageData);

    const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name email')
        .populate('recipient', 'name email')
        .populate({
            path: 'projectId',
            select: 'title members',
            populate: {
                path: 'members.user',
                select: 'name email'
            }
        });

    // Format dates
    const formattedMessage = {
        ...populatedMessage._doc,
        createdAt: moment(populatedMessage.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment(populatedMessage.updatedAt).format('YYYY-MM-DD HH:mm:ss')
    };

    res.status(201).json(
        new ApiResponse(201, formattedMessage, "Message sent successfully")
    );
});

// Get Chat Messages
const getChatMessages = asyncHandler(async (req, res) => {
    const { userId, projectId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    let query = {
        deletedFor: { $ne: req.user._id }
    };

    if (userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ApiError(400, "Invalid user ID");
        }
        query.$or = [
            { sender: req.user._id, recipient: userId },
            { sender: userId, recipient: req.user._id }
        ];
    } else if (projectId) {
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            throw new ApiError(400, "Invalid project ID");
        }
        query.projectId = projectId;

        // Verify project exists and user is a member
        const Project = mongoose.model('Project');
        const project = await Project.findById(projectId)
            .populate('members.user', 'name email');
        
        if (!project) {
            throw new ApiError(404, "Project not found");
        }

        const isMember = project.members.some(member => 
            member.user._id.toString() === req.user._id.toString()
        );
        if (!isMember) {
            throw new ApiError(403, "You are not a member of this project");
        }
    }

    const messages = await Message.find(query)
        .populate('sender', 'name email')
        .populate('recipient', 'name email')
        .populate({
            path: 'projectId',
            select: 'title members',
            populate: {
                path: 'members.user',
                select: 'name email'
            }
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    // Format dates for all messages
    const formattedMessages = messages.map(message => ({
        ...message._doc,
        createdAt: moment(message.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment(message.updatedAt).format('YYYY-MM-DD HH:mm:ss')
    }));

    const total = await Message.countDocuments(query);

    res.status(200).json(
        new ApiResponse(200, {
            messages: formattedMessages.reverse(),
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
    const { projectId } = req.query;
    const userId = req.user._id;

    // Get all projects where user is a member
    const Project = mongoose.model('Project');
    const userProjects = await Project.find({
        'members.user': userId
    }).select('_id');

    let query = {
        deletedFor: { $ne: userId }
    };

    if (projectId) {
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            throw new ApiError(400, "Invalid project ID");
        }
        query.projectId = projectId;
    } else {
        // Include both direct messages and project chats where user is a member
        query.$or = [
            { sender: userId },
            { recipient: userId },
            { projectId: { $in: userProjects.map(p => p._id) } }
        ];
    }

    const recentChats = await Message.aggregate([
        {
            $match: query
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $group: {
                _id: {
                    $cond: [
                        { $eq: ["$projectId", null] },
                        {
                            $cond: [
                                { $eq: ["$sender", userId] },
                                "$recipient",
                                "$sender"
                            ]
                        },
                        "$projectId"
                    ]
                },
                lastMessage: { $first: "$$ROOT" },
                isProjectChat: { $first: { $ne: ["$projectId", null] } },
                unreadCount: {
                    $sum: {
                        $cond: [
                            { $and: [
                                { $eq: ["$isRead", false] },
                                { $ne: ["$sender", userId] }
                            ]},
                            1,
                            0
                        ]
                    }
                }
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
            $lookup: {
                from: "projects",
                localField: "_id",
                foreignField: "_id",
                as: "project"
            }
        },
        {
            $project: {
                user: {
                    $cond: [
                        "$isProjectChat",
                        {
                            $let: {
                                vars: {
                                    project: { $arrayElemAt: ["$project", 0] }
                                },
                                in: {
                                    _id: "$$project._id",
                                    title: "$$project.title",
                                    members: "$$project.members"
                                }
                            }
                        },
                        { $arrayElemAt: ["$user", 0] }
                    ]
                },
                lastMessage: {
                    content: 1,
                    createdAt: 1,
                    isRead: 1,
                    sender: 1
                },
                isProjectChat: 1,
                unreadCount: 1
            }
        }
    ]);

    // Populate project members for team chats
    for (let chat of recentChats) {
        if (chat.isProjectChat && chat.user.members) {
            const project = await Project.findById(chat.user._id)
                .populate('members.user', 'name email')
                .lean();
            
            if (project) {
                chat.user.members = project.members;
            }
        }
    }

    res.status(200).json(
        new ApiResponse(200, recentChats, "Recent chats retrieved successfully")
    );
});

// Mark Messages as Read
const markMessagesAsRead = asyncHandler(async (req, res) => {
    const { userId, projectId } = req.params;

    let query = {
        recipient: req.user._id,
        isRead: false
    };

    if (userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ApiError(400, "Invalid user ID");
        }
        query.sender = userId;
    } else if (projectId) {
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            throw new ApiError(400, "Invalid project ID");
        }
        query.projectId = projectId;
    }

    await Message.updateMany(query, { isRead: true });

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
        message.recipient?.toString() !== req.user._id.toString()) {
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
    const { projectId } = req.query;

    let query = {
        recipient: req.user._id,
        isRead: false,
        deletedFor: { $ne: req.user._id }
    };

    if (projectId) {
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            throw new ApiError(400, "Invalid project ID");
        }
        query.projectId = projectId;
    }

    const count = await Message.countDocuments(query);

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