const CACHE_NAME = 'kenji-laberinto-v4'; 
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './main.js',
  './manifest.json',

  // Todos los archivos de la carpeta assets
  './assets/apple-touch-icon.png',
  './assets/bomba.png',
  './assets/cai_en_espinas.png',
  './assets/cai_en_la_bomba.png',
  './assets/derrota.png',
  './assets/espinas.png',
  './assets/explosion.jpg',
  './assets/favicon-96x96.png',
  './assets/favicon.ico',
  './assets/favicon.svg',
  './assets/fondo_espinas.jpg',
  './assets/fondo-derrota.jpg',
  './assets/fondo-victoria.jpg',
  './assets/fondo.jpg',
  './assets/intro_bg.jpg',
  './assets/menu_bg.jpg',
  './assets/meta.png',
  './assets/muro.jpg',
  './assets/nino.png',
  './assets/personaje_intro.png',
  './assets/site.webmanifest',
  './assets/trampa.png',
  './assets/victoria.png',
  './assets/web-app-manifest-192x192.png',
  './assets/web-app-manifest-512x512.png',

  // Pistas de Audio (Asegúrate de que coincidan exactamente las mayúsculas/minúsculas)
  './audio/menu_music.mpeg',
  './audio/introduccion.mpeg',
  './audio/victoria.mpeg',
  './audio/derrota.mpeg',
  './audio/explosion.mp3',
  './audio/trampa.mp3',
  './audio/la_bomba.mpeg',
  './audio/espinas.MPEG',
  './audio/final_espinas.mp3'
];

// Instalación y precaché de todos los archivos
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Limpieza de caché antigua
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

// Intercepción para modo offline
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});