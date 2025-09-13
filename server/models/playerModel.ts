import mongoose, { Schema, Model } from "mongoose";
import {
  IPlayerDocument,
  PlayerPosition,
  NBATeam,
} from "../interfaces/betting";

const playerSchema = new Schema<IPlayerDocument>(
  {
    firstName: {
      type: String,
      required: [true, "Player first name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Player last name is required"],
      trim: true,
    },
    team: {
      type: String,
      required: [true, "Team is required"],
      enum: Object.values(NBATeam),
      trim: true,
    },
    position: {
      type: String,
      required: [true, "Position is required"],
      enum: Object.values(PlayerPosition),
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
