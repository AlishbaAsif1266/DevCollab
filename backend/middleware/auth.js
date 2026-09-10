import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes middleware (Verifies Access Token)
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify Access Token
      let decoded;
      try {
        decoded = jwt.verify(
          token,
          process.env.JWT_ACCESS_SECRET || 'devcollab_access_secret_token_2026'
        );
      } catch (err) {
        // Fallback for older tokens during migration
        decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'devcollab_super_secret_jwt_key_2026'
        );
      }

      // Get user from database without password
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('User not found with this token');
      }

      next();
    } catch (error) {
      res.status(401);
      return next(new Error('Not authorized, access token expired or invalid'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token provided'));
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(`User role '${req.user.role}' is not authorized to access this resource`)
      );
    }
    next();
  };
};
