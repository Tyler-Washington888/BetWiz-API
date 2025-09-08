import { Document } from "mongoose";
import { Request } from "express";

// User role enum
export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

// User document interface (with password and methods)
export interface IUserDocument extends Document {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  dateOfBirth: string;
  linkedBet360Account: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// User registration request interface
export interface RegisterUserRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  dateOfBirth: string; // MM-DD-YYYY format
  linkedBet360Account?: boolean;
}

// User login request interface
export interface LoginUserRequest {
  email: string;
  password: string;
}

// User registration response interface
export interface RegisterUserResponse {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  dateOfBirth: string;
  linkedBet360Account: boolean;
  token: string;
  role: string;
}

// User login response interface
export interface LoginUserResponse {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  dateOfBirth: string;
  linkedBet360Account: boolean;
  token: string;
  role: string;
}

// User profile response interface (without sensitive data)
export interface UserProfileResponse {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  dateOfBirth: string;
  linkedBet360Account: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// User-specific authenticated request interface
export interface UserAuthenticatedRequest<TBody = any> extends Request {
  user: IUserDocument;
  body: TBody;
}

// Extended Request interface with user
export interface AuthenticatedRequest extends Request {
  user: IUserDocument;
}

// JWT payload interface
export interface JWTPayload {
  id: string;
  iat?: number;
  exp?: number;
}
