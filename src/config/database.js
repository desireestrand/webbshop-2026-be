import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in .env");
  }

  if (mongoose.connection.readyState === 1) return;

  try {
    await mongoose.connect(MONGODB_URI);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

export async function disconnectFromDatabase() {
  if (mongoose.connection.readyState === 0) return;

  try {
    await mongoose.disconnect();
  } catch (err) {
    console.error("MongoDB disconnection error:", err);
  }
}

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Disconnected from MongoDB");
});