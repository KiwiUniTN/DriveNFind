import { POST } from "../../../../../app/api/users/baseusers/reports/route";
import { createRequest, createResponse } from "node-mocks-http";
import Report from "../../../../../app/models/Report";
import { authorizeRole } from "../../../../../app/middleware/auth";
import { validateUser } from "../../../../../app/api/users/baseusers/reports/route"; // Ensure this import is correct based on your code


jest.mock('../../../../../app/lib/database');
jest.mock("../../../../../app/models/Report");
jest.mock("../../../../../app/middleware/auth");
  
describe("POST /api/users/baseusers/reports", () => {
it("should return 400 if required fields are missing", async () => {
    authorizeRole.mockImplementation(() => {
        return async (req) => ({
          authorized: true, // Authorized user
          user: { username: "adminUser", role: "admin" }, // Mocking the admin user
        });
    });
    const req = createRequest({
    method: "POST",
    url: "http://localhost/api/users/baseusers/reports",
    body: { parkingLotId: "123" }, // Missing description and imageUrl
    });
    const res = createResponse();

    const response = await POST(req, res);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe(
    "Missing required fields: parkingLotId, description, and/or imageUrl"
    );
});

it("should return 201 and create a new report when all fields are provided", async () => {
    const mockUser = { username: "adminUser", role: "admin" };
    const mockReport = {
      username: "adminUser",
      parkingLotId: "123",
      description: "Test report description",
      status: "In sospeso",
      imageUrl: "path/to/image",
    };

    // Mock the authorization role function to simulate an authorized user
    authorizeRole.mockImplementation(() => {
      return async (req) => ({
        authorized: true,
        user: mockUser,
      });
    });

    // Mock the report creation to simulate successful report creation
    Report.create.mockResolvedValue(mockReport);

    const req = createRequest({
      method: "POST",
      url: "http://localhost/api/users/baseusers/reports",
      body: {
        parkingLotId: "123",
        description: "Test report description",
        imageUrl: "path/to/image",
      },
    });
    const res = createResponse();

    try {
      const response = await POST(req, res);
      const data = await response.json();

    //   console.log("Response data:", data); // Log the response data

      // Assertions to verify that the response is correct
      expect(response.status).toBe(201);
      expect(data.username).toBe("adminUser");
      expect(data.parkingLotId).toBe("123");
      expect(data.description).toBe("Test report description");
      expect(data.status).toBe("In sospeso");
      expect(data.imageUrl).toBe("path/to/image");
    } catch (error) {
    //   console.error("Error in POST test:", error); // Log any errors that occur during the test
      throw error; // Rethrow the error to fail the test
    }
  });
  

it("should return 403 when the user is unauthorized", async () => {
const req = createRequest({
    method: "POST",
    url: "http://localhost/api/users/baseusers/reports",
    body: {
    parkingLotId: "123",
    description: "Test report description",
    imageUrl: "path/to/image",
    },
});
const res = createResponse();

// Mock the authorization role function to simulate an unauthorized user
authorizeRole.mockImplementation(() => {
    return async (req) => ({
    authorized: false, // Unauthorized user
    response: new Response(JSON.stringify({ message: "Unauthorized" }), { status: 403 }),
    });
});

try {
    const response = await POST(req, res);
    const data = await response.json();

    // console.log("Response data:", data); // Log the response data

    // Assertions to verify the response is correct
    expect(response.status).toBe(403);
    expect(data.message).toBe("Unauthorized");
} catch (error) {
    throw error; // Rethrow the error to fail the test
}
});

it("should return 500 if report creation fails", async () => {
    authorizeRole.mockImplementation(() => {
        return async (req) => ({
          authorized: true, // Authorized user
          user: { username: "adminUser", role: "admin" }, // Mocking the admin user
        });
    });

    // Mock an error during report creation
    Report.create.mockRejectedValue(new Error("Database error"));

    const req = createRequest({
    method: "POST",
    url: "http://localhost/api/users/baseusers/reports",
    body: {
        parkingLotId: "123",
        description: "Test report description",
        imageUrl: "path/to/image",
    },
    });
    const res = createResponse();

    const response = await POST(req, res);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe("Report creation failed: Database error");
});
});