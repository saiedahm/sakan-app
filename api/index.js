const app = require("../frontend/backend/server");
const registerOAuth = require("./oauth");

registerOAuth(app);

module.exports = app;
