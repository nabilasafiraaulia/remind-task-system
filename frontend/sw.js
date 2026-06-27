const CACHE_NAME = 'remind-task-v1';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.json'
];

// Tahap Install: Menyimpan file aset ke dalam cache browser
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Tahap Fetch: Mengambil data dari cache jika sedang offline
self.addEventListener('fetch', (e) => {
  // Jangan intercept request API backend (misal: endpoint dengan '/api/')
  if (e.request.url.includes('/api/') || e.request.url.includes('localhost:5000') || e.request.url.includes('onrender.com')) {
    return;
  }

  // Hanya layani request GET untuk cache
  if (e.request.method !== 'GET') {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request).catch((err) => {
        console.warn('Network request failed, resource not in cache:', e.request.url);
        // Kembalikan response kosong/error alih-alih melempar uncaught promise
        return new Response('Network error occurred', { status: 480, statusText: 'Network Error' });
      });
    })
  );
});