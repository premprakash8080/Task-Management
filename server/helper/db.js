import mongoose from "mongoose";

mongoose.Promise = global.Promise;

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false); // Recommended for Mongoose 7+

    await mongoose.connect("mongodb://127.0.0.1:27017/test", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Connection Successful");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;