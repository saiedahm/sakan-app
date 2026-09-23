const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function getBlogPosts() {
  const blogPath = path.join(root, "src", "lib", "blog.ts");
  if (!fs.existsSync(blogPath)) {
    return [];
  }

  return [];
}

module.exports = {
  getBlogPosts,
};
