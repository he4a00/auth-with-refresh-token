import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
dotenv.config();

const protect = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Token not found" });
    }

    jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET,
      async (err, decodedToken) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "jwt expired" });
          }
          return res.status(403).json({ message: "Token verification failed" });
        }

        const user = await User.findById(decodedToken?._id).select(
          "-password -refreshTokens"
        );

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next();
      }
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const verifyTokenAndAdmin = async (req, res, next) => {
  await protect(req, res, async () => {
    if (req.user && req.user.type === "teacher") {
      return next();
    } else {
      return res.status(403).json("You're not authorized");
    }
  });
};

export { protect, verifyTokenAndAdmin };
