// Moneyland Service Worker — v1.0.0
const CACHE_NAME = 'moneyland-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Instalación: pre-cachear assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activación: limpiar caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first para API y Supabase, cache-first para assets estáticos
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Siempre ir a red para Supabase, Claude API y cualquier POST
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('anthropic.com') ||
    event.request.method !== 'GET'
  ) {
    return; // dejar que el browser maneje normalmente
  }

  // Para archivos de la app: network-first con fallback a cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cachear respuesta fresca
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
