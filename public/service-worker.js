
const CACHE_NAME = 'github-profile-viewer-cache-v1';
const urlsToCache = [
  './views',
  //'/styles.css', //will come later
  // Add paths to JavaScript files
  // Add other static assets to cache
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        return response || fetch(event.request);
      })
  );
});
