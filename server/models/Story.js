import mongoose from "mongoose";

const { Schema, model } = mongoose;

const StorySchema = new Schema({
    title: {
        type: String,
        required: true,  // Ensuring title is required
        maxlength: 100,  // Increased length for better usability
        trim: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",  // Assuming there is a User model
        required: true,  // Ensuring stories are associated with a user
    },
    storyId: {
        type: Number,
        required: true,
        unique: true,  // Prevent duplicate story IDs
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
});

const Story = model("Story", StorySchema);
export default Story;