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
    promoBalance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Promo balance cannot be negative"],
      validate: {
        validator: function (value: number): boolean {
          return Number.isFinite(value) && value >= 0;
        },
        message: "Promo balance must be a valid non-negative number",
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

// Method to deposit to main balance
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

// Method to add promo balance (internal use)
checkingAccountSchema.methods.increasePromoBalance = function (
  this: ICheckingAccountDocument,
  amount: number
): Promise<ICheckingAccountDocument> {
  if (amount <= 0) {
    throw new Error("Promo amount must be positive");
  }
  this.promoBalance += amount;
  this.lastTransaction = new Date();
  return this.save();
};

// Method to decrease main balance
checkingAccountSchema.methods.decreaseBalance = function (
  this: ICheckingAccountDocument,
  amount: number
): Promise<ICheckingAccountDocument> {
  if (amount <= 0) {
    throw new Error("Decrease amount must be positive");
  }
  if (amount > this.balance) {
    throw new Error("Insufficient main balance");
  }
  this.balance -= amount;
  this.lastTransaction = new Date();
  return this.save();
};

// Method to decrease promo balance
checkingAccountSchema.methods.decreasePromoBalance = function (
  this: ICheckingAccountDocument,
  amount: number
): Promise<ICheckingAccountDocument> {
  if (amount <= 0) {
    throw new Error("Decrease amount must be positive");
  }
  if (amount > this.promoBalance) {
    throw new Error("Insufficient promo balance");
  }
  this.promoBalance -= amount;
  this.lastTransaction = new Date();
  return this.save();
};
// Ensure virtual fields are serialized
checkingAccountSchema.set("toJSON", { virtuals: true });
checkingAccountSchema.set("toObject", { virtuals: true });

// Create and export the model
const CheckingAccount: Model<ICheckingAccountDocument> =
  mongoose.model<ICheckingAccountDocument>(
    "CheckingAccount",
    checkingAccountSchema
  );

export default CheckingAccount;
