// Update this version number whenever you want to trigger an update
const CACHE_NAME = 'open777-v1.0.1';
const VERSION = 3;

// Get the scope from the location
const getScope = () => {
  const path = self.location.pathname;
  const parts = path.split('/');
  return parts.slice(0, parts.length - 1).join('/') || '/';
}

const urlsToCache = [
  getScope(),
  `${getScope()}/index.html`,
  `${getScope()}/static/js/main.chunk.js`,
  `${getScope()}/static/js/runtime-main.js`,
  `${getScope()}/static/css/main.chunk.css`,
  `${getScope()}/manifest.json`,
  `${getScope()}/favicon.ico`,
  `${getScope()}/background_image.jpg`
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Clean up old caches when a new service worker activates
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients as soon as it activates
      return clients.claim();
    })
  );
});

// Fetch resources with network-first strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
}); 