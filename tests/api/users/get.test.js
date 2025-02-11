import { createRequest, createResponse } from 'node-mocks-http';
import { GET } from '../../../app/api/users/route';
import { connectToDB } from '../../../app/lib/database';
import User from '../../../app/models/User';
import { Response } from 'node-fetch';
import { authorizeRole } from '../../../app/middleware/auth'; // Import to mock

jest.mock('../../../app/lib/database'); // Mock the database connection
jest.mock('../../../app/models/User'); // Mock the User model
jest.mock('../../../app/middleware/auth'); // Mock the authorization middleware

describe('GET /api/users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 403 if unauthorized (non-admin)', async () => {
    authorizeRole.mockImplementation(() => () => ({
      authorized: false,
      response: new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 }),
    }));

    const req = createRequest({ method: 'GET' });
    const res = createResponse();

    const response = await GET(req, res);

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Forbidden' });
  });

  it('should return 500 if there is a database error', async () => {
    authorizeRole.mockImplementation(() => () => ({
      authorized: true,
      user: { username: 'admin', role: 'admin' },
    }));

    connectToDB.mockRejectedValueOnce(new Error('DB connection error'));

    const req = createRequest({ method: 'GET' });
    const res = createResponse();

    const result = await GET(req, res);

    expect(result.status).toBe(500);
    const data = await result.json();
    expect(data.error).toBe('Internal server error');
  });

  it('should return 200 and list users on success', async () => {
    authorizeRole.mockImplementation(() => () => ({
      authorized: true,
      user: { username: 'adminuser', role: 'admin' },
    }));

    User.find.mockResolvedValueOnce([{ username: 'testUser1' }, { username: 'testUser2' }]);

    const req = createRequest({ method: 'GET' });
    const res = new Response();

    const result = await GET(req, res);

    expect(result.status).toBe(200);
    const data = await result.json();
    expect(data).toEqual([{ username: 'testUser1' }, { username: 'testUser2' }]);
  });
});