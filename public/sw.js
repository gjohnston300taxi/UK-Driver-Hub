// UK Driver Hub service worker
// Always tries the internet first so drivers see the latest version of every page.
// Saved copies are only used when there is no connection (offline).
// If you change this file, increase the version number below.
const CACHE_NAME = 'uk-driver-hub-v2';
const urlsToCache = [
  '/',
  '/feed',
  '/news',
  '/marketplace',
  '/resources',
];

// Install: save the key pages for offline use, and take over straight away
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)).catch(() => {})
  );
});

// Activate: delete old saved copies (e.g. v1) and start controlling open pages
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: internet first, saved copy only if offline
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle normal page loads from our own site.
  // Everything else (API calls, sign-in, images, other websites) goes straight to the internet.
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }
  if (request.mode !== 'navigate') {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Keep the latest copy of the page for offline use
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match('/feed'))
      )
  );
});
