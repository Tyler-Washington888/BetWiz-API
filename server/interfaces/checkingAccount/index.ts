import { Types, Document } from "mongoose";
import { AuthenticatedRequest } from "@/interfaces/user";

// ====== MONGOOSE DOCUMENT INTERFACE ======
export interface ICheckingAccountDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  balance: number;
  isActive: boolean;
  lastTransaction: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  increaseBalance(amount: number): Promise<ICheckingAccountDocument>;
  decreaseBalance(amount: number): Promise<ICheckingAccountDocument>;
}

// ====== REQUEST INTERFACES ======
export interface DepositRequest extends AuthenticatedRequest {
  body: { amount?: number };
}

// ====== RESPONSE INTERFACES ======
export interface DepositResponse {
  success: boolean;
  balance: number;
  lastTransaction: Date | null;
  lastTransactionAmount?: number;
  message: string;
}
