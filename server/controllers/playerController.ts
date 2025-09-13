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
    const { firstName, lastName, team, position }: CreatePlayerRequest =
      req.body;

    // Validate required fields
    if (!firstName) {
      res.status(400);
      throw new Error("First name is required");
    }

    if (!lastName) {
      res.status(400);
      throw new Error("Last name is required");
    }

    if (!team) {
      res.status(400);
      throw new Error("Team is required");
    }

    let player: IPlayerDocument;
    try {
      player = await Player.create({
        firstName,
        lastName,
        team,
        position,
      });

      const response: PlayerResponse = {
        _id: player._id.toString(),
        firstName: player.firstName,
        lastName: player.lastName,
        team: player.team,
        position: player.position,
        createdAt: player.createdAt,
        updatedAt: player.updatedAt,
      };

      res.status(201).json(response);
    } catch (error: any) {
      // Handle unique constraint violation
      if (error.code === 11000) {
        res.status(400);
        throw new Error("Player already exists on this team");
      }
      throw error;
    }
  }
);

// @desc    Get all players
// @route   GET /api/players
// @access  Public
const getPlayers = asyncHandler(async (req: Request, res: Response) => {
  const players = await Player.find({}).sort({ lastName: 1, firstName: 1 });

  const response: PlayerResponse[] = players.map((player) => ({
    _id: player._id.toString(),
    firstName: player.firstName,
    lastName: player.lastName,
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

  if (!id) {
    res.status(400);
    throw new Error("Player ID is required");
  }

  const player = await Player.findById(id);

  if (!player) {
    res.status(404);
    throw new Error("Player not found");
  }

  const response: PlayerResponse = {
    _id: player._id.toString(),
    firstName: player.firstName,
    lastName: player.lastName,
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
  const { firstName, lastName, team, position } = req.body;

  if (!id) {
    res.status(400);
    throw new Error("Player ID is required");
  }

  const player = await Player.findById(id);

  if (!player) {
    res.status(404);
    throw new Error("Player not found");
  }

  if (firstName) player.firstName = firstName;
  if (lastName) player.lastName = lastName;
  if (team) player.team = team;
  if (position) player.position = position;

  try {
    const updatedPlayer = await player.save();

    const response: PlayerResponse = {
      _id: updatedPlayer._id.toString(),
      firstName: updatedPlayer.firstName,
      lastName: updatedPlayer.lastName,
      team: updatedPlayer.team,
      position: updatedPlayer.position,
      createdAt: updatedPlayer.createdAt,
      updatedAt: updatedPlayer.updatedAt,
    };

    res.json(response);
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === 11000) {
      res.status(400);
      throw new Error("Player already exists on this team");
    }
    throw error;
  }
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
