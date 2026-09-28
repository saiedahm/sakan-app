const app = require("../frontend/backend/server");
const registerOAuth = require("./oauth");

// OAuth start/callback routes must run before the generic /api database
// middleware. Starting OAuth only needs to redirect to Google/Facebook.
const before = Array.isArray(app._router?.stack) ? app._router.stack.length : 0;
registerOAuth(app);

if (app._router?.stack && app._router.stack.length > before) {
  const stack = app._router.stack;
  const oauthLayers = stack.filter(layer => {
    const path = layer.route?.path;
    return typeof path === "string" && (
      path.startsWith("/api/auth/oauth/") ||
      path === "/api/auth/social-complete"
    );
  });

  if (oauthLayers.length) {
    const remaining = stack.filter(layer => !oauthLayers.includes(layer));
    let insertAt = remaining.length;

    // Insert before the first /api middleware (the database connection layer).
    for (let i = 0; i < remaining.length; i++) {
      const layer = remaining[i];
      if (!layer.route && layer.regexp) {
        const source = String(layer.regexp);
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
