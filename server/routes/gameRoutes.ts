import express from "express";
import {
  createGame,
  getGames,
  getGameById,
  updateGame,
  deleteGame,
} from "../controllers/gameController";
import { adminOnly } from "../middleware/authMiddleware";

const router = express.Router();

router.route("/").get(getGames).post(adminOnly, createGame);

router
  .route("/:id")
  .get(getGameById)
  .put(adminOnly, updateGame)
  .delete(adminOnly, deleteGame);

export default router;
