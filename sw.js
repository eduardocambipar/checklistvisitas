/* Service worker do Checklist Operacional — cache para uso em campo sem sinal.
   Ao publicar uma versão nova do formulário, troque o número do CACHE abaixo. */
var CACHE = 'checklist-v4';
var PRE = ['./', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
/* As bibliotecas de PDF agora vão embutidas no index.html: nada de CDN externo,
   o relatório é gerado mesmo sem internet ou atrás do firewall da empresa. */

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(PRE.map(function(u){ return c.add(u).catch(function(){}); }));
  }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ return k === CACHE ? null : caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function(r){
      var copia = r.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copia).catch(function(){}); });
      return r;
    }).catch(function(){ return caches.match(e.request, { ignoreSearch: true }); })
  );
});
