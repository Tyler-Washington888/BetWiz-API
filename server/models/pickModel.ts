import mongoose, { Schema, Model } from "mongoose";
import { IPickDocument } from "../interfaces/betting";
import Player from "./playerModel";
import Game from "./gameModel";

const pickSchema = new Schema<IPickDocument>(
  {
    player: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: [true, "Player is required"],
    },
    game: {
      type: Schema.Types.ObjectId,
      ref: "Game",
      required: [true, "Game is required"],
    },
    statType: {
      type: String,
      required: [true, "Stat type is required"],
      enum: ["points", "rebounds", "assists", "steals", "blocks", "threes"],
    },
    line: {
      type: Number,
      required: [true, "Line is required"],
      min: [0, "Line must be positive"],
    },
  },
  {
    timestamps: true,
  }
);

// Custom validator to ensure player is on one of the teams in the game and game hasn't started
pickSchema.pre("validate", async function (next) {
  const player = await Player.findById(this.player);
  const game = await Game.findById(this.game);

  if (!player) {
    return next(new Error("Player not found"));
  }

  if (!game) {
    return next(new Error("Game not found"));
  }

  if (player.team !== game.homeTeam && player.team !== game.awayTeam) {
    return next(
      new Error("Player must be on one of the teams playing in this game")
    );
  }

  // Check if game has already started
  if (game.startTime <= new Date()) {
    return next(
      new Error("Cannot create pick for a game that has already started")
    );
  }

  next();
});

const Pick: Model<IPickDocument> = mongoose.model<IPickDocument>(
  "Pick",
  pickSchema
);

export default Pick;
