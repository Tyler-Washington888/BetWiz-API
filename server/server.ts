import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import colors from "colors";
import connectDB from "./config/db";
import { errorHandler } from "./middleware/errorMiddleware";
import userRoutes from "./routes/userRoutes";
import checkingAccountRoutes from "./routes/checkingAccountRoutes";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/users", userRoutes);
app.use("/api/checking-account", checkingAccountRoutes);

// Error handler middleware
app.use(errorHandler);

const PORT: number = parseInt(process.env.PORT || "5000", 10);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`.yellow.bold);
});
