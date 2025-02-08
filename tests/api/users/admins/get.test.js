import { createRequest, createResponse } from 'node-mocks-http';
import { GET } from '../../../../app/api/users/admins/route';
import { connectToDB } from '../../../../app/lib/database';
import User from '../../../../app/models/User';
import { Response } from 'node-fetch';
import { authorize } from '../../../../app/middleware/auth';

jest.mock('../../../../app/lib/database'); // Mock the database connection
jest.mock('../../../../app/models/User'); // Mock the User model
jest.mock('../../../../app/middleware/auth', () => ({
  authorize: jest.fn(),
}));

describe('GET /api/users/admins', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if the user is not authorized for the GET request", async () => {
    authorize.mockReturnValueOnce({ authorized: false, response: new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 }) });
  
    const req = { url: "/users/admins?getAll=true" };
    const response = await GET(req);
    const data = await response.json();
  
    expect(response.status).toBe(401);
    expect(data.message).toBe("Unauthorized");
  });

  it('should return 403 if unauthorized (non-admin)', async () => {
    authorize.mockReturnValue({
      authorized: true,
      user: { userId: '67a2192a8f75d37bec75aeeb', role: 'baseuser' },
    });

    const req = createRequest({
      method: 'GET',
    });
    req.url = 'http://localhost/api/users/admins?getAll=true'; 

    const res = createResponse();

    const response = await GET(req, res);

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ message: 'Forbidden - insufficient permissions' });
  });

  it('should return 500 if there is a database error', async () => {
    connectToDB.mockRejectedValueOnce(new Error('DB connection error'));
    
    authorize.mockReturnValue({
      authorized: true,
      user: { userId: '67a2319e57d21f77467855dd', role: 'admin' },
    });

    const req = createRequest({
      method: 'GET',
    });
    req.url = 'http://localhost/api/users?getAll=true';

    const res = createResponse();

    const result = await GET(req, res);

    expect(result.status).toBe(500);
    const data = await result.json();
    expect(data.error).toBe('Internal server error');
  });

  it('should return 404 if user not found', async () => {
    authorize.mockReturnValue({
      authorized: true,
      user: { userId: '67a2319e57d21f77467855dd', role: 'admin' },
    });

    User.findByUsername.mockResolvedValueOnce(null);

    const req = createRequest({
      method: 'GET',
    });
    req.url = 'http://localhost/api/users?getAll=false';

    const res = createResponse();

    const result = await GET(req, res);

    expect(result.status).toBe(404);
    const data = await result.json();
    expect(data.error).toBe('User not found');
  });

  it('should return 200 and list users for admin with getAll=true', async () => {
    authorize.mockReturnValue({
      authorized: true,
      user: { userId: '67a2192a8f75d37bec75aeeb', role: 'admin' },
    });

    User.findByRole.mockResolvedValueOnce([
      { username: 'testUser1', role: 'admin' },
      { username: 'testUser2', role: 'admin' },
    ]);

    const req = createRequest({
      method: 'GET',
    });
    req.url = 'http://localhost/api/users?getAll=true';

    const res = createResponse();

    const result = await GET(req, res);

    expect(result.status).toBe(200);
    const data = await result.json();
    expect(data).toEqual([
      { username: 'testUser1', role: 'admin' },
      { username: 'testUser2', role: 'admin' },
    ]);
  });

  it('should return 200 and specific user info if admin with getAll=false', async () => {
    authorize.mockReturnValue({
      authorized: true,
      user: { userId: '67a2192a8f75d37bec75aeeb', role: 'admin' },
    });

    User.findByUsername.mockResolvedValueOnce({
      username: 'admin',
      role: 'admin',
    });

    const req = createRequest({
      method: 'GET',
    });
    req.url = 'http://localhost/api/users?getAll=false';

    const res = createResponse();

    const result = await GET(req, res);

    expect(result.status).toBe(200);
    const data = await result.json();
    expect(data).toEqual({ username: 'admin', role: 'admin' });
  });
});
