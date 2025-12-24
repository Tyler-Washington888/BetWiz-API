import express from "express";
import {
  signUp,
  login,
  getProfile,
  acknowledgeBetwizBet360Link,
  getSubscriptionStatus,
  subscribe,
  unsubscribe,
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
router.get("/:userId/isSubscribed", protect, getSubscriptionStatus);
router.post("/:userId/subscribe", protect, subscribe);
router.post("/:userId/unsubscribe", protect, unsubscribe);

export default router;
