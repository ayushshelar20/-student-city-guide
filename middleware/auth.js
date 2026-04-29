/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user data to the request object.
 */

const jwt = require('jsonwebtoken');

// Secret key for JWT signing (in production, use environment variable)
const JWT_SECRET = 'student-city-guide-secret-key-2024';

/**
 * Required auth — blocks request if no valid token
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, name, email }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Optional auth — attaches user if token present, but doesn't block
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Token invalid, continue without user
    }
  }

  next();
}

module.exports = { requireAuth, optionalAuth, JWT_SECRET };
