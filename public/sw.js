const CACHE_NAME = 'uk-driver-hub-v1';
const urlsToCache = [
  '/',
  '/feed',
  '/news',
  '/marketplace',
  '/resources',
];

// Install the service worker and cache key pages
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    }).catch(() => {
      // If both fail, show cached feed page as fallback
      return caches.match('/feed');
    })
  );
});

// Clean up old caches when a new service worker activates
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});
