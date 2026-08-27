// server/src/utils/sessionCode.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// Generate a random 5-character alphanumeric code (e.g., "AB7X3")
function randomCode() {
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return code;
}

// Generate a session code guaranteed to be unique in the database.
// This is the function session.js imports as `generateSessionCode`.
async function generateSessionCode() {
  let code;
  let exists = true;
  while (exists) {
    code = randomCode();
    const existing = await prisma.tableSession.findUnique({
      where: { sessionCode: code }
    });
    exists = !!existing;
  }
  return code;
}

module.exports = { generateSessionCode };