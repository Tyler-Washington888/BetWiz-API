import express from "express";
import {
  createEntry,
  getMyEntries,
  getEntryById,
} from "../controllers/entryController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, createEntry);
router.get("/my-entries", protect, getMyEntries);
router.get("/my-entries/:id", protect, getEntryById);

export default router;
