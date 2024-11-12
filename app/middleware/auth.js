import jwt from 'jsonwebtoken';
import User from '../models/User';

export const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication token missing' });

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    const dbUser = await User.findOne({ username: user.username });
    if (!dbUser) return res.status(404).json({ message: 'User not found' });
    
    req.user = dbUser;
    next();
  });
};

export const authorizeRoles = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Access forbidden: insufficient permissions' });
  next();
};
