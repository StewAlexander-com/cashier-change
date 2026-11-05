/* Cashier Change service worker: precache the app shell, serve it offline. */
var CACHE = "cashier-change-v1";
var SHELL = [
  "./",
  "index.html",
  "styles.css",
  "change.js",
  "app.js",
  "manifest.webmanifest",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "icons/apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

/*
 * Pages: network first, so a new deploy shows up right away; cached copy offline.
 * Static files: stale-while-revalidate. Serve from cache instantly, refresh in
 * the background, so the next launch picks up changes without a cache-name bump.
 */
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put("index.html", copy); });
        }
        return res;
      }).catch(function () {
        return caches.match("index.html");
      })
    );
    return;
  }

  e.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(req, { ignoreSearch: true }).then(function (hit) {
        var refresh = fetch(req).then(function (res) {
          if (res.ok) cache.put(req, res.clone());
          return res;
        });
        if (hit) {
          e.waitUntil(refresh.catch(function () {}));
          return hit;
        }
        return refresh;
      });
    })
  );
});
