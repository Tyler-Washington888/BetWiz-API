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

// @desc    Create checking account for user (Admin only)
// @route   POST /api/checking-account/admin/create
// @access  Private/Admin
const createCheckingAccount = asyncHandler<
  checkingAccountRequest,
  Response<CheckingAccountResponse>
>(async (req, res) => {
  const { _id: userId } = req.user;

  try {
    const createdCheckingAccount: ICheckingAccountDocument =
      await createCheckingAccountForUser(userId.toString());

    const response: CheckingAccountResponse = {
      _id: createdCheckingAccount._id.toString(),
      userId: createdCheckingAccount.userId.toString(),
      balance: createdCheckingAccount.balance,
      promoBalance: createdCheckingAccount.promoBalance,
      lastTransaction: createdCheckingAccount.lastTransaction,
      createdAt: createdCheckingAccount.createdAt,
      updatedAt: createdCheckingAccount.updatedAt,
    };

    res.status(201).json(response);
  } catch (error) {
    res.status(400);
    throw new Error((error as Error).message);
  }
});

// @desc    Get checking account by ID (Admin only)
// @route   GET /api/checking-account/:id
// @access  Private/Admin
const getCheckingAccountById = asyncHandler<
  checkingAccountRequest,
  Response<CheckingAccountResponse>
>(async (req, res) => {
  const userId = req.params.userId;

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
      amount: amount,
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
  const { userId } = req.params;

  if (!userId) {
    res.status(400);
    throw new Error("User id is required");
  }

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
    await checkingAccount.increasePromoBalance(amount);

    const response: TransactionResult = {
      success: true,
      message: `Successfuly increased promo balance`,
      balance: checkingAccount.balance,
      promoBalance: checkingAccount.promoBalance,
      lastTransaction: checkingAccount.lastTransaction,
      amount: amount,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(400);
    throw new Error((error as Error).message);
  }
});

// @desc    Decrease main balance
// @route   POST /api/checking-account/decrease-balance
// @access  Private
const decreaseBalance = asyncHandler<
  checkingAccountRequest,
  Response<TransactionResult>
>(async (req, res) => {
  const { amount } = req.body;
  const { _id: userId } = req.user;

  if (!amount) {
    res.status(400);
    throw new Error("Decrease amount is required");
  }

  const checkingAccount: ICheckingAccountDocument | null =
    await CheckingAccount.findOne({ userId });

  if (!checkingAccount) {
    res.status(404);
    throw new Error(`Checking account not found for user: ${userId}`);
  }

  try {
    await checkingAccount.decreaseBalance(amount);

    const response: TransactionResult = {
      success: true,
      message: `Successfuly decreased balance`,
      balance: checkingAccount.balance,
      promoBalance: checkingAccount.promoBalance,
      lastTransaction: checkingAccount.lastTransaction,
      amount: amount,
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
  const { userId } = req.params;

  if (!userId) {
    res.status(400);
    throw new Error("User id is required");
  }

  if (!amount) {
    res.status(400);
    throw new Error("Decrease amount is required");
  }

  const checkingAccount = await CheckingAccount.findOne({ userId });

  if (!checkingAccount) {
    res.status(404);
    throw new Error(`Checking account not found for user: ${userId}`);
  }

  try {
    await checkingAccount.decreasePromoBalance(amount);

    const response: TransactionResult = {
      success: true,
      message: `Successfuly decreased promo balance`,
      balance: checkingAccount.balance,
      promoBalance: checkingAccount.promoBalance,
      lastTransaction: checkingAccount.lastTransaction,
      amount: amount,
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

export {
  getCheckingAccountById,
  createCheckingAccount,
  increaseBalance,
  increasePromoBalance,
  decreaseBalance,
  decreasePromoBalance,
  deleteCheckingAccount,
};
