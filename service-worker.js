// Nom du cache et version
const CACHE_NAME = 'pixpop-cache-v1';

// Liste statique des ressources critiques à mettre en-cache
const urlsToCache = [
  '/',                 // La racine (index.html)
  '/index.html',
  '/styles.css',
  '/script.js',
  '/image-placeholder.png'
  // Vous pouvez ajouter d'autres fichiers statiques critiques ici.
];

// Installation du Service Worker : pré-cache des ressources critiques
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker : Cache ouvert, mise en cache des ressources critiques');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation du Service Worker : suppression des anciens caches si nécessaire
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker : Suppression de l\'ancien cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes pour mettre en cache dynamiquement les assets (images, etc.)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si on trouve la réponse dans le cache, la retourner.
        if (response) {
          return response;
        }
        // Sinon, effectuer la requête en réseau et mettre la réponse en cache.
        return fetch(event.request).then(networkResponse => {
          // Vérifier que l'on a bien une réponse et qu'elle est "basique" pour éviter de mettre en cache des requêtes tierces.
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          // On clone la réponse, car la réponse est un flux qui ne peut être consommé qu'une seule fois.
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              // Stocker dans le cache pour les prochains accès.
              cache.put(event.request, responseClone);
            });
          return networkResponse;
        });
      })
  );
});
