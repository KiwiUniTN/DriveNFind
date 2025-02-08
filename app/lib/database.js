import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);
  if (!process.env.MONGODB_URI) {
    return { success: false, message: "MONGODB_URI is missing in environment variables" };
  }
  if (isConnected) {
    return { success: true, message: "Already connected to the database" };
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "drivenfind",
    });
    isConnected = true;
    return { success: true, message: "Database connected successfully!" };
  } catch (error) {
    console.error("Database connection failed:", error);
    return { success: false, message: "Database connection failed" };
  }
};

export const setIsConnectedForTesting = (value) => {
  isConnected = value;
};
