import mongoose from "mongoose";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "your_jwt_secret", {
        expiresIn: "30d"
    });
};

// User Registration
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, name, lastName, password } = req.body;

    if (!username || !email || !name || !password) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        throw new ApiError(400, "User already exists with this email or username");
    }

    const user = await User.create({
        username,
        email,
        name,
        lastName,
        password
    });

    const token = generateToken(user._id);

    res.status(201).json(
        new ApiResponse(201, {
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                name: user.name,
                lastName: user.lastName,
                role: user.role
            },
            token
        }, "User registered successfully")
    );
});

// User Login
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        throw new ApiError(401, "Invalid credentials");
    }

    const token = generateToken(user._id);

    res.status(200).json(
        new ApiResponse(200, {
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                name: user.name,
                lastName: user.lastName,
                role: user.role
            },
            token
        }, "Login successful")
    );
});

// Get Current User Profile
const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.status(200).json(new ApiResponse(200, user, "User profile retrieved"));
});

// Update User Profile
const updateProfile = asyncHandler(async (req, res) => {
    const { name, lastName, email } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = name || user.name;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;

        const updatedUser = await user.save();
        res.status(200).json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
    } else {
        throw new ApiError(404, "User not found");
    }
});

// Change Password
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Both current and new password are required");
    }

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
        throw new ApiError(401, "Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json(new ApiResponse(200, null, "Password changed successfully"));
});

// Get All Users (Admin only)
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select("-password");
    res.status(200).json(new ApiResponse(200, users, "Users retrieved successfully"));
});

// Delete User (Admin only)
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
});

export {
    registerUser,
    loginUser,
    getCurrentUser,
    updateProfile,
    changePassword,
    getAllUsers,
    deleteUser
};