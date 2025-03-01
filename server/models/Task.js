import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Task title is required"],
        trim: true,
        maxlength: [255, "Title cannot exceed 255 characters"]
    },
    description: {
        type: String,
        trim: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: [true, "Project reference is required"]
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    labels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Label"
    }],
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["todo", "in_progress", "done"],
        default: "todo"
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },
    dueDate: Date,
    estimatedTime: {
        type: Number, // in minutes
        min: 0
    },
    actualTime: {
        type: Number, // in minutes
        min: 0,
        default: 0
    },
    subtasks: [{
        title: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["todo", "in_progress", "done"],
            default: "todo"
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        completedAt: Date
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        content: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    attachments: [{
        fileUrl: {
            type: String,
            required: true
        },
        fileName: {
            type: String,
            required: true
        },
        fileType: String,
        fileSize: Number,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    history: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        action: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ labels: 1 });
taskSchema.index({ dueDate: 1 });

const Task = mongoose.model("Task", taskSchema);
export default Task;