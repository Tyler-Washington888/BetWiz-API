import express from "express";
import { deposit } from "../controllers/checkingAccountController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.put("/deposit", protect, deposit);

export default router;
