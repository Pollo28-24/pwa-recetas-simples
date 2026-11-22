const CACHE_VERSION = "v5";
const STATIC_CACHE = `recetario-static-${CACHE_VERSION}`;
const PAGES_CACHE = `recetario-pages-${CACHE_VERSION}`;
const MEDIA_CACHE = `recetario-media-${CACHE_VERSION}`;
const ACTIVE_CACHES = new Set([STATIC_CACHE, PAGES_CACHE, MEDIA_CACHE]);

const PRECACHE_ASSETS = [
  "/",
  "/favoritos",
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) =>
        Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            cache.add(new Request(url, { cache: "reload" })).catch(() => null),
          ),
        ),
      ),
    ]).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !ACTIVE_CACHES.has(key)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "CACHE_URLS" || !Array.isArray(data.urls)) return;

  const urls = data.urls.filter((item) => typeof item === "string" && item.length > 0);
  if (urls.length === 0) return;

  event.waitUntil(
    Promise.allSettled(
      urls.map(async (rawUrl) => {
        const parsed = new URL(rawUrl, self.location.origin);
        const targetCache =
          parsed.origin === self.location.origin ? PAGES_CACHE : MEDIA_CACHE;
        const cache = await caches.open(targetCache);
        const res = await fetch(rawUrl);
        if (res.ok || res.type === "opaque") {
          await cache.put(rawUrl, res);
        }
      }),
    ),
  );
});

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    if (fallbackUrl) {
      const staticCache = await caches.open(STATIC_CACHE);
      const fallback = (await staticCache.match(fallbackUrl)) || (await caches.match("/"));
      if (fallback) return fallback;
    }

    return new Response("Sin conexión disponible", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok || response.type === "opaque") {
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (request.mode === "navigate" && url.origin === self.location.origin) {
    event.respondWith(networkFirst(request, PAGES_CACHE, "/offline"));
    return;
  }

  const isStaticAsset =
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static") ||
      url.pathname.startsWith("/icons/") ||
      url.pathname === "/manifest.webmanifest");

  if (isStaticAsset) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  const isMealDbImage =
    (url.hostname === "www.themealdb.com" && url.pathname.startsWith("/images/")) ||
    (url.origin === self.location.origin && url.pathname === "/_next/image");

  if (isMealDbImage) {
    event.respondWith(cacheFirst(request, MEDIA_CACHE));
    return;
  }

  if (url.origin === self.location.origin && url.pathname.startsWith("/api/meals/lookup")) {
    event.respondWith(networkFirst(request, PAGES_CACHE));
  }
});
