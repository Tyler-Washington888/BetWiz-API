import { Document, Types } from "mongoose";
import { Request } from "express";
import { IUserDocument } from "../user";

// Enums
export enum PlayerPosition {
  PG = "PG",
  SG = "SG",
  SF = "SF",
  PF = "PF",
  C = "C",
}

export enum NBATeam {
  ATL = "Atlanta Hawks",
  BOS = "Boston Celtics",
  BKN = "Brooklyn Nets",
  CHA = "Charlotte Hornets",
  CHI = "Chicago Bulls",
  CLE = "Cleveland Cavaliers",
  DAL = "Dallas Mavericks",
  DEN = "Denver Nuggets",
  DET = "Detroit Pistons",
  GSW = "Golden State Warriors",
  HOU = "Houston Rockets",
  IND = "Indiana Pacers",
  LAC = "LA Clippers",
  LAL = "Los Angeles Lakers",
  MEM = "Memphis Grizzlies",
  MIA = "Miami Heat",
  MIL = "Milwaukee Bucks",
  MIN = "Minnesota Timberwolves",
  NO = "New Orleans Pelicans",
  NYK = "New York Knicks",
  OKC = "Oklahoma City Thunder",
  ORL = "Orlando Magic",
  PHI = "Philadelphia 76ers",
  PHX = "Phoenix Suns",
  POR = "Portland Trail Blazers",
  SAC = "Sacramento Kings",
  SA = "San Antonio Spurs",
  TOR = "Toronto Raptors",
  UTA = "Utah Jazz",
  WAS = "Washington Wizards",
}

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
  firstName: string;
  lastName: string;
  team: NBATeam;
  position: PlayerPosition;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPlayerDocument extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  team: NBATeam;
  position: PlayerPosition;
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
  firstName: string;
  lastName: string;
  team: NBATeam;
  position: PlayerPosition;
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
  firstName: string;
  lastName: string;
  team: NBATeam;
  position: PlayerPosition;
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
