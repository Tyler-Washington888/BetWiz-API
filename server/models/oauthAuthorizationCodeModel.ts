import mongoose, { Schema, Model } from "mongoose";

export interface IOAuthAuthorizationCodeDocument {
  _id: string;
  code: string;
  clientId: string;
  userId: string;
  redirectUri: string;
  scope: string[];
  codeChallenge: string;
  codeChallengeMethod: "S256" | "plain";
  expiresAt: Date;
  createdAt: Date;
}

const oauthAuthorizationCodeSchema = new Schema<IOAuthAuthorizationCodeDocument>(
  {
    code: {
      type: String,
      required: [true, "Authorization code is required"],
      unique: true,
      index: true,
    },
    clientId: {
      type: String,
      required: [true, "Client ID is required"],
      index: true,
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    redirectUri: {
      type: String,
      required: [true, "Redirect URI is required"],
    },
    scope: {
      type: [String],
      required: [true, "Scope is required"],
      default: [],
    },
    codeChallenge: {
      type: String,
      required: [true, "Code challenge is required"],
    },
    codeChallengeMethod: {
      type: String,
      enum: ["S256", "plain"],
      default: "S256",
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
      index: { expireAfterSeconds: 0 }, 
    },
  },
  {
    timestamps: true,
  }
);

const OAuthAuthorizationCode: Model<IOAuthAuthorizationCodeDocument> = mongoose.model<IOAuthAuthorizationCodeDocument>(
  "OAuthAuthorizationCode",
  oauthAuthorizationCodeSchema
);

export default OAuthAuthorizationCode;



