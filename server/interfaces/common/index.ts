import { Request } from "express";
import { Document } from "mongoose";
import { IUser, IUserDocument } from "../user";

// Base API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Error response interface
export interface ErrorResponse extends ApiResponse {
  success: false;
  error: string;
  statusCode?: number;
}

// Success response interface
export interface SuccessResponse<T = any> extends ApiResponse<T> {
  success: true;
  data: T;
}

// Extended Request interface with user
export interface AuthenticatedRequest extends Request {
  user: IUserDocument;
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

// Common validation error interface
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}
