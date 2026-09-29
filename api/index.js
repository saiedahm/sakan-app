const app = require("../frontend/backend/server");
const registerOAuth = require("./oauth");
const featuredAdsRoutes = require("../frontend/backend/featuredAdsRoutes");

registerOAuth(app);

const beforeFeatured = Array.isArray(app._router?.stack) ? app._router.stack.length : 0;
app.use(featuredAdsRoutes);

// The main server has a generic /api 404 handler near the end of its stack.
// Move the newly registered featured-ad routes before that handler.
if (app._router?.stack && app._router.stack.length > beforeFeatured) {
  const stack = app._router.stack;
  const featuredLayers = stack.slice(beforeFeatured);
  const remaining = stack.slice(0, beforeFeatured);
  let insertAt = remaining.length;

  for (let i = 0; i < remaining.length; i++) {
    const layer = remaining[i];
    const path = layer.route?.path;
    if (typeof path === 'string' && path.startsWith('/api/')) {
      // Keep searching; the first /api route after the database middleware is
      // not necessarily the 404 handler. The generic handler has no route path.
      continue;
    }
    if (!layer.route && layer.regexp && String(layer.regexp).includes('api')) {
      insertAt = i;
      break;
    }
  }

  remaining.splice(insertAt, 0, ...featuredLayers);
  app._router.stack = remaining;
}

module.exports = app;
