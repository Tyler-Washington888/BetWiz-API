const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const { errorHandler } = require("./src/middleware/errorMiddleware");
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/users", require("./src/routes/userRoutes"));

// Error handler middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`.yellow.bold);
});
