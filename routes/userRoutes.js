import express from "express";

const router = express.Router();
import { protect, verifyTokenAndAdmin } from "../middleware/verifyToken.js";

import {
  login,
  logout,
  refreshAccessToken,
  register,
} from "../controllers/userControllers.js";
import {
  deleteStudent,
  getAllUsers,
} from "../controllers/StudentControllers.js";

router.post("/register", register);
router.post("/refresh-token", refreshAccessToken);
router.post("/login", login);
router.post("/logout", protect, logout);

export default router;
