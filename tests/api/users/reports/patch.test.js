import { PATCH } from "../../../../app/api/users/reports/route";
import { connectToDB } from "../../../../app/lib/database";
import Report from "../../../../app/models/Report";
import { authorize } from "../../../../app/middleware/auth";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { Buffer } from "buffer";

jest.mock("../../../../app/lib/database");
jest.mock("../../../../app/models/Report");
jest.mock("../../../../app/middleware/auth");
jest.mock("cloudinary");
jest.mock("stream");

describe("PATCH /api/users/reports", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
      callback(null, { secure_url: "http://example.com/image.jpg" });
    });
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
    // Mock dell'autorizzazione
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: "testUser", role: "baseuser" },
    }));
  
    // Mock della connessione al database
    connectToDB.mockResolvedValueOnce();
  
    // Mock per trovare il report
    Report.findById.mockResolvedValueOnce({ _id: "123", username: "testUser" });
  
    // Mock per il formData - simuliamo che 'status' sia presente, il che dovrebbe portare a un errore 403
    const req = {
      url: "http://localhost/api/users/reports?reportId=123",
      formData: async () => ({
        has: jest.fn().mockImplementation((key) => key === "status"), // Simuliamo che il body contenga un campo "status"
        get: jest.fn().mockImplementation(() => "resolved"),
      }),
    };
  
    // Eseguiamo la funzione PATCH
    const response = await PATCH(req);
  
    // Convertiamo la risposta in JSON
    const data = await response.json();
  
    // Verifica delle asserzioni
    expect(response.status).toBe(403);
    expect(data.message).toBe("Base users can't modify the status");
  });
  

  it("should return 200 and update the report for base users", async () => {
    // Mock dell'autorizzazione per un baseuser
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: "testUser", role: "baseuser" },
    }));
  
    // Mock della connessione al database
    connectToDB.mockResolvedValueOnce();
  
    // Mock per trovare il report
    Report.findById.mockResolvedValueOnce({ _id: "123", username: "testUser" });
  
    // Mock per aggiornare il report nel database
    Report.findByIdAndUpdate.mockResolvedValueOnce({
      _id: "123",
      username: "testUser",
      description: "Updated description", // Descrizione aggiornata
    });
  
    // Mock del formData - simuliamo che il campo description venga aggiornato
    const req = {
      url: "http://localhost/api/users/reports?reportId=123",
      formData: async () => ({
        has: jest.fn().mockImplementation((key) => key === "description"), // Verifica che "description" sia presente
        get: jest.fn().mockImplementation(() => "Updated description"), // Restituisce la nuova descrizione
      }),
    };
  
    // Eseguiamo la funzione PATCH
    const response = await PATCH(req);
  
    // Convertiamo la risposta in JSON
    const data = await response.json();
  
    // Verifica delle asserzioni
    expect(response.status).toBe(200); // Controlla che lo status sia 200
    expect(data.message).toBe("Report updated successfully"); // Verifica il messaggio di successo
    expect(data.report.username).toBe("testUser"); // Verifica il nome utente nel report
    expect(data.report.description).toBe("Updated description"); // Verifica la descrizione aggiornata
  });
  





  
  it("should return 403 if admin tries to modify the description or imageUrl", async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: "adminUser", role: "admin" },
    }));
  
    connectToDB.mockResolvedValueOnce();
    Report.findById.mockResolvedValueOnce({ _id: "123", username: "testUser" });
  
    const req = {
      url: "http://localhost/api/users/reports?reportId=123",
      formData: async () => ({
        has: jest.fn().mockImplementation((key) => key === "description"),
        get: jest.fn(),
      }),
    };
  
    const response = await PATCH(req);
    const data = await response.json();
  
    expect(response.status).toBe(403);
    expect(data.message).toBe("Admins can't modify the description and imageUrl");
  });
  
  it("should return 400 if admin does not provide status", async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: "adminUser", role: "admin" },
    }));
  
    connectToDB.mockResolvedValueOnce();
    Report.findById.mockResolvedValueOnce({ _id: "123", username: "testUser" });
  
    const req = {
      url: "http://localhost/api/users/reports?reportId=123",
      formData: async () => ({
        has: jest.fn().mockImplementation(() => false), // Nessun campo "status"
        get: jest.fn(),
      }),
    };
  
    const response = await PATCH(req);
    const data = await response.json();
  
    expect(response.status).toBe(400);
    expect(data.message).toBe("Status is required");
  });

  it("should return 500 if image upload fails", async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: "testUser", role: "baseuser" },
    }));
  
    connectToDB.mockResolvedValueOnce();
    Report.findById.mockResolvedValueOnce({ _id: "123", username: "testUser" });
  
    cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
      callback(new Error("Upload failed"), null); // Simula un errore durante il caricamento
    });
  
    const req = {
      url: "http://localhost/api/users/reports?reportId=123",
      formData: async () => ({
        has: jest.fn().mockImplementation((key) => key === "image"),
        get: jest.fn().mockImplementation(() => new Blob(["image content"], { type: "image/jpeg" })),
      }),
    };
  
    const response = await PATCH(req);
    const data = await response.json();
  
    expect(response.status).toBe(500);
    expect(data.message).toBe("Image upload failed");
  });

  it("should return 404 if report update fails", async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: "testUser", role: "baseuser" },
    }));
  
    connectToDB.mockResolvedValueOnce();
    Report.findById.mockResolvedValueOnce({ _id: "123", username: "testUser" });
    Report.findByIdAndUpdate.mockResolvedValueOnce(null); // Simula fallimento aggiornamento
  
    const req = {
      url: "http://localhost/api/users/reports?reportId=123",
      formData: async () => ({
        has: jest.fn().mockImplementation((key) => key === "description"),
        get: jest.fn().mockImplementation(() => "Updated description"),
      }),
    };
  
    const response = await PATCH(req);
    const data = await response.json();
  
    expect(response.status).toBe(404);
    expect(data.message).toBe("Update failed, report not found");
  });

  
  it("should successfully resolve image upload and update report with imageUrl", async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: "testUser", role: "baseuser" },
    }));
  
    connectToDB.mockResolvedValueOnce();
    Report.findById.mockResolvedValueOnce({ _id: "123", username: "testUser" });
    Report.findByIdAndUpdate.mockResolvedValueOnce({
      _id: "123",
      username: "testUser",
      imageUrl: "http://example.com/image.jpg",
    });
  
    cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
      callback(null, { secure_url: "http://example.com/image.jpg" }); // Simula il resolve
    });
  
    const req = {
      url: "http://localhost/api/users/reports?reportId=123",
      formData: async () => ({
        has: jest.fn().mockImplementation((key) => key === "image"),
        get: jest.fn().mockImplementation(() => new Blob(["image content"], { type: "image/jpeg" })),
      }),
    };
  
    const response = await PATCH(req);
    const data = await response.json();
  
    expect(response.status).toBe(200);
    expect(data.message).toBe("Report updated successfully");
    expect(data.report.imageUrl).toBe("http://example.com/image.jpg");
  });

  it("should return 200 and update report status for admin user", async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: "adminUser", role: "admin" },
    }));
  
    connectToDB.mockResolvedValueOnce();
    Report.findById.mockResolvedValueOnce({ _id: "123", username: "adminUser" });
    Report.findByIdAndUpdate.mockResolvedValueOnce({
      _id: "123",
      username: "adminUser",
      status: "approved",
    });
  
    const req = {
      url: "http://localhost/api/users/reports?reportId=123",
      formData: async () => ({
        has: jest.fn().mockImplementation((key) => key === "status"), // Simula presenza di "status"
        get: jest.fn().mockImplementation(() => "approved"),
      }),
    };
  
    const response = await PATCH(req);
    const data = await response.json();
  
    expect(response.status).toBe(200);
    expect(data.message).toBe("Report updated successfully");
    expect(data.report.status).toBe("approved");
  });
  
  it("should return 500 if an unexpected error occurs during report update", async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: "adminUser", role: "admin" },
    }));
  
    connectToDB.mockResolvedValueOnce();
    Report.findById.mockRejectedValueOnce(new Error("Unexpected database error"));
  
    const req = {
      url: "http://localhost/api/users/reports?reportId=123",
      formData: async () => ({
        has: jest.fn(),
        get: jest.fn(),
      }),
    };
  
    const response = await PATCH(req);
    const data = await response.json();
  
    expect(response.status).toBe(500);
    expect(data.message).toBe("Unexpected database error");
  });
  
});
