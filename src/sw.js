self.addEventListener('install', event => {
  const urlsToCache = [
    '/',
    'css/master.css',
    'main.js',
    'sw.js',
    'https://free.currencyconverterapi.com/api/v5/currencies'
  ];

  event.waitUntil(
    caches.open('owcc-v1').then(cache => {
      return cache.addAll(urlsToCache);
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
