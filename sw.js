var cacheName = 'app-shell-cache-v0';
var filesToCache = [
                    'mmts.html',
                    'mmts.js',
                    'manifest.json',
                    'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',
                    'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css',
                    'https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js',
                    'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js',
                    ];
self.addEventListener('install', function(event){
    console.log("Attempting to install service worker and cache static assets");
    event.waitUntil(
        caches.open(cacheName).then(function(cache){
            return cache.addAll(filesToCache);
        }).then(function(){
            return self.skipWaiting();
        })
    );
});

self.addEventListener('fetch', function(event){
    console.log('Fetch event for ', event.request.url);
    event.respondWith(
      caches.match(event.request).then(function(response) {
        console.log("caches:",caches,"Response:",response);
        if (response) {
          console.log('Found ', event.request.url, ' in cache');
          return response;
        }
        console.log('Network request for ', event.request.url);
        return fetch(event.request).then(function(response){
            if(filesToCache.indexOf(event.request)!=-1){
                caches.open(cacheName).then(function(cache) {
                    cache.put(event.request.url, response.clone());
                });
            }
            return response;
        });  
      }).catch(function(error) {
        // TODO 6 - Respond with custom offline page
      })
    );
});