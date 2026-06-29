import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const connStr = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/diabeguide";
    await mongoose.connect(connStr);
    console.log(`MongoDB Connected successfully to ${connStr}`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};
