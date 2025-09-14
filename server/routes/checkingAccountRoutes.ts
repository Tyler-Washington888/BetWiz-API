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

// @route   POST /api/checking-account/admin/increase-promo-balance/:email
// @desc    Increase promo balance
router.put("/increase-promo-balance/:email", increasePromoBalance);

// @route   POST /api/checking-account/admin/decrease-promo-balance/:email
// @desc    Decrease promo balance
router.put("/decrease-promo-balance/:email", decreasePromoBalance);

export default router;
