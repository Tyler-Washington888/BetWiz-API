import { Document, Types } from "mongoose";
import { Request } from "express";
import { IUserDocument } from "../user";

// Game interfaces
export interface IGame {
  _id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGameDocument extends Document {
  _id: Types.ObjectId;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Player interfaces
export interface IPlayer {
  _id: string;
  name: string;
  team: string;
  position: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPlayerDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  team: string;
  position: string;
  createdAt: Date;
  updatedAt: Date;
}

// Pick interfaces
export interface IPick {
  _id: string;
  player: string;
  game: string;
  statType: string;
  line: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPickDocument extends Document {
  _id: Types.ObjectId;
  player: Types.ObjectId;
  game: Types.ObjectId;
  statType: string;
  line: number;
  createdAt: Date;
  updatedAt: Date;
}

// Entry pick with selection
export interface IEntryPick {
  pick: string;
  selection: "over" | "under";
}

export interface IEntryPickDocument {
  pick: Types.ObjectId;
  selection: "over" | "under";
}

// Entry interfaces
export interface IEntry {
  _id: string;
  user: string;
  picks: IEntryPick[];
  wagerAmount: number;
  balanceType: "regular" | "promo";
  payoutMultiplier: number;
  betType: "power";
  status: "pending" | "won" | "lost";
  createdAt: Date;
  updatedAt: Date;
}

export interface IEntryDocument extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  picks: IEntryPickDocument[];
  wagerAmount: number;
  balanceType: "regular" | "promo";
  payoutMultiplier: number;
  betType: "power";
  status: "pending" | "won" | "lost";
  createdAt: Date;
  updatedAt: Date;
}

// Request interfaces
export interface CreateGameRequest {
  homeTeam: string;
  awayTeam: string;
  startTime: string;
}

export interface CreatePlayerRequest {
  name: string;
  team: string;
  position: string;
}

export interface CreatePickRequest {
  player: string;
  game: string;
  statType: string;
  line: number;
}

// Entry pick with user's selection
export interface EntryPickRequest {
  pickId: string;
  selection: "over" | "under";
}

export interface CreateEntryRequest {
  picks: EntryPickRequest[];
  wagerAmount: number;
  betType: "power";
  balanceType: "regular" | "promo";
}

// Response interfaces
export interface GameResponse {
  _id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerResponse {
  _id: string;
  name: string;
  team: string;
  position: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PickResponse {
  _id: string;
  player: PlayerResponse;
  game: GameResponse;
  statType: string;
  line: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EntryPickResponse {
  pick: PickResponse;
  selection: "over" | "under";
}

export interface EntryResponse {
  _id: string;
  user: string;
  picks: EntryPickResponse[];
  wagerAmount: number;
  balanceType: "regular" | "promo";
  payoutMultiplier: number;
  potentialPayout: number;
  betType: "power";
  status: "pending" | "won" | "lost";
  createdAt: Date;
  updatedAt: Date;
}

// Betting authenticated request
export interface BettingAuthenticatedRequest extends Request {
  user: IUserDocument;
}
