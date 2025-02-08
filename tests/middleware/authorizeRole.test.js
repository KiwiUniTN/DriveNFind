import jwt from 'jsonwebtoken';
import { authorizeRole } from '../../app/middleware/auth'; // Adjust with the correct path

jest.mock('jsonwebtoken');

describe('authorizeRole', () => {
  it('should allow access if authorized and role matches', async () => {
    // Mock jwt.verify to return a decoded user with the correct role
    jwt.verify.mockImplementationOnce(() => ({ role: 'admin' }));

    const req = { headers: { authorization: 'Bearer valid_token' } };
    const result = await authorizeRole(['admin'])(req);

    expect(result.authorized).toBe(true);
    expect(result.user.role).toBe('admin');
  });

  it('should deny access if user does not have the required role', async () => {
    // Mock jwt.verify to return a decoded user with a different role
    jwt.verify.mockImplementationOnce(() => ({ role: 'user' }));

    const req = { headers: { authorization: 'Bearer valid_token' } };
    const result = await authorizeRole(['admin'])(req);

    expect(result.authorized).toBe(false);
    const jsonResponse = await result.response.json();
    expect(jsonResponse).toEqual({ message: 'Forbidden - insufficient permissions' });
  });

  it('should deny access if no token is provided', async () => {
    // Mock jwt.verify to return undefined (simulating no token provided)
    jwt.verify.mockImplementationOnce(() => {
      throw new Error('Authorization token required');
    });

    const req = { headers: { authorization: '' } }; // No token
    const result = await authorizeRole(['admin'])(req);

    expect(result.authorized).toBe(false);
    const jsonResponse = await result.response.json();
    expect(jsonResponse).toEqual({ message: 'Authorization token required' });
  });

  it('should deny access if the token is invalid', async () => {
    // Mock jwt.verify to throw an error (simulating invalid token)
    jwt.verify.mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });

    const req = { headers: { authorization: 'Bearer invalid_token' } };
    const result = await authorizeRole(['admin'])(req);

    expect(result.authorized).toBe(false);
    const jsonResponse = await result.response.json();
    expect(jsonResponse).toEqual({ message: 'Invalid token' });
  });
});
