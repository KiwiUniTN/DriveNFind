import { DELETE } from "../../../../../app/api/users/baseusers/reports/route";
import { connectToDB } from "../../../../../app/lib/database";
import Report from "../../../../../app/models/Report";
import { authorizeRole } from "../../../../../app/middleware/auth";

jest.mock("../../../../../app/lib/database");
jest.mock("../../../../../app/models/Report");
jest.mock("../../../../../app/middleware/auth");

describe("DELETE /api/users/baseusers/reports", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if report ID is missing", async () => {
    const req = { url: "http://localhost/api/users/baseusers/reports" };

    const response = await DELETE(req);

    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.message).toBe("Missing required report ID");
  });

  it("should return 403 if user is unauthorized", async () => {
    authorizeRole.mockImplementation(() => async () => ({
      authorized: false,
      response: new Response(JSON.stringify({ message: "Unauthorized" }), { status: 403 }),
    }));

    const req = { url: "http://localhost/api/users/baseusers/reports?id=123" };

    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.message).toBe("Unauthorized");
  });

  it("should return 200 and delete report successfully", async () => {
    connectToDB.mockResolvedValueOnce();
    authorizeRole.mockImplementation(() => async () => ({
      authorized: true,
      user: { username: "baseUser", role: "baseuser" },
    }));
    Report.findByIdAndDelete.mockResolvedValueOnce(true);

    const req = { url: "http://localhost/api/users/baseusers/reports?id=123" };

    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Report deleted successfully");
  });

  it("should return 404 if the report is not found", async () => {
    connectToDB.mockResolvedValueOnce();
    authorizeRole.mockImplementation(() => async () => ({
      authorized: true,
      user: { username: "baseUser", role: "baseuser" },
    }));
    Report.findByIdAndDelete.mockResolvedValueOnce(null);

    const req = { url: "http://localhost/api/users/baseusers/reports?id=123" };

    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toBe("Report not found or already deleted");
  });

  it("should return 500 if an error occurs during deletion", async () => {
    connectToDB.mockResolvedValueOnce();
    authorizeRole.mockImplementation(() => async () => ({
      authorized: true,
      user: { username: "baseUser", role: "baseuser" },
    }));
    Report.findByIdAndDelete.mockRejectedValueOnce(new Error("Database error"));

    const req = { url: "http://localhost/api/users/baseusers/reports?id=123" };

    const response = await DELETE(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe("Internal server error");
  });
});
