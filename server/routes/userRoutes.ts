import express from "express";
import {
  registerUser,
  loginUser,
  getMyData,
  deleteUser,
  acknowledgeBetwizBet360Link,
} from "../controllers/userController";
import { protect, adminOnly } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/my-data", protect, getMyData);
router.delete("/delete", protect, deleteUser);
router.put(
  "/:userId/acknowledge-betwiz-bet360-link",
  adminOnly,
  acknowledgeBetwizBet360Link
);

export default router;
