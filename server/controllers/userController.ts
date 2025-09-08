import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel";
import {
  RegisterUserResponse,
  LoginUserRequest,
  LoginUserResponse,
  UserProfileResponse,
  JWTPayload,
  IUserDocument,
} from "../interfaces/user";
import {
  createCheckingAccountForUser,
  deleteCheckingAccountForUser,
  increasePromoBalanceByUserId,
} from "./checkingAccountController";
import { AuthenticatedRequest } from "@/interfaces/user";

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(
  async (req: Request, res: Response<RegisterUserResponse>) => {
    const { firstname, lastname, email, password, dateOfBirth, role } =
      req.body;

    if (!email) {
      res.status(400);
      throw new Error("Email is required");
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    // Create user
    const user: IUserDocument = await User.create({
      firstname,
      lastname,
      email,
      password,
      dateOfBirth,
      role,
    });

    if (user) {
      await createCheckingAccountForUser(user._id.toString());

      const response: RegisterUserResponse = {
        _id: user._id.toString(),
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        linkedBet360Account: user.linkedBet360Account,
        role: user.role,
        token: generateToken(user._id.toString()),
      };

      res.status(201).json(response);
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  }
);

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(
  async (req: Request, res: Response<LoginUserResponse>) => {
    const { email, password }: LoginUserRequest = req.body;

    if (!email) {
      res.status(400);
      throw new Error("Email is required");
    }

    if (!password) {
      res.status(400);
      throw new Error("Password is required");
    }

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const response: LoginUserResponse = {
        _id: user._id.toString(),
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        linkedBet360Account: user.linkedBet360Account,
        role: user.role,
        token: generateToken(user._id.toString()),
      };

      res.json(response);
    } else {
      res.status(400);
      throw new Error("Invalid credentials");
    }
  }
);

// @desc    Get user data
// @route   GET /api/users/my-data
// @access  Private
const getMyData = asyncHandler(
  async (req: Request, res: Response<UserProfileResponse>) => {
    const typedReq = req as AuthenticatedRequest;

    const user: IUserDocument | null = await User.findById(
      typedReq.user._id.toString()
    );

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    const response: UserProfileResponse = {
      _id: user._id.toString(),
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      dateOfBirth: user.dateOfBirth,
      linkedBet360Account: user.linkedBet360Account,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json(response);
  }
);

// @desc    Delete user and associated checking account
// @route   DELETE /api/users/delete
// @access  Private
const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const typedReq = req as AuthenticatedRequest;
  const userId = typedReq.user._id.toString();

  try {
    // First delete the checking account
    await deleteCheckingAccountForUser(userId);

    // Then delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: "User and associated checking account successfully deleted",
    });
  } catch (error) {
    res.status(400);
    throw new Error(`Failed to delete user: ${(error as Error).message}`);
  }
});

// @desc    Acknowledge that user's Betwiz account is linked to Bet360 and add $20 promo bonus
// @route   POST /api/users/:userId/acknowledge-betwiz-bet360-link
// @access  Private/Admin
const acknowledgeBetwizBet360Link = asyncHandler(
  async (req: Request, res: Response) => {
    const typedReq = req as AuthenticatedRequest;
    const { userId } = req.params;

    if (!userId) {
      res.status(400);
      throw new Error("User id is required");
    }

    try {
      const user = await User.findById(userId);

      if (!user) {
        res.status(404);
        throw new Error("User not found");
      }

      // Check if already acknowledged
      if (user.linkedBet360Account) {
        res.status(400);
        throw new Error(
          "User's Betwiz-Bet360 link has already been acknowledged"
        );
      }

      // Update user to set linkedBet360Account to true
      user.linkedBet360Account = true;
      await user.save();

      // Add $20 to promo balance
      const updatedCheckingAccount = await increasePromoBalanceByUserId(
        userId,
        20
      );

      res.status(200).json({
        message: "Betwiz-Bet360 link acknowledged and $20 promo bonus added",
        user: {
          _id: user._id.toString(),
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          linkedBet360Account: user.linkedBet360Account,
        },
        promoBalance: updatedCheckingAccount.promoBalance,
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
const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const payload: JWTPayload = { id };

  return jwt.sign(payload, secret, {
    expiresIn: "30d",
  });
};

export {
  registerUser,
  loginUser,
  getMyData,
  deleteUser,
  acknowledgeBetwizBet360Link,
};
