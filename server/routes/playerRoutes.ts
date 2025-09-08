import express from "express";
import {
  createPlayer,
  getPlayers,
  getPlayerById,
  updatePlayer,
  deletePlayer,
} from "../controllers/playerController";
import { adminOnly } from "../middleware/authMiddleware";

const router = express.Router();

router.route("/").get(getPlayers).post(adminOnly, createPlayer);

router
  .route("/:id")
  .get(getPlayerById)
  .put(adminOnly, updatePlayer)
  .delete(adminOnly, deletePlayer);

export default router;
