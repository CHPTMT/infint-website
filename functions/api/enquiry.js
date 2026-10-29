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

  // Hidden "company" field: real visitors never fill it, spam bots usually do.
  if (clean(data.company)) return json({ ok: true });
  if (!env.RESEND_API_KEY) return json({ ok: false, error: "Email not configured" }, 500);

  return data.kind === "booking" ? booking(data, request, env) : contact(data, env);
}

async function contact(data, env) {
  const name = clean(data.name, 120);
  const message = clean(data.message);
  const email = clean(data.email, 200);
  if (!name || !message) return json({ ok: false, error: "Missing name or message" }, 400);

  // The message already holds the name and contact details, so nothing is appended.
  const msg = {
    from: env.FROM_INFO || SENDERS.contact,
    to: notifyTo(env, "contact"),
    subject: clean(data.subject, 150) || "New message: Infint site",
    text: message
  };
  if (isEmail(email)) msg.reply_to = email;
  const res = await sendEmail(env, msg);
  if (!res.ok) return json({ ok: false, error: "Email provider error" }, 502);

  // Copy to the visitor so they know it arrived. If this one fails the message still reached Tshedza.
  if (!isEmail(email)) return json({ ok: true, acknowledged: false });
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

async function booking(data, request, env) {
  const b = readBooking(data);
  const bad = validateBooking(b);
  if (bad.length) return json({ ok: false, error: "Check the highlighted fields", fields: bad }, 400);

  const shoot = serviceName(b.service);
  const blocks = [
    { heading: "New booking enquiry" },
    { rows: summaryRows(b) }
  ];

  if (env.BOOKING_SECRET) {
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
    replyTo: b.email,
    subject: "Booking enquiry: " + shoot + ", " + niceDate(b) + " (" + b.name + ")",
    blocks
  });
  const res = await sendEmail(env, toMe);
  if (!res.ok) return json({ ok: false, error: "Email provider error" }, 502);

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
