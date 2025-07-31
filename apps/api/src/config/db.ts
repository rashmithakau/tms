import mongoose from "mongoose"
import { MONGO_URI } from "../constants/env";

const connectDB=async ()=>{
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process with failure
    }
}
export default connectDB;