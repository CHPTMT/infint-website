/*
  Cloudflare Pages Function: /api/booking-response
  Opened from the Accept and Decline buttons in a booking enquiry email.

  GET  shows the booking, an optional message box and a confirm button. It never sends anything,
       so email link scanners that open the link can't trigger an email.
  POST (the confirm button) checks the signed link again and emails the client from bookings@,
       with a copy to NOTIFY_EMAIL.

  No database, so "already done" is remembered two ways, both best effort:
    - Resend's Idempotency-Key stops a second email for the same booking within 24 hours.
    - Cloudflare's cache keeps a note of the decision so reopening the link says it's done.
*/

import {
  SIGN_OFF, esc, clean, summaryRows, serviceName, niceDate, firstName, sendEmail,
  emailFromBlocks, readToken, notifyTo, bookingFrom, config
} from "../_shared/booking.js";

const ACTIONS = { accept: "Accept", decline: "Decline" };
const stateKey = id => "https://booking-state.infint.co.za/" + encodeURIComponent(id);

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const token = url.searchParams.get("t");
  const action = ACTIONS[url.searchParams.get("a")] ? url.searchParams.get("a") : "accept";
  const t = await readToken(token, env.BOOKING_SECRET);
  if (!t.ok) return page(badLinkBody(t.reason), 400);

  const done = await getState(t.id);
  if (done) return page(doneBody(t.b, done.action, done.at, true));

  return page(confirmBody(t.b, token, action));
}

export async function onRequestPost({ request, env }) {
  const form = await request.formData().catch(() => null);
  if (!form) return page(badLinkBody("invalid"), 400);
  const token = form.get("t");
  const action = form.get("a");
  const message = clean(form.get("message"), 2000);
  if (!ACTIONS[action]) return page(badLinkBody("invalid"), 400);

  const t = await readToken(token, env.BOOKING_SECRET);
  if (!t.ok) return page(badLinkBody(t.reason), 400);
  if (!env.RESEND_API_KEY) return page(`<h1>Email is not set up</h1><p>RESEND_API_KEY is missing in Cloudflare for this site, so nothing was sent.</p>`, 500);

  const done = await getState(t.id);
  if (done) return page(doneBody(t.b, done.action, done.at, true));

  const b = t.b;
  const msg = emailFromBlocks({
    from: bookingFrom(env),
    to: b.email,
    bcc: notifyTo(env),
    subject: action === "accept"
      ? "Your INFINT booking: " + serviceName(b.service) + ", " + niceDate(b)
      : "Your INFINT booking enquiry for " + niceDate(b),
    blocks: action === "accept" ? acceptBlocks(b, message) : declineBlocks(b, message)
  });

  const res = await sendEmail(env, msg, "booking-" + t.id);
  if (res.status === 409) return page(doneBody(b, null, null, true));
  if (!res.ok) return page(`<h1>That didn't send</h1><p>Resend returned an error (${res.status}). Nothing reached ${esc(b.name)}. Go back and try again, or reply to them from your inbox.</p>`, 502);

  await putState(t.id, { action, at: new Date().toISOString() }, t.exp);
  return page(doneBody(b, action, null, false));
}

export async function onRequest() {
  return new Response("Method not allowed", { status: 405 });
}

/* Client emails */

function acceptBlocks(b, message) {
  const c = config(), pct = c.booking.depositPct || 50;
  const rows = summaryRows(b, { withContact: false }).filter(([k]) => k !== "Notes");
  const blocks = [
    "Hi " + firstName(b) + ",",
    "Good news, I'm available and I'd be glad to do your shoot. Here's what I have:",
    { rows }
  ];
  if (message) blocks.push(message);
  blocks.push(
    { heading: "Next steps" },
    { list: [
      "Pay the " + pct + "% booking fee to secure your date. The date is only held once the payment reflects.",
      "How to pay: " + c.booking.payment,
      "Reply to this email with your proof of payment.",
      "The balance is due on or before the shoot day.",
      "The day before the shoot, I'll send you a short shot list so we're both clear on timing."
    ] },
    c.booking.terms,
    "Any questions, reply here or WhatsApp me on " + c.contact.phone + ".",
    SIGN_OFF
  );
  return blocks;
}

function declineBlocks(b, message) {
  const blocks = [
    "Hi " + firstName(b) + ",",
    "Thank you for your enquiry about a " + serviceName(b.service) + " shoot on " + niceDate(b) + ". I'm sorry, but I can't take this booking."
  ];
  if (message) blocks.push(message);
  blocks.push(
    "If another date works for you, reply to this email or send a new enquiry at https://infint.co.za/#/book and I'll check it for you.",
    SIGN_OFF
  );
  return blocks;
}

/* Remembering decisions (best effort, see top of file) */

async function getState(id) {
  try {
    const hit = await caches.default.match(stateKey(id));
    return hit ? await hit.json() : null;
  } catch { return null; }
}

async function putState(id, state, exp) {
  try {
    const ttl = Math.max(60, Math.floor(exp - Date.now() / 1000));
    await caches.default.put(stateKey(id), new Response(JSON.stringify(state), {
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=" + ttl }
    }));
  } catch { /* cache not available (e.g. on pages.dev), idempotency still applies */ }
}

/* Page bodies */

function bookingTable(b) {
  return `<table>${summaryRows(b).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("")}</table>`;
}

function confirmBody(b, token, action) {
  const other = action === "accept" ? "decline" : "accept";
  const hint = action === "accept"
    ? "Optional. For example your quote, the start time or what to bring. It goes above the next steps."
    : "Optional. For example why, or a date that would work.";
  const goes = action === "accept"
    ? "Sends " + esc(firstName(b)) + " a confirmation with the date, the shoot and the next steps (" + (config().booking.depositPct || 50) + "% booking fee and how to pay)."
    : "Sends " + esc(firstName(b)) + " a short, polite note and invites them to try another date.";
  return `
    <p class="eyebrow">Booking enquiry</p>
    <h1>${ACTIONS[action]} this booking<span>.</span></h1>
    ${bookingTable(b)}
    <form method="post" action="/api/booking-response">
      <input type="hidden" name="t" value="${esc(token)}">
      <input type="hidden" name="a" value="${action}">
      <label for="message">Message to ${esc(firstName(b))}</label>
      <textarea id="message" name="message" maxlength="2000" rows="5"></textarea>
      <p class="hint">${hint}</p>
      <p class="hint">${goes} It goes to ${esc(b.email)} from bookings@infint.co.za and a copy comes to you. Nothing is sent until you press the button.</p>
      <button type="submit" class="btn ${action}">Confirm and send ${action === "accept" ? "acceptance" : "decline"}</button>
    </form>
    <p class="switch">Wrong button? <a href="/api/booking-response?t=${esc(token)}&a=${other}">${ACTIONS[other]} instead</a></p>`;
}

function doneBody(b, action, at, earlier) {
  const what = action === "accept" ? "accepted" : action === "decline" ? "declined" : "answered";
  const when = at ? " on " + new Date(at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Johannesburg" }) : "";
  return `
    <p class="eyebrow">Booking enquiry</p>
    <h1>Done<span>.</span></h1>
    <p class="lead">${earlier
      ? `This booking was already ${what}${when}. Nothing new was sent.`
      : `The booking is ${what}. The email went to ${esc(b.name)} (${esc(b.email)}) and a copy is on its way to your inbox.`}</p>
    ${bookingTable(b)}
    <p class="switch">To follow up, reply to ${esc(firstName(b))} from your inbox.</p>`;
}

function badLinkBody(reason) {
  return reason === "expired"
    ? `<h1>This link has expired<span>.</span></h1><p class="lead">Accept and Decline links work for 30 days. Reply to the client from the enquiry email instead.</p>`
    : `<h1>This link doesn't work<span>.</span></h1><p class="lead">It may have been cut short when it was copied. Open it straight from the enquiry email, or reply to the client from your inbox.</p>`;
}

function page(body, status = 200) {
  const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><meta name="referrer" content="no-referrer">
<title>Booking · Infint</title>
<link rel="icon" href="/assets/icons/favicon.ico" sizes="any">
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{--ink:#0E1115;--bone:#F5F5F3;--amber:#FFA000;--mute:#5b5f66;--line:#e4e4e0}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bone);color:var(--ink);font:16px/1.55 Inter,Arial,sans-serif}
  header{background:var(--ink);padding:18px 20px}
  header a{color:#fff;text-decoration:none;font:italic 800 1.4rem Archivo,Arial,sans-serif;letter-spacing:.02em}
  main{max-width:640px;margin:0 auto;padding:36px 20px 60px}
  .eyebrow{margin:0 0 6px;font-size:.78rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--mute)}
  h1{margin:0 0 22px;font:800 clamp(2rem,7vw,2.8rem)/1.05 Archivo,Arial,sans-serif;letter-spacing:-.02em}
  h1 span{color:var(--amber)}
  .lead{font-size:1.05rem;margin:0 0 22px}
  table{width:100%;border-collapse:collapse;background:#fff;margin:0 0 26px}
  td{padding:11px 14px;border-bottom:1px solid var(--line);vertical-align:top;font-size:.95rem}
  td:first-child{color:var(--mute);width:38%}
  label{display:block;font-size:.78rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px}
  textarea{width:100%;padding:12px;border:1px solid #cfcfca;background:#fff;font:inherit;resize:vertical}
  textarea:focus{outline:2px solid var(--amber);outline-offset:1px}
  .hint{color:var(--mute);font-size:.9rem;margin:8px 0}
  .btn{margin-top:14px;border:0;padding:15px 26px;font:600 .9rem Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;width:100%}
  .btn.accept{background:var(--amber);color:var(--ink)}
  .btn.decline{background:var(--ink);color:#fff}
  .btn:disabled{opacity:.6;cursor:default}
  .switch{margin-top:22px;font-size:.92rem;color:var(--mute)}
  .switch a{color:var(--ink)}
</style>
</head><body>
<header><a href="/">INFINT</a></header>
<main>${body}</main>
<script>document.querySelector("form")?.addEventListener("submit",e=>{const b=e.target.querySelector("button");b.disabled=true;b.textContent="Sending…";});</script>
</body></html>`;
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex" }
  });
}
