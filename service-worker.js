// Service Worker for QUICKSUB PWA
// Enables offline functionality and caching

const CACHE_NAME = 'quicksub-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('[Service Worker] Some resources failed to cache:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Define cache-first strategy for assets
  if (request.url.includes('.css') || 
      request.url.includes('.js') || 
      request.url.includes('fonts') ||
      request.url.includes('font-awesome')) {
    event.respondWith(
      caches.match(request)
        .then(response => response || fetch(request))
        .catch(() => {
          // Return offline fallback if needed
          return new Response('Offline - Resource not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        })
    );
    return;
  }
  
  // Network-first strategy for HTML and API calls
  event.respondWith(
    fetch(request)
      .then(response => {
        // Clone the response
        const responseClone = response.clone();
        
        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Fall back to cache if network fails
        return caches.match(request)
          .then(response => response || new Response(
            'Offline - Page not available in cache',
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({ 'Content-Type': 'text/plain' })
            }
          ));
      })
  );
});

// Handle messages from the app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodic background sync for future use
self.addEventListener('sync', event => {
  if (event.tag === 'sync-subscriptions') {
    event.waitUntil(
      // Sync subscriptions data with server when online
      Promise.resolve()
    );
  }
});
