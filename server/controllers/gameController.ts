import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Game from "../models/gameModel";
import {
  CreateGameRequest,
  GameResponse,
  IGameDocument,
} from "@/interfaces/betting";
import { AuthenticatedRequest } from "@/interfaces/user";

// @desc    Create a new game
// @route   POST /api/games
// @access  Private/Admin
const createGame = asyncHandler(
  async (req: Request, res: Response<GameResponse>) => {
    const { homeTeam, awayTeam, startTime }: CreateGameRequest = req.body;

    if (!startTime) {
      res.status(400);
      throw new Error("Start time is required");
    }

    let game: IGameDocument;
    try {
      game = await Game.create({
        homeTeam,
        awayTeam,
        startTime: startTime, // Pass the original string, not the Date object
      });

      const response: GameResponse = {
        _id: game._id.toString(),
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        startTime: game.startTime,
        createdAt: game.createdAt,
        updatedAt: game.updatedAt,
      };

      res.status(201).json(response);
    } catch (error: any) {
      // Handle unique constraint violation
      if (error.code === 11000) {
        res.status(400);
        throw new Error(
          "Game already exists with the same teams and start time"
        );
      }
      throw error;
    }
  }
);

// @desc    Get all games
// @route   GET /api/games
// @access  Public
const getGames = asyncHandler(async (req: Request, res: Response) => {
  const games = await Game.find({}).sort({ startTime: 1 });

  const response: GameResponse[] = games.map((game) => ({
    _id: game._id.toString(),
    homeTeam: game.homeTeam,
    awayTeam: game.awayTeam,
    startTime: game.startTime,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
  }));

  res.json(response);
});

// @desc    Get game by ID
// @route   GET /api/games/:id
// @access  Public
const getGameById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const game = await Game.findById(id);

  if (!game) {
    res.status(404);
    throw new Error("Game not found");
  }

  const response: GameResponse = {
    _id: game._id.toString(),
    homeTeam: game.homeTeam,
    awayTeam: game.awayTeam,
    startTime: game.startTime,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
  };

  res.json(response);
});

// @desc    Update game
// @route   PUT /api/games/:id
// @access  Private/Admin
const updateGame = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { homeTeam, awayTeam, startTime } = req.body;

  const game: IGameDocument | null = await Game.findById(id);

  if (!game) {
    res.status(404);
    throw new Error("Game not found");
  }

  if (homeTeam) game.homeTeam = homeTeam;
  if (awayTeam) game.awayTeam = awayTeam;
  if (startTime) game.startTime = startTime;

  const updatedGame = await game.save();

  const response: GameResponse = {
    _id: updatedGame._id.toString(),
    homeTeam: updatedGame.homeTeam,
    awayTeam: updatedGame.awayTeam,
    startTime: updatedGame.startTime,
    createdAt: updatedGame.createdAt,
    updatedAt: updatedGame.updatedAt,
  };

  res.json(response);
});

// @desc    Delete game
// @route   DELETE /api/games/:id
// @access  Private/Admin
const deleteGame = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const game = await Game.findById(id);

  if (!game) {
    res.status(404);
    throw new Error("Game not found");
  }

  await game.deleteOne();

  res.json({ message: "Game deleted successfully" });
});

export { createGame, getGames, getGameById, updateGame, deleteGame };
