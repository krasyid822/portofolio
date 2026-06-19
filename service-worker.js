const CACHE_NAME = 'my-site-cache-v6';
const urlsToCache = [
  '/',
  '/index.html',
  '/page404.html',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
  '/rsc/jpg/me.jpg',
  // Clean Architecture CSS
  '/assets/css/design-system.css',
  '/assets/css/layout.css',
  '/assets/css/components.css',
  '/assets/css/transitions.css',
  '/assets/css/balloon-popup.css',
  '/assets/css/responsive.css',
  // Clean Architecture JS
  '/assets/js/main.js',
  '/assets/js/modules/scan-transition.js',
  '/assets/js/modules/theme-transition.js',
  '/assets/js/modules/page-router.js',
  '/assets/js/modules/magnetic-cursor.js',
  '/assets/js/modules/balloon-popup.js',
  '/assets/js/modules/theme-toggle.js',
  '/assets/js/modules/projects-loader.js',
  '/assets/js/modules/service-worker.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
            return undefined;
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
          return response;
        })
        .catch(() => caches.match(event.request).then(response => response || caches.match('/page404.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }

      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
        return networkResponse;
      });
    })
  );
});
