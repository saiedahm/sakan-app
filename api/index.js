const app = require("../frontend/backend/server");
const registerOAuth = require("./oauth");

/* OAuth is registered after server.js, whose final /api/* 404 middleware
   would otherwise intercept these routes first. Move the new OAuth layers
   in front of that API 404 middleware. */
const before = Array.isArray(app._router?.stack) ? app._router.stack.length : 0;
registerOAuth(app);

if (app._router?.stack && app._router.stack.length > before) {
  const stack = app._router.stack;
  const oauthLayers = stack.filter(layer => {
    const path = layer.route?.path;
    return typeof path === "string" && path.startsWith("/api/auth/oauth/");
  });

  if (oauthLayers.length) {
    const remaining = stack.filter(layer => !oauthLayers.includes(layer));
    let insertAt = remaining.length;

    for (let i = remaining.length - 1; i >= 0; i--) {
      const layer = remaining[i];
      if (!layer.route && typeof layer.handle === "function" && layer.handle.length < 4) {
        const source = String(layer.regexp || "");
        if (source.includes("api")) {
          insertAt = i;
          break;
        }
      }
    }

    remaining.splice(insertAt, 0, ...oauthLayers);
    app._router.stack = remaining;
  }
}

module.exports = app;
