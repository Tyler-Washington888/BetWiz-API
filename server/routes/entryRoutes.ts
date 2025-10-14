import express from "express";
import { createEntry } from "../controllers/entryController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, createEntry);

export default router;
