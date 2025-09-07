import express from "express";
import {
  getCheckingAccountById,
  createCheckingAccount,
  increaseBalance,
  increasePromoBalance,
  decreaseBalance,
  decreasePromoBalance,
  deleteCheckingAccount,
} from "../controllers/checkingAccountController";
import { adminOnly, protect } from "../middleware/authMiddleware";

const router = express.Router();

// USER ROUTES (Protected by authentication)

// @route   POST /api/checking-account/admin/create
// @desc    Create checking account for user
// @access  Private/Admin
router.post("/create", protect, createCheckingAccount);

// @route   GET /api/checking-account/get-my-checking-account
// @desc    Get user's checking account
// @access  Private
router.get("/get-my-checking-account", protect, getCheckingAccountById);

// @route   POST /api/checking-account/increase-balance
// @desc    Increase main balance
// @access  Private
router.post("/increase-balance", protect, increaseBalance);

// @route   POST /api/checking-account/decrease-balance
// @desc    Decrease main balance
// @access  Private
router.post("/decrease-balance", protect, decreaseBalance);

// @route   DELETE /api/checking-account/delete-my-checking-account
// @desc    Delete user's checking account
// @access  Private
router.delete("/delete-my-checking-account", protect, deleteCheckingAccount);

// ADMIN ROUTES (Protected by authentication + admin privileges)

// @route   POST /api/checking-account/admin/increase-promo-balance/:userId
// @desc    Increase promo balance (Admin only)
// @access  Private/Admin
router.post(
  "/admin/increase-promo-balance/:userId",
  adminOnly,
  increasePromoBalance
);

// @route   POST /api/checking-account/admin/decrease-promo-balance/:userId
// @desc    Decrease promo balance (Admin only)
// @access  Private/Admin
router.post(
  "/admin/decrease-promo-balance/:userId",
  adminOnly,
  decreasePromoBalance
);

export default router;
