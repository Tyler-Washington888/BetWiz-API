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
  SubscriptionStatusResponse,
  SubscribeRequest,
  UnsubscribeRequest,
} from "../interfaces/user";
import {
  createCheckingAccountForUser,
  getCheckingAccountByUserId,
} from "./checkingAccountController";
import { JWTPayload } from "../interfaces/jwt";




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

    if (!password) {
      res.status(400);
      throw new Error("Password is required");
    }

    
    if (password.length > 40) {
      res.status(400);
      throw new Error("Password cannot exceed 40 characters");
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
        isSubscribed: user.isSubscribed || false,
        subscribedBet360Emails: user.subscribedBet360Emails || [],
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
        isSubscribed: user.isSubscribed || false,
        subscribedBet360Emails: user.subscribedBet360Emails || [],
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
      isSubscribed: user.isSubscribed || false,
      subscribedBet360Emails: user.subscribedBet360Emails || [],
      creditBalance: checkingAccount?.balance || 0,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json(response);
  }
);




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

      if (user.isSubscribed) {
        res.status(400);
        throw new Error(
          "User's Betwiz-Bet360 link has already been acknowledged"
        );
      }

      user.isSubscribed = true;
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
          isSubscribed: user.isSubscribed,
          subscribedBet360Emails: user.subscribedBet360Emails,
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




const getSubscriptionStatus = asyncHandler(
  async (req: Request, res: Response<SubscriptionStatusResponse>) => {
    const typedReq = req as AuthenticatedRequest;
    const { userId } = req.params;

    
    if (userId !== typedReq.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to access this resource");
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const response: SubscriptionStatusResponse = {
      isSubscribed: user.isSubscribed || false,
      subscribedBet360Emails: user.subscribedBet360Emails || [],
    };

    res.status(200).json(response);
  }
);




const subscribe = asyncHandler(
  async (req: Request, res: Response) => {
    const typedReq = req as AuthenticatedRequest;
    const { userId } = req.params;
    const { bet360Email }: SubscribeRequest = req.body;

    if (!bet360Email) {
      res.status(400);
      throw new Error("Bet360 email is required");
    }

    
    if (userId !== typedReq.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to access this resource");
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    
    const updateData: {
      $addToSet?: { subscribedBet360Emails: string };
      isSubscribed?: boolean;
    } = {};
    
    
    if (!user.subscribedBet360Emails.includes(bet360Email)) {
      updateData.$addToSet = { subscribedBet360Emails: bet360Email };
    }

    
    if (!user.isSubscribed) {
      updateData.isSubscribed = true;
    }

    
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: false } 
    );

    if (!updatedUser) {
      res.status(404);
      throw new Error("User not found");
    }

    
    const { notifyBet360Subscription } = await import("../services/bet360Service");
    await notifyBet360Subscription(bet360Email, true);

    res.status(200).json({
      message: "Successfully subscribed to Bet360",
      isSubscribed: updatedUser.isSubscribed,
      subscribedBet360Emails: updatedUser.subscribedBet360Emails,
    });
  }
);




const unsubscribe = asyncHandler(
  async (req: Request, res: Response) => {
    const typedReq = req as AuthenticatedRequest;
    const { userId } = req.params;
    const { bet360Email }: UnsubscribeRequest = req.body;

    if (!bet360Email) {
      res.status(400);
      throw new Error("Bet360 email is required");
    }

    
    if (userId !== typedReq.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to access this resource");
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    
    user.subscribedBet360Emails = user.subscribedBet360Emails.filter(
      (email) => email !== bet360Email
    );

    
    if (user.subscribedBet360Emails.length === 0) {
      user.isSubscribed = false;
    }

    await user.save();

    res.status(200).json({
      message: "Successfully unsubscribed from Bet360",
      isSubscribed: user.isSubscribed,
      subscribedBet360Emails: user.subscribedBet360Emails,
    });
  }
);

export { signUp, login, getProfile, acknowledgeBetwizBet360Link, getSubscriptionStatus, subscribe, unsubscribe };
