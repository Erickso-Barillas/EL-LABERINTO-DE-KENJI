const CACHE_NAME = 'kenji-laberinto-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './main.js',
  './manifest.json',
  './assets/nino.png',
  './assets/muro.jpg',
  './assets/meta.png',
  './assets/trampa.png',
  './assets/fondo.jpg',
  './assets/victoria.png',
  './assets/derrota.png',
  './assets/personaje_intro.png',
  './audio/menu_music.mpeg',
  './audio/introduccion.mpeg',
  './audio/victoria.mpeg',
  './audio/derrota.mpeg'
];

// Instalación y almacenamiento en caché de todos los recursos
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación y limpieza de cachés antiguas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercepción de solicitudes para soporte Offline
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});