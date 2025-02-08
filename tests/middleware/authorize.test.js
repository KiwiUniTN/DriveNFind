import jwt from 'jsonwebtoken';
import { authorize } from '../../app/middleware/auth'; // Replace with the correct path


jest.mock('jsonwebtoken');

describe('authorize function', () => {
  it('should return an error if no authorization token is provided', async () => {
    const req = {
      headers: {
        authorization: '',
      },
    };

    const result = authorize(req);

    // Check that the authorization is false
    expect(result.authorized).toBe(false);

    // Check that the response is correct
    // We need to mock `json` to resolve with the expected data
    const jsonResponse = await result.response.json();
    expect(jsonResponse).toEqual({
      message: 'Authorization token required',
    });

    // Check that the status code is 401
    expect(result.response.status).toBe(401);
  });

  it('should return an error if the token is invalid', async () => {
    const req = {
      headers: {
        authorization: 'Bearer invalid_token',
      },
    };

    // Mock jwt.verify to throw an error (invalid token)
    jwt.verify.mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });

    const result = authorize(req);

    // Check that the authorization is false
    expect(result.authorized).toBe(false);

    // Check that the response is correct
    const jsonResponse = await result.response.json();
    expect(jsonResponse).toEqual({
      message: 'Invalid token',
    });

    // Check that the status code is 401
    expect(result.response.status).toBe(401);
  });

  it('should return authorized and decoded user if the token is valid', async () => {
    const req = {
      headers: {
        authorization: 'Bearer valid_token',
      },
    };

    const mockDecoded = { userId: '123', name: 'John Doe' };

    // Mock jwt.verify to return the mockDecoded data (valid token)
    jwt.verify.mockImplementationOnce(() => mockDecoded);

    const result = authorize(req);

    // Check that the authorization is true
    expect(result.authorized).toBe(true);

    // Check that the decoded user data is correct
    expect(result.user).toEqual(mockDecoded); // Using toEqual() to compare decoded user data
  });
});
