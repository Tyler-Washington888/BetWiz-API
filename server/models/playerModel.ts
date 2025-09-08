import mongoose, { Schema, Model } from "mongoose";
import { IPlayerDocument } from "../interfaces/betting";

const playerSchema = new Schema<IPlayerDocument>(
  {
    name: {
      type: String,
      required: [true, "Player name is required"],
      trim: true,
    },
    team: {
      type: String,
      required: [true, "Team is required"],
      trim: true,
    },
    position: {
      type: String,
      required: [true, "Position is required"],
      enum: ["PG", "SG", "SF", "PF", "C"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Player: Model<IPlayerDocument> = mongoose.model<IPlayerDocument>(
  "Player",
  playerSchema
);

export default Player;
