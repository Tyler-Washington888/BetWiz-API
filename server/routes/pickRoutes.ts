import express from "express";
import {
  createPick,
  getPicks,
  getPickById,
  deletePick,
} from "../controllers/pickController";
import { protect, adminOnly } from "../middleware/authMiddleware";

const router = express.Router();

router.route("/").get(protect, getPicks).post(protect, adminOnly, createPick);

router
  .route("/:id")
  .get(protect, getPickById)
  .delete(protect, adminOnly, deletePick);

export default router;
