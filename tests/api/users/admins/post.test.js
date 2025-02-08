import { createRequest, createResponse } from 'node-mocks-http';
import { POST } from '../../../../app/api/users/admins/route';
import jwt from 'jsonwebtoken';
import { connectToDB } from '../../../../app/lib/database';
import User from '../../../../app/models/User';
import bcrypt from 'bcrypt';
import { authorizeRole } from '../../../../app/middleware/auth';
import { Response } from 'node-fetch';

jest.mock('../../../../app/lib/database'); // Mock the database connection
jest.mock('../../../../app/models/User'); // Mock the User model
jest.mock('bcrypt'); // Mock bcrypt
jest.mock('../../../../app/middleware/auth', () => ({
  authorizeRole: jest.fn(),
}));


describe('POST /api/users/admins', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 403 if unauthorized (non-admin)', async () => {
    authorizeRole.mockImplementation(() => () => ({
      authorized: false,
      response: new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403 }
      ),
    }));

    const token = jwt.sign(
      {
        userId: '67a2192a8f75d37bec75aeeb',
        username: 'baseuser',
        role: 'baseuser',
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    const req = createRequest({
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    });
    req.url = 'http://localhost/api/users/admins';

    const res = createResponse();

    const response = await POST(req, res);

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Forbidden' });
  });

  it('should return 400 if missing required fields (username or password)', async () => {
    authorizeRole.mockImplementation(() => () => ({ authorized: true }));

    const token = jwt.sign(
      {
        userId: '67a2192a8f75d37bec75aeeb',
        username: 'admin',
        role: 'admin',
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    const req = createRequest({
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({ username: 'newUser' }),
    });
    req.url = 'http://localhost/api/users/admins';

    const res = createResponse();

    const response = await POST(req, res);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: 'Missing required fields' });
  });

  it('should return 400 if the username is already taken', async () => {
    authorizeRole.mockImplementation(() => () => ({ authorized: true }));

    User.findByUsername.mockResolvedValueOnce({ username: 'existingUser' });

    const token = jwt.sign(
      {
        userId: '67a2192a8f75d37bec75aeeb',
        username: 'admin',
        role: 'admin',
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    const req = createRequest({
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: { username: 'existingUser', password: 'password123' },
    });
    req.url = 'http://localhost/api/users/admins';

    const res = createResponse();

    const response = await POST(req, res);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: 'Username already taken' });
  });

  it('should create a new admin user and return 201', async () => {
    authorizeRole.mockImplementation(() => () => ({ authorized: true }));

    bcrypt.hash.mockResolvedValueOnce('hashedPassword');
    User.findByUsername.mockResolvedValueOnce(null);

    const newUserMock = {
      username: 'newUser',
      role: 'admin',
      toObject: jest.fn().mockReturnValue({
        username: 'newUser',
        role: 'admin',
      }),
    };

    User.prototype.save.mockResolvedValueOnce(newUserMock);

    const token = jwt.sign(
      {
        userId: '67a2192a8f75d37bec75aeeb',
        username: 'admin',
        role: 'admin',
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    const req = createRequest({
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: { username: 'newUser', password: 'password123' },
    });
    req.url = 'http://localhost/api/users/admins';

    const res = createResponse();

    const response = await POST(req, res);

    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe('Admin user created successfully');
    expect(data.user).toHaveProperty('username', 'newUser');
    expect(data.user).toHaveProperty('role', 'admin');
  });

  it('should return 500 if there is an internal server error', async () => {
    authorizeRole.mockImplementation(() => () => ({ authorized: true }));

    connectToDB.mockRejectedValueOnce(new Error('DB connection error'));

    const token = jwt.sign(
      {
        userId: '67a2192a8f75d37bec75aeeb',
        username: 'admin',
        role: 'admin',
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    const req = createRequest({
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: { username: 'newUser', password: 'password123' },
    });
    req.url = 'http://localhost/api/users/admins';

    const res = createResponse();

    const response = await POST(req, res);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ message: 'Internal server error' });
  });
});
