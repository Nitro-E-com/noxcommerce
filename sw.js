// Service Worker Simples - Cache First Strategy
const CACHE_NAME = 'noxcommerce-v1';
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Instalar e cachear assets críticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CRITICAL_ASSETS).catch(() => {
        console.log('[PWA] Alguns assets não puderam ser cacheados (CDN pode estar indisponível)');
      });
    })
  );
  self.skipWaiting();
});

// Ativar e remover caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Cache First para tudo
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200) return response;
          const cache = caches.open(CACHE_NAME);
          cache.then(c => c.put(event.request, response.clone()));
          return response;
        });
      })
      .catch(() => {
        // Retorna placeholder SVG para imagens
        if (event.request.destination === 'image') {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#e5e7eb" width="200" height="200"/></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
        return new Response('Não disponível', { status: 503 });
      })
  );
});