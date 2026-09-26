/**
 * CALORA Service Worker
 * Advanced Application Shell & Critical Static Asset Caching
 * Ensures seamless resilience during intermittent connectivity and full offline access.
 */

const VERSION = 'v2';
const CACHE_STATIC_NAME = `calora-static-${VERSION}`;
const CACHE_RUNTIME_NAME = `calora-runtime-${VERSION}`;
const CACHE_FONTS_NAME = `calora-fonts-${VERSION}`;

// Critical Application Shell resources to precache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/metadata.json'
];

// Offline HTML fallback for navigation when cache is empty and network is completely severed
const OFFLINE_FALLBACK_HTML = `<!doctype html>
<html lang="en" style="background:#0B0B0C;color:#F5F3EE;font-family:sans-serif;">
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
    <title>CALORA - Offline Mode</title>
    <style>
      body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0B0B0C;color:#F5F3EE;}
      .card{max-width:440px;margin:24px;padding:32px;background:#19191C;border:1px solid rgba(255,255,255,0.08);border-radius:24px;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,0.6);}
      h1{font-size:22px;margin:16px 0 8px;letter-spacing:1px;text-transform:uppercase;}
      p{font-size:13px;color:#8C8C8E;line-height:1.5;margin:0 0 24px;}
      .btn{display:inline-block;padding:12px 24px;background:#FF6B4A;color:#101010;font-weight:700;border-radius:999px;text-decoration:none;border:none;cursor:pointer;}
    </style>
  </head>
  <body>
    <div class="card">
      <svg width="48" height="48" viewBox="0 0 36 36" style="margin:auto;display:block;">
        <circle cx="18" cy="18" r="14" fill="none" stroke="#212125" stroke-width="3.5"/>
        <circle cx="18" cy="18" r="14" fill="none" stroke="#FF6B4A" stroke-width="3.5" stroke-dasharray="45, 100" stroke-linecap="round"/>
        <circle cx="18" cy="18" r="4.5" fill="#FF6B4A"/>
      </svg>
      <h1>CALORA Offline</h1>
      <p>Your metabolic logs are safely stored locally. We will automatically reconnect and sync once connectivity is restored.</p>
      <button class="btn" onclick="window.location.reload()">Retry Connection</button>
    </div>
  </body>
</html>`;

/**
 * Install Event: Pre-cache critical application shell
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Precaching Application Shell...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[ServiceWorker] Precache warning:', err);
        return self.skipWaiting();
      })
  );
});

/**
 * Activate Event: Clean up outdated cache versions and claim clients
 */
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_STATIC_NAME, CACHE_RUNTIME_NAME, CACHE_FONTS_NAME];

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[ServiceWorker] Activated & claimed clients.');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch Event: Smart routing for App Shell, Static Assets, and CDN Fonts
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Bypass non-GET requests, WebSockets, API routes, Firebase Firestore, and browser extensions
  if (
    request.method !== 'GET' ||
    url.protocol === 'ws:' ||
    url.protocol === 'wss:' ||
    url.pathname.startsWith('/live') ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('securetoken.googleapis.com') ||
    url.protocol === 'chrome-extension:'
  ) {
    return;
  }

  // 2. Navigation Requests (HTML / App Shell): Stale-While-Revalidate with Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html')
        .then((cachedShell) => {
          // If we have cached app shell, fetch fresh copy in background while serving cache immediately
          const networkFetch = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_STATIC_NAME).then((cache) => {
                  cache.put('/index.html', responseToCache);
                  cache.put('/', responseToCache.clone());
                });
              }
              return networkResponse;
            })
            .catch(() => {
              // Network error: already handled by cachedShell
              return null;
            });

          if (cachedShell) {
            return cachedShell;
          }

          // If no cached shell yet, await the network
          return networkFetch.then((res) => {
            if (res) return res;
            // Complete offline fallback
            return new Response(OFFLINE_FALLBACK_HTML, {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          });
        })
        .catch(() => {
          return new Response(OFFLINE_FALLBACK_HTML, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        })
    );
    return;
  }

  // 3. Web Fonts (Google Fonts stylesheets & font binaries)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_FONTS_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 4. Critical Static Assets (JS bundles, CSS, SVGs, PNGs, JPGs, WOFF2)
  const isStaticAsset =
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.json') ||
    url.pathname.includes('/assets/');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate in background for non-hashed resources
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_RUNTIME_NAME).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          }).catch(() => {/* Offline */});
          return cachedResponse;
        }

        // Cache-miss: fetch from network and cache
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_RUNTIME_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // If an image request fails, we can return null or let browser show alt
            return new Response('', { status: 408, statusText: 'Request timed out / offline' });
          });
      })
    );
    return;
  }

  // 5. Default: Network with Cache fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_RUNTIME_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});

/**
 * Message Event: Allow client to command Service Worker (e.g. skipWaiting)
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHES') {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
  }
});
