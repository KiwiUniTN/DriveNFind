import { DELETE } from '../../../../app/api/users/admins/route';
import { createRequest, createResponse } from 'node-mocks-http';
import User from '../../../../app/models/User';
import { authorizeRole } from '../../../../app/middleware/auth';

jest.mock('../../../../app/lib/database');
jest.mock('../../../../app/models/User');
jest.mock('../../../../app/middleware/auth');

describe('DELETE /api/users/admins', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 403 for unauthorized requests", async () => {
    // Use mockImplementation to simulate an unauthorized response
    authorizeRole.mockImplementation(() => {
      return async (req) => ({
        authorized: false,
        response: new Response(JSON.stringify({ message: "Unauthorized" }), { status: 403 }),
      });
    });

    const req = createRequest({ method: "DELETE", url: "http://localhost/api/users/admins" });
    const res = createResponse();

    const response = await DELETE(req, res);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.message).toBe("Unauthorized");
  });

  it('should return 403 when trying to delete the last admin', async () => {
    // Use mockImplementation to simulate a successful authorization
    authorizeRole.mockImplementation(() => {
      return async (req) => ({
        authorized: true,
        user: { username: 'adminUser', role: 'admin' }
      });
    });

    User.countDocuments.mockResolvedValueOnce(1); // Only one admin in the system

    const req = createRequest({ method: 'DELETE', url: 'http://localhost/api/users/admins' });
    const res = createResponse();

    const response = await DELETE(req, res);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.message).toBe('At least one admin must remain in the system.');
    expect(User.deleteOne).not.toHaveBeenCalled();
  });

  it('should delete the target admin user and return 200', async () => {
    // Use mockImplementation for successful authorization and user deletion
    authorizeRole.mockImplementation(() => {
      return async (req) => ({
        authorized: true,
        user: { username: 'adminUser', role: 'admin' }
      });
    });

    User.findOne.mockResolvedValueOnce({ username: 'targetAdmin', role: 'admin' });
    User.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });

    const req = createRequest({ method: 'DELETE', url: 'http://localhost/api/users/admins?targetUsername=targetAdmin' });
    const res = createResponse();

    const response = await DELETE(req, res);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Admin user targetAdmin deleted successfully.');
    expect(User.deleteOne).toHaveBeenCalledWith({ username: 'targetAdmin' });
  });

  it('should return 404 if the target user does not exist', async () => {
    // Use mockImplementation to simulate successful authorization and a non-existing user
    authorizeRole.mockImplementation(() => {
      return async (req) => ({
        authorized: true,
        user: { username: 'adminUser', role: 'admin' }
      });
    });

    User.findOne.mockResolvedValueOnce(null); // Target user not found

    const req = createRequest({ method: 'DELETE', url: 'http://localhost/api/users/admins?targetUsername=nonexistentUser' });
    const res = createResponse();

    const response = await DELETE(req, res);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toBe('User not found.');
  });

  it('should return 500 if an internal error occurs', async () => {
    // Use mockImplementation to simulate successful authorization and an internal error
    authorizeRole.mockImplementation(() => {
      return async (req) => ({
        authorized: true,
        user: { username: 'adminUser', role: 'admin' }
      });
    });

    User.countDocuments.mockRejectedValueOnce(new Error('Database error')); // Simulate internal error

    const req = createRequest({ method: 'DELETE', url: 'http://localhost/api/users/admins' });
    const res = createResponse();

    const response = await DELETE(req, res);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe('Internal server error.');
  });

  it("should delete the admin's own account and return success", async () => {
    // Mock authorization and database
    authorizeRole.mockImplementation(() => {
        return async (req) => ({
          authorized: true,
          user: { username: 'adminUser', role: 'admin' }
        });
      });
    User.countDocuments.mockResolvedValueOnce(2); // Ensure at least one admin remains
  
    const req = { url: "http://localhost/api/users/admins" };
    User.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });
  
    const response = await DELETE(req);
    const data = await response.json();
  
    expect(response.status).toBe(200);
    expect(data.message).toBe("Your account has been deleted successfully.");
  });
});
