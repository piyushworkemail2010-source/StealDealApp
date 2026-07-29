// StealDeal Service Worker - Basic PWA installability shell
const CACHE_NAME = 'stealdeal-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass network requests through directly (online-first for live deals)
  event.respondWith(fetch(event.request).catch(() => new Response('StealDeal is online-only for live price accuracy.')));
});
