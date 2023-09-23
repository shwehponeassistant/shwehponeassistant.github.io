'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"version.json": "4fa879f8c4a4a15e4c3f0ebd5bc78c8e",
"index.html": "290f8a81d90187ab2ec52bbe1cf929fb",
"/": "290f8a81d90187ab2ec52bbe1cf929fb",
"main.dart.js": "a7b38ee69fb57e99f0cf2a14b638968a",
"flutter.js": "6fef97aeca90b426343ba6c5c9dc5d4a",
"favicon.png": "1be6e4121badabbf6670a4ba0c6d8f4b",
"icons/Icon-192.png": "a3d12e6a8e302f90eba4c42a6c8c1e3a",
"icons/Icon-maskable-192.png": "a3d12e6a8e302f90eba4c42a6c8c1e3a",
"icons/Icon-maskable-512.png": "8c0c6e76dc6fee79c15794663e78fd73",
"icons/Icon-512.png": "8c0c6e76dc6fee79c15794663e78fd73",
"manifest.json": "f320caaa623ed9515fe135012c9d248e",
"assets/AssetManifest.json": "7690e573f231c4532e734f1ebaaa36e7",
"assets/NOTICES": "3983c5cf4212a0612fe5737cb960bc67",
"assets/FontManifest.json": "0c765607616d53f96c58f88a2d01c0bb",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "62f53b0dd3f73ea8bba0dee0ce773380",
"assets/packages/fluttertoast/assets/toastify.js": "56e2c9cedd97f10e7e5f1cebd85d53e3",
"assets/packages/fluttertoast/assets/toastify.css": "a85675050054f179444bc5ad70ffc635",
"assets/shaders/ink_sparkle.frag": "f8b80e740d33eb157090be4e995febdf",
"assets/AssetManifest.bin": "18da9f5878559bd28773cb86452139a3",
"assets/fonts/MaterialIcons-Regular.otf": "1c307c38f927427134873c0878f64f5d",
"assets/assets/images/transfermoneyicon.png": "e97c07f5e6e28f08f58a8f20beb3ea1c",
"assets/assets/images/shwehponeicon1.png": "7e484c0e831b1d3686892e4a3dba94cd",
"assets/assets/images/accessoriesicon.png": "f4189d1708bdc78269acbe29e9530ee1",
"assets/assets/images/shwehponeicon2.png": "6fd070c9905b7ee475528ecb87709652",
"assets/assets/images/logo.png": "ee3037469476e79de583e9450a673c8c",
"assets/assets/images/shwehponelogo.png": "1cd412cd6634c985f0702fdca86a188b",
"assets/assets/images/wavemoneyicon.png": "9a93b4f4374bcff4185e89fdbdd20387",
"assets/assets/images/serviceicon.png": "3f3c724a13fc19f8b242fed780c25fd9",
"assets/assets/images/kpayicon.png": "05fe350ea3d88ce0144b2250687b27a0",
"assets/assets/fonts/Lora-Italic-VariableFont_wght.ttf": "b1f251bc5aaa536a4d8c27223f3c3257",
"assets/assets/fonts/Pyidaungsu-2.5.3_Regular.ttf": "36ecc0bdcc82651baf8adf09715fb2bd",
"assets/assets/fonts/Pyidaungsu-2.5.3_Numbers.ttf": "376bbd8fd25414443a8b6a8a659044e9",
"assets/assets/fonts/Pyidaungsu-2.5.3_Bold.ttf": "d7d3b57983918b572e826021a00ebe55",
"assets/assets/fonts/Lora-VariableFont_wght.ttf": "ea5cbfa365fc139fc6d7b4ad26287e2e",
"canvaskit/skwasm.js": "1df4d741f441fa1a4d10530ced463ef8",
"canvaskit/skwasm.wasm": "6711032e17bf49924b2b001cef0d3ea3",
"canvaskit/chromium/canvaskit.js": "8c8392ce4a4364cbb240aa09b5652e05",
"canvaskit/chromium/canvaskit.wasm": "fc18c3010856029414b70cae1afc5cd9",
"canvaskit/canvaskit.js": "76f7d822f42397160c5dfc69cbc9b2de",
"canvaskit/canvaskit.wasm": "f48eaf57cada79163ec6dec7929486ea",
"canvaskit/skwasm.worker.js": "19659053a277272607529ef87acf9d8a"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
