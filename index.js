import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

// import routes

import userRoutes from "./routes/userRoutes.js";

const app = express();
const corsOptions = {
  origin:
    process.env.NODE_ENV === "development"
      ? process.env.DEVELOPMENT_CLIENT_URL
      : process.env.PRODUCTION_CLIENT_URL,
  credentials: true,
};

app.use(cors(corsOptions));

dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log("listening on port", process.env.PORT);
  });
});

// routes

app.use("/api/users", userRoutes);
