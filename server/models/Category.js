import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    color: {
        type: String,
        default: "#2196f3"
    },
    icon: {
        type: String,
        default: "folder"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isGlobal: {
        type: Boolean,
        default: false
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    }
}, {
    timestamps: true
});

// Ensure unique category names within a project
categorySchema.index({ name: 1, projectId: 1 }, { unique: true });

const Category = mongoose.model("Category", categorySchema);
export default Category; 