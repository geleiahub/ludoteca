// Ludoteca GeleiaHUB: guarda os arquivos do app para abrir rápido (os dados sempre vêm do sistema)
var VERSAO = 'ludoteca-app-v1';
var ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './logo.png', './favicon.png',
                './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSAO).then(function (c) { return c.addAll(ARQUIVOS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSAO; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;   // sistema, fontes etc.: direto da internet
  if (req.mode === 'navigate') {
    // páginas: tenta a internet (versão mais nova); sem internet, abre o app guardado
    e.respondWith(fetch(req).then(function (r) {
      var copia = r.clone(); caches.open(VERSAO).then(function (c) { c.put('./index.html', copia); });
      return r;
    }).catch(function () { return caches.match('./index.html'); }));
    return;
  }
  e.respondWith(caches.match(req).then(function (hit) {
    var rede = fetch(req).then(function (r) { var copia = r.clone(); caches.open(VERSAO).then(function (c) { c.put(req, copia); }); return r; });
    return hit || rede;
  }));
});
