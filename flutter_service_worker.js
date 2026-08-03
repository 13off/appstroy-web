'use strict';

const RECOVERY_CACHE_VERSION = 'appstroy-recovery-20260803-1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      } catch (e) {
        console.warn('Failed to clear stale AppСтрой caches:', e);
      }

      try {
        await self.clients.claim();
      } catch (e) {
        console.warn('Failed to claim AppСтрой clients:', e);
      }

      try {
        await self.registration.unregister();
      } catch (e) {
        console.warn('Failed to unregister the service worker:', e);
      }

      try {
        const clients = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true,
        });
        clients.forEach((client) => {
          if (client.url && 'navigate' in client) {
            const url = new URL(client.url);
            url.searchParams.set('pwa_recovery', RECOVERY_CACHE_VERSION);
            client.navigate(url.toString());
          }
        });
      } catch (e) {
        console.warn('Failed to reload AppСтрой clients:', e);
      }
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
