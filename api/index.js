const app = require("../frontend/backend/server");
const registerOAuth = require("./oauth");
const featuredAdsRoutes = require("../frontend/backend/featuredAdsRoutes");

// OAuth and featured-ad routes are registered on the same Express app.
// The existing API database middleware still protects these endpoints.
registerOAuth(app);
app.use(featuredAdsRoutes);

module.exports = app;
