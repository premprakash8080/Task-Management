import mongoose from "mongoose";
const { Schema } = mongoose;

const TaskSchema = new Schema({
    title: {
        type: String,
        default: 'No Title'
    },
    content: {
        type: String,
        default: 'No Content'
    },
    date: {
        type: Date,
        default: Date.now
    },
    contributors: {
        type: Schema.Types.ObjectId, // don't forget that!
        required: true
    },
    status: {
        type: Number,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        required: true
    },
    dueDate: {
        type: Date,
        default: Date.now
    },
    color: {
        type: String,
        default: "#2196f3"
    },
    storyId: {
        type: Number,
        required: true
    }
});

export default mongoose.model("Task", TaskSchema);