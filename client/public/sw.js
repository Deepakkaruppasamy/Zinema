const CACHE_NAME = 'zinema-v2';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Do not intercept cross-origin requests
  if (url.origin !== self.location.origin) return;

  // App shell SPA navigation fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME)
        const cachedShell = await cache.match('/index.html')
        return cachedShell || Response.error()
      })
    );
    return;
  }

  // API calls: network-first, do NOT cache (avoid stale data like bookings/isPaid)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Static assets: cache-first
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'worker') {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request).then((res) => {
          caches.open(CACHE_NAME).then((c) => c.put(request, res.clone()))
          return res
        })
        return cached || networkFetch
      })
    )
    return;
  }

  // Images: cache-first with background refresh
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request).then((res) => {
          caches.open(CACHE_NAME).then((c) => c.put(request, res.clone()))
          return res
        }).catch(() => cached)
        return cached || networkFetch
      })
    )
    return;
  }

  // Default: stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request).then((res) => {
        caches.open(CACHE_NAME).then((c) => c.put(request, res.clone()))
        return res
      }).catch(() => cached || new Response('Offline', { status: 503, statusText: 'Offline' }))
      return cached || networkFetch
    })
  );
});
