const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const blog = require(path.join(root, "src", "lib", "blog.ts"));

function buildSitemap() {
  const posts = blog.getAllPosts();

  return posts
    .map((post) => `/blog/${post.slug}`)
    .join("\n");
}

module.exports = {
  buildSitemap,
};
