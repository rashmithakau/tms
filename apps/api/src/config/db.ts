import mongoose from "mongoose"
import { MONGO_URI } from "../constants/env";

const connectDB = async () => {
    try {
        // Configure connection with performance optimizations
        await mongoose.connect(MONGO_URI, {
            maxPoolSize: 10, // Maximum number of connections in the pool
            minPoolSize: 2,  // Minimum number of connections in the pool
            serverSelectionTimeoutMS: 5000, // Timeout for server selection
            socketTimeoutMS: 45000, // Timeout for socket operations
        });
        
        // Set up connection event handlers
        mongoose.connection.on('connected', () => {
            console.log("MongoDB connected successfully");
        });
        
        mongoose.connection.on('error', (err) => {
            console.error("MongoDB connection error:", err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn("MongoDB disconnected");
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process with failure
    }
}

export default connectDB;