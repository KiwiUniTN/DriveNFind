import { GET } from "../../../../app/api/users/reports/route";
import { connectToDB } from "../../../../app/lib/database";
import Report from "../../../../app/models/Report";
import { authorize } from "../../../../app/middleware/auth";

jest.mock("../../../../app/lib/database");
jest.mock("../../../../app/models/Report");
jest.mock("../../../../app/middleware/auth");

describe("GET /api/users/reports", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 403 if the user is unauthorized", async () => {
    authorize.mockImplementation(() => ({
      authorized: false,
      response: new Response(JSON.stringify({ message: "Unauthorized" }), { status: 403 }),
    }));

    const req = { url: "http://localhost/api/users/reports" };
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.message).toBe("Unauthorized");
  });

  it("should return 404 if the reportId is provided but the report is not found", async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: "testUser", role: "baseuser" },
    }));
    connectToDB.mockResolvedValueOnce();
    Report.findById.mockResolvedValueOnce(null);

    const req = { url: "http://localhost/api/users/reports?reportId=123" };
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toBe("Report not found");
  });

  it("should return 403 if a user tries to access another user's report", async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: "testUser", role: "baseuser" },
    }));
    connectToDB.mockResolvedValueOnce();
    Report.findById.mockResolvedValueOnce({
      _id: "123",
      username: "otherUser",
      description: "Unauthorized report",
    });

    const req = { url: "http://localhost/api/users/reports?reportId=123" };
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.message).toBe("A user can't access a report made by another user");
  });

  it("should return 200 and the report if the reportId is provided and the user owns the report", async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: "testUser", role: "baseuser" },
    }));
    connectToDB.mockResolvedValueOnce();
    Report.findById.mockResolvedValueOnce({
      _id: "123",
      username: "testUser",
      description: "Sample report",
    });

    const req = { url: "http://localhost/api/users/reports?reportId=123" };
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data._id).toBe("123");
    expect(data.username).toBe("testUser");
  });

  it("should return 200 and all reports for admin users", async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: "adminUser", role: "admin" },
    }));
    connectToDB.mockResolvedValueOnce();
    Report.find.mockResolvedValueOnce([
      { _id: "1", username: "user1", description: "Report 1" },
      { _id: "2", username: "user2", description: "Report 2" },
    ]);

    const req = { url: "http://localhost/api/users/reports" };
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.length).toBe(2);
  });

  it("should return 200 and only the user's reports for base users", async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: "testUser", role: "baseuser" },
    }));
    connectToDB.mockResolvedValueOnce();
    Report.find.mockResolvedValueOnce([
      { _id: "1", username: "testUser", description: "Report 1" },
    ]);

    const req = { url: "http://localhost/api/users/reports" };
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.length).toBe(1);
    expect(data[0].username).toBe("testUser");
  });

  it("should return 404 if no reports are found for base users", async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: "testUser", role: "baseuser" },
    }));
    connectToDB.mockResolvedValueOnce();
    Report.find.mockResolvedValueOnce([]);

    const req = { url: "http://localhost/api/users/reports" };
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toBe("No reports found");
  });

  it("should return 500 if an internal server error occurs", async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: "testUser", role: "baseuser" },
    }));
    connectToDB.mockResolvedValueOnce();
    Report.find.mockRejectedValueOnce(new Error("Database error"));

    const req = { url: "http://localhost/api/users/reports" };
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe("Internal server error");
  });
});
