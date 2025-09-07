import express from "express";
import {
  registerUser,
  loginUser,
  getMyData,
  deleteUser,
} from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/my-data", protect, getMyData);
router.delete("/delete", protect, deleteUser);

export default router;
