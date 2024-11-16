import jwt from 'jsonwebtoken';
export function authorizeRole(allowedRoles) {
  return async (req) => {
    const token = req.headers.get('authorization')?.split(' ')[1];
    console.log('Authorization token:', token);
    if (!token) {// If no token is provided, return an error response
      return { authorized: false, response: Response.json({ message: 'Authorization token required' }, { status: 401 }) };
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!allowedRoles.includes(decoded.role)) {// If the user does not have the required role, return an error response
        return { authorized: false, response: Response.json({ message: 'Forbidden - insufficient permissions' }, { status: 403 }) };
      }

      return { authorized: true, user: decoded };// If the user is authorized, return the decoded token
    } catch (error) {
      return { authorized: false, response: Response.json({ message: 'Invalid token' }, { status: 401 }) };
    }
  };
}
