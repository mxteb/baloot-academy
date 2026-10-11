const CACHE = "baloot-academy-v3";
const asset = (path) => new URL(path, self.registration.scope).pathname;
const APP_SHELL = ["./", "site.webmanifest", "pwa-192.png", "pwa-512.png", "apple-touch-icon.png"].map(asset);

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith(new URL("api/", self.registration.scope).pathname)) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") return caches.match("/");
        return new Response("غير متصل", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      })
  );
});
