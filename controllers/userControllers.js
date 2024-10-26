import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const register = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
     
      password,
    } = req.body;

    const userExists = await User.findOne({ phoneNumber: phoneNumber });

    if (userExists) {
      return res.status(409).json("user already exists");
    }

    if (
      !firstname ||
      !lastname ||
      
    ) {
      return res.status(404).json("Some data is missing");
    }

    const newUser = await User.create({
      firstname,
      lastname,
      password,
    });

    const createdUser = await User.findById(newUser._id).select(
      "-password -refreshToken"
    );

    return res
      .status(201)
      .json({ user: createdUser, message: "User created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(error.message);
  }
};

const login = async (req, res) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return res
      .status(400)
      .json({ message: "Phone Number and password are required" });
  }

  try {
    const user = await User.findOne({ phoneNumber }).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await user.correctPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshTokens"
    );

    const accessTokenOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    };

    const refreshTokenOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
      // maxAge: 1 * 60 * 1000, // 30 days
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, accessTokenOptions)
      .cookie("refreshToken", refreshToken, refreshTokenOptions)
      .json({
        user: loggedInUser,
        accessToken,
        refreshToken,
        message: "Logged in successfully",
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token not found" });
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
    path: "/",
  };

  return res
    .status(200)
    .cookie("accessToken", "", options)
    .cookie("refreshToken", "", options)
    .json({ user: {}, message: "Logged out successfully" });
};

const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({ message: "Refresh token not found" });
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_SECRET
    );
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const accessTokenOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
      // maxAge: 1 * 60 * 1000, // 1 minute
    };

    const refreshTokenOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      // maxAge: 1 * 60 * 1000, // 1 minute
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id,
      incomingRefreshToken
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, accessTokenOptions)
      .cookie("refreshToken", refreshToken, refreshTokenOptions)
      .json({ accessToken, refreshToken, message: "Access token refreshed" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export { register, login, logout, refreshAccessToken };
