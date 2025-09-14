import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Entry from "../models/entryModel";
import Pick from "../models/pickModel";
import {
  CreateEntryRequest,
  EntryResponse,
  IEntryDocument,
} from "@/interfaces/betting";
import { AuthenticatedRequest } from "@/interfaces/user";
import { decreaseBalanceByType } from "./checkingAccountController";

// Helper function to calculate payout multiplier based on picks count (power only)
const calculatePayoutMultiplier = (pickCount: number): number => {
  const powerMultipliers: { [key: number]: number } = {
    2: 2.5,
    3: 4,
    4: 8,
    5: 15,
    6: 40,
  };

  return powerMultipliers[pickCount] || 1;
};

// @desc    Create a new entry (place bet)
// @route   POST /api/entries
// @access  Private
const createEntry = asyncHandler(
  async (req: Request, res: Response<EntryResponse>) => {
    const typedReq = req as AuthenticatedRequest;
    const { picks, wagerAmount, betType, balanceType }: CreateEntryRequest =
      req.body;

    if (!balanceType) {
      res.status(400);
      throw new Error("Balance type is required");
    }

    if (!wagerAmount) {
      res.status(400);
      throw new Error("Wager amount is required");
    }

    if (!picks || picks.length === 0) {
      res.status(400);
      throw new Error("Picks are required");
    }

    // Verify all picks exist and validate selections
    const pickIds = picks.map((p) => p.pickId);
    const validPicks = await Pick.find({ _id: { $in: pickIds } });
    if (validPicks.length !== picks.length) {
      res.status(400);
      throw new Error("One or more picks are invalid");
    }

    // Validate selections
    for (const pick of picks) {
      if (!pick.selection || !["over", "under"].includes(pick.selection)) {
        res.status(400);
        throw new Error(
          "Each pick must have a valid selection (over or under)"
        );
      }
    }

    const payoutMultiplier = calculatePayoutMultiplier(picks.length);

    try {
      // Deduct wager amount from user's balance
      await decreaseBalanceByType(
        typedReq.user._id.toString(),
        wagerAmount,
        balanceType
      );

      // Create the entry with picks and selections
      const entryPicks = picks.map((p) => ({
        pick: p.pickId,
        selection: p.selection,
      }));

      const entry: IEntryDocument = await Entry.create({
        user: typedReq.user._id,
        picks: entryPicks,
        wagerAmount,
        balanceType,
        payoutMultiplier,
        betType,
      });

      // Populate the entry with pick details
      const populatedEntry = await Entry.findById(entry._id)
        .populate({
          path: "picks.pick",
          populate: [
            { path: "player", model: "Player" },
            { path: "game", model: "Game" },
          ],
        })
        .exec();

      if (!populatedEntry) {
        res.status(500);
        throw new Error("Failed to create entry");
      }

      const response: EntryResponse = {
        _id: populatedEntry._id.toString(),
        user: populatedEntry.user.toString(),
        picks: populatedEntry.picks.map((entryPick: any) => ({
          pick: {
            _id: entryPick.pick._id.toString(),
            player: {
              _id: entryPick.pick.player._id.toString(),
              firstName: entryPick.pick.player.firstName,
              lastName: entryPick.pick.player.lastName,
              team: entryPick.pick.player.team,
              position: entryPick.pick.player.position,
              createdAt: entryPick.pick.player.createdAt,
              updatedAt: entryPick.pick.player.updatedAt,
            },
            game: {
              _id: entryPick.pick.game._id.toString(),
              homeTeam: entryPick.pick.game.homeTeam,
              awayTeam: entryPick.pick.game.awayTeam,
              startTime: entryPick.pick.game.startTime,
              createdAt: entryPick.pick.game.createdAt,
              updatedAt: entryPick.pick.game.updatedAt,
            },
            statType: entryPick.pick.statType,
            line: entryPick.pick.line,
            createdAt: entryPick.pick.createdAt,
            updatedAt: entryPick.pick.updatedAt,
          },
          selection: entryPick.selection,
        })),
        wagerAmount: populatedEntry.wagerAmount,
        balanceType: populatedEntry.balanceType,
        payoutMultiplier: populatedEntry.payoutMultiplier,
        potentialPayout:
          populatedEntry.wagerAmount * populatedEntry.payoutMultiplier,
        betType: populatedEntry.betType,
        status: populatedEntry.status,
        createdAt: populatedEntry.createdAt,
        updatedAt: populatedEntry.updatedAt,
      };

      // TODO: Send entry event to Lambda function for Bet360 consumption
      // This should trigger a Lambda function that will format and send the entry data to Bet360
      console.log("📊 NEW ENTRY CREATED - Send to Lambda:", {
        ...response, // Complete entry data including all picks with player/game details
        timestamp: new Date().toISOString(),
        event: "ENTRY_CREATED",
      });

      res.status(201).json(response);
    } catch (error) {
      res.status(400);
      throw new Error(`Failed to create entry: ${(error as Error).message}`);
    }
  }
);

// @desc    Get user's entries
// @route   GET /api/entries/my-entries
// @access  Private
const getMyEntries = asyncHandler(async (req: Request, res: Response) => {
  const typedReq = req as AuthenticatedRequest;

  const entries = await Entry.find({ user: typedReq.user._id })
    .populate({
      path: "picks.pick",
      populate: [
        { path: "player", model: "Player" },
        { path: "game", model: "Game" },
      ],
    })
    .sort({ createdAt: -1 });

  const response: EntryResponse[] = entries.map((entry) => ({
    _id: entry._id.toString(),
    user: entry.user.toString(),
    picks: entry.picks.map((entryPick: any) => ({
      pick: {
        _id: entryPick.pick._id.toString(),
        player: {
          _id: entryPick.pick.player._id.toString(),
          firstName: entryPick.pick.player.firstName,
          lastName: entryPick.pick.player.lastName,
          team: entryPick.pick.player.team,
          position: entryPick.pick.player.position,
          createdAt: entryPick.pick.player.createdAt,
          updatedAt: entryPick.pick.player.updatedAt,
        },
        game: {
          _id: entryPick.pick.game._id.toString(),
          homeTeam: entryPick.pick.game.homeTeam,
          awayTeam: entryPick.pick.game.awayTeam,
          startTime: entryPick.pick.game.startTime,
          createdAt: entryPick.pick.game.createdAt,
          updatedAt: entryPick.pick.game.updatedAt,
        },
        statType: entryPick.pick.statType,
        line: entryPick.pick.line,
        createdAt: entryPick.pick.createdAt,
        updatedAt: entryPick.pick.updatedAt,
      },
      selection: entryPick.selection,
    })),
    wagerAmount: entry.wagerAmount,
    balanceType: entry.balanceType,
    payoutMultiplier: entry.payoutMultiplier,
    potentialPayout: entry.wagerAmount * entry.payoutMultiplier,
    betType: entry.betType,
    status: entry.status,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  }));

  res.json(response);
});

// @desc    Get entry by ID
// @route   GET /api/entries/:id
// @access  Private
const getEntryById = asyncHandler(async (req: Request, res: Response) => {
  const typedReq = req as AuthenticatedRequest;
  const { id } = req.params;

  const entry = await Entry.findById(id)
    .populate({
      path: "picks.pick",
      populate: [
        { path: "player", model: "Player" },
        { path: "game", model: "Game" },
      ],
    })
    .exec();

  if (!entry) {
    res.status(404);
    throw new Error("Entry not found");
  }

  const response: EntryResponse = {
    _id: entry._id.toString(),
    user: entry.user.toString(),
    picks: entry.picks.map((entryPick: any) => ({
      pick: {
        _id: entryPick.pick._id.toString(),
        player: {
          _id: entryPick.pick.player._id.toString(),
          firstName: entryPick.pick.player.firstName,
          lastName: entryPick.pick.player.lastName,
          team: entryPick.pick.player.team,
          position: entryPick.pick.player.position,
          createdAt: entryPick.pick.player.createdAt,
          updatedAt: entryPick.pick.player.updatedAt,
        },
        game: {
          _id: entryPick.pick.game._id.toString(),
          homeTeam: entryPick.pick.game.homeTeam,
          awayTeam: entryPick.pick.game.awayTeam,
          startTime: entryPick.pick.game.startTime,
          createdAt: entryPick.pick.game.createdAt,
          updatedAt: entryPick.pick.game.updatedAt,
        },
        statType: entryPick.pick.statType,
        line: entryPick.pick.line,
        createdAt: entryPick.pick.createdAt,
        updatedAt: entryPick.pick.updatedAt,
      },
      selection: entryPick.selection,
    })),
    wagerAmount: entry.wagerAmount,
    balanceType: entry.balanceType,
    payoutMultiplier: entry.payoutMultiplier,
    potentialPayout: entry.wagerAmount * entry.payoutMultiplier,
    betType: entry.betType,
    status: entry.status,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };

  res.json(response);
});

export { createEntry, getMyEntries, getEntryById };
