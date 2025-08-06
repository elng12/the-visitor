// Service Worker for caching and offline support
const CACHE_NAME = 'the-visitor-v3';
const GAME_CACHE = 'the-visitor-game-v1';

const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css?v=2',
    '/script.js?v=2',
    '/manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://imgs.crazygames.com/thevisitor.png?metadata=none&quality=100&width=800&height=600&fit=crop'
];

const gameUrlsToCache = [
    'https://the-visitor.game-files.crazygames.com/ruffle/thevisitor.html?ssrDevice=desktop&isNewUser=false&v=1.337'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME).then(cache => {
                console.log('Caching app resources');
                return cache.addAll(urlsToCache);
            }),
            caches.open(GAME_CACHE).then(cache => {
                console.log('Preloading game resources');
                return cache.addAll(gameUrlsToCache).catch(err => {
                    console.log('Game preload failed, will load on demand');
                });
            })
        ])
    );
    self.skipWaiting();
});

// Fetch event - optimized caching strategy
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Game resources - cache first, then network
    if (url.hostname === 'the-visitor.game-files.crazygames.com' || url.hostname === 'games.crazygames.com') {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        console.log('Serving game from cache');
                        return response;
                    }
                    return fetch(event.request).then(response => {
                        const responseClone = response.clone();
                        caches.open(GAME_CACHE).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                        return response;
                    });
                })
        );
        return;
    }

    // App resources - cache first
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== GAME_CACHE) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});