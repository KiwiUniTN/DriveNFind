import { PATCH } from "../../../../app/api/users/reports/route";
import { connectToDB } from "../../../../app/lib/database";
import Report from "../../../../app/models/Report";
import { authorize } from "../../../../app/middleware/auth";

jest.mock("../../../../app/lib/database");
jest.mock("../../../../app/models/Report");
jest.mock("../../../../app/middleware/auth");

describe("PATCH /api/users/reports", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if reportId is missing", async () => {
    const req = { url: "http://localhost/api/users/reports" }; // No reportId in the URL
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe("Missing required report ID");
  });

  it("should return 403 if the user is unauthorized", async () => {
    authorize.mockImplementation(() => ({
      authorized: false,
      response: new Response(JSON.stringify({ message: "Unauthorized" }), { status: 403 }),
    }));

    const req = { url: "http://localhost/api/users/reports?reportId=123" };
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.message).toBe("Unauthorized");
  });

  it("should return 404 if the report is not found", async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: "testUser", role: "baseuser" },
    }));
    connectToDB.mockResolvedValueOnce();
    Report.findById.mockResolvedValueOnce(null);

    const req = { url: "http://localhost/api/users/reports?reportId=123" };
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toBe("Report not found");
  });

  it("should return 403 if base user tries to modify the status", async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: "testUser", role: "baseuser" },
    }));
    connectToDB.mockResolvedValueOnce();
    Report.findById.mockResolvedValueOnce({ _id: "123", username: "testUser" });

    const req = {
      url: "http://localhost/api/users/reports?reportId=123",
      json: () => ({ status: "resolved" }),
    };
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.message).toBe("Base users can't modify the status");
  });

  it("should return 200 and update the report for base users", async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: "testUser", role: "baseuser" },
    }));
    connectToDB.mockResolvedValueOnce();
    Report.findById.mockResolvedValueOnce({ _id: "123", username: "testUser" });
    Report.findByIdAndUpdate.mockResolvedValueOnce({
      _id: "123",
      username: "testUser",
      description: "Updated description",
    });

    const req = {
      url: "http://localhost/api/users/reports?reportId=123",
      json: () => ({ description: "Updated description" }),
    };
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Report updated");
    expect(data.report.username).toBe("testUser");
    expect(data.report.description).toBe("Updated description");
  });

  it("should return 403 if admin tries to modify description or imageUrl", async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: "adminUser", role: "admin" },
    }));
    connectToDB.mockResolvedValueOnce();
    Report.findById.mockResolvedValueOnce({ _id: "123", username: "testUser" });

    const req = {
      url: "http://localhost/api/users/reports?reportId=123",
      json: () => ({ description: "New description", imageUrl: "new_url" }),
    };
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.message).toBe("Admins can't modify the description and imageUrl");
  });

  it("should return 400 if status is not provided for admin", async () => { //1ui
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: "adminUser", role: "admin" },
    }));
    connectToDB.mockResolvedValueOnce();
    Report.findById.mockResolvedValueOnce({ _id: "123", username: "testUser" });

    const req = {
      url: "http://localhost/api/users/reports?reportId=123",
      json: () => ({ }),
    };
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe("Status is required");
  });

  it("should return 500 if an internal server error occurs", async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: "testUser", role: "baseuser" },
    }));
    connectToDB.mockResolvedValueOnce();
    Report.findById.mockRejectedValueOnce(new Error("Database error"));

    const req = {
      url: "http://localhost/api/users/reports?reportId=123",
      json: () => ({ description: "Updated description" }),
    };
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe("Internal server error");
  });

  it('should update the report for an admin', async () => {
    const reportId = 'report123';
    const body = {
      status: 'resolved', // Supponiamo che l'admin stia cambiando lo status
    };

    // Mock della funzione `authorize` per simulare un admin autenticato
    authorize.mockReturnValueOnce({
      authorized: true,
      user: { username: 'admin1', role: 'admin' },
    });

    // Mock del `Report.findById` per simulare il ritrovamento del report da aggiornare
    const existingReport = { _id: reportId, status: 'pending', description: 'Old description' };
    Report.findById.mockResolvedValueOnce(existingReport);

    // Mock del `Report.findByIdAndUpdate` per simulare l'aggiornamento del report
    const updatedReport = { ...existingReport, ...body };
    Report.findByIdAndUpdate.mockResolvedValueOnce(updatedReport);

    const req = {
      url: `https://example.com/api/reports?reportId=${reportId}`,
      json: () => body, // Simula il body JSON della richiesta
    };

    const response = await PATCH(req); // Chiama la funzione PATCH
    const data = await response.json();

    expect(response.status).toBe(200); // Aspettati uno status 200 per l'aggiornamento riuscito
    expect(data.message).toBe('Report updated'); // Aspettati il messaggio di successo
    expect(data.report).toEqual(updatedReport); // Aspettati che il report aggiornato sia restituito
  });
});
