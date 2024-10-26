import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    // Log the NODE_ENV to ensure it's correctly set
    // console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

    const uri =
      process.env.NODE_ENV === "development"
        ? process.env.DEVELOPMENT_MONGO_URI
        : process.env.PRODUCTION_MONGO_URI;

    // Log the URI to ensure it's correctly set
    console.log(`Connecting to MongoDB with URI: ${uri}`);

    if (!uri) {
      throw new Error("MongoDB URI is not defined");
    }

    const conn = await mongoose.connect(uri, {
      ssl: true, // Enable SSL explicitly
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
