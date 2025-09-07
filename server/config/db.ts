import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/betwiz";

    const conn = await mongoose.connect(mongoUri);

    console.log(
      `✅ MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold
    );
  } catch (error) {
    console.log(`❌ Error: ${(error as Error).message}`.red.underline.bold);
    process.exit(1);
  }
};

export default connectDB;
