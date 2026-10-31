import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import { env } from "./env.js";

// Native MongoDB client for Better Auth
export const mongoClient = new MongoClient(env.MONGODB_URI);

// Select StudioSpace database
export const mongoDb = mongoClient.db(env.MONGODB_DB);

// Connect to MongoDB
export const connectDB = async () => {
  try {
    await mongoClient.connect();

    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB,
    });

    console.log(`MongoDB Connected: ${mongoDb.databaseName}`);
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    throw error;
  }
};