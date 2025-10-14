import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel";
import {
  LoginRequest,
  LoginResponse,
  ProfileResponse,
  IUserDocument,
  SignUpResponse,
  SignUpRequest,
  AuthenticatedRequest,
} from "../interfaces/user";
import {
  createCheckingAccountForUser,
  getCheckingAccountByUserId,
} from "./checkingAccountController";
import { JWTPayload } from "../interfaces/jwt";

// @desc    Register user
// @route   POST /api/users/signup
// @access  Public
const signUp = asyncHandler(
  async (req: Request, res: Response<SignUpResponse>) => {
    const {
      firstname,
      lastname,
      email,
      password,
      dateOfBirth,
      role,
    }: SignUpRequest = req.body;

    if (!email) {
      res.status(400);
      throw new Error("Email is required");
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user: IUserDocument = await User.create({
      firstname,
      lastname,
      email,
      password,
      dateOfBirth,
      role,
    });

    if (user) {
      const userIdToString = user._id.toString();
      await createCheckingAccountForUser(userIdToString);

      const response: SignUpResponse = {
        _id: userIdToString,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        linkedBet360Account: user.linkedBet360Account,
        creditBalance: 0,
        role: user.role,
        token: generateJsonWebToken(userIdToString),
      };

      res.status(201).json(response);
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  }
);

// @desc    Authenticate  user
// @route   POST /api/users/login
// @access  Public
const login = asyncHandler(
  async (req: Request, res: Response<LoginResponse>) => {
    const { email, password }: LoginRequest = req.body;

    if (!email) {
      res.status(400);
      throw new Error("Email is required");
    }

    if (!password) {
      res.status(400);
      throw new Error("Password is required");
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const userIdToString = user._id.toString();
      const checkingAccount = await getCheckingAccountByUserId(userIdToString);

      const response: LoginResponse = {
        _id: userIdToString,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        linkedBet360Account: user.linkedBet360Account,
        creditBalance: checkingAccount?.balance || 0,
        role: user.role,
        token: generateJsonWebToken(userIdToString),
      };

      res.json(response);
    } else {
      res.status(400);
      throw new Error("Invalid credentials");
    }
  }
);

// @desc    Get user profile data
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(
  async (req: Request, res: Response<ProfileResponse>) => {
    const typedReq = req as AuthenticatedRequest;

    const user: IUserDocument | null = await User.findById(
      typedReq.user._id.toString()
    );

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    const userIdToString = user._id.toString();

    const checkingAccount = await getCheckingAccountByUserId(userIdToString);

    const response: ProfileResponse = {
      _id: userIdToString,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      dateOfBirth: user.dateOfBirth,
      linkedBet360Account: user.linkedBet360Account,
      creditBalance: checkingAccount?.balance || 0,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json(response);
  }
);

// @desc    Acknowledge that user's Betwiz account is linked to Bet360 and add $20 promo bonus
// @route   POST /api/users/:userId/acknowledge-betwiz-bet360-link
// @access  Private/Admin
const acknowledgeBetwizBet360Link = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.params;

    if (!email) {
      res.status(400);
      throw new Error("User email is required");
    }

    try {
      const user = await User.findOne({ email });

      if (!user) {
        res.status(404);
        throw new Error("User not found");
      }

      const userIdToString = user._id.toString();

      if (user.linkedBet360Account) {
        res.status(400);
        throw new Error(
          "User's Betwiz-Bet360 link has already been acknowledged"
        );
      }

      user.linkedBet360Account = true;
      await user.save();

      const checkingAccount = await getCheckingAccountByUserId(userIdToString);

      res.status(200).json({
        message:
          "Betwiz-Bet360 link acknowledged and $20 bonus added to balance",
        user: {
          _id: userIdToString,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          linkedBet360Account: user.linkedBet360Account,
        },
        balance: checkingAccount?.balance || 0,
      });
    } catch (error) {
      res.status(400);
      throw new Error(
        `Failed to acknowledge Betwiz-Bet360 link: ${(error as Error).message}`
      );
    }
  }
);

// Generate JWT
const generateJsonWebToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const payload: JWTPayload = { id };

  return jwt.sign(payload, secret, {
    expiresIn: "30d",
  });
};

export { signUp, login, getProfile, acknowledgeBetwizBet360Link };
