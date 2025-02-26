import mongoose from "mongoose";
import Story from "../models/Story.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a Story
const createStory = asyncHandler(async (req, res) => {
    const { title, content, status } = req.body;

    if (!title || !content || !status) {
        throw new ApiError(400, "All fields are required");
    }

    const newStory = new Story({ title, content, status });
    await newStory.save();

    res.status(201).json(new ApiResponse(201, "Story created successfully", newStory));
});

// Get All Stories
const getAllStories = asyncHandler(async (req, res) => {
    const stories = await Story.find({});
    if (!stories.length) throw new ApiError(404, "No stories found");

    res.status(200).json(new ApiResponse(200, "Stories retrieved successfully", stories));
});

// Get Story Count by Status
const getStoryCount = asyncHandler(async (req, res) => {
    const count = await Story.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
            },
        },
    ]);

    res.status(200).json(new ApiResponse(200, "Story count retrieved", count));
});

// Get a Single Story by ID
const getStoryById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid story ID");

    const story = await Story.findById(id);
    if (!story) throw new ApiError(404, "Story not found");

    res.status(200).json(new ApiResponse(200, "Story retrieved successfully", story));
});

// Update Story
const updateStory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid story ID");

    const updatedStory = await Story.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedStory) throw new ApiError(404, "Story not found");

    res.status(200).json(new ApiResponse(200, "Story updated successfully", updatedStory));
});

// Delete Story
const deleteStory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid story ID");

    const deletedStory = await Story.findByIdAndDelete(id);
    if (!deletedStory) throw new ApiError(404, "Story not found");

    res.status(200).json(new ApiResponse(200, "Story deleted successfully"));
});

export {
    createStory,
    getAllStories,
    getStoryCount,
    getStoryById,
    updateStory,
    deleteStory
};