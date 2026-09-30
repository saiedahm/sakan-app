const app = require("../frontend/backend/server");
const registerOAuth = require("./oauth");
const registerEmailVerification = require("./emailVerification");
const featuredAdsRoutes = require("../frontend/backend/featuredAdsRoutes");
const { router: commercialAdsRoutes } = require("../frontend/backend/commercialAdRoutes");

registerOAuth(app);
registerEmailVerification(app);
app.use(featuredAdsRoutes);
app.use(commercialAdsRoutes);

module.exports = app;
