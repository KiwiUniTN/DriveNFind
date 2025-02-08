import { POST } from '../../../../app/api/users/baseusers/route';
import { createRequest, createResponse } from 'node-mocks-http';
import User from '../../../../app/models/User';
import bcrypt from 'bcrypt';
import { connectToDB } from '../../../../app/lib/database';
import { auth, currentUser } from "../../../../node_modules/@clerk/nextjs/server";

jest.mock('../../../../app/lib/database');
jest.mock('../../../../app/models/User');
jest.mock('bcrypt');
jest.mock("../../../../node_modules/@clerk/nextjs/server");

describe("POST /api/users/baseusers", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it("should return 401 if the user is not authenticated", async () => {
      auth.mockResolvedValueOnce({ userId: null });
  
      const req = {};
      const response = await POST(req);
      const data = await response.json();
  
      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });
  
    it("should return 400 if email is not found", async () => {
      auth.mockResolvedValueOnce({ userId: "mockUserId" });
      currentUser.mockResolvedValueOnce({ emailAddresses: [] });
  
      const req = {};
      const response = await POST(req);
      const data = await response.json();
  
      expect(response.status).toBe(400);
      expect(data.error).toBe("Email not found");
    });
  
    it("should return 200 if the user already exists", async () => {
      auth.mockResolvedValueOnce({ userId: "mockUserId" });
      currentUser.mockResolvedValueOnce({ emailAddresses: [{ emailAddress: "test@example.com" }] });
      User.findOne.mockResolvedValueOnce({ username: "test@example.com" });
  
      const req = {};
      const response = await POST(req);
      const data = await response.json();
  
      expect(response.status).toBe(200);
      expect(data.message).toBe("User already exists");
    });
  
    it("should return 201 and create a new user successfully", async () => {
      auth.mockResolvedValueOnce({ userId: "mockUserId" });
      currentUser.mockResolvedValueOnce({ emailAddresses: [{ emailAddress: "newuser@example.com" }] });
      User.findOne.mockResolvedValueOnce(null);
      bcrypt.hash.mockResolvedValueOnce("hashedPassword");
  
      const saveMock = jest.fn();
      User.mockImplementationOnce(() => ({
        save: saveMock,
      }));
  
      const req = {};
      const response = await POST(req);
      const data = await response.json();
  
      expect(response.status).toBe(201);
      expect(data.message).toBe("User created successfully");
      expect(saveMock).toHaveBeenCalled();
    });
  
    it("should return 500 if an internal server error occurs", async () => {
        connectToDB.mockImplementationOnce(() => {
          throw new Error("Database connection error");
        });
      
        const req = {}; // Mock empty request
        const response = await POST(req);
        const data = await response.json();
      
        expect(response.status).toBe(500);
        expect(data.error).toBe("Internal server error");
      });
  });
