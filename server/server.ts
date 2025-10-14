import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import colors from "./config/colors";
import connectToDatabase from "./config/db";
import { errorHandler } from "./middleware/errorMiddleware";
import userRoutes from "./routes/userRoutes";
import checkingAccountRoutes from "./routes/checkingAccountRoutes";
import pickRoutes from "./routes/pickRoutes";
import entryRoutes from "./routes/entryRoutes";
import { seedDatabase } from "./seed/seedDatabase";

const PORT: number = parseInt(process.env.PORT || "5000", 10);

dotenv.config();

connectToDatabase();
seedDatabase();

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/users", userRoutes);
app.use("/api/checking-account", checkingAccountRoutes);
app.use("/api/picks", pickRoutes);
app.use("/api/entries", entryRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(colors.yellow.bold(`Server running on port:  ${PORT}`));
});
