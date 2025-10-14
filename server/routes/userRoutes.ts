import express from "express";
import {
  signUp,
  login,
  getProfile,
  acknowledgeBetwizBet360Link,
} from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.put(
  "/acknowledge-betwiz-bet360-link/:email",
  acknowledgeBetwizBet360Link
);

export default router;
