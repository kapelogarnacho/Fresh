const CACHE_NAME = 'fresh-ent-cache-v1';
const urlsToCache = [
  'index.html',
  'villagehub.html',
  'cinema.html',
  'chatmd.html',
  'auramq.html',
  'com_ink.html',
  'news.html',
  'music.html',
  'contact.html',
  'tiktok_games.html',
  'orbit101.html',
  'style.css',
  'script.js',
  'offline-data.js',
  'app.js',
  'voice.js',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).then(
          networkResponse => {
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, cloned);
            });
            return networkResponse;
          }
        );
      })
      .catch(() => {
        // Offline fallback
        return caches.match('index.html');
      })
  );
});