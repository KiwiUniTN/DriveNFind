import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export function authorizeRole(allowedRoles) {
  return async (req) => {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Authorization token required' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded.username)

      if (!allowedRoles.includes(decoded.role)) {
        return NextResponse.json({ message: 'Forbidden - insufficient permissions' }, { status: 403 });
      }

      req.user = decoded;
      return true;  // Authorization success
    } catch (error) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
  };
}
