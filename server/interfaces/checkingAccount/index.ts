import { Types, Document } from "mongoose";
import { AuthenticatedRequest } from "@/interfaces/user";

// Checking Account document interface (with methods)
export interface ICheckingAccountDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  balance: number;
  promoBalance: number;
  totalBalance: number; // Virtual field
  isActive: boolean;
  lastTransaction: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  increaseBalance(amount: number): Promise<ICheckingAccountDocument>;
  increasePromoBalance(amount: number): Promise<ICheckingAccountDocument>;
  decreaseBalance(amount: number): Promise<ICheckingAccountDocument>;
  decreasePromoBalance(amount: number): Promise<ICheckingAccountDocument>;
}

// Authenticated request interface for deposit operations
export interface checkingAccountRequest extends AuthenticatedRequest {
  params: { userId?: string };
  body: { amount?: number };
}

// Checking account response interface (full details)
export interface CheckingAccountResponse {
  _id: string;
  userId: string;
  balance: number;
  promoBalance: number;
  lastTransaction: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction result interface
export interface TransactionResult {
  success: boolean;
  balance: number;
  promoBalance: number;
  lastTransaction: Date | null;
  amount?: number;
  message: string;
}
