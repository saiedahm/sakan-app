 const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const blogRoutes = require(path.join(root, "src", "blog-routes.tsx"));

module.exports = {
  blogRoutes,
};
