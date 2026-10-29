/*
  Shared code for the booking emails and the Accept / Decline links.
  No database: everything about a booking travels inside a signed link.

  A link token is base64url(JSON) + "." + base64url(HMAC-SHA256), signed with BOOKING_SECRET.
  Tokens expire after 30 days.
*/

import "../../js/content.js";
const CONFIG = globalThis.INFINT_CONFIG;

export const SENDERS = {
  booking: "Infint Bookings <bookings@infint.co.za>",
  contact: "Infint Info <info@infint.co.za>"
};
export const SIGN_OFF = "Tshedza, Infint";
const TOKEN_DAYS = 30;

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export const clean = (v, max = 4000) => String(v ?? "").slice(0, max).trim();
export const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isPhone = v => /^\+?[\d\s()]{9,20}$/.test(v) && v.replace(/\D/g, "").length >= 9;
export const isDate = v => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v + "T00:00:00Z"));
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// NOTIFY_EMAIL can hold several addresses separated by commas; every one gets the enquiries.
export const notifyTo = env => (env.NOTIFY_EMAIL || "infintco@gmail.com").split(",").map(s => s.trim()).filter(Boolean);
export const bookingFrom = env => env.FROM_BOOKINGS || SENDERS.booking;
export const config = () => CONFIG;

/* Booking fields */

export function readBooking(data) {
  return {
    service: clean(data.service, 40),
    pkg: clean(data.pkg, 80),
    date: clean(data.date, 10),
    time: clean(data.time, 5),
    hours: clean(data.hours, 40),
    location: clean(data.location, 200),
    notes: clean(data.notes, 1500),
    name: clean(data.name, 120),
    phone: clean(data.phone, 40),
    email: clean(data.email, 200),
    handle: clean(data.handle, 80),
    billing: clean(data.billing, 120),
    source: clean(data.source, 60)
  };
}

/* Returns the names of fields that fail. Same rules as the form in js/app.js. */
export function validateBooking(b) {
  const bad = [];
  if (!b.name) bad.push("name");
  if (!isEmail(b.email)) bad.push("email");
  if (!isPhone(b.phone)) bad.push("phone");
  if (!CONFIG.services.some(s => s.slug === b.service)) bad.push("service");
  const today = new Date(Date.now() + 2 * 3600e3).toISOString().slice(0, 10); // Johannesburg is UTC+2
  if (!isDate(b.date) || b.date < today) bad.push("date");
  if (!b.location) bad.push("location");
  return bad;
}

export const serviceName = slug => (CONFIG.services.find(s => s.slug === slug) || {}).name || slug || "Shoot";

export function niceDate(b) {
  const d = isDate(b.date)
    ? new Date(b.date + "T00:00:00Z").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    : b.date;
  return d + (b.time ? " at " + b.time : "");
}

export const firstName = b => (b.name || "").split(/\s+/)[0] || "there";

/* Label and value pairs. Empty optional fields are left out. */
export function summaryRows(b, { withContact = true } = {}) {
  const rows = [
    ["Shoot", serviceName(b.service)],
    ["Package", b.pkg],
    ["Date", niceDate(b)],
    ["Coverage", b.hours],
    ["Location", b.location],
    ["Notes", b.notes]
  ];
  if (withContact) rows.push(
    ["Name", b.name], ["Phone", b.phone], ["Email", b.email],
    ["Handle", b.handle], ["Billing name", b.billing], ["Heard about Infint", b.source]
  );
  return rows.filter(([, v]) => v);
}

/* Email bodies. Each email is a list of blocks rendered to both text and simple HTML.
   Block types: string (paragraph), {rows}, {list}, {heading}, {buttons:[[label,url,colour]]} */

export function renderText(blocks) {
  return blocks.map(b => {
    if (typeof b === "string") return b;
    if (b.heading) return b.heading.toUpperCase();
    if (b.rows) return b.rows.map(([k, v]) => k + ": " + v).join("\n");
    if (b.list) return b.list.map((x, i) => (i + 1) + ". " + x).join("\n");
    if (b.buttons) return b.buttons.map(([label, url]) => label + ":\n" + url).join("\n\n");
    return "";
  }).join("\n\n");
}

export function renderHtml(blocks) {
  const p = 'style="margin:0 0 16px;font:15px/1.55 Arial,Helvetica,sans-serif;color:#0E1115"';
  const body = blocks.map(b => {
    if (typeof b === "string") return `<p ${p}>${esc(b).replace(/\n/g, "<br>")}</p>`;
    if (b.heading) return `<p style="margin:24px 0 8px;font:bold 13px/1.4 Arial,Helvetica,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#0E1115">${esc(b.heading)}</p>`;
    if (b.rows) return `<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 16px;width:100%;max-width:560px">${b.rows.map(([k, v]) =>
      `<tr><td style="padding:8px 12px 8px 0;border-bottom:1px solid #e4e4e0;font:bold 14px Arial,Helvetica,sans-serif;color:#0E1115;vertical-align:top;width:140px">${esc(k)}</td><td style="padding:8px 0;border-bottom:1px solid #e4e4e0;font:14px/1.5 Arial,Helvetica,sans-serif;color:#0E1115">${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("")}</table>`;
    if (b.list) return `<ol style="margin:0 0 16px;padding-left:22px;font:15px/1.55 Arial,Helvetica,sans-serif;color:#0E1115">${b.list.map(x => `<li style="margin-bottom:6px">${esc(x)}</li>`).join("")}</ol>`;
    if (b.buttons) return `<p style="margin:8px 0 20px">${b.buttons.map(([label, url, bg]) =>
      `<a href="${esc(url)}" style="display:inline-block;margin:0 10px 10px 0;padding:13px 24px;background:${bg || "#FFA000"};color:${bg === "#0E1115" ? "#fff" : "#0E1115"};font:bold 14px Arial,Helvetica,sans-serif;letter-spacing:.04em;text-transform:uppercase;text-decoration:none">${esc(label)}</a>`).join("")}</p>`;
    return "";
  }).join("");
  return `<div style="background:#F5F5F3;padding:24px 12px"><div style="max-width:600px;margin:0 auto;background:#fff;padding:28px 24px">${body}</div></div>`;
}

export async function sendEmail(env, msg, idempotencyKey) {
  const headers = { Authorization: "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  const res = await fetch("https://api.resend.com/emails", { method: "POST", headers, body: JSON.stringify(msg) });
  return res;
}

export function emailFromBlocks({ from, to, subject, blocks, replyTo, bcc }) {
  const msg = { from, to: [].concat(to), subject, text: renderText(blocks), html: renderHtml(blocks) };
  if (replyTo) msg.reply_to = replyTo;
  if (bcc) msg.bcc = [].concat(bcc);
  return msg;
}

/* Signed links */

const enc = new TextEncoder();
const b64url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64url = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), c => c.charCodeAt(0));

const hmacKey = secret => crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);

export async function makeToken(booking, secret) {
  const id = b64url(crypto.getRandomValues(new Uint8Array(9)));
  const body = { id, exp: Math.floor(Date.now() / 1000) + TOKEN_DAYS * 86400, b: booking };
  const data = b64url(enc.encode(JSON.stringify(body)));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(data));
  return data + "." + b64url(sig);
}

/* Returns {ok:true, id, exp, b} or {ok:false, reason:"invalid"|"expired"} */
export async function readToken(token, secret) {
  const [data, sig] = String(token || "").split(".");
  if (!data || !sig || !secret) return { ok: false, reason: "invalid" };
  let valid = false;
  try { valid = await crypto.subtle.verify("HMAC", await hmacKey(secret), unb64url(sig), enc.encode(data)); } catch { valid = false; }
  if (!valid) return { ok: false, reason: "invalid" };
  let body;
  try { body = JSON.parse(new TextDecoder().decode(unb64url(data))); } catch { return { ok: false, reason: "invalid" }; }
  if (!body.exp || body.exp < Date.now() / 1000) return { ok: false, reason: "expired" };
  return { ok: true, ...body };
}
