const app = require("../frontend/backend/server");
const registerOAuth = require("./oauth");
const registerEmailVerification = require("./emailVerification");
const featuredAdsRoutes = require("../frontend/backend/featuredAdsRoutes");

registerOAuth(app);
registerEmailVerification(app);

const beforeFeatured = Array.isArray(app._router?.stack) ? app._router.stack.length : 0;
app.use(featuredAdsRoutes);

if (app._router?.stack && app._router.stack.length > beforeFeatured) {
  const stack = app._router.stack;
  const featuredLayers = stack.slice(beforeFeatured);
  const remaining = stack.slice(0, beforeFeatured);
  const apiMiddlewareIndexes = [];
  for (let i = 0; i < remaining.length; i++) {
    const layer = remaining[i];
    if (!layer.route && layer.regexp && String(layer.regexp).includes('api')) apiMiddlewareIndexes.push(i);
  }
  const insertAt = apiMiddlewareIndexes.length ? apiMiddlewareIndexes[apiMiddlewareIndexes.length - 1] : remaining.length;
  remaining.splice(insertAt, 0, ...featuredLayers);
  app._router.stack = remaining;
}

module.exports = app;
