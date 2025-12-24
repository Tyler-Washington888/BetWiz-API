import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import CheckingAccount from "../models/checkingAccountModel";
import {
  DepositRequest,
  DepositResponse,
  ICheckingAccountDocument,
} from "../interfaces/checkingAccount";




const deposit = asyncHandler<DepositRequest, Response<DepositResponse>>(
  async (req, res) => {
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

      const response: DepositResponse = {
        success: true,
        message: `Successfully deposited $${amount}`,
        balance: checkingAccount.balance,
        lastTransaction: checkingAccount.lastTransaction,
        lastTransactionAmount: amount,
      };

      res.status(200).json(response);
    } catch (error) {
      res.status(400);
      throw new Error((error as Error).message);
    }
  }
);


export const createCheckingAccountForUser = async (
  userId: string
): Promise<ICheckingAccountDocument> => {
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


export const getCheckingAccountByUserId = async (userId: string) => {
  const checkingAccount = await CheckingAccount.findOne({ userId });
  return checkingAccount;
};


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

export { deposit };
