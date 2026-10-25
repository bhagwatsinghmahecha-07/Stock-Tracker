/* Keeps the app shell available offline. Stock data itself is cached by Firebase. */
const CACHE='stock-tracker-v8';
const SHELL=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  const ok=u.origin===location.origin||u.hostname==='www.gstatic.com'||u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com';
  if(!ok)return; // Firebase data/auth calls go straight to the network
  e.respondWith(fetch(r).then(res=>{
    if(res&&res.status===200){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy))}
    return res;
  }).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
});
