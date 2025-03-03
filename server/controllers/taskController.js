import mongoose from "mongoose";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import moment from 'moment';

// Create Task
const createTask = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        project,
        assignees = [],
        priority = 'medium',
        dueDate,
        estimatedTime,
        status = 'todo',
        category,
        labels = [],
        subtasks = []
    } = req.body;

    if (!title || !description || !project) {
        throw new ApiError(400, "Title, description and project are required");
    }

    // Check if project exists and user has access
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
        throw new ApiError(404, "Project not found");
    }

    // Check if user has access to the project
    const isMember = projectDoc.members.some(member => 
        member.user.toString() === req.user._id.toString()
    );
    const isCreator = projectDoc.createdBy.toString() === req.user._id.toString();

    if (!isMember && !isCreator) {
        throw new ApiError(403, "Not authorized to create tasks in this project");
    }

    // If no assignees specified, assign to creator
    const taskAssignees = assignees.length > 0 ? assignees : [{ 
        user: req.user._id,
        role: 'responsible',
        assignedAt: new Date()
    }];

    const task = await Task.create({
        title,
        description,
        project,
        assignees: taskAssignees,
        priority,
        dueDate: dueDate ? moment(dueDate).toDate() : null,
        estimatedTime,
        status,
        category,
        labels,
        subtasks: subtasks.map(subtask => ({
            ...subtask,
            dueDate: subtask.dueDate ? moment(subtask.dueDate).toDate() : null
        })),
        createdBy: req.user._id
    });

    const populatedTask = await Task.findById(task._id)
        .populate('assignees.user', 'name email')
        .populate('createdBy', 'name email')
        .populate('project', 'title')
        .populate('category', 'name color')
        .populate('labels', 'name color');

    // Format dates for response
    const formattedTask = {
        ...populatedTask._doc,
        createdAt: moment(populatedTask.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment(populatedTask.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
        dueDate: populatedTask.dueDate ? moment(populatedTask.dueDate).format('YYYY-MM-DD') : null,
        subtasks: populatedTask.subtasks.map(subtask => ({
            ...subtask,
            dueDate: subtask.dueDate ? moment(subtask.dueDate).format('YYYY-MM-DD') : null
        })),
        assignees: populatedTask.assignees.map(assignee => ({
            ...assignee._doc,
            assignedAt: moment(assignee.assignedAt).format('YYYY-MM-DD HH:mm:ss')
        }))
    };

    res.status(201).json(
        new ApiResponse(201, formattedTask, "Task created successfully")
    );
});

// Get All Tasks
const getAllTasks = asyncHandler(async (req, res) => {
    const { 
        project, 
        status, 
        priority, 
        assignedTo,
        search,
        startDate,
        endDate,
        sortBy = 'dueDate',
        sortOrder = 'asc',
        page = 1, 
        limit = 10 
    } = req.query;

    const query = {};

    // Add filters only if they exist
    if (project) query.project = project;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query['assignees.user'] = assignedTo;

    // Date range filter
    if (startDate || endDate) {
        query.dueDate = {};
        if (startDate && startDate !== 'undefined') {
            query.dueDate.$gte = moment(startDate).startOf('day').toDate();
        }
        if (endDate && endDate !== 'undefined') {
            query.dueDate.$lte = moment(endDate).endOf('day').toDate();
        }
        // Remove empty dueDate object if no dates were set
        if (!Object.keys(query.dueDate).length) {
            delete query.dueDate;
        }
    }

    // Search in title or description
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    // Create sort object
    const sort = {};
    sort[sortBy || 'dueDate'] = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find(query)
        .populate('assignees.user', 'name email')
        .populate('project', 'title')
        .populate('createdBy', 'name email')
        .populate('category', 'name color')
        .populate('labels', 'name color')
        .sort(sort)
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));

    // Format dates for all tasks
    const formattedTasks = tasks.map(task => ({
        ...task._doc,
        createdAt: moment(task.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment(task.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
        dueDate: task.dueDate ? moment(task.dueDate).format('YYYY-MM-DD') : null,
        completedAt: task.completedAt ? moment(task.completedAt).format('YYYY-MM-DD HH:mm:ss') : null,
        subtasks: task.subtasks.map(subtask => ({
            ...subtask,
            dueDate: subtask.dueDate ? moment(subtask.dueDate).format('YYYY-MM-DD') : null
        }))
    }));

    const total = await Task.countDocuments(query);

    res.status(200).json(
        new ApiResponse(200, {
            tasks: formattedTasks,
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
    const isAssignee = task.assignees.some(assignee => 
        assignee.user.toString() === req.user._id.toString()
    );

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
    .populate('assignees.user', 'name email')
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

// Get Tasks by Project ID
const getTasksByProjectId = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { status, priority, search, page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid project ID");
    }

    // Check if project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Check if user has access to the project
    const isMember = project.members.some(member => 
        member.user.toString() === req.user._id.toString()
    );
    const isCreator = project.createdBy.toString() === req.user._id.toString();

    if (!isMember && !isCreator) {
        throw new ApiError(403, "Not authorized to view tasks in this project");
    }

    // Build query
    const query = { project: projectId };

    // Add filters if provided
    if (status) {
        query.status = status;
    }

    if (priority) {
        query.priority = priority;
    }

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    const tasks = await Task.find(query)
        .populate('assignees', 'name email')
        .populate('createdBy', 'name email')
        .populate('project', 'title')
        .populate('category', 'name color')
        .populate('labels', 'name color')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    // Format dates for all tasks
    const formattedTasks = tasks.map(task => ({
        ...task._doc,
        createdAt: moment(task.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment(task.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
        dueDate: task.dueDate ? moment(task.dueDate).format('YYYY-MM-DD') : null,
        completedAt: task.completedAt ? moment(task.completedAt).format('YYYY-MM-DD HH:mm:ss') : null,
        subtasks: task.subtasks.map(subtask => ({
            ...subtask,
            dueDate: subtask.dueDate ? moment(subtask.dueDate).format('YYYY-MM-DD') : null
        }))
    }));

    const total = await Task.countDocuments(query);

    res.status(200).json(
        new ApiResponse(200, {
            tasks: formattedTasks,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        }, "Tasks retrieved successfully")
    );
});

// Mark Task as Complete
const markTaskComplete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { completionNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid task ID");
    }

    const task = await Task.findById(id);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Check if user is assigned to the task or is project leader
    const project = await Project.findById(task.project);
    const isAssignee = task.assignees.some(assignee => 
        assignee.user.toString() === req.user._id.toString()
    );
    const isLeader = project.members.some(member => 
        member.user.toString() === req.user._id.toString() && member.role === "leader"
    );
    const isCreator = project.createdBy.toString() === req.user._id.toString();

    if (!isAssignee && !isLeader && !isCreator) {
        throw new ApiError(403, "Not authorized to complete this task");
    }

    task.status = "done";
    task.completedAt = new Date();
    task.completedBy = req.user._id;
    task.progress = 100;

    if (completionNotes) {
        task.comments.push({
            user: req.user._id,
            content: `Task completed: ${completionNotes}`
        });
    }

    task.history.push({
        user: req.user._id,
        action: "Marked task as complete"
    });

    await task.save();

    const updatedTask = await Task.findById(id)
        .populate('assignees.user', 'name email')
        .populate('createdBy', 'name email')
        .populate('completedBy', 'name email')
        .populate('project', 'title')
        .populate('category', 'name color')
        .populate('labels', 'name color');

    res.status(200).json(
        new ApiResponse(200, updatedTask, "Task marked as complete")
    );
});

// Get My Tasks
const getMyTasks = asyncHandler(async (req, res) => {
    const { 
        status, 
        priority, 
        project,
        search,
        startDate,
        endDate,
        page = 1, 
        limit = 10 
    } = req.query;

    // Query for tasks where the user is in the assignees array
    const query = {
        'assignees.user': req.user._id
    };

    // Add filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (project) query.project = project;

    // Date range filter
    if (startDate || endDate) {
        query.dueDate = {};
        if (startDate) query.dueDate.$gte = moment(startDate).startOf('day').toDate();
        if (endDate) query.dueDate.$lte = moment(endDate).endOf('day').toDate();
    }

    // Search in title or description
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    const tasks = await Task.find(query)
        .populate({
            path: 'assignees.user',
            select: 'name email'
        })
        .populate('project', 'title')
        .populate('createdBy', 'name email')
        .populate('category', 'name color')
        .populate('labels', 'name color')
        .populate('completedBy', 'name email')
        .sort({ dueDate: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    // Format dates for all tasks
    const formattedTasks = tasks.map(task => ({
        ...task._doc,
        createdAt: moment(task.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment(task.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
        dueDate: task.dueDate ? moment(task.dueDate).format('YYYY-MM-DD') : null,
        completedAt: task.completedAt ? moment(task.completedAt).format('YYYY-MM-DD HH:mm:ss') : null,
        assignees: task.assignees.map(assignee => ({
            ...assignee._doc,
            assignedAt: moment(assignee.assignedAt).format('YYYY-MM-DD HH:mm:ss')
        })),
        subtasks: task.subtasks.map(subtask => ({
            ...subtask,
            dueDate: subtask.dueDate ? moment(subtask.dueDate).format('YYYY-MM-DD') : null,
            completedAt: subtask.completedAt ? moment(subtask.completedAt).format('YYYY-MM-DD HH:mm:ss') : null
        }))
    }));

    const total = await Task.countDocuments(query);

    res.status(200).json(
        new ApiResponse(200, {
            tasks: formattedTasks,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        }, "Tasks retrieved successfully")
    );
});

export {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    addTaskComment,
    getTaskStats,
    getTasksByProjectId,
    getMyTasks,
    markTaskComplete
};