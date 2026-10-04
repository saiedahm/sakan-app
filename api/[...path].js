// Sakan Vercel API catch-all
// Keeps the original Express request path intact, including:
// /api/auth/register, /api/auth/login, /api/users/*, /api/messages/*, etc.
const app = require("../frontend/backend/server");

module.exports = app;
