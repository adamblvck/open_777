const CACHE_NAME = 'your-app-v1';

// Get the repository name from the location
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
});

// Fetch resources
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
}); 