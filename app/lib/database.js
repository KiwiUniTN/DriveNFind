// app/lib/database.js
import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  // Check if already connected to avoid reconnecting
  if (isConnected) {
    console.log("Already connected to the database");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "drivenfind"
    });

    // Set isConnected to true after a successful connection
    isConnected = true;
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};
