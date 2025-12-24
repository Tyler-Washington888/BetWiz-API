import { Types, Document } from "mongoose";
import { AuthenticatedRequest } from "@/interfaces/user";


export interface ICheckingAccountDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  balance: number;
  isActive: boolean;
  lastTransaction: Date | null;
  createdAt: Date;
  updatedAt: Date;

  
  increaseBalance(amount: number): Promise<ICheckingAccountDocument>;
  decreaseBalance(amount: number): Promise<ICheckingAccountDocument>;
}


export interface DepositRequest extends AuthenticatedRequest {
  body: { amount?: number };
}


export interface DepositResponse {
  success: boolean;
  balance: number;
  lastTransaction: Date | null;
  lastTransactionAmount?: number;
  message: string;
}
