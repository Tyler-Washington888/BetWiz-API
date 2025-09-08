import express from "express";
import {
  createPick,
  getPicks,
  getPickById,
  deletePick,
} from "../controllers/pickController";
import { adminOnly } from "../middleware/authMiddleware";

const router = express.Router();

router.route("/").get(getPicks).post(adminOnly, createPick);

router.route("/:id").get(adminOnly, getPickById).delete(adminOnly, deletePick);

export default router;
