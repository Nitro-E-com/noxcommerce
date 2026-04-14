const CACHE_NAME = 'noxcommerce-cache-v1';

// Arquivos que precisam ser salvos para funcionar offline
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Instalação do Service Worker (Cacheia os arquivos iniciais)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto com sucesso');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // Força a ativação imediata
});

// Intercepta as requisições de rede (Estratégia: Cache First)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se encontrar, senão busca na rede
        return response || fetch(event.request);
      })
  );
});

// Limpeza de caches antigos quando uma nova versão do app é lançada
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Controla as páginas abertas imediatamente
});