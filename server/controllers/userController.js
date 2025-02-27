import mongoose from "mongoose";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// User Registration
const registerUser = asyncHandler(async (req, res) => {
    const { username, name, lastName, password } = req.body;

    if (!username || !name || !lastName || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        throw new ApiError(400, "Username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, name, lastName, password: hashedPassword });

    await newUser.save();
    res.status(201).json(new ApiResponse(201,  newUser, "User registered successfully"));
});

// User Login
const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        throw new ApiError(400, "Username and password are required");
    }

    const user = await User.findOne({ username });
    if (!user) throw new ApiError(400, "User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ApiError(400, "Invalid credentials");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "your_jwt_secret", { expiresIn: "1h" });
    res.status(200).json(new ApiResponse(200,  { token } ,"Login successful"));
});

// Create User
const createUser = asyncHandler(async (req, res) => {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(new ApiResponse(201, user ,"User created successfully" ));
});

// Get All Users
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    if (!users.length) throw new ApiError(404, "No users found");

    res.status(200).json(new ApiResponse(200,  users ,"Users retrieved successfully"));
});

// Delete User
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid user ID");

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) throw new ApiError(404, "User not found");

    res.status(200).json(new ApiResponse(200, "User deleted successfully"));
});

export {
    registerUser,
    loginUser,
    createUser,
    getAllUsers,
    deleteUser
};