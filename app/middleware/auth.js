import jwt from 'jsonwebtoken';

export function authorizeRole(allowedRoles) {
  return async (req) => {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return Response.json({ message: 'Authorization token required' }, { status: 401 });//Throw error if no token is present
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!allowedRoles.includes(decoded.role)) {
        return Response.json({ message: 'Forbidden - insufficient permissions' }, { status: 403 });//Throw error if user does not have the required role
      }

      req.user = decoded;
      return true;  // Authorization success
    } catch (error) {
      return Response.json({ message: 'Invalid token' }, { status: 401 });
    }
  };
}
