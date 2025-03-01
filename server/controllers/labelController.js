import mongoose from "mongoose";
import Label from "../models/Label.js";
import Project from "../models/Project.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create Label
const createLabel = asyncHandler(async (req, res) => {
    const { name, color, description, projectId } = req.body;

    if (!name || !projectId) {
        throw new ApiError(400, "Label name and project ID are required");
    }

    // Verify project access
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const isLeader = project.members.some(member => 
        member.user.toString() === req.user._id.toString() && member.role === "leader"
    );
    const isCreator = project.createdBy.toString() === req.user._id.toString();

    if (!isLeader && !isCreator) {
        throw new ApiError(403, "Not authorized to create labels in this project");
    }

    const label = await Label.create({
        name,
        color,
        description,
        projectId,
        createdBy: req.user._id
    });

    res.status(201).json(
        new ApiResponse(201, label, "Label created successfully")
    );
});

// Get Labels
const getLabels = asyncHandler(async (req, res) => {
    const { projectId } = req.query;

    if (!projectId) {
        throw new ApiError(400, "Project ID is required");
    }

    // Verify project access
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const isMember = project.members.some(member => 
        member.user.toString() === req.user._id.toString()
    );
    const isCreator = project.createdBy.toString() === req.user._id.toString();

    if (!isMember && !isCreator) {
        throw new ApiError(403, "Not authorized to view labels in this project");
    }

    const labels = await Label.find({ projectId })
        .populate('createdBy', 'name email');

    res.status(200).json(
        new ApiResponse(200, labels, "Labels retrieved successfully")
    );
});

// Update Label
const updateLabel = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid label ID");
    }

    const label = await Label.findById(id);
    if (!label) {
        throw new ApiError(404, "Label not found");
    }

    // Verify project access
    const project = await Project.findById(label.projectId);
    const isLeader = project.members.some(member => 
        member.user.toString() === req.user._id.toString() && member.role === "leader"
    );
    const isCreator = project.createdBy.toString() === req.user._id.toString();

    if (!isLeader && !isCreator) {
        throw new ApiError(403, "Not authorized to update this label");
    }

    const updatedLabel = await Label.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.status(200).json(
        new ApiResponse(200, updatedLabel, "Label updated successfully")
    );
});

// Delete Label
const deleteLabel = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid label ID");
    }

    const label = await Label.findById(id);
    if (!label) {
        throw new ApiError(404, "Label not found");
    }

    // Verify project access
    const project = await Project.findById(label.projectId);
    const isLeader = project.members.some(member => 
        member.user.toString() === req.user._id.toString() && member.role === "leader"
    );
    const isCreator = project.createdBy.toString() === req.user._id.toString();

    if (!isLeader && !isCreator) {
        throw new ApiError(403, "Not authorized to delete this label");
    }

    await Label.findByIdAndDelete(id);

    res.status(200).json(
        new ApiResponse(200, null, "Label deleted successfully")
    );
});

export {
    createLabel,
    getLabels,
    updateLabel,
    deleteLabel
}; 