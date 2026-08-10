const CACHE='move-v1';
const ASSETS=['/','/index.html','/manifest.webmanifest','/icon.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith(
    fetch(event.request).catch(()=>caches.match(event.request).then(r=>r||caches.match('/index.html')))
  );
});

self.addEventListener('push',event=>{
  let data={title:'Move',body:'What are you noticing right now?',url:'/?checkin=1'};
  try{ data={...data,...event.data.json()}; }catch(e){}
  event.waitUntil(self.registration.showNotification(data.title,{
    body:data.body,
    icon:'/icon.svg',
    badge:'/icon.svg',
    tag:data.tag||'move-checkin',
    data:{url:data.url||'/?checkin=1'}
  }));
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=event.notification.data?.url||'/?checkin=1';
  event.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
      for(const client of list){
        if('focus' in client){
          client.navigate(target);
          return client.focus();
        }
      }
      return clients.openWindow ? clients.openWindow(target) : undefined;
    })
  );
});
