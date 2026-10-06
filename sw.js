// 칭찬 구슬병 — works offline once opened; the page and hidden notes refresh from the network when online.
const CACHE = 'praise-jar-v3';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
const put = (req, res) => { if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return res; };
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin){
    const fresh = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html') || url.pathname.endsWith('/notes.dat');
    if (fresh){
      e.respondWith(fetch(req).then(res => put(req, res)).catch(() => caches.match(req, { ignoreSearch:true }).then(r => r || caches.match('./index.html'))));
    } else {
      e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => put(req, res))));
    }
    return;
  }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com' || url.hostname === 'cdnjs.cloudflare.com'){
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => put(req, res))));
  }
});
