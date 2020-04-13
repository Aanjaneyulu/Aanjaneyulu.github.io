importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');
var cacheName = 'app-shell-cache-v0';
var filesToCache = [
                    './index.html',
                    './webPush.js',
                    './manifest.json',
                    'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css',
                    'https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js',
                    'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js',
                    'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js'
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

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  'messagingSenderId': '278748258522'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/icons/logo.png'
  };

  return self.registration.showNotification(notificationTitle,
      notificationOptions);
});


