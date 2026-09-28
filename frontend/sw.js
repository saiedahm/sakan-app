const CACHE_NAME = "sakan-cache-v3";
const OAUTH_SCRIPT = "/js/oauth-client.js";

self.addEventListener("install", event => {
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request, { cache: "no-store" })
            .then(async response => {
                if (!response || !response.ok) return response;

                const contentType = response.headers.get("content-type") || "";
                const url = new URL(event.request.url);

                /* Inject the active social-login client into the existing
                   SAKAN entry page without replacing the current app.js. */
                if (contentType.includes("text/html") &&
                    (url.pathname === "/" || url.pathname.endsWith("/frontend/index.html"))) {
                    const html = await response.clone().text();
                    if (!html.includes(OAUTH_SCRIPT)) {
                        const updated = html.replace(
                            /<\/body>/i,
                            `    <script src="${OAUTH_SCRIPT}"></script>\n</body>`
                        );
                        return new Response(updated, {
                            status: response.status,
                            statusText: response.statusText,
                            headers: response.headers
                        });
                    }
                }

                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
