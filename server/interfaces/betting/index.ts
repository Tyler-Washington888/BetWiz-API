import { Document, Types } from "mongoose";

// ====== ENUMS ======
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

// ====== MONGOOSE DOCUMENT INTERFACES ======
export interface IGameDocument extends Document {
  _id: Types.ObjectId;
  homeTeam: NBATeam;
  awayTeam: NBATeam;
  startTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPlayerDocument extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  team: NBATeam;
  position: PlayerPosition;
  imageUrl: string;
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

export interface IEntryPickDocument {
  pick: Types.ObjectId;
  selection: "over" | "under";
}

export interface IEntryDocument extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  picks: IEntryPickDocument[];
  wagerAmount: number;
  payoutMultiplier: number;
  betType: "power";
  status: "pending" | "won" | "lost";
  createdAt: Date;
  updatedAt: Date;
}

// ====== API REQUEST INTERFACES ======
export interface EntryPickRequest {
  pickId: string;
  selection: "over" | "under";
}

export interface CreateEntryRequest {
  picks: EntryPickRequest[];
  wagerAmount: number;
  betType: "power";
}

// ====== API RESPONSE INTERFACES ======
export interface GameResponse {
  _id: string;
  homeTeam: NBATeam;
  awayTeam: NBATeam;
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
  imageUrl: string;
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
  payoutMultiplier: number;
  betType: "power";
  potentialPayout: number;
  status: "pending" | "won" | "lost";
  createdAt: Date;
  updatedAt: Date;
}

// ====== SNS PAYLOAD INTERFACES ======
export interface SNSEntryData extends EntryResponse {
  userId: string;
  userEmail: string;
  sportsbook: string;
  timestamp: string;
  event: "ENTRY_CREATED";
}
