var CACHE_NAME = "prologue-cache-v1";
var DATA_CACHE_NAME = 'prologue-v1';
var filesToCache = [
  '/',
  'index.html',
  '/images/avatar.jpg'
];

self.addEventListener('install', function (e) {
  console.log('ServiceWorker Install');
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('ServiceWorker Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function (e) {
  console.log('ServiceWorker Activate');
  e.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('ServiceWorker Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});