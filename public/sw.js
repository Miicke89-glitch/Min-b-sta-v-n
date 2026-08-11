// Enkel service worker som cachar öppnade dokument så att de går att
// läsa offline. Signerade URL:er varierar i frågesträngen, därför
// matchas cachen på sökvägen utan query.
const CACHE = "dbv-dokument-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function arDokument(url) {
  return url.pathname.includes("/storage/v1/object/sign/dokument/");
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || !arDokument(url)) return;

  const cacheNyckel = url.origin + url.pathname;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        const svar = await fetch(event.request);
        if (svar.ok) cache.put(cacheNyckel, svar.clone());
        return svar;
      } catch {
        const cachat = await cache.match(cacheNyckel);
        if (cachat) return cachat;
        throw new Error("offline och inte cachad");
      }
    })()
  );
});
