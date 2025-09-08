import mongoose, { Schema, Model } from "mongoose";
import { IGameDocument } from "../interfaces/betting";

const gameSchema = new Schema<IGameDocument>(
  {
    homeTeam: {
      type: String,
      required: [true, "Home team is required"],
      trim: true,
    },
    awayTeam: {
      type: String,
      required: [true, "Away team is required"],
      trim: true,
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
  },
  {
    timestamps: true,
  }
);

const Game: Model<IGameDocument> = mongoose.model<IGameDocument>(
  "Game",
  gameSchema
);

export default Game;
