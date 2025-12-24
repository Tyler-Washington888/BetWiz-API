import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import OAuthClient from "../models/oauthClientModel";
import OAuthAuthorizationCode from "../models/oauthAuthorizationCodeModel";
import User from "../models/userModel";
import {
  AuthorizationRequest,
  AuthorizationResponse,
  AuthorizationPostResponse,
  TokenRequest,
  TokenResponse,
  OAuthError,
} from "../interfaces/oauth";
import { AuthenticatedRequest, IUserDocument } from "../interfaces/user";

const authorize = asyncHandler(
  async (req: Request, res: Response<AuthorizationResponse | OAuthError>) => {
    const {
      client_id,
      redirect_uri,
      response_type,
      scope,
      state,
      code_challenge,
      code_challenge_method,
    }: AuthorizationRequest = req.query as any;

    if (!client_id || !redirect_uri || !code_challenge) {
      res.status(400);
      throw new Error("Missing required parameters: client_id, redirect_uri, code_challenge");
    }

    if (response_type !== "code") {
      res.status(400);
      throw new Error("response_type must be 'code'");
    }

    if (code_challenge_method && !["S256", "plain"].includes(code_challenge_method)) {
      res.status(400);
      throw new Error("code_challenge_method must be 'S256' or 'plain'");
    }

    
    const client = await OAuthClient.findOne({ clientId: client_id, isActive: true });
    if (!client) {
      res.status(400);
      throw new Error("Invalid client_id");
    }

    
    if (!client.redirectUris.includes(redirect_uri)) {
      res.status(400);
      throw new Error("Invalid redirect_uri");
    }

    let user: IUserDocument | null = null;
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      try {
        const secret = process.env.JWT_SECRET;
        if (secret) {
          const decoded = jwt.verify(token, secret) as { id: string };
          user = await User.findById(decoded.id).select("-password");
        }
      } catch (error) {
      }
    }

    if (!user) {
      const BETWIZ_UI_URL = process.env.BETWIZ_UI_URL || "http:
      const loginUrl = new URL(`${BETWIZ_UI_URL}/login`);

      loginUrl.searchParams.set("oauth_redirect", "true");
      loginUrl.searchParams.set("client_id", client_id);
      loginUrl.searchParams.set("redirect_uri", redirect_uri);
      loginUrl.searchParams.set("response_type", response_type);
      if (scope) loginUrl.searchParams.set("scope", scope);
      if (state) loginUrl.searchParams.set("state", state);
      loginUrl.searchParams.set("code_challenge", code_challenge);
      if (code_challenge_method) loginUrl.searchParams.set("code_challenge_method", code_challenge_method);

      res.redirect(loginUrl.toString());
      return;
    }

    const typedReq = req as AuthenticatedRequest;
    typedReq.user = user;

    const requestedScopes = scope ? scope.split(" ") : [];
    const validScopes = requestedScopes.filter((s) => client.allowedScopes.includes(s));
    if (requestedScopes.length > 0 && validScopes.length === 0) {
      res.status(400);
      throw new Error("Invalid scope");
    }

    
    const authCode = crypto.randomBytes(32).toString("hex");

    
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await OAuthAuthorizationCode.create({
      code: authCode,
      clientId: client_id,
      userId: user._id.toString(),
      redirectUri: redirect_uri,
      scope: validScopes.length > 0 ? validScopes : client.allowedScopes,
      codeChallenge: code_challenge,
      codeChallengeMethod: (code_challenge_method || "S256") as "S256" | "plain",
      expiresAt,
    });

    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set("code", authCode);
    if (state) {
      redirectUrl.searchParams.set("state", state);
    }

    res.redirect(redirectUrl.toString());
  }
);

const token = asyncHandler(
  async (req: Request, res: Response<TokenResponse | OAuthError>) => {
    const {
      grant_type,
      code,
      redirect_uri,
      client_id,
      client_secret,
      code_verifier,
      refresh_token,
    }: TokenRequest = req.body;

    if (!["authorization_code", "refresh_token"].includes(grant_type)) {
      res.status(400);
      throw new Error("Invalid grant_type");
    }

    const client = await OAuthClient.findOne({ clientId: client_id, isActive: true });
    if (!client || client.clientSecret !== client_secret) {
      res.status(401);
      throw new Error("Invalid client credentials");
    }

    if (grant_type === "authorization_code") {
      if (!code || !redirect_uri || !code_verifier) {
        res.status(400);
        throw new Error("Missing required parameters: code, redirect_uri, code_verifier");
      }

      const authCodeDoc = await OAuthAuthorizationCode.findOne({ code });
      if (!authCodeDoc) {
        res.status(400);
        throw new Error("Invalid authorization code. It may have already been used or expired. Please try connecting again.");
      }

      if (new Date() > authCodeDoc.expiresAt) {
        await OAuthAuthorizationCode.deleteOne({ code });
        res.status(400);
        throw new Error("Authorization code has expired");
      }

      if (authCodeDoc.redirectUri !== redirect_uri) {
        res.status(400);
        throw new Error("Invalid redirect_uri");
      }

      let codeChallengeValid = false;
      if (authCodeDoc.codeChallengeMethod === "S256") {
        const hash = crypto.createHash("sha256").update(code_verifier).digest("base64url");
        codeChallengeValid = hash === authCodeDoc.codeChallenge;
      } else if (authCodeDoc.codeChallengeMethod === "plain") {
        codeChallengeValid = code_verifier === authCodeDoc.codeChallenge;
      }

      if (!codeChallengeValid) {
        res.status(400);
        throw new Error("Invalid code_verifier");
      }

      const user = await User.findById(authCodeDoc.userId);
      if (!user) {
        res.status(400);
        throw new Error("User not found");
      }

      const accessToken = crypto.randomBytes(32).toString("hex");
      const refreshToken = crypto.randomBytes(32).toString("hex");

      const accessTokenExpiresIn = 3600;
      const refreshTokenExpiresIn = 90 * 24 * 3600;

      user.refreshToken = refreshToken;
      user.refreshTokenExpiresAt = new Date(Date.now() + refreshTokenExpiresIn * 1000);
      await user.save();

      await OAuthAuthorizationCode.deleteOne({ code });

      const response: TokenResponse = {
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: accessTokenExpiresIn,
        refresh_token: refreshToken,
        scope: authCodeDoc.scope.join(" "),
        user_id: user._id.toString(),
      };

      res.status(200).json(response);
    } else if (grant_type === "refresh_token") {
      if (!refresh_token) {
        res.status(400);
        throw new Error("Missing refresh_token");
      }

      const user = await User.findOne({
        refreshToken: refresh_token,
        refreshTokenExpiresAt: { $gt: new Date() },
      });

      if (!user) {
        res.status(400);
        throw new Error("Invalid or expired refresh_token");
      }

      const accessToken = crypto.randomBytes(32).toString("hex");
      const accessTokenExpiresIn = 3600;

      const newRefreshToken = crypto.randomBytes(32).toString("hex");
      const refreshTokenExpiresIn = 90 * 24 * 3600;

      user.refreshToken = newRefreshToken;
      user.refreshTokenExpiresAt = new Date(Date.now() + refreshTokenExpiresIn * 1000);
      await user.save();

      const response: TokenResponse = {
        access_token: accessToken,
        token_type: "Bearer",
        expires_in: accessTokenExpiresIn,
        refresh_token: newRefreshToken,
        scope: "betting_events:read betting_events:subscribe",
      };

      res.status(200).json(response);
    }
  }
);

const revokeToken = asyncHandler(
  async (req: Request, res: Response) => {
    const typedReq = req as AuthenticatedRequest;
    const { token } = req.body;

    if (!token) {
      res.status(400);
      throw new Error("Token is required");
    }

    const user = await User.findById(typedReq.user._id);
    if (user && user.refreshToken === token) {
      user.refreshToken = undefined;
      user.refreshTokenExpiresAt = undefined;
      await user.save();
    }

    res.status(200).json({ message: "Token revoked successfully" });
  }
);

const authorizePost = asyncHandler(
  async (req: Request, res: Response<AuthorizationPostResponse | OAuthError>) => {
    const {
      client_id,
      redirect_uri,
      response_type,
      scope,
      state,
      code_challenge,
      code_challenge_method,
    }: AuthorizationRequest = req.body;

    if (!client_id || !redirect_uri || !code_challenge) {
      res.status(400);
      throw new Error("Missing required parameters: client_id, redirect_uri, code_challenge");
    }

    if (response_type !== "code") {
      res.status(400);
      throw new Error("response_type must be 'code'");
    }

    if (code_challenge_method && !["S256", "plain"].includes(code_challenge_method)) {
      res.status(400);
      throw new Error("code_challenge_method must be 'S256' or 'plain'");
    }

    
    const client = await OAuthClient.findOne({ clientId: client_id, isActive: true });
    if (!client) {
      res.status(400);
      throw new Error("Invalid client_id");
    }

    
    if (!client.redirectUris.includes(redirect_uri)) {
      res.status(400);
      throw new Error("Invalid redirect_uri");
    }

    let user: IUserDocument | null = null;
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401);
      throw new Error("Authorization token required");
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (secret) {
        const decoded = jwt.verify(token, secret) as { id: string };
        user = await User.findById(decoded.id).select("-password");
      }
    } catch (error) {
      res.status(401);
      throw new Error("Invalid or expired token");
    }

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    const typedReq = req as AuthenticatedRequest;
    typedReq.user = user;

    const requestedScopes = scope ? scope.split(" ") : [];
    const validScopes = requestedScopes.filter((s) => client.allowedScopes.includes(s));
    if (requestedScopes.length > 0 && validScopes.length === 0) {
      res.status(400);
      throw new Error("Invalid scope");
    }

    
    const authCode = crypto.randomBytes(32).toString("hex");

    
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    try {
      const createdCode = await OAuthAuthorizationCode.create({
        code: authCode,
        clientId: client_id,
        userId: typedReq.user._id.toString(),
        redirectUri: redirect_uri,
        scope: validScopes.length > 0 ? validScopes : client.allowedScopes,
        codeChallenge: code_challenge,
        codeChallengeMethod: (code_challenge_method || "S256") as "S256" | "plain",
        expiresAt,
      });
    } catch (error: any) {
      res.status(500);
      throw new Error("Failed to create authorization code");
    }

    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set("code", authCode);
    if (state) {
      redirectUrl.searchParams.set("state", state);
    }

    res.status(200).json({
      redirect_uri: redirectUrl.toString(),
    });
  }
);

    export { authorize, authorizePost, token, revokeToken };

