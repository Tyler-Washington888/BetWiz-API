import express from "express";
import { getPicks } from "../controllers/pickController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", protect, getPicks);

export default router;
