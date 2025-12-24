import { Document } from "mongoose";
import { Request } from "express";


export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}


export interface IUserDocument extends Document {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  dateOfBirth: string;
  isSubscribed: boolean;
  subscribedBet360Emails: string[];
  refreshToken?: string;
  refreshTokenExpiresAt?: Date;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}


export interface SignUpRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  dateOfBirth: string;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthenticatedRequest extends Request {
  user: IUserDocument;
}


export interface SignUpResponse {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  dateOfBirth: string;
  token: string;
  role: UserRole;
  isSubscribed: boolean;
  subscribedBet360Emails: string[];
  creditBalance: number;
}

export interface LoginResponse {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  dateOfBirth: string;
  token: string;
  role: string;
  isSubscribed: boolean;
  subscribedBet360Emails: string[];
  creditBalance: number;
}

export interface ProfileResponse {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  dateOfBirth: string;
  isSubscribed: boolean;
  subscribedBet360Emails: string[];
  role: UserRole;
  creditBalance: number;
  createdAt: Date;
  updatedAt: Date;
}


export interface SubscriptionStatusResponse {
  isSubscribed: boolean;
  subscribedBet360Emails: string[];
}

export interface SubscribeRequest {
  bet360Email: string;
}

export interface UnsubscribeRequest {
  bet360Email: string;
}
