// public/sw.js
const CACHE_VERSION = `gorila-gym-${Date.now()}`;
const STATIC_CACHE = `gorilla-gym-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `gorilla-gym-dynamic-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/dashboard/routine",
  "/dashboard/exercises",
  "/login",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  console.log("[SW] Instalando versión:", CACHE_VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  // NO llamar skipWaiting aquí — esperar confirmación del usuario
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activando versión:", CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => {
            console.log("[SW] Eliminando cache viejo:", key);
            return caches.delete(key);
          }),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data === "CLEAR_CACHE") {
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => {
        event.ports[0]?.postMessage("CACHE_CLEARED");
      });
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  if (
    !url.origin.includes(self.location.origin) &&
    !url.origin.includes("supabase.co")
  ) {
    return;
  }

  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        if (url.origin.includes("supabase.co")) {
          return fetch(request)
            .then((response) => {
              if (response?.status === 200) {
                caches
                  .open(DYNAMIC_CACHE)
                  .then((cache) => cache.put(request, response.clone()));
              }
              return response;
            })
            .catch(() => cachedResponse);
        }
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type === "error"
          ) {
            return response;
          }
          if (
            url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/) ||
            url.pathname.startsWith("/dashboard") ||
            url.origin.includes("supabase.co")
          ) {
            caches
              .open(DYNAMIC_CACHE)
              .then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          if (request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/dashboard");
          }
        });
    }),
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(Promise.resolve());
  }
});
