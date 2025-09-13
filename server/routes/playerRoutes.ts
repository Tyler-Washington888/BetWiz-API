import express from "express";
import {
  createPlayer,
  getPlayers,
  getPlayerById,
  updatePlayer,
  deletePlayer,
} from "../controllers/playerController";
import { adminOnly, protect } from "../middleware/authMiddleware";

const router = express.Router();

router
  .route("/")
  .get(protect, adminOnly, getPlayers)
  .post(protect, adminOnly, createPlayer);

router
  .route("/:id")
  .get(getPlayerById)
  .put(protect, adminOnly, updatePlayer)
  .delete(protect, adminOnly, deletePlayer);

export default router;
