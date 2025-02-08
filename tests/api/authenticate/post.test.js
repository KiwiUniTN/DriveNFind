import { POST } from "../../../app/api/authenticate/route";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../../app/models/User";
import { connectToDB } from "../../../app/lib/database";

jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../../app/models/User");
jest.mock("../../../app/lib/database");

describe("POST /api/authenticate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if username or password is missing", async () => {
    const req = { json: async () => ({ username: "testUser" }) };
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe("Username and password are required.");
  });

  it("should return 401 if the user is not found", async () => {
    User.findOne.mockResolvedValueOnce(null);

    const req = { json: async () => ({ username: "nonExistentUser", password: "password123" }) };
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe("Invalid username or password, user not present.");
  });

  it("should return 401 if the password is incorrect", async () => {
    const mockUser = { username: "testUser", password: "hashedPassword" };
    User.findOne.mockResolvedValueOnce(mockUser);
    bcrypt.compare.mockResolvedValueOnce(false);

    const req = { json: async () => ({ username: "testUser", password: "wrongPassword" }) };
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe("Invalid username or password.");
  });

  it("should return 200 and a token if the credentials are correct", async () => {
    const mockUser = { _id: "123", username: "testUser", password: "hashedPassword", role: "admin" };
    User.findOne.mockResolvedValueOnce(mockUser);
    bcrypt.compare.mockResolvedValueOnce(true);
    jwt.sign.mockReturnValue("mockToken");

    const req = { json: async () => ({ username: "testUser", password: "password123" }) };
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.token).toBe("mockToken");
    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: mockUser._id, username: mockUser.username, role: mockUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );
  });

  it("should return 500 if an internal server error occurs", async () => {
    User.findOne.mockRejectedValueOnce(new Error("Database error"));

    const req = { json: async () => ({ username: "testUser", password: "password123" }) };
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe("Internal server error");
  });
});
