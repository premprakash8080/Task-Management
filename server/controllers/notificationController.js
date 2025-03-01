import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create Notification (Internal use)
export const createNotification = async (data) => {
    try {
        const notification = await Notification.create(data);
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
};

// Get User's Notifications
const getNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, isRead, isArchived } = req.query;
    const query = { recipient: req.user._id };

    if (typeof isRead === 'boolean') {
        query.isRead = isRead;
    }

    if (typeof isArchived === 'boolean') {
        query.isArchived = isArchived;
    }

    const notifications = await Notification.find(query)
        .populate('relatedTask', 'title')
        .populate('relatedProject', 'title')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await Notification.countDocuments(query);

    res.status(200).json(
        new ApiResponse(200, {
            notifications,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        }, "Notifications retrieved successfully")
    );
});

// Mark Notification as Read
const markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid notification ID");
    }

    const notification = await Notification.findOneAndUpdate(
        { _id: id, recipient: req.user._id },
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    res.status(200).json(
        new ApiResponse(200, notification, "Notification marked as read")
    );
});

// Mark All Notifications as Read
const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { isRead: true }
    );

    res.status(200).json(
        new ApiResponse(200, null, "All notifications marked as read")
    );
});

// Archive Notification
const archiveNotification = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid notification ID");
    }

    const notification = await Notification.findOneAndUpdate(
        { _id: id, recipient: req.user._id },
        { isArchived: true },
        { new: true }
    );

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    res.status(200).json(
        new ApiResponse(200, notification, "Notification archived")
    );
});

// Delete Notification
const deleteNotification = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid notification ID");
    }

    const notification = await Notification.findOneAndDelete({
        _id: id,
        recipient: req.user._id
    });

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    res.status(200).json(
        new ApiResponse(200, null, "Notification deleted successfully")
    );
});

// Get Unread Notification Count
const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({
        recipient: req.user._id,
        isRead: false,
        isArchived: false
    });

    res.status(200).json(
        new ApiResponse(200, { count }, "Unread notification count retrieved")
    );
});

export {
    getNotifications,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    getUnreadCount
}; 