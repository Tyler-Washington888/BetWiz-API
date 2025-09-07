import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response, NextFunction } from "express";
import User from "../models/userModel";
import { IUserDocument, JWTPayload, UserRole } from "../interfaces/user";
import { AuthenticatedRequest } from "@/interfaces/common";

const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        // Get token from header
        token = req.headers.authorization.split(" ")[1];

        // Verify token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error("JWT_SECRET is not defined");
        }

        const decoded = jwt.verify(token, secret) as JWTPayload;

        // Get user from the token
        const user: IUserDocument | null = await User.findById(
          decoded.id
        ).select("-password");

        if (!user) {
          res.status(401);
          throw new Error("Not authorized - user not found");
        }

        // Attach user to request
        (req as AuthenticatedRequest).user = user;

        next();
      } catch (error) {
        console.log(error);
        res.status(401);
        throw new Error("Not authorized");
      }
    }

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, no token");
    }
  }
);

// @desc    Check if user is admin
const adminOnly = asyncHandler<AuthenticatedRequest, Response>(
  async (req, res, next) => {
    if (req.user && req.user.role === UserRole.ADMIN) {
      next();
    } else {
      res.status(403);
      throw new Error("Access denied. Admin privileges required.");
    }
  }
);

export { protect, adminOnly };
