const CACHE_NAME = 'lumi-routine-v1';
const CACHED_URLS = ['./', './index.html'];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing Lumi✨Routine service worker');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHED_URLS).catch(() => {
        // 캐싱 실패해도 설치 계속 진행
        console.log('[SW] Cache failed, continuing anyway');
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // network-first: 온라인이면 최신 파일, 오프라인이면 캐시 사용
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
