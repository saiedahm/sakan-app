const CACHE_NAME = "sakan-cache-v5";
const OAUTH_SCRIPT = "/frontend/js/oauth-client.js";
const HOME_ENHANCEMENT = "/frontend/js/home-enhancements.js";

self.addEventListener("install", event => self.skipWaiting());
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request, { cache: "no-store" }).then(async response => {
      if (!response || !response.ok) return response;
      const type = response.headers.get("content-type") || "";
      const url = new URL(event.request.url);

      if (type.includes("text/html")) {
        const entry = url.pathname === "/" || url.pathname.endsWith("/frontend/index.html");
        const home = url.pathname.endsWith("/frontend/pages/home.html") || url.pathname.endsWith("/home.html");
        if (entry || home) {
          let html = await response.clone().text();
          const src = entry ? OAUTH_SCRIPT : HOME_ENHANCEMENT;
          if (!html.includes(src)) {
            html = html.replace(/<\/body>/i, `    <script src="${src}"></script>\n</body>`);
          }
          return new Response(html, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });
        }
      }

      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request))
  );
});
