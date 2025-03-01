import mongoose from "mongoose";
import Project from "../models/Project.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create Project
const createProject = asyncHandler(async (req, res) => {
    const { title, description, startDate, endDate, priority, tags } = req.body;

    if (!title || !description || !startDate) {
        throw new ApiError(400, "Title, description and start date are required");
    }

    const project = await Project.create({
        projectId: Math.random().toString(36).substr(2, 9), // Generate a unique project ID
        title,
        description,
        startDate,
        endDate,
        priority,
        tags,
        createdBy: req.user._id,
        members: [{ user: req.user._id, role: "leader" }]
    });

    res.status(201).json(
        new ApiResponse(201, project, "Project created successfully")
    );
});

// Get All Projects (with filters and pagination)
const getAllProjects = asyncHandler(async (req, res) => {
    const { status, priority, search, page = 1, limit = 10 } = req.query;
    const query = {};

    // Filter by status
    if (status) {
        query.status = status;
    }

    // Filter by priority
    if (priority) {
        query.priority = priority;
    }

    // Search in title or description
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    // Filter projects where user is member or creator
    query.$or = [
        { createdBy: req.user._id },
        { 'members.user': req.user._id }
    ];

    const projects = await Project.find(query)
        .populate('createdBy', 'name email')
        .populate('members.user', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await Project.countDocuments(query);

    res.status(200).json(
        new ApiResponse(200, {
            projects,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        }, "Projects retrieved successfully")
    );
});

// Get Project by ID
const getProjectById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid project ID");
    }

    const project = await Project.findById(id)
        .populate('createdBy', 'name email')
        .populate('members.user', 'name email')
        .populate({
            path: 'tasks',
            populate: { path: 'assignedTo', select: 'name email' }
        });

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Check if user has access to project
    const isMember = project.members.some(member => 
        member.user._id.toString() === req.user._id.toString()
    );
    const isCreator = project.createdBy._id.toString() === req.user._id.toString();

    if (!isMember && !isCreator) {
        throw new ApiError(403, "Not authorized to access this project");
    }

    res.status(200).json(
        new ApiResponse(200, project, "Project retrieved successfully")
    );
});

// Update Project
const updateProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid project ID");
    }

    const project = await Project.findById(id);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Check if user is project leader or creator
    const isLeader = project.members.some(member => 
        member.user.toString() === req.user._id.toString() && member.role === "leader"
    );
    const isCreator = project.createdBy.toString() === req.user._id.toString();

    if (!isLeader && !isCreator) {
        throw new ApiError(403, "Not authorized to update this project");
    }

    // Update project
    const updatedProject = await Project.findByIdAndUpdate(
        id,
        { ...updates },
        { new: true, runValidators: true }
    )
    .populate('createdBy', 'name email')
    .populate('members.user', 'name email');

    res.status(200).json(
        new ApiResponse(200, updatedProject, "Project updated successfully")
    );
});

// Delete Project
const deleteProject = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid project ID");
    }

    const project = await Project.findById(id);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Only creator can delete project
    if (project.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to delete this project");
    }

    await Project.findByIdAndDelete(id);

    res.status(200).json(
        new ApiResponse(200, null, "Project deleted successfully")
    );
});

// Add Member to Project
const addProjectMember = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userId, role = "member" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid project ID or user ID");
    }

    const project = await Project.findById(id);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Check if user is already a member
    if (project.members.some(member => member.user.toString() === userId)) {
        throw new ApiError(400, "User is already a member of this project");
    }

    // Only leader or creator can add members
    const isLeader = project.members.some(member => 
        member.user.toString() === req.user._id.toString() && member.role === "leader"
    );
    const isCreator = project.createdBy.toString() === req.user._id.toString();

    if (!isLeader && !isCreator) {
        throw new ApiError(403, "Not authorized to add members to this project");
    }

    project.members.push({ user: userId, role });
    await project.save();

    const updatedProject = await Project.findById(id)
        .populate('createdBy', 'name email')
        .populate('members.user', 'name email');

    res.status(200).json(
        new ApiResponse(200, updatedProject, "Member added successfully")
    );
});

// Remove Member from Project
const removeProjectMember = asyncHandler(async (req, res) => {
    const { id, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid project ID or user ID");
    }

    const project = await Project.findById(id);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Only leader or creator can remove members
    const isLeader = project.members.some(member => 
        member.user.toString() === req.user._id.toString() && member.role === "leader"
    );
    const isCreator = project.createdBy.toString() === req.user._id.toString();

    if (!isLeader && !isCreator) {
        throw new ApiError(403, "Not authorized to remove members from this project");
    }

    // Cannot remove the creator
    if (userId === project.createdBy.toString()) {
        throw new ApiError(400, "Cannot remove project creator");
    }

    project.members = project.members.filter(
        member => member.user.toString() !== userId
    );

    await project.save();

    const updatedProject = await Project.findById(id)
        .populate('createdBy', 'name email')
        .populate('members.user', 'name email');

    res.status(200).json(
        new ApiResponse(200, updatedProject, "Member removed successfully")
    );
});

// Get Project Statistics
const getProjectStats = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid project ID");
    }

    const project = await Project.findById(id).populate('tasks');

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const stats = {
        totalTasks: project.tasks.length,
        completedTasks: project.tasks.filter(task => task.status === "done").length,
        inProgressTasks: project.tasks.filter(task => task.status === "in_progress").length,
        todoTasks: project.tasks.filter(task => task.status === "todo").length,
        memberCount: project.members.length,
        progress: project.progress
    };

    res.status(200).json(
        new ApiResponse(200, stats, "Project statistics retrieved successfully")
    );
});

export {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addProjectMember,
    removeProjectMember,
    getProjectStats
};