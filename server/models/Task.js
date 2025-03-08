import mongoose from "mongoose";

const subtaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['todo', 'in_progress', 'completed'],
        default: 'todo'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dueDate: Date,
    completedAt: Date
});

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
    assignees: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        assignedAt: {
            type: Date,
            default: Date.now
        },
        role: {
            type: String,
            enum: ["responsible", "accountable", "consulted", "informed"],
            default: "responsible"
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["backlog", "todo", "in_progress", "in_review", "done", "archived"],
        default: "todo"
    },
    completedAt: {
        type: Date
    },
    completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    priority: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
        default: "MEDIUM"
    },
    dueDate: Date,
    startDate: Date,
    estimatedTime: {
        type: Number, // in minutes
        min: 0
    },
    actualTime: {
        type: Number, // in minutes
        min: 0,
        default: 0
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    subtasks: [subtaskSchema],
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
    }],
    dependencies: [{
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        },
        type: {
            type: String,
            enum: ['blocks', 'blocked_by', 'relates_to', 'duplicates', 'is_duplicated_by'],
            required: true
        }
    }],
    timeTracking: {
        estimated: Number, // in minutes
        spent: {
            type: Number,
            default: 0
        },
        remaining: Number,
        logs: [{
            duration: Number,
            description: String,
            startTime: Date,
            endTime: Date,
            loggedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }]
    },
    recurring: {
        isRecurring: {
            type: Boolean,
            default: false
        },
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'custom']
        },
        customPattern: String,
        startDate: Date,
        endDate: Date,
        lastGenerated: Date
    },
    customFields: [{
        name: String,
        value: mongoose.Schema.Types.Mixed,
        type: {
            type: String,
            enum: ['text', 'number', 'date', 'select', 'multiselect', 'checkbox']
        },
        options: [String] // For select/multiselect fields
    }],
    version: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

// Indexes for better query performance
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ "assignees.user": 1, status: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ labels: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ status: 1, completedAt: -1 });
taskSchema.index({ 'recurring.isRecurring': 1, 'recurring.frequency': 1 });
taskSchema.index({ createdAt: -1 });

// Pre-save middleware to handle task completion
taskSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'done' && !this.completedAt) {
        this.completedAt = new Date();
        this.completedBy = this.modifiedBy; // Assuming modifiedBy is set in the controller
    }
    if (this.isModified()) {
        this.version += 1;
    }
    next();
});

const Task = mongoose.model("Task", taskSchema);
export default Task;