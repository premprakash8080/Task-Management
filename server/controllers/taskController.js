import mongoose from "mongoose";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create Task
const createTask = asyncHandler(async (req, res) => {
    const { title, description, project: projectId, assignedTo, priority, dueDate, estimatedTime, subtasks } = req.body;

    // Validate required fields
    if (!title || !projectId) {
        throw new ApiError(400, "Title and project ID are required");
    }

    // Check if project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Check if user is project member
    const isMember = project.members.some(member => 
        member.user.toString() === req.user._id.toString()
    );
    const isCreator = project.createdBy.toString() === req.user._id.toString();

    if (!isMember && !isCreator) {
        throw new ApiError(403, "Not authorized to create tasks in this project");
    }

    const task = await Task.create({
        title,
        description,
        project: projectId,
        assignedTo,
        priority,
        dueDate,
        estimatedTime,
        subtasks,
        createdBy: req.user._id
    });

    const populatedTask = await Task.findById(task._id)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .populate('project', 'title');

    res.status(201).json(
        new ApiResponse(201, populatedTask, "Task created successfully")
    );
});

// Get All Tasks (with filters and pagination)
const getAllTasks = asyncHandler(async (req, res) => {
    const { status, priority, search, project, assignedTo, page = 1, limit = 10 } = req.query;
    const query = {};

    // Filter by status
    if (status) {
        query.status = status;
    }

    // Filter by priority
    if (priority) {
        query.priority = priority;
    }

    // Filter by project
    if (project) {
        query.project = project;
    }

    // Filter by assignee
    if (assignedTo) {
        query.assignedTo = assignedTo;
    }

    // Search in title or description
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    // Ensure user can only see tasks from their projects
    const userProjects = await Project.find({
        $or: [
            { createdBy: req.user._id },
            { 'members.user': req.user._id }
        ]
    }).select('_id');

    query.project = { $in: userProjects.map(p => p._id) };

    const tasks = await Task.find(query)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .populate('project', 'title')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await Task.countDocuments(query);

    res.status(200).json(
        new ApiResponse(200, {
            tasks,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        }, "Tasks retrieved successfully")
    );
});

// Get Task by ID
const getTaskById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid task ID");
    }

    const task = await Task.findById(id)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .populate('project', 'title')
        .populate('subtasks.assignedTo', 'name email')
        .populate('comments.user', 'name email')
        .populate('attachments.uploadedBy', 'name email');

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Check if user has access to the project
    const project = await Project.findById(task.project);
    const isMember = project.members.some(member => 
        member.user.toString() === req.user._id.toString()
    );
    const isCreator = project.createdBy.toString() === req.user._id.toString();

    if (!isMember && !isCreator) {
        throw new ApiError(403, "Not authorized to view this task");
    }

    res.status(200).json(
        new ApiResponse(200, task, "Task retrieved successfully")
    );
});

// Update Task
const updateTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid task ID");
    }

    const task = await Task.findById(id);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Check project access
    const project = await Project.findById(task.project);
    const isLeader = project.members.some(member => 
        member.user.toString() === req.user._id.toString() && member.role === "leader"
    );
    const isCreator = project.createdBy.toString() === req.user._id.toString();
    const isAssignee = task.assignedTo?.toString() === req.user._id.toString();

    if (!isLeader && !isCreator && !isAssignee) {
        throw new ApiError(403, "Not authorized to update this task");
    }

    // Add to history
    updates.history = [
        ...task.history,
        {
            user: req.user._id,
            action: `Updated task: ${Object.keys(updates).join(', ')}`
        }
    ];

    const updatedTask = await Task.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
    )
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .populate('project', 'title');

    res.status(200).json(
        new ApiResponse(200, updatedTask, "Task updated successfully")
    );
});

// Delete Task
const deleteTask = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid task ID");
    }

    const task = await Task.findById(id);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Check project access
    const project = await Project.findById(task.project);
    const isLeader = project.members.some(member => 
        member.user.toString() === req.user._id.toString() && member.role === "leader"
    );
    const isCreator = project.createdBy.toString() === req.user._id.toString();

    if (!isLeader && !isCreator) {
        throw new ApiError(403, "Not authorized to delete this task");
    }

    await Task.findByIdAndDelete(id);

    res.status(200).json(
        new ApiResponse(200, null, "Task deleted successfully")
    );
});

// Add Comment to Task
const addTaskComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    const task = await Task.findById(id);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Check project access
    const project = await Project.findById(task.project);
    const isMember = project.members.some(member => 
        member.user.toString() === req.user._id.toString()
    );
    const isCreator = project.createdBy.toString() === req.user._id.toString();

    if (!isMember && !isCreator) {
        throw new ApiError(403, "Not authorized to comment on this task");
    }

    task.comments.push({
        user: req.user._id,
        content
    });

    await task.save();

    const updatedTask = await Task.findById(id)
        .populate('comments.user', 'name email');

    res.status(200).json(
        new ApiResponse(200, updatedTask, "Comment added successfully")
    );
});

// Get Task Statistics
const getTaskStats = asyncHandler(async (req, res) => {
    const { projectId } = req.query;

    const query = {};
    if (projectId) {
        query.project = projectId;
    }

    // Ensure user can only see stats from their projects
    const userProjects = await Project.find({
        $or: [
            { createdBy: req.user._id },
            { 'members.user': req.user._id }
        ]
    }).select('_id');

    query.project = { $in: userProjects.map(p => p._id) };

    const stats = await Task.aggregate([
        { $match: query },
        {
            $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                completedTasks: {
                    $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] }
                },
                inProgressTasks: {
                    $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] }
                },
                todoTasks: {
                    $sum: { $cond: [{ $eq: ["$status", "todo"] }, 1, 0] }
                },
                highPriorityTasks: {
                    $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] }
                },
                averageEstimatedTime: { $avg: "$estimatedTime" },
                averageActualTime: { $avg: "$actualTime" }
            }
        }
    ]);

    res.status(200).json(
        new ApiResponse(200, stats[0] || {}, "Task statistics retrieved successfully")
    );
});

export {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    addTaskComment,
    getTaskStats
};