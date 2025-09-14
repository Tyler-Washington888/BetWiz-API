import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import CheckingAccount from "../models/checkingAccountModel";
import {
  CheckingAccountResponse,
  checkingAccountRequest,
  ICheckingAccountDocument,
} from "../interfaces/checkingAccount";
import { AuthenticatedRequest } from "@/interfaces/user";
import { TransactionResult } from "@/interfaces/checkingAccount";
import { getUserByEmail } from "./userController";

// @desc    Get checking account by ID (Admin only)
// @route   GET /api/checking-account/:id
// @access  Private/Admin
const getCheckingAccountById = asyncHandler<
  checkingAccountRequest,
  Response<CheckingAccountResponse>
>(async (req, res) => {
  const userId = req.user._id.toString();

  if (!userId) {
    res.status(400);
    throw new Error("User id is required");
  }

  const checkingAccount: ICheckingAccountDocument | null =
    await CheckingAccount.findOne({ userId });

  if (!checkingAccount) {
    res.status(404);
    throw new Error(`Checking account not found for user: ${userId}`);
  }

  const response: CheckingAccountResponse = {
    _id: checkingAccount._id.toString(),
    userId: checkingAccount.userId.toString(),
    balance: checkingAccount.balance,
    promoBalance: checkingAccount.promoBalance,
    lastTransaction: checkingAccount.lastTransaction,
    createdAt: checkingAccount.createdAt,
    updatedAt: checkingAccount.updatedAt,
  };

  res.status(200).json(response);
});

// @desc    Increase main balance
// @route   POST /api/checking-account/increase-balance
// @access  Private
const increaseBalance = asyncHandler<
  checkingAccountRequest,
  Response<TransactionResult>
>(async (req, res) => {
  const { amount } = req.body;
  const { _id: userId } = req.user;

  if (!amount) {
    res.status(400);
    throw new Error("Despoit amount is required");
  }

  const checkingAccount: ICheckingAccountDocument | null =
    await CheckingAccount.findOne({ userId });

  if (!checkingAccount) {
    res.status(404);
    throw new Error(`Checking account not found for user: ${userId}`);
  }

  try {
    await checkingAccount.increaseBalance(amount);

    const response: TransactionResult = {
      success: true,
      message: `Successfuly increased balance`,
      balance: checkingAccount.balance,
      promoBalance: checkingAccount.promoBalance,
      lastTransaction: checkingAccount.lastTransaction,
      lastTransactionAmount: amount,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(400);
    throw new Error((error as Error).message);
  }
});

// @desc    Add promo balance (Internal/Admin only)
// @route   POST /api/checking-account/admin/add-promo
// @access  Private/Admin
// @desc    Increase promo balance
// @route   POST /api/checking-account/increase-promo-balance
// @access  Private
const increasePromoBalance = asyncHandler<
  checkingAccountRequest,
  Response<TransactionResult>
>(async (req, res) => {
  const { amount } = req.body;
  const { email } = req.params;
  const stringedEmail = email?.toString().trim();

  if (!stringedEmail) {
    res.status(400);
    throw new Error("User email is required");
  }

  if (email === ":email") {
    res.status(400);
    throw new Error("Invalid user email provided");
  }

  if (!amount) {
    res.status(400);
    throw new Error("Despoit amount is required");
  }

  try {
    const user = await getUserByEmail(stringedEmail);

    if (!user) {
      res.status(404);
      throw new Error("User not found: " + stringedEmail);
    }

    const checkingAccount = await increasePromoBalanceByUserId(
      user._id.toString(),
      amount
    );

    const response: TransactionResult = {
      success: true,
      message: `Successfuly increased promo balance`,
      balance: checkingAccount.balance,
      promoBalance: checkingAccount.promoBalance,
      lastTransaction: checkingAccount.lastTransaction,
      lastTransactionAmount: amount,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(400);
    throw new Error((error as Error).message);
  }
});

// @desc    Decrease promo balance
// @route   POST /api/checking-account/decrease-promo-balance
// @access  Private
const decreasePromoBalance = asyncHandler<
  checkingAccountRequest,
  Response<TransactionResult>
>(async (req, res) => {
  const { amount } = req.body;
  const { email } = req.params;
  const stringedEmail = email?.toString().trim();

  if (!stringedEmail) {
    res.status(400);
    throw new Error("User email is required");
  }

  if (email === ":email") {
    res.status(400);
    throw new Error("Invalid user email provided");
  }

  if (!amount) {
    res.status(400);
    throw new Error("Decrease amount is required");
  }

  try {
    const user = await getUserByEmail(stringedEmail);
    if (!user) {
      res.status(404);
      throw new Error("User not found: " + stringedEmail);
    }

    const checkingAccount = await decreasePromoBalanceByUserId(
      user._id.toString(),
      amount
    );

    const response: TransactionResult = {
      success: true,
      message: `Successfuly decreased promo balance`,
      balance: checkingAccount.balance,
      promoBalance: checkingAccount.promoBalance,
      lastTransaction: checkingAccount.lastTransaction,
      lastTransactionAmount: amount,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(400);
    throw new Error((error as Error).message);
  }
});

// @desc    Delete checking account (Admin only - soft delete by deactivation)
// @route   DELETE /api/checking-account/admin/:id
// @access  Private/Admin
const deleteCheckingAccount = asyncHandler<
  AuthenticatedRequest,
  Response<{ message: string }>
>(async (req, res) => {
  const { _id: userId } = req.user;

  try {
    await deleteCheckingAccountForUser(userId.toString());

    res.status(200).json({
      message: "Successfully deleted checking account",
    });
  } catch (error) {
    res.status(400);
    throw new Error((error as Error).message);
  }
});

// Standalone function to create a checking account for a user
export const createCheckingAccountForUser = async (
  userId: string
): Promise<ICheckingAccountDocument> => {
  // Check if checking account already exists for this user
  const existingCheckingAccount = await CheckingAccount.findOne({ userId });
  if (existingCheckingAccount) {
    throw new Error(`Checking account already exists for user: ${userId}`);
  }

  const createdCheckingAccount: ICheckingAccountDocument =
    await CheckingAccount.create({
      userId,
    });

  return createdCheckingAccount;
};

// Internal function to create a checking account for a user

// Standalone function to delete a checking account for a user
export const deleteCheckingAccountForUser = async (
  userId: string
): Promise<void> => {
  const checkingAccount: ICheckingAccountDocument | null =
    await CheckingAccount.findOne({ userId });

  if (!checkingAccount) {
    throw new Error(`Checking account not found for user: ${userId}`);
  }

  await checkingAccount.deleteOne();
};

// Helper function to increase promo balance by userId (for internal use)
export const increasePromoBalanceByUserId = async (
  userId: string,
  amount: number
): Promise<ICheckingAccountDocument> => {
  const checkingAccount: ICheckingAccountDocument | null =
    await CheckingAccount.findOne({ userId });

  if (!checkingAccount) {
    throw new Error(`Checking account not found for user: ${userId}`);
  }

  await checkingAccount.increasePromoBalance(amount);
  return checkingAccount;
};

// Helper function to decrease balance by userId (for internal use)
export const decreaseBalanceByUserId = async (
  userId: string,
  amount: number
): Promise<ICheckingAccountDocument> => {
  const checkingAccount: ICheckingAccountDocument | null =
    await CheckingAccount.findOne({ userId });

  if (!checkingAccount) {
    throw new Error(`Checking account not found for user: ${userId}`);
  }

  await checkingAccount.decreaseBalance(amount);
  return checkingAccount;
};

// Helper function to decrease promo balance by userId (for internal use)
export const decreasePromoBalanceByUserId = async (
  userId: string,
  amount: number
): Promise<ICheckingAccountDocument> => {
  const checkingAccount: ICheckingAccountDocument | null =
    await CheckingAccount.findOne({ userId });

  if (!checkingAccount) {
    throw new Error(`Checking account not found for user: ${userId}`);
  }

  await checkingAccount.decreasePromoBalance(amount);
  return checkingAccount;
};

// Helper function to decrease from appropriate balance type
export const decreaseBalanceByType = async (
  userId: string,
  amount: number,
  balanceType: "regular" | "promo"
): Promise<ICheckingAccountDocument> => {
  if (balanceType === "promo") {
    return await decreasePromoBalanceByUserId(userId, amount);
  } else {
    return await decreaseBalanceByUserId(userId, amount);
  }
};

export {
  getCheckingAccountById,
  increaseBalance,
  increasePromoBalance,
  decreasePromoBalance,
  deleteCheckingAccount,
};
