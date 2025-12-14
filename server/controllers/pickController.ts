import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Pick from "../models/pickModel";
import { PickResponse } from "@/interfaces/betting";

// @desc    Get all available picks for future games
// @route   GET /api/picks
// @access  Private
const getPicks = asyncHandler(async (req: Request, res: Response) => {
  const currentTime = new Date();

  const picks = await Pick.find({})
    .populate("player")
    .populate("game")
    .sort({ createdAt: -1 });

  // Filter picks to only include those with future games
  const futurePicks = picks.filter((pick) => {
    const gameStartTime = new Date((pick.game as any).startTime);
    return gameStartTime > currentTime;
  });

  const response: PickResponse[] = futurePicks.map((pick) => ({
    _id: pick._id.toString(),
    player: {
      _id: (pick.player as any)._id.toString(),
      firstName: (pick.player as any).firstName,
      lastName: (pick.player as any).lastName,
      team: (pick.player as any).team,
      position: (pick.player as any).position,
      imageUrl: (pick.player as any).imageUrl,
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

export { getPicks };
