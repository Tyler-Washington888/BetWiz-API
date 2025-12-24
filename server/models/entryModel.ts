import mongoose, { Schema, Model } from "mongoose";
import { IEntryDocument } from "../interfaces/betting";

const entrySchema = new Schema<IEntryDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    picks: [
      {
        pick: {
          type: Schema.Types.ObjectId,
          ref: "Pick",
          required: true,
        },
        selection: {
          type: String,
          required: true,
          enum: ["over", "under"],
        },
      },
    ],
    wagerAmount: {
      type: Number,
      required: [true, "Wager amount is required"],
      min: [1, "Minimum wager is $1"],
    },
    payoutMultiplier: {
      type: Number,
      required: [true, "Payout multiplier is required"],
      min: [1, "Payout multiplier must be at least 1"],
    },
    betType: {
      type: String,
      required: [true, "Bet type is required"],
      enum: ["power"],
      default: "power",
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "won", "lost"],
    },
  },
  {
    timestamps: true,
  }
);


entrySchema.pre("save", function (next) {
  if (this.picks.length < 2 || this.picks.length > 6) {
    next(new Error("Entry must have between 2 and 6 picks"));
  } else {
    next();
  }
});

const Entry: Model<IEntryDocument> = mongoose.model<IEntryDocument>(
  "Entry",
  entrySchema
);

export default Entry;
