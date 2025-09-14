import express from "express";
import {
  createGame,
  getGames,
  getGameById,
  updateGame,
  deleteGame,
} from "../controllers/gameController";
import { protect, adminOnly } from "../middleware/authMiddleware";

const router = express.Router();

router.route("/").get(protect, adminOnly, getGames).post(protect, adminOnly, createGame);

router
  .route("/:id")
  .get(protect, adminOnly, getGameById)
  .put(protect, adminOnly, updateGame)
  .delete(protect, adminOnly, deleteGame);

export default router;
