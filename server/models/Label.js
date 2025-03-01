import mongoose from "mongoose";

const labelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Label name is required"],
        trim: true
    },
    color: {
        type: String,
        default: "#e0e0e0"
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Ensure unique label names within a project
labelSchema.index({ name: 1, projectId: 1 }, { unique: true });

const Label = mongoose.model("Label", labelSchema);
export default Label; 