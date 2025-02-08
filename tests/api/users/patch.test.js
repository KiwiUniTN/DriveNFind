import { createRequest, createResponse } from 'node-mocks-http';
import { PATCH } from '../../../app/api/users/route';
import { connectToDB } from '../../../app/lib/database';
import User from '../../../app/models/User';
import bcrypt from 'bcrypt';
import { authorize } from '../../../app/middleware/auth'; // Ensure correct import

jest.mock('../../../app/lib/database');
jest.mock('../../../app/models/User');
jest.mock('../../../app/middleware/auth');

describe('PATCH /api/users with mocked authorize', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 403 if trying to change another user’s password', async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: 'baseuser', role: 'baseuser' },
    }));

    const req = createRequest({
      method: 'PATCH',
      body: { username: 'anotherUser', newPassword: 'newpassword123' },
    });

    const res = createResponse();

    const response = await PATCH(req, res);

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.message).toBe('You can only change your own password.');
  });

  it('should return 403 if unauthorized to update roles (non-admin)', async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: 'baseuser', role: 'baseuser' },
    }));

    const req = createRequest({
      method: 'PATCH',
      body: { username: 'admin', newRole: 'admin' },
    });

    const res = createResponse();

    const response = await PATCH(req, res);

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.message).toBe('Only admins can change user roles.');
  });

  it('should return 500 if there is a database error', async () => {
    connectToDB.mockRejectedValueOnce(new Error('DB connection error'));

    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: 'admin', role: 'admin' },
    }));

    const req = createRequest({
      method: 'PATCH',
      body: { username: 'testUser', newRole: 'baseuser' },
    });

    const res = createResponse();

    const result = await PATCH(req, res);

    expect(result.status).toBe(500);
    const data = await result.json();
    expect(data.message).toBe('Internal server error.');
  });

  it('should successfully update a user’s password', async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: 'baseuser', role: 'baseuser' },
    }));

    const hashedPassword = await bcrypt.hash('newpassword123', 10);

    User.updateOne.mockResolvedValueOnce({ acknowledged: true });

    const req = createRequest({
      method: 'PATCH',
      body: { newPassword: 'newpassword123' },
    });

    const res = createResponse();

    const response = await PATCH(req, res);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe('Password updated successfully.');
  });

  it('should successfully update a user’s role (admin only)', async () => {
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: 'admin', role: 'admin' },
    }));

    User.findOneAndUpdate.mockResolvedValueOnce({
      username: 'testUser',
      role: 'admin',
    });

    const req = createRequest({
      method: 'PATCH',
      body: { username: 'testUser', newRole: 'admin' },
    });

    const res = createResponse();

    const response = await PATCH(req, res);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe('Role updated successfully for testUser.');
    expect(data.user.role).toBe('admin');
  });

  it("should return 401 if the user is not authorized", async () => {
    authorize.mockReturnValueOnce({ authorized: false, response: new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 }) });
  
    const req = { json: jest.fn().mockResolvedValue({ newPassword: "newSecurePass123" }) };
    const response = await PATCH(req);
    const data = await response.json();
  
    expect(response.status).toBe(401);
    expect(data.message).toBe("Unauthorized");
  });

  it("should return 400 if an invalid role is provided", async () => {
    authorize.mockReturnValueOnce({ authorized: true, user: { role: "admin" } });
  
    const req = {
      json: jest.fn().mockResolvedValue({ targetUsername: "testUser", newRole: "invalidRole" })
    };
    const response = await PATCH(req);
    const data = await response.json();
  
    expect(response.status).toBe(400);
    expect(data.message).toBe("Invalid role provided. Allowed roles: baseuser, admin.");
  });

  it("should return 404 if the target user is not found when updating the role", async () => {
    authorize.mockReturnValueOnce({ authorized: true, user: { role: "admin" } });
  
    User.findOneAndUpdate.mockResolvedValueOnce(null); // Mock no user found
  
    const req = {
      json: jest.fn().mockResolvedValue({ targetUsername: "nonexistentUser", newRole: "baseuser" })
    };
    const response = await PATCH(req);
    const data = await response.json();
  
    expect(response.status).toBe(404);
    expect(data.message).toBe("User not found.");
  });

  it("should return 400 if no valid operation is specified", async () => {
    authorize.mockReturnValueOnce({ authorized: true, user: { role: "baseuser" } });
  
    const req = { json: jest.fn().mockResolvedValue({ targetUsername: "testUser" }) };
    const response = await PATCH(req);
    const data = await response.json();
  
    expect(response.status).toBe(400);
    expect(data.message).toBe("No valid operation specified.");
  });
});
