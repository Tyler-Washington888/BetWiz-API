import mongoose, { Schema, Model } from "mongoose";

export interface IOAuthClientDocument {
  _id: string;
  clientId: string;
  clientSecret: string;
  clientName: string;
  redirectUris: string[];
  allowedScopes: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const oauthClientSchema = new Schema<IOAuthClientDocument>(
  {
    clientId: {
      type: String,
      required: [true, "Client ID is required"],
      unique: true,
      index: true,
    },
    clientSecret: {
      type: String,
      required: [true, "Client secret is required"],
    },
    clientName: {
      type: String,
      required: [true, "Client name is required"],
    },
    redirectUris: {
      type: [String],
      required: [true, "Redirect URIs are required"],
      validate: {
        validator: function (uris: string[]): boolean {
          return uris.length > 0;
        },
        message: "At least one redirect URI is required",
      },
    },
    allowedScopes: {
      type: [String],
      required: [true, "Allowed scopes are required"],
      default: ["betting_events:read", "betting_events:subscribe"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const OAuthClient: Model<IOAuthClientDocument> = mongoose.model<IOAuthClientDocument>(
  "OAuthClient",
  oauthClientSchema
);

export default OAuthClient;



