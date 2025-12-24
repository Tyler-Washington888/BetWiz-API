import express from "express";
import {
  authorize,
  authorizePost,
  token,
  revokeToken,
} from "../controllers/oauthController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/authorize", authorize);
router.post("/authorize", authorizePost);
router.post("/token", token);
router.post("/revoke", protect, revokeToken);

export default router;

