/*
  Cloudflare Pages Function: POST /api/enquiry
  Receives the booking and contact forms and emails them to Infint through Resend.

  Set these in Cloudflare: Workers & Pages > your project > Settings > Variables and secrets
    RESEND_API_KEY  (secret)  from resend.com > API Keys
    NOTIFY_EMAIL    optional backup copy of every enquiry, e.g. infintco@gmail.com
    NOTIFY_CONTACT  optional, where contact messages go (default info@infint.co.za)
    NOTIFY_BOOKINGS optional, where booking enquiries go (default bookings@infint.co.za)
    BOOKING_SECRET  (secret)  long random string that signs the Accept and Decline links
    BANK_DETAILS    (secret)  bank details for the acceptance email only (see booking-response.js)
    FROM_BOOKINGS   optional, sender for the booking form (default Infint Bookings <bookings@infint.co.za>)
    FROM_INFO       optional, sender for the contact form (default Infint Info <info@infint.co.za>)
  infint.co.za is verified in Resend, so both senders work. Replies go to the visitor.

  Contact: emails Tshedza the message, then sends the visitor a copy if they gave an email.
  Booking: emails Tshedza a summary with Accept and Decline buttons (see booking-response.js),
  then sends the client an acknowledgement.
*/

import {
  SENDERS, SIGN_OFF, json, clean, isEmail, readBooking, validateBooking, summaryRows, serviceName,
  niceDate, firstName, sendEmail, emailFromBlocks, makeToken, notifyTo, bookingFrom, config
} from "../_shared/booking.js";

export async function onRequestPost({ request, env }) {
  let data;
  try { data = await request.json(); } catch { return json({ ok: false, error: "Bad request" }, 400); }

  if (!env.RESEND_API_KEY) return json({ ok: false, error: "Email not configured" }, 500);

  // Hidden "company" field: people never see it, spam bots usually fill it. Browser autofill once filled it
  // for real visitors and their enquiries were silently dropped, so it no longer drops anything: the enquiry
  // still reaches Tshedza, marked "Possible spam", and no copy goes to the sender.
  const spam = !!clean(data.company);
  return data.kind === "booking" ? booking(data, request, env, spam) : contact(data, env, spam);
}

const SPAM_TAG = "Possible spam: ";

// Sends the email to Tshedza. If Resend has a hiccup it tries up to 3 times; the same Idempotency-Key
// means a retry can never send the same email twice.
async function sendToMe(env, msg) {
  const key = crypto.randomUUID();
  for (let i = 0; i < 3; i++) {
    if (i) await new Promise(r => setTimeout(r, 1000 * i));
    try {
      const res = await sendEmail(env, msg, key);
      if (res.ok || (res.status < 500 && res.status !== 429)) return res;
    } catch { /* network error: try again */ }
  }
  return { ok: false };
}

async function contact(data, env, spam) {
  const name = clean(data.name, 120);
  const message = clean(data.message);
  const email = clean(data.email, 200);
  // A real visitor with a missing name or message is told to fill it in. A suspected bot is never told
  // anything: whatever it sent goes to Tshedza.
  if ((!name || !message) && !spam) return json({ ok: false, error: "Missing name or message" }, 400);

  // The message already holds the name and contact details, so nothing is appended.
  const msg = {
    from: env.FROM_INFO || SENDERS.contact,
    to: notifyTo(env, "contact"),
    subject: (spam ? SPAM_TAG : "") + (clean(data.subject, 150) || "New message: Infint site"),
    text: message || ("Name: " + (name || "-") + "\nEmail: " + (email || "-") + "\n(No message)")
  };
  if (isEmail(email)) msg.reply_to = email;
  const res = await sendToMe(env, msg);
  if (!res.ok) return json({ ok: false, error: "Email provider error" }, 502);

  // Copy to the visitor so they know it arrived. If this one fails the message still reached Tshedza.
  if (spam || !isEmail(email)) return json({ ok: true, acknowledged: false });
  const hours = config().booking.replyHours || 24;
  const ack = emailFromBlocks({
    from: env.FROM_INFO || SENDERS.contact,
    to: email,
    subject: "I've got your message: Infint",
    blocks: [
      "Hi " + firstName({ name }) + ",",
      "Thanks for your message. I'll reply within " + hours + " hours.",
      { heading: "What you sent" },
      message,
      "If you want to add anything, just reply to this email.",
      SIGN_OFF + "\n" + config().contact.phone
    ]
  });
  const ackRes = await sendEmail(env, ack).catch(() => null);
  return json({ ok: true, acknowledged: !!(ackRes && ackRes.ok) });
}

async function booking(data, request, env, spam) {
  const b = readBooking(data);
  const bad = validateBooking(b);
  // A real visitor is shown which fields to fix. A suspected bot is never told anything: whatever it sent goes to Tshedza.
  if (bad.length && !spam) return json({ ok: false, error: "Check the highlighted fields", fields: bad }, 400);

  const shoot = serviceName(b.service);
  const rows = summaryRows(b);
  const blocks = [
    { heading: "New booking enquiry" },
    rows.length ? { rows } : "(No details were filled in.)"
  ];

  if (bad.length) {
    blocks.push("This one came in with missing or invalid details (" + bad.join(", ") + "), so it has no Accept or Decline buttons." +
      (isEmail(b.email) ? " Reply to this email to write to them." : ""));
  } else if (env.BOOKING_SECRET) {
    const token = await makeToken(b, env.BOOKING_SECRET);
    const base = new URL(request.url).origin + "/api/booking-response?t=" + token + "&a=";
    blocks.push(
      "Accept or decline below. Each button opens a page where you can add a message before anything is sent to " + b.name + ". The buttons work for 30 days.",
      { buttons: [["Accept", base + "accept", "#FFA000"], ["Decline", base + "decline", "#0E1115"]] },
      "Or just reply to this email to write to " + b.name + " directly."
    );
  } else {
    blocks.push("Accept and Decline buttons are off because BOOKING_SECRET is not set in Cloudflare. Reply to this email to answer " + b.name + ".");
  }

  const toMe = emailFromBlocks({
    from: bookingFrom(env),
    to: notifyTo(env),
    replyTo: isEmail(b.email) ? b.email : undefined,
    subject: (spam ? SPAM_TAG : "") + "Booking enquiry: " + shoot + ", " + (niceDate(b) || "no date") + " (" + (b.name || "no name") + ")",
    blocks
  });
  const res = await sendToMe(env, toMe);
  if (!res.ok) return json({ ok: false, error: "Email provider error" }, 502);
  if (spam) return json({ ok: true, acknowledged: false });

  // Acknowledgement to the client. If this one fails the enquiry still reached Tshedza, so it still counts as sent.
  const hours = config().booking.replyHours || 24;
  const ack = emailFromBlocks({
    from: bookingFrom(env),
    to: b.email,
    subject: "I've got your booking enquiry: " + shoot + ", " + niceDate(b),
    blocks: [
      "Hi " + firstName(b) + ",",
      "Thanks for your booking enquiry. I'll reply within " + hours + " hours to let you know if I'm available and to send a quote.",
      { heading: "What you sent" },
      { rows: summaryRows(b) },
      "If anything here is wrong, reply to this email and I'll update it. Please don't pay anything yet. I'll send payment details only once I've confirmed I'm available.",
      SIGN_OFF + "\n" + config().contact.phone
    ]
  });
  const ackRes = await sendEmail(env, ack).catch(() => null);
  return json({ ok: true, acknowledged: !!(ackRes && ackRes.ok) });
}

export async function onRequest() {
  return json({ ok: false, error: "Use POST" }, 405);
}
