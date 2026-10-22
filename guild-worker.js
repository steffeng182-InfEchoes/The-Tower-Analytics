'use strict';
// Bump this version whenever deploying changed app/config files. Install atomically;
// activate after the old app's tabs close. Never cache Auth/API/CDN responses.
const CACHE='tower-guild-shell-v2';
const FILES=['./','./index.html','./guild/config.js','./guild/client.js','./guild/sync.js','./guild/i18n.js','./guild/backup.js','./guild/app.js'];
const ROOT=new URL('./',self.location.href);
const URLS=FILES.map(path=>new URL(path,ROOT).href);
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 try{await cache.addAll(URLS.map(url=>new Request(url,{cache:'reload'})));}
 catch(error){await caches.delete(CACHE);throw error;}
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith('tower-guild-shell-')&&name!==CACHE)await caches.delete(name);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==ROOT.origin)return;
 // Map navigations with an Auth callback query to the plain shell cache key;
 // neither callback codes nor response credentials become cache entries.
 const clean=url.origin+url.pathname;
 if(!URLS.includes(clean))return;
 event.respondWith((async()=>{const response=await (await caches.open(CACHE)).match(clean);return response||fetch(event.request);})());
});
