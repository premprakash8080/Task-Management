import mongoose from "mongoose";
import Category from "../models/Category.js";
import Project from "../models/Project.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create Category
const createCategory = asyncHandler(async (req, res) => {
    const { name, description, color, icon, projectId, isGlobal } = req.body;

    if (!name) {
        throw new ApiError(400, "Category name is required");
    }

    // If category is project-specific, verify project access
    if (projectId) {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new ApiError(404, "Project not found");
        }

        const isLeader = project.members.some(member => 
            member.user.toString() === req.user._id.toString() && member.role === "leader"
        );
        const isCreator = project.createdBy.toString() === req.user._id.toString();

        if (!isLeader && !isCreator) {
            throw new ApiError(403, "Not authorized to create categories in this project");
        }
    }

    const category = await Category.create({
        name,
        description,
        color,
        icon,
        projectId,
        isGlobal,
        createdBy: req.user._id
    });

    res.status(201).json(
        new ApiResponse(201, category, "Category created successfully")
    );
});

// Get Categories
const getCategories = asyncHandler(async (req, res) => {
    const { projectId } = req.query;
    const query = {};

    if (projectId) {
        query.projectId = projectId;
        
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
            throw new ApiError(403, "Not authorized to view categories in this project");
        }
    }

    // Get global categories and project-specific categories
    const categories = await Category.find({
        $or: [
            query,
            { isGlobal: true }
        ]
    }).populate('createdBy', 'name email');

    res.status(200).json(
        new ApiResponse(200, categories, "Categories retrieved successfully")
    );
});

// Update Category
const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid category ID");
    }

    const category = await Category.findById(id);
    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    // Check authorization
    if (category.projectId) {
        const project = await Project.findById(category.projectId);
        const isLeader = project.members.some(member => 
            member.user.toString() === req.user._id.toString() && member.role === "leader"
        );
        const isCreator = project.createdBy.toString() === req.user._id.toString();

        if (!isLeader && !isCreator) {
            throw new ApiError(403, "Not authorized to update this category");
        }
    } else if (!category.isGlobal) {
        // Only creator can update non-global categories
        if (category.createdBy.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "Not authorized to update this category");
        }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.status(200).json(
        new ApiResponse(200, updatedCategory, "Category updated successfully")
    );
});

// Delete Category
const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid category ID");
    }

    const category = await Category.findById(id);
    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    // Check authorization
    if (category.projectId) {
        const project = await Project.findById(category.projectId);
        const isLeader = project.members.some(member => 
            member.user.toString() === req.user._id.toString() && member.role === "leader"
        );
        const isCreator = project.createdBy.toString() === req.user._id.toString();

        if (!isLeader && !isCreator) {
            throw new ApiError(403, "Not authorized to delete this category");
        }
    } else if (!category.isGlobal) {
        // Only creator can delete non-global categories
        if (category.createdBy.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "Not authorized to delete this category");
        }
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json(
        new ApiResponse(200, null, "Category deleted successfully")
    );
});

export {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
}; 