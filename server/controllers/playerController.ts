import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Player from "../models/playerModel";
import {
  CreatePlayerRequest,
  PlayerResponse,
  IPlayerDocument,
} from "@/interfaces/betting";

// @desc    Create a new player
// @route   POST /api/players
// @access  Private/Admin
const createPlayer = asyncHandler(
  async (req: Request, res: Response<PlayerResponse>) => {
    const { name, team, position }: CreatePlayerRequest = req.body;

    // Need name and team for duplicate check
    if (!name) {
      res.status(400);
      throw new Error("Name is required");
    }

    if (!team) {
      res.status(400);
      throw new Error("Team is required");
    }

    // Check if player already exists
    const existingPlayer = await Player.findOne({ name, team });
    if (existingPlayer) {
      res.status(400);
      throw new Error("Player already exists on this team");
    }

    const player: IPlayerDocument = await Player.create({
      name,
      team,
      position,
    });

    const response: PlayerResponse = {
      _id: player._id.toString(),
      name: player.name,
      team: player.team,
      position: player.position,
      createdAt: player.createdAt,
      updatedAt: player.updatedAt,
    };

    res.status(201).json(response);
  }
);

// @desc    Get all players
// @route   GET /api/players
// @access  Public
const getPlayers = asyncHandler(async (req: Request, res: Response) => {
  const players = await Player.find({}).sort({ name: 1 });

  const response: PlayerResponse[] = players.map((player) => ({
    _id: player._id.toString(),
    name: player.name,
    team: player.team,
    position: player.position,
    createdAt: player.createdAt,
    updatedAt: player.updatedAt,
  }));

  res.json(response);
});

// @desc    Get player by ID
// @route   GET /api/players/:id
// @access  Public
const getPlayerById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const player = await Player.findById(id);

  if (!player) {
    res.status(404);
    throw new Error("Player not found");
  }

  const response: PlayerResponse = {
    _id: player._id.toString(),
    name: player.name,
    team: player.team,
    position: player.position,
    createdAt: player.createdAt,
    updatedAt: player.updatedAt,
  };

  res.json(response);
});

// @desc    Update player
// @route   PUT /api/players/:id
// @access  Private/Admin
const updatePlayer = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, team, position } = req.body;

  const player = await Player.findById(id);

  if (!player) {
    res.status(404);
    throw new Error("Player not found");
  }

  if (name) player.name = name;
  if (team) player.team = team;
  if (position) player.position = position;

  const updatedPlayer = await player.save();

  const response: PlayerResponse = {
    _id: updatedPlayer._id.toString(),
    name: updatedPlayer.name,
    team: updatedPlayer.team,
    position: updatedPlayer.position,
    createdAt: updatedPlayer.createdAt,
    updatedAt: updatedPlayer.updatedAt,
  };

  res.json(response);
});

// @desc    Delete player
// @route   DELETE /api/players/:id
// @access  Private/Admin
const deletePlayer = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const player = await Player.findById(id);

  if (!player) {
    res.status(404);
    throw new Error("Player not found");
  }

  await player.deleteOne();

  res.json({ message: "Player deleted successfully" });
});

export { createPlayer, getPlayers, getPlayerById, updatePlayer, deletePlayer };
