import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import colors from "./config/colors";
import connectToDatabase from "./config/db";
import { errorHandler } from "./middleware/errorMiddleware";
import userRoutes from "./routes/userRoutes";
import checkingAccountRoutes from "./routes/checkingAccountRoutes";
import pickRoutes from "./routes/pickRoutes";
import entryRoutes from "./routes/entryRoutes";
import oauthRoutes from "./routes/oauthRoutes";
import { seedDatabase } from "./seed/seedDatabase";

const PORT: number = parseInt(process.env.PORT || "5001", 10);

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/users", userRoutes);
app.use("/api/checking-account", checkingAccountRoutes);
app.use("/api/picks", pickRoutes);
app.use("/api/entries", entryRoutes);
app.use("/oauth", oauthRoutes);

app.use(errorHandler);


app.listen(PORT, async () => {
  console.log(colors.yellow.bold(`\n🚀 Server running on port:  ${PORT}\n`));
  
  
  const connected = await connectToDatabase();
  
  if (connected) {
    
    try {
      await seedDatabase();
      console.log("✅ Database seeded successfully.\n".green);
    } catch (error) {
      console.log("⚠️  Database seeding failed, but server continues running.\n".yellow);
    }
  } else {
    console.log("⚠️  Database not connected. Seeding will run when database is available.\n".yellow);
    
    
    let checkCount = 0;
    const checkInterval = setInterval(async () => {
      checkCount++;
      if (mongoose.connection.readyState === 1) {
        clearInterval(checkInterval);
        try {
          await seedDatabase();
          console.log("✅ Database connected and seeded!\n".green);
        } catch (error) {
          console.log("⚠️  Database seeding failed.\n".yellow);
        }
      } else if (checkCount % 12 === 0) {
        
        console.log("⏳ Still waiting for database connection...".yellow);
      }
    }, 5000);
  }
});
