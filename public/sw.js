// public/sw.js
const CACHE_NAME = "gorila-gym-v1";
const STATIC_CACHE = "gorila-gym-static-v1";
const DYNAMIC_CACHE = "gorila-gym-dynamic-v1";

// Recursos estáticos para cachear
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/dashboard/routine",
  "/dashboard/exercises",
  "/login",
  "/favicon.ico",
];

// Instalar Service Worker
self.addEventListener("install", (event) => {
  console.log("[SW] Instalando Service Worker...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[SW] Cacheando recursos estáticos");
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

// Activar Service Worker
self.addEventListener("activate", (event) => {
  console.log("[SW] Activando Service Worker...");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key)),
      );
    }),
  );
  self.clients.claim();
});

// Interceptar peticiones
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticiones que no sean GET
  if (request.method !== "GET") return;

  // Ignorar peticiones a APIs externas (excepto Supabase)
  if (
    !url.origin.includes(self.location.origin) &&
    !url.origin.includes("supabase.co")
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Si está en cache, devolver pero actualizar en background
      if (cachedResponse) {
        // Network First para APIs de Supabase
        if (url.origin.includes("supabase.co")) {
          return fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE).then((cache) => {
                  cache.put(request, responseClone);
                });
              }
              return response;
            })
            .catch(() => cachedResponse);
        }

        // Cache First para recursos estáticos
        return cachedResponse;
      }

      // Si no está en cache, hacer fetch y cachear
      return fetch(request)
        .then((response) => {
          // Solo cachear respuestas exitosas
          if (
            !response ||
            response.status !== 200 ||
            response.type === "error"
          ) {
            return response;
          }

          const responseClone = response.clone();

          // Cachear imágenes y recursos estáticos
          if (
            url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/) ||
            url.pathname.startsWith("/dashboard") ||
            url.origin.includes("supabase.co")
          ) {
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }

          return response;
        })
        .catch(() => {
          // Si falla y es una página, devolver página offline
          if (request.headers.get("accept").includes("text/html")) {
            return caches.match("/dashboard");
          }
        });
    }),
  );
});

// Sincronización en background
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag);
  if (event.tag === "sync-data") {
    event.waitUntil(
      // Aquí se puede implementar sincronización de datos
      Promise.resolve(),
    );
  }
});
