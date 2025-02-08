import { DELETE } from '../../../../app/api/users/baseusers/route';
import { createRequest, createResponse } from 'node-mocks-http';
import User from '../../../../app/models/User';
import { connectToDB } from '../../../../app/lib/database';
import { authorize } from '../../../../app/middleware/auth';

jest.mock('../../../../app/lib/database');
jest.mock('../../../../app/models/User');
jest.mock('../../../../app/middleware/auth');

describe('DELETE /api/users/baseusers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 403 if the user is not authorized', async () => {
    // Mock the authorization to simulate an unauthorized user
    authorize.mockResolvedValueOnce({ authorized: false, response: Response.json({ message: 'Unauthorized' }, { status: 403 }) });

    const req = createRequest({
      method: 'DELETE',
      url: 'http://localhost/api/users/baseusers',
      body: { username: 'targetUser' }
    });
    const res = createResponse();

    const response = await DELETE(req, res);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.message).toBe('Unauthorized');
  });

  it('should return 403 if a base user tries to delete another user\'s account', async () => {
    const mockAuth = { authorized: true, user: { username: 'baseUser', role: 'baseuser' } };
    authorize.mockResolvedValueOnce(mockAuth);

    const req = createRequest({
      method: 'DELETE',
      url: 'http://localhost/api/users/baseusers',
      body: { username: 'targetUser' }
    });
    const res = createResponse();

    const response = await DELETE(req, res);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.message).toBe('You can only delete your own account.');
  });

  it('should return 403 if an admin tries to delete a non-base user', async () => {
    const mockAuth = { authorized: true, user: { username: 'adminUser', role: 'admin' } };
    authorize.mockResolvedValueOnce(mockAuth);
    const mockUser = { username: 'targetUser', role: 'otherRole' };
    User.findOne.mockResolvedValueOnce(mockUser);

    const req = createRequest({
      method: 'DELETE',
      url: 'http://localhost/api/users/baseusers',
      body: { username: 'targetUser' }
    });
    const res = createResponse();

    const response = await DELETE(req, res);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.message).toBe('Admins can only delete base users.');
  });

  it('should return 404 if the user to delete is not found', async () => {
    const mockAuth = { authorized: true, user: { username: 'adminUser', role: 'admin' } };
    authorize.mockResolvedValueOnce(mockAuth);
    User.findOne.mockResolvedValueOnce(null); // Simulate user not found

    const req = createRequest({
      method: 'DELETE',
      url: 'http://localhost/api/users/baseusers',
      body: { username: 'nonexistentUser' }
    });
    const res = createResponse();

    const response = await DELETE(req, res);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toBe('User not found.');
  });

  it('should return 200 if an admin successfully deletes a base user', async () => {
    const mockAuth = { authorized: true, user: { username: 'adminUser', role: 'admin' } };
    const mockUser = { username: 'baseUser', role: 'baseuser' };
    authorize.mockResolvedValueOnce(mockAuth);
    User.findOne.mockResolvedValueOnce(mockUser); // Simulate the user exists
    User.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });

    const req = createRequest({
      method: 'DELETE',
      url: 'http://localhost/api/users/baseusers',
      body: { username: 'baseUser' }
    });
    const res = createResponse();

    const response = await DELETE(req, res);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('User baseUser deleted successfully.');
  });

  it('should return 200 if a base user successfully deletes their own account', async () => {
    const mockAuth = { authorized: true, user: { username: 'baseUser', role: 'baseuser' } };
    authorize.mockResolvedValueOnce(mockAuth);
    User.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });

    const req = createRequest({
      method: 'DELETE',
      url: 'http://localhost/api/users/baseusers',
      body: { username: null }
    });
    const res = createResponse();

    const response = await DELETE(req, res);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Your account has been deleted successfully.');
  });

  it('should return 500 if an internal error occurs', async () => {
    const mockAuth = { authorized: true, user: { username: 'adminUser', role: 'admin' } };
    authorize.mockResolvedValueOnce(mockAuth);
    User.findOne.mockRejectedValueOnce(new Error('Database error')); // Simulate an internal error

    const req = createRequest({
      method: 'DELETE',
      url: 'http://localhost/api/users/baseusers',
      body: { username: 'baseUser' }
    });
    const res = createResponse();

    const response = await DELETE(req, res);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe('Internal server error.');
  });

  it("should return 403 if admin does not provide a username to delete", async () => {
    // Mock authorization and user role
    authorize.mockReturnValueOnce({ authorized: true, user: { username: "adminUser", role: "admin" } });
  
    const req = { body: {} }; // No username in body
    const response = await DELETE(req);
    const data = await response.json();
  
    expect(response.status).toBe(403);
    expect(data.message).toBe("You don't provide any username to delete");
  });
});
