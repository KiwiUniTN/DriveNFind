// app/lib/database.js
import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  if (isConnected) {
    console.log("Already connected to the database");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "drivenfind",
    });

    isConnected = true;
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};
