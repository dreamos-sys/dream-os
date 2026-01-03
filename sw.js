// DREAM OS - ADVANCED SERVICE WORKER
const VERSION = '1.0.0';
const CACHE_NAME = `dream-cache-${VERSION}`;

// Core assets to cache immediately
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/style.css',
    '/config.js',
    '/manifest.json'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
    console.log(`🚀 Installing DREAM OS v${VERSION}`);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(CORE_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log(`🎯 Activating v${VERSION}`);
    
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log(`🗑️ Deleting old cache: ${key}`);
                        return caches.delete(key);
                    }
                })
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Skip non-GET requests and chrome-extension
    if (event.request.method !== 'GET' || url.protocol === 'chrome-extension:') {
        return;
    }
    
    // API calls - Network first, fallback to cache
    if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/auth/v1/')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Cache successful responses
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(event.request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }
    
    // HTML files - Network first
    if (event.request.headers.get('Accept')?.includes('text/html')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }
    
    // Static assets - Cache first, network for updates
    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                // Return cached if exists
                if (cached) {
                    // Background update
                    fetch(event.request)
                        .then(response => {
                            if (response.ok) {
                                const clone = response.clone();
                                caches.open(CACHE_NAME)
                                    .then(cache => cache.put(event.request, clone));
                            }
                        });
                    return cached;
                }
                
                // Otherwise fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Cache the response
                        if (response.ok) {
                            const clone = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(event.request, clone));
                        }
                        return response;
                    });
            })
    );
});

// Background sync for offline operations
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-offline-queue') {
        event.waitUntil(syncOfflineQueue());
    }
});

// Push notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data?.text() || 'New update from DREAM OS',
        icon: '/assets/icons/icon-192.png',
        badge: '/assets/icons/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            url: '/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('DREAM OS', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(clientList => {
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

// Sync offline queue function
async function syncOfflineQueue() {
    console.log('🔄 Syncing offline queue...');
    
    // This would sync offline data with server
    // Implementation depends on your offline queue structure
}
