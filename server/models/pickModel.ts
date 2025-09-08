import mongoose, { Schema, Model } from "mongoose";
import { IPickDocument } from "../interfaces/betting";

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

const Pick: Model<IPickDocument> = mongoose.model<IPickDocument>(
  "Pick",
  pickSchema
);

export default Pick;
