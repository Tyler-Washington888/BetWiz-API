const { expect } = require("chai");
const request = require("supertest");
const express = require("express");
const cors = require("cors");
const User = require("../../server/models/userModel");
const userRoutes = require("../../server/routes/userRoutes");
const { errorHandler } = require("../../server/middleware/errorMiddleware");
const {
  setupTestDB,
  teardownTestDB,
  clearTestDB,
} = require("../helpers/testSetup");

describe("User Routes Integration Tests", () => {
  let app;

  before(async () => {
    await setupTestDB();

    // Setup test app
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use("/api/users", userRoutes);
    app.use(errorHandler);
  });

  after(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe("POST /api/users/register", () => {
    it("should register a new user", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/users/register")
        .send(userData)
        .expect(201);

      expect(response.body).to.have.property("_id");
      expect(response.body).to.have.property("name", "John Doe");
      expect(response.body).to.have.property("email", "john@example.com");
      expect(response.body).to.have.property("token");
      expect(response.body).to.not.have.property("password");
    });

    it("should return error for missing required fields", async () => {
      const userData = {
        name: "John Doe",
        // Missing email and password
      };

      const response = await request(app)
        .post("/api/users/register")
        .send(userData)
        .expect(400);

      expect(response.body).to.have.property("success", false);
      expect(response.body).to.have.property("error", "Please add all fields");
    });

    it("should return error for duplicate email", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      // Create user first
      await User.create(userData);

      // Try to create duplicate
      const response = await request(app)
        .post("/api/users/register")
        .send(userData)
        .expect(400);

      expect(response.body).to.have.property("success", false);
      expect(response.body).to.have.property("error", "User already exists");
    });
  });

  describe("POST /api/users/login", () => {
    beforeEach(async () => {
      // Create a test user
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };
      await User.create(userData);
    });

    it("should login with valid credentials", async () => {
      const loginData = {
        email: "john@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/users/login")
        .send(loginData)
        .expect(200);

      expect(response.body).to.have.property("_id");
      expect(response.body).to.have.property("name", "John Doe");
      expect(response.body).to.have.property("email", "john@example.com");
      expect(response.body).to.have.property("token");
    });

    it("should return error for invalid email", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/users/login")
        .send(loginData)
        .expect(400);

      expect(response.body).to.have.property("success", false);
      expect(response.body).to.have.property("error", "Invalid credentials");
    });

    it("should return error for invalid password", async () => {
      const loginData = {
        email: "john@example.com",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/users/login")
        .send(loginData)
        .expect(400);

      expect(response.body).to.have.property("success", false);
      expect(response.body).to.have.property("error", "Invalid credentials");
    });
  });

  describe("GET /api/users/me", () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      // Create and login user to get token
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      const registerResponse = await request(app)
        .post("/api/users/register")
        .send(userData);

      authToken = registerResponse.body.token;
      userId = registerResponse.body._id;
    });

    it("should get user profile with valid token", async () => {
      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).to.have.property("_id", userId);
      expect(response.body).to.have.property("name", "John Doe");
      expect(response.body).to.have.property("email", "john@example.com");
      expect(response.body).to.not.have.property("password");
    });

    it("should return error without token", async () => {
      const response = await request(app).get("/api/users/me").expect(401);

      expect(response.body).to.have.property("success", false);
      expect(response.body).to.have.property(
        "error",
        "Not authorized, no token"
      );
    });

    it("should return error with invalid token", async () => {
      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", "Bearer invalidtoken")
        .expect(401);

      expect(response.body).to.have.property("success", false);
      expect(response.body).to.have.property("error", "Not authorized");
    });
  });
});
