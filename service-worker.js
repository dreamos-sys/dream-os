
// DREAM OS v4.0 HYBRID SERVICE WORKER
// Integrasi antara versi kita + Mrs. Qwen

const CACHE_VERSION = 'v4.0-hybrid-' + new Date().toISOString().slice(0, 10);
const CACHE_NAME = `dream-os-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';
const RUNTIME_CACHE = 'dream-runtime';

// Dynamic base path untuk GitHub Pages
function getBasePath() {
    const path = self.location.pathname;
    if (path.includes('/dream-os/') || path.includes('/dream-os')) {
        return '/dream-os/';
    }
    return '/';
}

const BASE_PATH = getBasePath();

// Assets yang HARUS di-cache (CRITICAL PATH)
const CRITICAL_ASSETS = [
    BASE_PATH,
    BASE_PATH + 'index.html',
    BASE_PATH + 'manifest.webmanifest',
    BASE_PATH + 'offline.html',
    BASE_PATH + '404.html',
    BASE_PATH + 'sw.js',
    
    // Core files
    BASE_PATH + 'core/dream-core.js',
    
    // Mode files
    BASE_PATH + 'low/index.html',
    BASE_PATH + 'mid/index.html', 
    BASE_PATH + 'high/index.html',
    
    // Essential icons
    BASE_PATH + 'assets/icons/icon-192x192.png',
    BASE_PATH + 'assets/icons/icon-512x512.png',
    BASE_PATH + 'assets/icons/maskable-icon-512x512.png',
    
    // External dependencies
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://ywtpykgjvbjwhmapmygb.supabase.co/rest/v1/bookings?select=*'
];

// Strategy: Cache First untuk static assets, Network First untuk API
const CACHE_STRATEGIES = {
    STATIC: ['html', 'css', 'js', 'json', 'webmanifest', 'png', 'jpg', 'svg', 'ico', 'woff2'],
    NETWORK: ['api', 'supabase', 'rest/v1'],
    HYBRID: ['bookings', 'inventory', 'k3']
};

// INSTALL: Pre-cache critical assets
self.addEventListener('install', event => {
    console.log('🚀 Dream OS Hybrid SW Installing:', CACHE_VERSION);
    
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME).then(cache => {
                console.log('📦 Pre-caching critical assets...');
                return cache.addAll(
                    CRITICAL_ASSETS.map(url => url.replace(/([^:]\/)\/+/g, "$1"))
                ).catch(err => {
                    console.warn('⚠️ Some assets failed to pre-cache:', err);
                    // Cache what we can
                    return Promise.all(
                        CRITICAL_ASSETS.map(url => 
                            cache.add(url).catch(e => {
                                console.warn(`Failed: ${url}`, e.message);
                                return null;
                            })
                        )
                    );
                });
            }),
            caches.open(RUNTIME_CACHE).then(cache => {
                console.log('⚡ Runtime cache ready');
                return cache;
            })
        ]).then(() => {
            console.log('✅ Installation complete! Skipping waiting...');
            return self.skipWaiting();
        })
    );
});

// ACTIVATE: Clean up old caches
self.addEventListener('activate', event => {
    console.log('🔄 Dream OS Hybrid SW Activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete old caches (keep runtime cache)
                    if (cacheName !== CACHE_NAME && 
                        cacheName !== RUNTIME_CACHE && 
                        cacheName.startsWith('dream-os-')) {
                        console.log(`🗑️  Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Activation complete! Claiming clients...');
            return self.clients.claim();
        })
    );
});

// FETCH: Intelligent caching strategy
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') return;
    
    // Skip chrome-extension requests
    if (url.protocol === 'chrome-extension:') return;
    
    // Determine strategy based on URL
    const strategy = determineStrategy(url);
    
    // Apply appropriate strategy
    switch(strategy) {
        case 'NETWORK_FIRST':
            event.respondWith(networkFirst(request));
            break;
        case 'CACHE_FIRST':
            event.respondWith(cacheFirst(request));
            break;
        case 'HYBRID':
            event.respondWith(hybridStrategy(request));
            break;
        case 'OFFLINE_ONLY':
            event.respondWith(offlineOnly(request));
            break;
        default:
            event.respondWith(defaultStrategy(request));
    }
});

// Strategy determination
function determineStrategy(url) {
    const path = url.pathname + url.search;
    
    // Network First untuk API calls
    if (path.includes('/rest/v1/') || path.includes('supabase.co')) {
        return 'NETWORK_FIRST';
    }
    
    // Cache First untuk static assets
    if (path.match(/\.(html|css|js|json|webmanifest|png|jpg|svg|ico|woff2)$/i)) {
        return 'CACHE_FIRST';
    }
    
    // Hybrid untuk app-specific routes
    if (path.includes('/bookings') || path.includes('/inventory') || path.includes('/k3')) {
        return 'HYBRID';
    }
    
    // Offline untuk offline page
    if (path.includes('/offline.html')) {
        return 'OFFLINE_ONLY';
    }
    
    return 'CACHE_FIRST';
}

// Strategy implementations
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('🌐 Network failed, trying cache...');
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // For API requests, return structured error
        if (request.url.includes('api') || request.url.includes('supabase')) {
            return new Response(
                JSON.stringify({
                    error: 'OFFLINE',
                    message: 'You are offline. Data will sync when connection restores.',
                    timestamp: new Date().toISOString(),
                    cached: false
                }),
                {
                    status: 503,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-DreamOS-Cache': 'MISS'
                    }
                }
            );
        }
        
        // Fallback to offline page for HTML requests
        if (request.headers.get('accept').includes('text/html')) {
            return caches.match(OFFLINE_URL);
        }
        
        throw error;
    }
}

async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // Refresh cache in background
        fetchAndCache(request);
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // If we're here, both cache and network failed
        if (request.headers.get('accept').includes('text/html')) {
            return caches.match(OFFLINE_URL);
        }
        
        return new Response('Service Unavailable', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

async function hybridStrategy(request) {
    // Try cache first for speed
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // Update cache in background
        fetchAndCache(request);
        return cachedResponse;
    }
    
    // If not in cache, try network
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache for future offline use
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Return offline data structure
        return new Response(
            JSON.stringify({
                data: [],
                offline: true,
                timestamp: new Date().toISOString(),
                message: 'Showing cached data'
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

async function offlineOnly(request) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline page not available', { status: 404 });
}

async function defaultStrategy(request) {
    return cacheFirst(request);
}

// Background fetch and cache
async function fetchAndCache(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
        }
    } catch (error) {
        // Silently fail
    }
}

// MESSAGE HANDLING
self.addEventListener('message', event => {
    const data = event.data;
    
    switch(data.type) {
        case 'CLEAR_CACHE':
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }).then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
            
        case 'GET_CACHE_INFO':
            caches.keys().then(cacheNames => {
                Promise.all(
                    cacheNames.map(cacheName => 
                        caches.open(cacheName).then(cache => 
                            cache.keys().then(requests => 
                                ({ name: cacheName, size: requests.length })
                            )
                        )
                    )
                ).then(info => {
                    event.ports[0].postMessage({ caches: info });
                });
            });
            break;
            
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
    }
});

// BACKGROUND SYNC
self.addEventListener('sync', event => {
    console.log('🔄 Background sync event:', event.tag);
    
    if (event.tag === 'sync-bookings') {
        event.waitUntil(syncBookings());
    }
    
    if (event.tag === 'sync-inventory') {
        event.waitUntil(syncInventory());
    }
    
    if (event.tag === 'sync-k3') {
        event.waitUntil(syncK3Reports());
    }
});

// Sync implementations
async function syncBookings() {
    const pendingBookings = await getPendingOperations('bookings');
    
    for (const booking of pendingBookings) {
        try {
            await fetch('https://ywtpykgjvbjwhmapmygb.supabase.co/rest/v1/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': 'YOUR_API_KEY',
                    'Authorization': 'Bearer YOUR_API_KEY'
                },
                body: JSON.stringify(booking)
            });
            
            console.log('✅ Booking synced:', booking.id);
            await markOperationComplete('bookings', booking.id);
        } catch (error) {
            console.error('❌ Booking sync failed:', error);
        }
    }
}

async function syncInventory() {
    // Implement inventory sync
}

async function syncK3Reports() {
    // Implement K3 reports sync
}

// Helper functions for pending operations
async function getPendingOperations(type) {
    const cache = await caches.open(RUNTIME_CACHE);
    const response = await cache.match(`/pending/${type}`);
    return response ? await response.json() : [];
}

async function markOperationComplete(type, id) {
    const cache = await caches.open(RUNTIME_CACHE);
    const pending = await getPendingOperations(type);
    const updated = pending.filter(op => op.id !== id);
    await cache.put(`/pending/${type}`, new Response(JSON.stringify(updated)));
}

// PUSH NOTIFICATIONS
self.addEventListener('push', event => {
    let notificationData = {
        title: 'Dream OS',
        body: 'You have new updates',
        icon: BASE_PATH + 'assets/icons/icon-192x192.png',
        badge: BASE_PATH + 'assets/icons/icon-72x72.png',
        tag: 'dream-os-notification'
    };
    
    try {
        if (event.data) {
            notificationData = { ...notificationData, ...event.data.json() };
        }
    } catch (e) {
        notificationData.body = event.data.text();
    }
    
    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            tag: notificationData.tag,
            vibrate: [200, 100, 200],
            data: {
                url: notificationData.url || BASE_PATH,
                timestamp: new Date().toISOString()
            },
            actions: [
                {
                    action: 'open',
                    title: 'Open',
                    icon: BASE_PATH + 'assets/icons/icon-96x96.png'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss',
                    icon: BASE_PATH + 'assets/icons/icon-96x96.png'
                }
            ]
        })
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then(clientList => {
                    // Focus existing window
                    for (const client of clientList) {
                        if (client.url.startsWith(self.origin) && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    
                    // Open new window
                    if (clients.openWindow) {
                        const url = event.notification.data.url || BASE_PATH;
                        return clients.openWindow(url);
                    }
                })
        );
    }
});

// PERIODIC SYNC (Background updates)
if ('periodicSync' in self.registration) {
    self.registration.periodicSync.register('dream-os-daily-sync', {
        minInterval: 24 * 60 * 60 * 1000 // Once per day
    }).then(() => {
        console.log('✅ Periodic sync registered');
    }).catch(error => {
        console.log('❌ Periodic sync not supported:', error);
    });
}

// ERROR HANDLING
self.addEventListener('error', event => {
    console.error('❌ Service Worker Error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('❌ Unhandled Promise Rejection:', event.reason);
});

console.log('✅ Dream OS Hybrid Service Worker loaded:', CACHE_VERSION);
console.log('📍 Base Path:', BASE_PATH);
console.log('🚀 Ready to serve Dream OS in offline mode!');
