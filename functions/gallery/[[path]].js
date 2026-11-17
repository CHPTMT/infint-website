/*
  Cloudflare Pages Function: everything under /gallery
  Shows the private client gallery (its own Pages project, infint-gallery) at infint.co.za/gallery.
  Each request is passed on to the gallery project and its answer comes back unchanged,
  so the address in the browser stays on infint.co.za.

  Settings (Workers & Pages > infint > Settings > Variables and secrets), both optional:
    GALLERY_ORIGIN   where the gallery runs (default https://preview.infint-gallery.pages.dev)
    GALLERY_ENABLED  set to false to switch the gallery off: every /gallery request then gets a 503
    ORIGIN_AUTH_SECRET  shared secret, same value as in the gallery project; lets the gallery see each visitor

  Photo sizes (/gallery/img/...) are kept in Cloudflare's cache for up to 10 minutes. The gallery
  checks access on every image request, so a hidden, revoked or expired gallery stops answering
  with photos, and the cached copy runs out within those 10 minutes.
*/

const DEFAULT_ORIGIN = "https://preview.infint-gallery.pages.dev";
const ROBOTS = "noindex, nofollow, noarchive";
const IMG_CACHE_SECONDS = 600;
const WAIT_MS = 60000;

// The only POST paths the gallery has (all admin API). It uses no PUT or DELETE.
const POST_PATHS = [
  /^\/gallery\/admin\/api\/(login|logout|galleries|drive\/scan|folders\/title)$/,
  /^\/gallery\/admin\/api\/galleries\/[^/]+\/(remove|sync)$/,
  /^\/gallery\/admin\/api\/shoots\/[^/]+(\/photos)?$/,
];

function unavailable() {
  return new Response("The gallery is not available right now.", {
    status: 503,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": ROBOTS },
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  if (url.pathname !== "/gallery" && !url.pathname.startsWith("/gallery/")) {
    return new Response("Not found", { status: 404 });
  }
  if (String(env.GALLERY_ENABLED ?? "").trim().toLowerCase() === "false") return unavailable();

  const method = request.method;
  const allowed = method === "GET" || method === "HEAD" || (method === "POST" && POST_PATHS.some((re) => re.test(url.pathname)));
  if (!allowed) {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD", "Cache-Control": "no-store", "X-Robots-Tag": ROBOTS } });
  }

  let upstream;
  try { upstream = new URL(env.GALLERY_ORIGIN || DEFAULT_ORIGIN); } catch { return unavailable(); }
  const target = new URL(url.pathname + url.search, upstream.origin);

  // Photo sizes for clients only: never for an admin (Preview of a hidden gallery) and never downloads.
  const cookie = request.headers.get("Cookie") || "";
  const cacheable = method === "GET" && url.pathname.startsWith("/gallery/img/") && !url.pathname.includes("/dl/")
    && !cookie.includes("infint_preview") && !cookie.includes("infint_admin");
  const cache = cacheable ? caches.default : null;
  const cacheKey = new Request(url.toString(), { method: "GET" });

  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) {
      const out = new Response(hit.body, hit);
      out.headers.set("Cache-Control", out.headers.get("X-Gallery-Browser-Cache") || "private, max-age=86400");
      out.headers.delete("X-Gallery-Browser-Cache");
      out.headers.set("X-Gallery-Cache", "HIT");
      return out;
    }
  }

  const headers = new Headers(request.headers);
  for (const name of [...headers.keys()]) {
    if (name === "host" || name.startsWith("cf-") || name.startsWith("x-forwarded-") || name === "x-real-ip" || name === "cdn-loop") {
      headers.delete(name);
    }
  }
  headers.delete("x-visitor-ip");
  headers.delete("x-origin-auth");
  headers.set("X-Forwarded-Host", url.host);
  headers.set("X-Forwarded-Proto", "https");
  // The visitor's own address, believed by the gallery only together with the shared secret
  // ORIGIN_AUTH_SECRET (set in both projects). Without the secret nothing is sent.
  const visitorIp = request.headers.get("CF-Connecting-IP");
  if (env.ORIGIN_AUTH_SECRET && visitorIp) {
    headers.set("X-Visitor-IP", visitorIp);
    headers.set("X-Origin-Auth", env.ORIGIN_AUTH_SECRET);
  }

  // Give up if the gallery has not started answering within the wait time. The timer stops once it
  // answers, so a long download is never cut off.
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), WAIT_MS);
  let res;
  try {
    res = await fetch(target.toString(), {
      method,
      headers,
      body: method === "GET" || method === "HEAD" ? undefined : request.body,
      redirect: "manual",
      signal: abort.signal,
    });
  } catch {
    return unavailable();
  } finally {
    clearTimeout(timer);
  }
  if (res.status >= 500) return unavailable();

  const out = new Response(res.body, res);
  const location = out.headers.get("Location");
  if (location) {
    try {
      const loc = new URL(location, target);
      if (loc.host === upstream.host) out.headers.set("Location", url.origin + loc.pathname + loc.search + loc.hash);
    } catch { /* leave it as it is */ }
  }
  const robots = (out.headers.get("X-Robots-Tag") || "").toLowerCase();
  if (!robots.includes("noindex") || !robots.includes("nofollow") || !robots.includes("noarchive")) {
    out.headers.set("X-Robots-Tag", ROBOTS);
  }
  if (!cache) return out;

  const type = out.headers.get("Content-Type") || "";
  if (res.status !== 200 || !type.startsWith("image/") || out.headers.has("Set-Cookie")) {
    out.headers.set("X-Gallery-Cache", "BYPASS");
    return out;
  }

  // The cached copy may be kept for 10 minutes; the browser still gets the gallery's own Cache-Control.
  const [forVisitor, forCache] = out.body.tee();
  const stored = new Response(forCache, out);
  stored.headers.set("X-Gallery-Browser-Cache", out.headers.get("Cache-Control") || "private, max-age=86400");
  stored.headers.set("Cache-Control", `public, max-age=${IMG_CACHE_SECONDS}`);
  context.waitUntil(cache.put(cacheKey, stored).catch(() => {}));

  const reply = new Response(forVisitor, out);
  reply.headers.set("X-Gallery-Cache", "MISS");
  return reply;
}
