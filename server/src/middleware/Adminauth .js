// server/src/middleware/adminAuth.js
//
// Protects admin-only routes. Expects: Authorization: Bearer <token>
// Verifies the JWT issued by POST /api/auth/login and attaches the
// decoded payload to req.admin so route handlers can use it if needed.

const jwt = require('jsonwebtoken');

function adminAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // { adminId, username, iat, exp }
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = adminAuth;