import mongoose, { Schema, Model } from "mongoose";
import { ICheckingAccountDocument } from "../interfaces/checkingAccount";

const checkingAccountSchema = new Schema<ICheckingAccountDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, "User ID is required"],
      ref: "User",
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Balance cannot be negative"],
      validate: {
        validator: function (value: number): boolean {
          return Number.isFinite(value) && value >= 0;
        },
        message: "Balance must be a valid non-negative number",
      },
    },
    lastTransaction: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


checkingAccountSchema.methods.increaseBalance = function (
  this: ICheckingAccountDocument,
  amount: number
): Promise<ICheckingAccountDocument> {
  if (amount <= 0) {
    throw new Error("Deposit amount must be positive");
  }
  this.balance += amount;
  this.lastTransaction = new Date();
  return this.save();
};


checkingAccountSchema.methods.decreaseBalance = function (
  this: ICheckingAccountDocument,
  amount: number
): Promise<ICheckingAccountDocument> {
  if (amount <= 0) {
    throw new Error("Bet amount must be positive");
  }
  if (amount > this.balance) {
    throw new Error("Insufficient balance");
  }
  this.balance -= amount;
  this.lastTransaction = new Date();
  return this.save();
};


checkingAccountSchema.set("toJSON", { virtuals: true });
checkingAccountSchema.set("toObject", { virtuals: true });


const CheckingAccount: Model<ICheckingAccountDocument> =
  mongoose.model<ICheckingAccountDocument>(
    "CheckingAccount",
    checkingAccountSchema
  );

export default CheckingAccount;
