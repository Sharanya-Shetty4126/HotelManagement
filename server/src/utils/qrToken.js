// server/src/utils/qrToken.js
const jwt = require('jsonwebtoken');

// Generate a secure signed token for a table's QR code.
// The token never expires by itself (tables are permanent), so we don't
// set exp — QR codes get reprinted only if a table is physically replaced.
function generateQRToken(tableId) {
  return jwt.sign({ tableId }, process.env.QR_SECRET);
}

// Verify a QR token and return its decoded payload ({ tableId, iat }).
// Throws if the token is missing, malformed, or signed with a different secret.
function verifyQRToken(token) {
  return jwt.verify(token, process.env.QR_SECRET);
}

// QR code content: https://yourdomain.com/table/{token}

module.exports = { generateQRToken, verifyQRToken };