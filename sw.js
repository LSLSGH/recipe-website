const CACHE_NAME = 'walkart-v23';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/app.js',
  '/js/i18n.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
