import { GET } from '../../../../app/api/users/baseusers/route';
import { createRequest, createResponse } from 'node-mocks-http';
import User from '../../../../app/models/User';
import { authorize } from '../../../../app/middleware/auth';
import { connectToDB } from '../../../../app/lib/database';

jest.mock('../../../../app/lib/database');
jest.mock('../../../../app/models/User');
jest.mock('../../../../app/middleware/auth');

describe('GET /api/users/baseusers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 403 if the user is unauthorized', async () => {
    // Mock the authorize middleware to simulate unauthorized access
    authorize.mockImplementation(() => ({
      authorized: false,
      response: new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 403 }),
    }));

    const req = createRequest({ method: 'GET', url: 'http://localhost/api/users/baseusers' });
    const res = createResponse();

    const response = await GET(req, res);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.message).toBe('Unauthorized');
  });

  it('should return 200 with base users when the user is an admin and no username is provided', async () => {
    // Mock authorization for an admin user
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: 'adminUser', role: 'admin' },
    }));

    const mockUsers = [{ username: 'baseuser1' }, { username: 'baseuser2' }];
    User.findByRole.mockResolvedValueOnce(mockUsers);

    const req = createRequest({
      method: 'GET',
      url: 'http://localhost/api/users/baseusers',
    });
    const res = createResponse();

    const response = await GET(req, res);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockUsers);
  });

  it('should return 404 if the user is an admin and the user to search for is not found', async () => {
    // Mock authorization for an admin user
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: 'adminUser', role: 'admin' },
    }));

    User.findByUsername.mockResolvedValueOnce(null); // Simulate no user found

    const req = createRequest({
      method: 'GET',
      url: 'http://localhost/api/users/baseusers?username=nonexistentUser',
    });
    const res = createResponse();

    const response = await GET(req, res);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('User not found');
  });

  it('should return 403 if the user is a baseuser and tries to search for another baseuser', async () => {
    // Mock authorization for a base user
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: 'baseuser1', role: 'baseuser' },
    }));

    const req = createRequest({
      method: 'GET',
      url: 'http://localhost/api/users/baseusers?username=anotherBaseUser',
    });
    const res = createResponse();

    const response = await GET(req, res);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.message).toBe('Forbidden - insufficient permissions');
  });

  it('should return 200 with the baseuser data when a baseuser searches for themselves', async () => {
    // Mock authorization for a baseuser
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: 'baseuser1', role: 'baseuser' },
    }));

    const mockUser = { username: 'baseuser1', role: 'baseuser' };
    User.findByUsername.mockResolvedValueOnce(mockUser);

    const req = createRequest({
      method: 'GET',
      url: 'http://localhost/api/users/baseusers',
    });
    const res = createResponse();

    const response = await GET(req, res);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockUser);
  });

  it('should return 500 if there is an internal server error', async () => {
    // Mock authorization for an admin user
    authorize.mockImplementation(() => ({
      authorized: true,
      user: { username: 'adminUser', role: 'admin' },
    }));

    // Simulate a database connection error
    connectToDB.mockRejectedValueOnce(new Error('Database connection error'));

    const req = createRequest({
      method: 'GET',
      url: 'http://localhost/api/users/baseusers',
    });
    const res = createResponse();

    const response = await GET(req, res);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
