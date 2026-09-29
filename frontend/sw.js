const CACHE_NAME = "sakan-cache-v6";
const OAUTH_SCRIPT = "/frontend/js/oauth-client.js";
const HOME_ENHANCEMENT = "/frontend/js/home-enhancements.js";
const RUNTIME_FIXES = "/frontend/js/runtime-fixes.js";
self.addEventListener("install", event => self.skipWaiting());
self.addEventListener("activate", event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request,{cache:"no-store"}).then(async response=>{
    if(!response||!response.ok)return response;
    const type=response.headers.get("content-type")||"",url=new URL(event.request.url);
    if(type.includes("text/html")){
      let html=await response.clone().text();
      const scripts=[RUNTIME_FIXES];
      if(url.pathname==="/"||url.pathname.endsWith("/frontend/index.html"))scripts.push(OAUTH_SCRIPT);
      if(url.pathname.endsWith("/frontend/pages/home.html")||url.pathname.endsWith("/home.html"))scripts.push(HOME_ENHANCEMENT);
      scripts.forEach(src=>{if(!html.includes(src))html=html.replace(/<\/body>/i,`<script src="${src}"></script>\n</body>`)});
      return new Response(html,{status:response.status,statusText:response.statusText,headers:response.headers});
    }
    const copy=response.clone();caches.open(CACHE_NAME).then(c=>c.put(event.request,copy));return response;
  }).catch(()=>caches.match(event.request)));
});
