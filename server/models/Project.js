import mongoose from "mongoose";
import User from "./User.js";

const projectSchema = new mongoose.Schema({
    projectId: {
        type: String,
        unique: true,
        default: () => Math.random().toString(36).substr(2, 9) // Generates a random ID
    },
    title: {
        type: String,
        required: [true, "Project title is required"],
        trim: true,
        maxlength: [100, "Title cannot exceed 100 characters"]
    },
    description: {
        type: String,
        required: [true, "Project description is required"],
        trim: true
    },
    status: {
        type: String,
        enum: ["planning", "in-progress", "completed", "on-hold"],
        default: "planning"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        role: {
            type: String,
            enum: ["leader", "member"],
            default: "member"
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    startDate: {
        type: Date,
        required: true
    },
    endDate: Date,
    priority: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH"],
        default: "MEDIUM"
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    tags: [String]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for tasks
projectSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'project'
});

// Indexes for better query performance
projectSchema.index({ createdBy: 1, status: 1 });
projectSchema.index({ "members.user": 1 });

// Drop the problematic unique index if it exists
mongoose.connection.once('open', async () => {
    try {
        await mongoose.connection.collection('projects').dropIndex('projectId_1');
    } catch (error) {
        // Index might not exist, that's okay
    }
});

const Project = mongoose.model("Project", projectSchema);
export default Project;