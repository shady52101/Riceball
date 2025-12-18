/* PWA Service Worker (GitHub Pages /Riceball/ scope) */
const CACHE_VERSION = "v1.0.0";
const CACHE_NAME = `okinawa-pwa-${CACHE_VERSION}`;

// Keep this list aligned with your repo root files.
const ASSETS = [
  "/Riceball/",
  "/Riceball/index.html",
  "/Riceball/manifest.webmanifest",
  "/Riceball/service-worker.js",
  "/Riceball/icon-192.png",
  "/Riceball/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)));
      await self.clients.claim();
    })()
  );
});

/**
 * Strategy:
 * - Navigation requests (HTML): network-first (fresh), fallback to cache
 * - Same-origin static assets: cache-first
 */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          cache.put("/Riceball/index.html", fresh.clone());
          return fresh;
        } catch {
          return (await caches.match(req)) || (await caches.match("/Riceball/index.html"));
        }
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;

      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        return caches.match("/Riceball/index.html");
      }
    })()
  );
});
