import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Pick from "../models/pickModel";
import {
  CreatePickRequest,
  PickResponse,
  IPickDocument,
} from "@/interfaces/betting";

// @desc    Create a new pick
// @route   POST /api/picks
// @access  Private/Admin
const createPick = asyncHandler(
  async (req: Request, res: Response<PickResponse>) => {
    const { player, game, statType, line }: CreatePickRequest = req.body;

    const pick: IPickDocument = await Pick.create({
      player,
      game,
      statType,
      line,
    });

    // Populate the pick with player and game details
    const populatedPick = await Pick.findById(pick._id)
      .populate("player")
      .populate("game")
      .exec();

    if (!populatedPick) {
      res.status(500);
      throw new Error("Failed to create pick");
    }

    const response: PickResponse = {
      _id: populatedPick._id.toString(),
      player: {
        _id: (populatedPick.player as any)._id.toString(),
        firstName: (populatedPick.player as any).firstName,
        lastName: (populatedPick.player as any).lastName,
        team: (populatedPick.player as any).team,
        position: (populatedPick.player as any).position,
        createdAt: (populatedPick.player as any).createdAt,
        updatedAt: (populatedPick.player as any).updatedAt,
      },
      game: {
        _id: (populatedPick.game as any)._id.toString(),
        homeTeam: (populatedPick.game as any).homeTeam,
        awayTeam: (populatedPick.game as any).awayTeam,
        startTime: (populatedPick.game as any).startTime,
        createdAt: (populatedPick.game as any).createdAt,
        updatedAt: (populatedPick.game as any).updatedAt,
      },
      statType: populatedPick.statType,
      line: populatedPick.line,
      createdAt: populatedPick.createdAt,
      updatedAt: populatedPick.updatedAt,
    };

    res.status(201).json(response);
  }
);

// @desc    Get all available picks
// @route   GET /api/picks
// @access  Public
const getPicks = asyncHandler(async (req: Request, res: Response) => {
  const picks = await Pick.find({})
    .populate("player")
    .populate("game")
    .sort({ createdAt: -1 });

  const response: PickResponse[] = picks.map((pick) => ({
    _id: pick._id.toString(),
    player: {
      _id: (pick.player as any)._id.toString(),
      firstName: (pick.player as any).firstName,
      lastName: (pick.player as any).lastName,
      team: (pick.player as any).team,
      position: (pick.player as any).position,
      createdAt: (pick.player as any).createdAt,
      updatedAt: (pick.player as any).updatedAt,
    },
    game: {
      _id: (pick.game as any)._id.toString(),
      homeTeam: (pick.game as any).homeTeam,
      awayTeam: (pick.game as any).awayTeam,
      startTime: (pick.game as any).startTime,
      createdAt: (pick.game as any).createdAt,
      updatedAt: (pick.game as any).updatedAt,
    },
    statType: pick.statType,
    line: pick.line,
    createdAt: pick.createdAt,
    updatedAt: pick.updatedAt,
  }));

  res.json(response);
});

// @desc    Get pick by ID
// @route   GET /api/picks/:id
// @access  Public
const getPickById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    res.status(400);
    throw new Error("Pick ID is required");
  }

  const pick = await Pick.findById(id)
    .populate("player")
    .populate("game")
    .exec();

  if (!pick) {
    res.status(404);
    throw new Error("Pick not found");
  }

  const response: PickResponse = {
    _id: pick._id.toString(),
    player: {
      _id: (pick.player as any)._id.toString(),
      firstName: (pick.player as any).firstName,
      lastName: (pick.player as any).lastName,
      team: (pick.player as any).team,
      position: (pick.player as any).position,
      createdAt: (pick.player as any).createdAt,
      updatedAt: (pick.player as any).updatedAt,
    },
    game: {
      _id: (pick.game as any)._id.toString(),
      homeTeam: (pick.game as any).homeTeam,
      awayTeam: (pick.game as any).awayTeam,
      startTime: (pick.game as any).startTime,
      createdAt: (pick.game as any).createdAt,
      updatedAt: (pick.game as any).updatedAt,
    },
    statType: pick.statType,
    line: pick.line,
    createdAt: pick.createdAt,
    updatedAt: pick.updatedAt,
  };

  res.json(response);
});

// @desc    Delete pick
// @route   DELETE /api/picks/:id
// @access  Private/Admin
const deletePick = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const pick = await Pick.findById(id);

  if (!pick) {
    res.status(404);
    throw new Error("Pick not found");
  }

  await pick.deleteOne();

  res.json({ message: "Pick deleted successfully" });
});

export { createPick, getPicks, getPickById, deletePick };
