const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load test environment variables
dotenv.config();

let mongoServer;

// Setup test database before all tests
const setupTestDB = async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
    console.log("✅ Test database connected");
  } catch (error) {
    console.error("❌ Test database connection failed:", error);
    throw error;
  }
};

// Cleanup test database after all tests
const teardownTestDB = async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log("✅ Test database cleaned up");
  } catch (error) {
    console.error("❌ Test database cleanup failed:", error);
  }
};

// Clear all collections between tests
const clearTestDB = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

module.exports = {
  setupTestDB,
  teardownTestDB,
  clearTestDB,
};
