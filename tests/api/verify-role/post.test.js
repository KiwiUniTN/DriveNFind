import { POST } from "../../../app/api/verify-role/route";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

describe("POST /api/authorization", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return 401 if no authorization token is provided", async () => {
    const request = {
      headers: { get: jest.fn().mockReturnValue(null) },
      json: jest.fn().mockResolvedValue(["admin"]),
    };

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe("Authorization token required");
  });

  it("should return 401 for an invalid token", async () => {
    const request = {
      headers: { get: jest.fn().mockReturnValue("Bearer invalid-token") },
      json: jest.fn().mockResolvedValue(["admin"]),
    };

    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe("Invalid token");
  });

  it("should return 403 if user role is not authorized", async () => {
    const request = {
      headers: { get: jest.fn().mockReturnValue("Bearer valid-token") },
      json: jest.fn().mockResolvedValue(["admin"]),
    };

    jwt.verify.mockReturnValue({ role: "user" });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.message).toBe("Forbidden - insufficient permissions");
  });

  it("should return 200 and authorized true if user role is authorized", async () => {
    const request = {
      headers: { get: jest.fn().mockReturnValue("Bearer valid-token") },
      json: jest.fn().mockResolvedValue(["admin"]),
    };

    jwt.verify.mockReturnValue({ role: "admin", id: 1 });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.authorized).toBe(true);
    expect(data.user).toEqual({ role: "admin", id: 1 });
  });
});
