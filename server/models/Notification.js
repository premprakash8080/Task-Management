import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String, 
        required: true
    },
    type: {
        type: String,
        enum: ["task_assigned", "task_completed", "comment_added", "due_date_reminder", "project_update"],
        required: true
    },
    relatedTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
    },
    relatedProject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification; 