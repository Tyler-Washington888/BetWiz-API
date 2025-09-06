const { expect } = require("chai");
const sinon = require("sinon");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../../server/models/userModel");
const {
  registerUser,
  loginUser,
  getMe,
} = require("../../server/controllers/userController");

describe("User Controller Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    // Mock Express req, res, next objects
    req = {
      body: {},
      user: null,
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };

    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("registerUser", () => {
    it("should register a new user successfully", async () => {
      // Arrange
      req.body = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      const mockUser = {
        _id: "mockUserId",
        name: "John Doe",
        email: "john@example.com",
      };

      sinon.stub(User, "findOne").resolves(null); // User doesn't exist
      sinon.stub(User, "create").resolves(mockUser);
      sinon.stub(jwt, "sign").returns("mockToken");

      // Act
      await registerUser(req, res, next);

      // Assert
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledOnce).to.be.true;

      const responseData = res.json.getCall(0).args[0];
      expect(responseData).to.have.property("_id", "mockUserId");
      expect(responseData).to.have.property("name", "John Doe");
      expect(responseData).to.have.property("email", "john@example.com");
      expect(responseData).to.have.property("token", "mockToken");
    });

    it("should return error if required fields are missing", async () => {
      // Arrange
      req.body = {
        name: "John Doe",
        // Missing email and password
      };

      // Act
      try {
        await registerUser(req, res, next);
      } catch (error) {
        // Assert
        expect(res.status.calledWith(400)).to.be.true;
        expect(error.message).to.equal("Please add all fields");
      }
    });

    it("should return error if user already exists", async () => {
      // Arrange
      req.body = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      const existingUser = { email: "john@example.com" };
      sinon.stub(User, "findOne").resolves(existingUser);

      // Act
      try {
        await registerUser(req, res, next);
      } catch (error) {
        // Assert
        expect(res.status.calledWith(400)).to.be.true;
        expect(error.message).to.equal("User already exists");
      }
    });

    it("should return error if user creation fails", async () => {
      // Arrange
      req.body = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      sinon.stub(User, "findOne").resolves(null);
      sinon.stub(User, "create").resolves(null); // Creation fails

      // Act
      try {
        await registerUser(req, res, next);
      } catch (error) {
        // Assert
        expect(res.status.calledWith(400)).to.be.true;
        expect(error.message).to.equal("Invalid user data");
      }
    });
  });

  describe("loginUser", () => {
    it("should login user successfully with valid credentials", async () => {
      // Arrange
      req.body = {
        email: "john@example.com",
        password: "password123",
      };

      const mockUser = {
        _id: "mockUserId",
        id: "mockUserId",
        name: "John Doe",
        email: "john@example.com",
        matchPassword: sinon.stub().resolves(true),
      };

      sinon.stub(User, "findOne").resolves(mockUser);
      sinon.stub(jwt, "sign").returns("mockToken");

      // Act
      await loginUser(req, res, next);

      // Assert
      expect(res.json.calledOnce).to.be.true;

      const responseData = res.json.getCall(0).args[0];
      expect(responseData).to.have.property("_id", "mockUserId");
      expect(responseData).to.have.property("name", "John Doe");
      expect(responseData).to.have.property("email", "john@example.com");
      expect(responseData).to.have.property("token", "mockToken");
    });

    it("should return error for invalid email", async () => {
      // Arrange
      req.body = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      sinon.stub(User, "findOne").resolves(null); // User not found

      // Act
      try {
        await loginUser(req, res, next);
      } catch (error) {
        // Assert
        expect(res.status.calledWith(400)).to.be.true;
        expect(error.message).to.equal("Invalid credentials");
      }
    });

    it("should return error for invalid password", async () => {
      // Arrange
      req.body = {
        email: "john@example.com",
        password: "wrongpassword",
      };

      const mockUser = {
        email: "john@example.com",
        matchPassword: sinon.stub().resolves(false), // Wrong password
      };

      sinon.stub(User, "findOne").resolves(mockUser);

      // Act
      try {
        await loginUser(req, res, next);
      } catch (error) {
        // Assert
        expect(res.status.calledWith(400)).to.be.true;
        expect(error.message).to.equal("Invalid credentials");
      }
    });
  });

  describe("getMe", () => {
    it("should return user data successfully", async () => {
      // Arrange
      const mockUser = {
        _id: "mockUserId",
        name: "John Doe",
        email: "john@example.com",
        role: "user",
      };

      req.user = mockUser;

      // Act
      await getMe(req, res, next);

      // Assert
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockUser)).to.be.true;
    });

    it("should handle missing user in request", async () => {
      // Arrange
      req.user = null;

      // Act
      await getMe(req, res, next);

      // Assert
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(null)).to.be.true;
    });
  });
});
