import jwt from 'jsonwebtoken';

export function authorizeRole(allowedRoles) {
  return async (req) => {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return new Response(JSON.stringify({ message: 'Authorization token required' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!allowedRoles.includes(decoded.role)) {
        return new Response(JSON.stringify({ message: 'Forbidden - insufficient permissions' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
      }

      req.user = decoded; // Attach user data if needed
      return true;  // Authorization success
    } catch (error) {
      return new Response(JSON.stringify({ message: 'Invalid token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
  };
}
