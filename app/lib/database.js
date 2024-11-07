// app/lib/database.js
import mongoose from "mongoose";

let isConnected = false; // Track the connection state

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  if (isConnected) {
    console.log("Already connected to the database");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "sample_mflix", // Specify the database name here
    });

    isConnected = true;
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};
