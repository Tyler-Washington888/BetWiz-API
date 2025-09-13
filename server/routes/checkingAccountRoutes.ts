import express from "express";
import {
  getCheckingAccountById,
  increaseBalance,
  increasePromoBalance,
  decreasePromoBalance,
  deleteCheckingAccount,
} from "../controllers/checkingAccountController";
import { adminOnly, protect } from "../middleware/authMiddleware";

const router = express.Router();

// USER ROUTES (Protected by authentication)
// @route   GET /api/checking-account/get-my-checking-account
// @desc    Get user's checking account
// @access  Private
router.get("/get-my-checking-account", protect, getCheckingAccountById);

// @route   PUT /api/checking-account/increase-balance
// @desc    Increase main balance
// @access  Private
router.put("/increase-balance", protect, increaseBalance);

// @route   DELETE /api/checking-account/delete-my-checking-account
// @desc    Delete user's checking account
// @access  Private
router.delete("/delete-my-checking-account", protect, deleteCheckingAccount);

// ADMIN ROUTES (Protected by authentication + admin privileges)

// @route   POST /api/checking-account/admin/increase-promo-balance/:userId
// @desc    Increase promo balance (Admin only)
// @access  Private/Admin
router.put(
  "/admin/increase-promo-balance/:userId",
  protect,
  adminOnly,
  increasePromoBalance
);

// @route   POST /api/checking-account/admin/decrease-promo-balance/:userId
// @desc    Decrease promo balance (Admin only)
// @access  Private/Admin
router.put(
  "/admin/decrease-promo-balance/:userId",
  protect,
  adminOnly,
  decreasePromoBalance
);

export default router;
