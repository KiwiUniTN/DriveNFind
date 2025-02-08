import { GET } from "../../../app/api/parking-spots/route";
import { connectToDB } from "../../../app/lib/database";
import ParkingSpot from "../../../app/models/ParkingSpot";

jest.mock("../../../app/lib/database");
jest.mock("../../../app/models/ParkingSpot");

describe("GET /api/parking-spots", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return 404 when parking spot with given ID is not found", async () => {
    connectToDB.mockResolvedValueOnce();
    ParkingSpot.findOne.mockResolvedValueOnce(null);

    const req = { url: "http://localhost/api/parking-spots?id=1" };
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toBe("Parking spot not found");
  });

  it("should return the parking spot when a valid ID is provided", async () => {
    connectToDB.mockResolvedValueOnce();
    const mockSpot = { id: 1, tipologia: "standard", disponibilita: "libero" };
    ParkingSpot.findOne.mockResolvedValueOnce(mockSpot);

    const req = { url: "http://localhost/api/parking-spots?id=1" };
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(1);
    expect(data.tipologia).toBe("standard");
  });

  it("should return parking spots filtered by disponibilita and tipologia", async () => {
    connectToDB.mockResolvedValueOnce();
    const mockSpots = [
      { id: 1, disponibilita: "libero", tipologia: "standard" },
      { id: 2, disponibilita: "libero", tipologia: "coperto" },
    ];
    ParkingSpot.find.mockResolvedValueOnce(mockSpots);

    const req = { url: "http://localhost/api/parking-spots?disponibilita=libero&tipologia=standard" };
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.length).toBe(2);
  });

  it("should return nearest parking spots when lat and long are provided", async () => {
    connectToDB.mockResolvedValueOnce();
    const mockNearestSpots = [
      { id: 1, tipologia: "standard", disponibilita: "libero", distance: 500 },
      { id: 2, tipologia: "coperto", disponibilita: "libero", distance: 900 },
    ];
    ParkingSpot.aggregate.mockResolvedValueOnce(mockNearestSpots);

    const req = { url: "http://localhost/api/parking-spots?lat=45.465&long=9.19" };
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.length).toBe(2);
    expect(data[0].distance).toBe(500);
  });

  it("should return 500 when an internal server error occurs", async () => {
    connectToDB.mockRejectedValueOnce(new Error("Database connection failed"));

    const req = { url: "http://localhost/api/parking-spots" };
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe("Server error");
    expect(data.error).toBe("Database connection failed");
  });

  it("should handle requests with missing query parameters gracefully", async () => {
    const req = { url: "http://localhost/api/parking-spots" };
    const response = await GET(req);
    expect(response.status).toBe(200);
  });

  it("should return parking spots within 1km radius when lat and long are provided", async () => {
    ParkingSpot.aggregate.mockResolvedValueOnce([
      { id: 1, location: { coordinates: [40.7128, -74.0060] }, distance: 900 },
    ]);
  
    const req = { url: "http://localhost/api/parking-spots?lat=40.7128&long=-74.0060" };
    const response = await GET(req);
    const data = await response.json();
  
    expect(response.status).toBe(200);
    expect(data.length).toBe(1);
  });

  it("should return 500 when a database error occurs", async () => {
    ParkingSpot.find.mockRejectedValueOnce(new Error("Database error"));
  
    const req = { url: "http://localhost/api/parking-spots" };
    const response = await GET(req);
    const data = await response.json();
  
    expect(response.status).toBe(500);
    expect(data.message).toBe("Server error");
  });

  it("should filter parking spots based on regolamento values", async () => {
    ParkingSpot.find.mockResolvedValueOnce([{ id: 1, regolamento: "A" }, { id: 2, regolamento: "B" }]);
  
    const req = { url: "http://localhost/api/parking-spots?regolamento=A,B" };
    const response = await GET(req);
    const data = await response.json();
  
    expect(response.status).toBe(200);
    expect(data.length).toBe(2);
    expect(data[0].regolamento).toBe("A");
    expect(data[1].regolamento).toBe("B");
  });

  it("should filter parking spots for disabile when true", async () => {
    ParkingSpot.find.mockResolvedValueOnce([{ id: 1, disabile: true }]);
  
    const req = { url: "http://localhost/api/parking-spots?disabile=true" };
    const response = await GET(req);
    const data = await response.json();
  
    expect(response.status).toBe(200);
    expect(data.length).toBe(1);
    expect(data[0].disabile).toBe(true);
  });

  it("should filter parking spots based on alimentazione values", async () => {
    ParkingSpot.find.mockResolvedValueOnce([{ id: 1, alimentazione: "electric" }, { id: 2, alimentazione: "gas" }]);
  
    const req = { url: "http://localhost/api/parking-spots?alimentazione=electric,gas" };
    const response = await GET(req);
    const data = await response.json();
  
    expect(response.status).toBe(200);
    expect(data.length).toBe(2);
    expect(data[0].alimentazione).toBe("electric");
    expect(data[1].alimentazione).toBe("gas");
  });
});
