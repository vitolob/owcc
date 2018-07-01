const version = 'owcc-v1';

self.addEventListener('install', event => {
  const urlsToCache = [
    './',
    './css/master.css',
    './js/main.js',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css',
    'https://free.currencyconverterapi.com/api/v5/currencies'
  ];

  event.waitUntil(
    caches.open(version).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// self.addEventListener('activate', event => {});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
