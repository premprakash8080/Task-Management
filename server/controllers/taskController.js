import Task from "../models/Task.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// Create Task
const createTask = asyncHandler(async (req, res) => {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(new ApiResponse(201, "Task created successfully", task));
});

// Get Task Counter by Status
const getTaskCounter = asyncHandler(async (req, res) => {
    const taskCount = await Task.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);
    res.status(200).json(new ApiResponse(200, "Task count retrieved", taskCount));
});

// Get Tasks by Story ID
const getTasksByStoryId = asyncHandler(async (req, res) => {
    const tasks = await Task.aggregate([
        { $match: { storyId: parseInt(req.params.id) } },
        {
            $lookup: {
                from: "users",
                localField: "contributors",
                foreignField: "_id",
                as: "contributors"
            }
        },
        { $unwind: "$contributors" },
        {
            $group: {
                _id: {
                    _id: "$_id",
                    content: "$content",
                    title: "$title",
                    status: "$status",
                    date: "$date",
                    color: "$color",
                    dueDate: "$dueDate",
                    createdBy: "$createdBy"
                },
                contributors: { $push: "$contributors" }
            }
        },
        {
            $project: {
                _id: "$_id._id",
                content: "$_id.content",
                title: "$_id.title",
                status: "$_id.status",
                date: "$_id.date",
                dueDate: "$_id.dueDate",
                color: "$_id.color",
                createdBy: "$_id.createdBy",
                contributors: "$contributors",
            }
        }
    ]);
    res.status(200).json(new ApiResponse(200, "Tasks retrieved successfully", tasks));
});

// Get Single Task by ID
const getTaskById = asyncHandler(async (req, res) => {
    const taskId = req.params.id;

    if (!mongoose.isValidObjectId(taskId)) {
        throw new ApiError(400, "Invalid task ID");
    }

    const task = await Task.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(taskId) } },
        {
            $lookup: {
                from: "users",
                localField: "contributors",
                foreignField: "_id",
                as: "contributors"
            }
        },
        { $unwind: "$contributors" },
        {
            $group: {
                _id: {
                    _id: "$_id",
                    content: "$content",
                    title: "$title",
                    status: "$status",
                    date: "$date",
                    color: "$color",
                    dueDate: "$dueDate",
                    createdBy: "$createdBy"
                },
                contributors: { $push: "$contributors" }
            }
        },
        {
            $project: {
                _id: "$_id._id",
                content: "$_id.content",
                title: "$_id.title",
                status: "$_id.status",
                date: "$_id.date",
                dueDate: "$_id.dueDate",
                color: "$_id.color",
                createdBy: "$_id.createdBy",
                contributors: "$contributors",
            }
        }
    ]);

    if (!task.length) throw new ApiError(404, "Task not found");

    res.status(200).json(new ApiResponse(200, "Task retrieved successfully", task[0]));
});

// Update Task
const updateTask = asyncHandler(async (req, res) => {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTask) throw new ApiError(404, "Task not found");

    res.status(200).json(new ApiResponse(200, "Task updated successfully", updatedTask));
});

// Delete Task
const deleteTask = asyncHandler(async (req, res) => {
    const deletedTask = await Task.findByIdAndRemove(req.params.id);
    if (!deletedTask) throw new ApiError(404, "Task not found");

    res.status(200).json(new ApiResponse(200, "Task deleted successfully"));
});

// Get All Tasks
const getAllTasks = asyncHandler(async (req, res) => {
    const tasks = await Task.find({});
    res.status(200).json(new ApiResponse(200, "All tasks retrieved successfully", tasks));
});

export {
    createTask,
    getTaskCounter,
    getTasksByStoryId,
    getTaskById,
    updateTask,
    deleteTask,
    getAllTasks
};