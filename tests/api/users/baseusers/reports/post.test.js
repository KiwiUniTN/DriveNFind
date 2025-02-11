import { POST } from "../../../../../app/api/users/baseusers/reports/route";
import { authorizeRole } from "../../../../../app/middleware/auth";
import Report from "../../../../../app/models/Report";
import cloudinary from "../../../../../app/lib/cloudinary";
import mongoose from "mongoose";

jest.mock("../../../../../app/middleware/auth");
jest.mock("../../../../../app/models/Report");
jest.mock("../../../../../app/lib/cloudinary");

describe("POST /api/users/baseusers/reports", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });
  
  afterEach(() => {
    jest.restoreAllMocks(); // Restore mocks to original state
  });
  const mockRequest = (data) => ({
    formData: jest.fn().mockResolvedValue({
      get: jest.fn((key) => data[key]),
    }),
  });

  it("should return 403 if the user is not authorized", async () => {
    // Mock authorization to return unauthorized
    authorizeRole.mockImplementation(() => async () => ({
      authorized: false,
      response: new Response(JSON.stringify({ message: "Unauthorized" }), { status: 403 }),
    }));

    const req = { formData: async () => new Map() }; // Simula l'assenza di dati nel form
    const res = await POST(req);

    const data = await res.json();
    expect(res.status).toBe(403);
    expect(data.message).toBe("User not authorized");
  });
  it("should return 500 if report creation fails due to database error", async () => {
    // Mock dell'autorizzazione per un baseuser
    // const mockUserAuth = { username: "baseUser", role: "baseuser"  };
    authorizeRole.mockImplementation(() => async () => ({
      authorized: true,
      user: { username: "baseUser", role: "baseuser" },
    }));
  
    // Mock del caricamento dell'immagine su Cloudinary (successo)
    cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
      callback(null, { secure_url: "http://cloudinary.com/image.jpg" });
    });
  
    // Mock del body della richiesta con un'immagine e un ID valido
    const req = {
      formData: async () => {
        const formDataMap = new Map();
        formDataMap.set("image", new Blob(["image data"], { type: "image/jpeg" }));
        formDataMap.set("parkingLotId", "60c72b2f9b1d8e001f8a9b8a"); // Un ID di esempio valido
        formDataMap.set("description", "Test description");
        return formDataMap;
      },
    };
  
    // Mock di mongoose.Types.ObjectId.isValid per restituire true
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
  
    // Mock del fallimento durante la creazione del report nel database
    Report.create = jest.fn().mockRejectedValue(new Error("Database error"));
  
    // Eseguiamo la funzione POST, passando anche il mock di userAuth
    const res = await POST(req); // Assuming POST does not take userAuth explicitly
  
    // Convertiamo la risposta in JSON
    const data = await res.json();
  
    // Verifica che la risposta sia 500 e che il messaggio di errore contenga "Database error"
    expect(res.status).toBe(500);
    expect(data.message).toBe("Report creation failed:Database error");
  });

  it("should return 201 if report is successfully created", async () => {
    // Mock dell'autorizzazione per un baseuser
    authorizeRole.mockImplementation(() => async () => ({
      authorized: true,
      user: { username: "baseUser", role: "baseuser" },
    }));
  
    // Mock del caricamento dell'immagine su Cloudinary (successo)
    cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
      callback(null, { secure_url: "http://cloudinary.com/image.jpg" });
    });
  
    // Mock del body della richiesta con un'immagine e un ID valido
    const req = {
      formData: async () => {
        const formDataMap = new Map();
        formDataMap.set("image", new Blob(["image data"], { type: "image/jpeg" }));
        formDataMap.set("parkingLotId", "60c72b2f9b1d8e001f8a9b8a"); // Un ID di esempio valido
        formDataMap.set("description", "Test description");
        return formDataMap;
      },
    };
  
    // Mock di mongoose.Types.ObjectId.isValid per restituire true
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
  
    // Mock della creazione del report nel database (successo)
    const mockCreatedReport = {
      parkingLotId: "60c72b2f9b1d8e001f8a9b8a",
      username: "baseUser",
      description: "Test description",
      status: "In sospeso",
      imageUrl: "http://cloudinary.com/image.jpg",
    };
  
    Report.create = jest.fn().mockResolvedValue(mockCreatedReport);
  
    // Eseguiamo la funzione POST
    const res = await POST(req); // Assuming POST does not take userAuth explicitly
  
    // Convertiamo la risposta in JSON
    const data = await res.json();
  
    // Verifica che la risposta sia 201 e che il report creato sia restituito correttamente
    expect(res.status).toBe(201);
    expect(data).toEqual(mockCreatedReport);
  });
  
  it("should return 400 if parkingLotId is invalid", async () => {
    authorizeRole.mockImplementation(() => async () => ({
      authorized: true,
      user: { username: "baseUser", role: "baseuser" },
    }));

    const req = { formData: async () => new Map([["parkingLotId", "invalid_id"]]) };
    const res = await POST(req);

    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.message).toBe("Invalid parkingLotId format");
  });

  it("should return 500 if image upload fails", async () => {
    // Mock dell'autorizzazione per un baseuser
    authorizeRole.mockImplementation(() => async () => ({
      authorized: true,
      user: { username: "baseUser", role: "baseuser" },
    }));
  
    // Mock del fallimento del caricamento dell'immagine su Cloudinary
    cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
      callback(new Error("Upload failed"));
    });
  
    // Mock del body della richiesta con un'immagine e un ID valido
    const req = {
      formData: async () => {
        const formDataMap = new Map();
        formDataMap.set("image", new Blob(["image data"], { type: "image/jpeg" }));
        formDataMap.set("parkingLotId", "60c72b2f9b1d8e001f8a9b8a"); // Un ID di esempio valido
        formDataMap.set("description", "Test description");
        return formDataMap;
      },
    };
  
    // Log per controllare che i dati siano correttamente passati
    const formData = await req.formData();
    console.log("Form Data:", formData);  // Questo aiuta a vedere cosa c'è nel corpo della richiesta
  
    // Eseguiamo la funzione POST
    const res = await POST(req);
  
    // Convertiamo la risposta in JSON
    const data = await res.json();
  
    // Verifica che lo status sia 500 e che il messaggio di errore sia corretto
    expect(res.status).toBe(500);
    expect(data.message).toBe("Image upload failed");
  });
  
  
  
  

  it("should return 500 if report creation fails", async () => {
    // Mock dell'autorizzazione per un baseuser
    authorizeRole.mockImplementation(() => async () => ({
      authorized: true,
      user: { username: "baseUser", role: "baseuser" },
    }));
  
    // Mock del caricamento su Cloudinary (successo)
    cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
      callback(null, { secure_url: "http://cloudinary.com/image.jpg" });
    });
  
    // Mock di Report.create per simulare un errore nel database
    Report.create.mockRejectedValueOnce(new Error("Database error"));
  
    // Mock dei dati della richiesta
    const req = {
      formData: async () =>
        new Map([
          ["parkingLotId", "60d6f5f8f8f8f8f8f8f8f8"], // ID valido
          ["description", "Test Description"],
          ["image", new Blob(["image content"], { type: "image/jpeg" })], // Simula un file immagine
        ]),
    };
  
    // Log per controllare i dati di formData
    const formData = await req.formData();
    console.log("Form Data:", Array.from(formData.entries()));
  
    // Verifica la validità del parkingLotId
    const parkingLotId = formData.get("parkingLotId");
    console.log("Validating parkingLotId:", parkingLotId);
  
    if (!mongoose.Types.ObjectId.isValid(parkingLotId)) {
      console.log("Invalid parkingLotId:", parkingLotId);
      return new Response(
        JSON.stringify({ message: "Invalid parkingLotId format" }),
        { status: 400 }
      );
    }
  
    // Aggiungiamo un log per capire cosa succede all'inizio del flusso
    console.log("Esecuzione della funzione POST");
  
    // Eseguiamo la funzione POST
    const res = await POST(req);
    const data = await res.json();
  
    // Log della risposta per capire meglio il flusso
    console.log("Response status:", res.status);
    console.log("Response body:", data);
  
    // Verifica che la risposta abbia status 500 e il messaggio corretto
    expect(res.status).toBe(500);
    expect(data.message).toBe("Report creation failed: Database error");
  });
  
  
  it("should return 403 if formData parsing fails", async () => {
    authorizeRole.mockImplementation(() => async () => ({
      authorized: true,
      user: { username: "baseUser", role: "baseuser" },
    }));
  
    // Simula un errore durante l'elaborazione del formData
    const req = {
      formData: async () => {
        throw new Error("Invalid formData parsing");
      },
    };
  
    const res = await POST(req);
    const data = await res.json();
  
    expect(res.status).toBe(403);
    expect(data.message).toBe("Invalid formData parsing");
  });

  it("should return 400 if creating parkingLotId ObjectId fails", async () => {
    authorizeRole.mockImplementation(() => async () => ({
      authorized: true,
      user: { username: "baseUser", role: "baseuser" },
    }));
  
    // Mock di formData con un ID problematico
    const req = {
      formData: async () => new Map([["parkingLotId", "malformed_id"]]),
    };
  
    // Mock di isValid per restituire false
    jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);
  
    const res = await POST(req);
    const data = await res.json();
  
    expect(res.status).toBe(400);
    expect(data.message).toBe("Invalid parkingLotId format");
    expect(data.receivedId).toBe("malformed_id");
  });
  
  
  it("should return 400 if parkingLotId is invalid", async () => {
    authorizeRole.mockImplementation(() => async () => ({
      authorized: true,
      user: { username: "baseUser", role: "baseuser" },
    }));
  
    const invalidParkingLotId = "invalid_id"; // ID non valido
  
    const req = {
      formData: async () =>
        new Map([
          ["parkingLotId", invalidParkingLotId],
          ["description", "Test Description"],
          ["image", new Blob(["image content"], { type: "image/jpeg" })],
        ]),
    };
  
    const res = await POST(req);
    const data = await res.json();
  
    // Debug per diagnosi di eventuali problemi
    console.log("Response status:", res.status);
    console.log("Response data:", data);
  
    expect(res.status).toBe(400);
    expect(data.message).toBe("Invalid parkingLotId format");
  });

  it("should return 400 if there is an error during parkingLotId conversion", async () => {
    // Mock dell'autorizzazione per un baseuser
    authorizeRole.mockImplementation(() => async () => ({
      authorized: true,
      user: { username: "baseUser", role: "baseuser" },
    }));
  
    // Mock del body della richiesta con un ID di parcheggio non valido
    const req = {
      formData: async () =>
        new Map([
          ["parkingLotId", "invalid_id"], // ID non valido
          ["description", "Test Description"],
          ["image", new Blob(["image content"], { type: "image/jpeg" })],
        ]),
    };
  
    // Simula un errore di conversione per parkingLotId
    mongoose.Types.ObjectId = jest.fn().mockImplementation(() => {
      throw new Error("Failed to convert parkingLotId");
    });
  
    // Mock di isValid per evitare errori nei test successivi
    mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true); // Simula che l'ID è valido prima della conversione
  
    // Eseguiamo la funzione POST
    const res = await POST(req);
    const data = await res.json();
  
    // Log per controllare la risposta
    console.log("Response:", res);
    console.log("Data:", data);
  
    // Verifica che lo status sia 400 e il messaggio di errore sia quello giusto
    expect(res.status).toBe(400);
    expect(data.message).toBe("Invalid parkingLotId format");
    expect(data.error).toBe("Failed to convert parkingLotId"); // Verifica che l'errore sia passato correttamente
    expect(data.receivedId).toBe("invalid_id"); // Verifica che l'ID ricevuto sia quello non valido
  });

  
  
  
  
  
  
  
  
  
});
