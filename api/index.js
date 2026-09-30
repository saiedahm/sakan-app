const app = require("../frontend/backend/server");
const registerOAuth = require("./oauth");
const registerEmailVerification = require("./emailVerification");
const featuredAdsRoutes = require("../frontend/backend/featuredAdsRoutes");
const { router: commercialAdsRoutes } = require("../frontend/backend/commercialAdRoutes");
const commercialAdAiRoutes = require("../frontend/backend/commercialAdAiRoutes");

registerOAuth(app);
registerEmailVerification(app);
app.use(featuredAdsRoutes);
app.use(commercialAdsRoutes);
app.use(commercialAdAiRoutes);

module.exports = app;
