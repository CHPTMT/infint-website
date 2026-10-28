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

  After an Accept, Tshedza also gets a "Booked" email with an Add to Google Calendar button and a calendar file
  (alerts 1 week and 2 days before), made in _shared/calendar.js. The page after Accept has the same two buttons.

  Bank details come only from the BANK_DETAILS secret in Cloudflare and only go into the acceptance
  email, so nobody can pay before Tshedza confirms the date. They are never in the repo or on the site.
*/

import {
  SIGN_OFF, esc, clean, summaryRows, serviceName, niceDate, firstName, sendEmail,
  emailFromBlocks, readToken, notifyTo, bookingFrom, config
} from "../_shared/booking.js";
import { googleCalendarUrl, icsFor, icsFileName } from "../_shared/calendar.js";

const ACTIONS = { accept: "Accept", decline: "Decline" };
const stateKey = id => "https://booking-state.infint.co.za/" + encodeURIComponent(id);

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const token = url.searchParams.get("t");
  const action = ACTIONS[url.searchParams.get("a")] ? url.searchParams.get("a") : "accept";
  const t = await readToken(token, env.BOOKING_SECRET);
  if (!t.ok) return page(badLinkBody(t.reason), 400);

  const done = await getState(t.id);
  if (done) return page(doneBody(t.b, done.action, done.at, true, t.id));

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
  if (done) return page(doneBody(t.b, done.action, done.at, true, t.id));

  const b = t.b;
  const msg = emailFromBlocks({
    from: bookingFrom(env),
    to: b.email,
    bcc: notifyTo(env),
    subject: action === "accept"
      ? "Your Infint booking: " + serviceName(b.service) + ", " + niceDate(b)
      : "Your Infint booking enquiry for " + niceDate(b),
    blocks: action === "accept" ? acceptBlocks(b, message, env.BANK_DETAILS) : declineBlocks(b, message)
  });

  const res = await sendEmail(env, msg, "booking-" + t.id);
  if (res.status === 409) return page(doneBody(b, null, null, true, t.id));
  if (!res.ok) return page(`<h1>That didn't send</h1><p>Resend returned an error (${res.status}). Nothing reached ${esc(b.name)}. Go back and try again, or reply to them from your inbox.</p>`, 502);

  await putState(t.id, { action, at: new Date().toISOString() }, t.exp);
  // Best effort: if this one fails, the client still has their email and the page below has the same calendar buttons
  if (action === "accept") await sendEmail(env, calendarEmail(b, t.id, env), "calendar-" + t.id).catch(() => null);
  return page(doneBody(b, action, null, false, t.id));
}

/* For Tshedza: the accepted shoot, ready to add to his calendar */
function calendarEmail(b, id, env) {
  const msg = emailFromBlocks({
    from: bookingFrom(env),
    to: notifyTo(env),
    subject: "Booked: " + serviceName(b.service) + ", " + niceDate(b) + " (" + b.name + ")",
    blocks: [
      "You accepted " + b.name + "'s booking. Add it to your calendar:",
      { buttons: [["Add to Google Calendar", googleCalendarUrl(b), "#FFA000"]] },
      "The attached file, " + icsFileName(b) + ", has alerts 1 week and 2 days before the shoot. Open it on your phone or computer to add the shoot with both alerts.",
      { rows: summaryRows(b) }
    ]
  });
  const bytes = new TextEncoder().encode(icsFor(b, id));
  msg.attachments = [{ filename: icsFileName(b), content: btoa(String.fromCharCode(...bytes)), content_type: "text/calendar" }];
  return msg;
}

export async function onRequest() {
  return new Response("Method not allowed", { status: 405 });
}

/* Client emails */

function acceptBlocks(b, message, bankDetails) {
  const c = config(), pct = c.booking.depositPct || 50;
  const rows = summaryRows(b, { withContact: false }).filter(([k]) => k !== "Notes");
  const bank = String(bankDetails || "").replace(/\r\n?/g, "\n").trim();
  // Payment reference: the client's first and last name, as they entered it on the booking form
  const reference = clean(b.name, 120) || "your first and last name";
  const blocks = [
    "Hi " + firstName(b) + ",",
    "Good news, I'm available on " + niceDate(b) + " and I'd be glad to do your shoot. Here's what I have:",
    { rows }
  ];
  if (message) blocks.push(message);
  blocks.push(
    { heading: "Next steps" },
    { list: [
      "A " + pct + "% deposit (half the quoted price) secures your booking. Your date is held once the deposit reflects.",
      "The balance is due on the day of the shoot.",
      "Use your first and last name as the payment reference: " + reference,
      "After paying, send me your proof of payment: reply to this email with it attached, or WhatsApp it to " + c.contact.phone + ".",
      "The day before the shoot, I'll send you a short shot list so we're both clear on timing."
    ] },
    { heading: "Payment details" },
    bank || "I'll send payment details separately.",
    "The deposit is non-refundable, but you can move it to a new date once, up to 14 days before the shoot.",
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
    "If another date works for you, reply to this email or send a new enquiry at https://infint.co.za/book and I'll check it for you.",
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

function doneBody(b, action, at, earlier, id) {
  const what = action === "accept" ? "accepted" : action === "decline" ? "declined" : "answered";
  const when = at ? " on " + new Date(at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Johannesburg" }) : "";
  return `
    <p class="eyebrow">Booking enquiry</p>
    <h1>Done<span>.</span></h1>
    <p class="lead">${earlier
      ? `This booking was already ${what}${when}. Nothing new was sent.`
      : `The booking is ${what}. The email went to ${esc(b.name)} (${esc(b.email)}) and a copy is on its way to your inbox.`}</p>
    ${action === "accept" && id ? calendarButtons(b, id) : ""}
    ${bookingTable(b)}
    <p class="switch">To follow up, reply to ${esc(firstName(b))} from your inbox.</p>`;
}

function calendarButtons(b, id) {
  const file = "data:text/calendar;charset=utf-8," + encodeURIComponent(icsFor(b, id));
  return `<div class="cal">
      <a class="btn accept" href="${esc(googleCalendarUrl(b))}" target="_blank" rel="noopener">Add to Google Calendar</a>
      <a class="btn decline" href="${file}" download="${esc(icsFileName(b))}">Calendar file with alerts</a>
      <p class="hint">The calendar file has alerts 1 week and 2 days before the shoot. Google's button can't carry alerts.</p>
    </div>`;
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
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/outfit-latin.woff2" crossorigin>
<style>
  @font-face{font-family:Outfit;font-weight:200 600;font-display:swap;src:url(/assets/fonts/outfit-latin.woff2) format("woff2")}
  @font-face{font-family:Montserrat;font-weight:700 900;font-display:swap;src:url(/assets/fonts/montserrat-latin.woff2) format("woff2")}
  :root{--ink:#0E1115;--ink-2:#08090B;--ink-3:#151A20;--text:#FFFFFF;--mute:#F5F5F3;--amber:#FFA000;--line:rgba(255,255,255,.09);--line-2:rgba(255,255,255,.16);color-scheme:dark}
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;color:var(--text);font:16px/1.6 Outfit,system-ui,sans-serif;-webkit-font-smoothing:antialiased;
    background:radial-gradient(70% 40% at 85% 0%,rgba(255,160,0,.14),transparent 70%),var(--ink)}
  header{padding:22px clamp(20px,4vw,48px);border-bottom:1px solid var(--line)}
  header a{display:inline-block}
  header img{display:block;height:22px;width:auto}
  main{max-width:680px;margin:0 auto;padding:clamp(36px,6vw,72px) 20px 72px}
  .eyebrow{margin:0 0 14px;font-size:.72rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--amber)}
  h1{margin:0 0 26px;font:900 clamp(2.2rem,8vw,3.6rem)/.95 Montserrat,system-ui,sans-serif;letter-spacing:-.035em;color:#fff}
  h1 span{color:var(--amber)}
  .lead{font-size:1.18rem;font-weight:400;color:var(--mute);margin:0 0 26px}
  table{width:100%;border-collapse:collapse;margin:0 0 30px;border-top:1px solid var(--line)}
  td{padding:12px 0;border-bottom:1px solid var(--line);vertical-align:top;font-size:.95rem}
  td:first-child{color:var(--mute);width:38%;padding-right:16px}
  td:last-child{color:#fff;overflow-wrap:anywhere}
  label{display:block;font-size:.8rem;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--mute);margin-bottom:10px}
  textarea{width:100%;padding:14px 16px;border:1px solid var(--line-2);border-radius:10px;background:var(--ink-3);color:#fff;font:inherit;resize:vertical;caret-color:var(--amber)}
  textarea:focus{outline:none;border-color:var(--amber);box-shadow:0 0 0 3px rgba(255,160,0,.18)}
  .hint{color:var(--mute);font-size:1rem;margin:10px 0}
  .btn{margin-top:18px;width:100%;min-height:54px;border:1px solid var(--amber);border-radius:999px;padding:0 26px;cursor:pointer;
    font:600 .84rem Outfit,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;transition:transform .14s ease,box-shadow .25s ease}
  .btn:active{transform:scale(.98)}
  .btn.accept{background:var(--amber);color:var(--ink);box-shadow:0 0 34px -10px rgba(255,160,0,.7)}
  .btn.decline{background:transparent;color:#fff;border-color:var(--line-2)}
  .btn:focus-visible{outline:2px solid var(--amber);outline-offset:3px}
  .btn:disabled{opacity:.6;cursor:default}
  a.btn{display:flex;align-items:center;justify-content:center;text-decoration:none}
  .cal{margin:0 0 30px}
  .switch{margin-top:26px;font-size:1rem;color:var(--mute)}
  .switch a{color:#fff;text-decoration:underline;text-decoration-color:var(--amber);text-underline-offset:5px}
</style>
</head><body>
<header><a href="/" aria-label="Infint home"><img src="/assets/brand/infint-wordmark-white-transparent.png" width="867" height="165" alt="Infint"></a></header>
<main>${body}</main>
<script>document.querySelector("form")?.addEventListener("submit",e=>{const b=e.target.querySelector("button");b.disabled=true;b.textContent="Sending…";});</script>
</body></html>`;
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex" }
  });
}
