import mongoose, { Schema, Model } from "mongoose";
import { IGameDocument, NBATeam } from "../interfaces/betting";

const gameSchema = new Schema<IGameDocument>(
  {
    homeTeam: {
      type: String,
      required: [true, "Home team is required"],
      enum: Object.values(NBATeam),
      trim: true,
    },
    awayTeam: {
      type: String,
      required: [true, "Away team is required"],
      enum: Object.values(NBATeam),
      trim: true,
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
      set: function (value: string | Date): Date {
        // Store original string for validation
        if (typeof value === "string") {
          (this as any).__originalStartTimeString = value;
        }
        return new Date(value);
      },
      validate: [
        {
          validator: function (value: Date): boolean {
            // Check if the date is valid
            if (!(value instanceof Date) || isNaN(value.getTime())) {
              return false;
            }
            return true;
          },
          message: "Start time must be a valid date",
        },
        {
          validator: function (value: Date): boolean {
            return value > new Date();
          },
          message: "Start time must be in the future",
        },
        {
          validator: function (value: Date): boolean {
            // Check original string format for ISO 8601 with required Z
            const originalString = (this as any).__originalStartTimeString;
            if (!originalString) {
              return true; // If no original string, skip this validation (field not being updated)
            }
            const iso8601WithZRegex =
              /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
            return iso8601WithZRegex.test(originalString);
          },
          message:
            "Start time must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)",
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

gameSchema.index(
  { homeTeam: 1, awayTeam: 1, startTime: 1 },
  { unique: true, name: "unique_game_matchup" }
);

gameSchema.pre("save", function (next) {
  if (this.homeTeam === this.awayTeam) {
    const error = new Error("Home team and away team cannot be the same");
    return next(error);
  }
  next();
});

const Game: Model<IGameDocument> = mongoose.model<IGameDocument>(
  "Game",
  gameSchema
);

export default Game;
