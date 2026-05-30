const CACHE_NAME = "null-noise-pwa-v2";
const OFFLINE_URL = "/offline";
const CORE_ASSETS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/brand/favicon.svg",
  "/brand/favicon-32.png",
  "/brand/apple-touch-icon.png",
  "/brand/pwa-icon-192.png",
  "/brand/pwa-icon-512.png",
  "/brand/pwa-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(OFFLINE_URL)) || Response.error();
      }),
    );
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/brand/") ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseForCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseForCache));
          }

          return response;
        })
        .catch(() =>
          caches.match(request).then((cachedResponse) => cachedResponse || Response.error()),
        ),
    );
    return;
  }

  if (url.pathname === OFFLINE_URL) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseForCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseForCache));
          }

          return response;
        })
        .catch(() =>
          caches.match(OFFLINE_URL).then((cachedResponse) => cachedResponse || Response.error()),
        ),
    );
  }
});
