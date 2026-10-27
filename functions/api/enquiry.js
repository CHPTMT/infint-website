/*
  Cloudflare Pages Function: POST /api/enquiry
  Receives the booking and contact forms and emails them to INFINT through Resend.

  Set these in Cloudflare: Workers & Pages > your project > Settings > Variables and secrets
    RESEND_API_KEY  (secret)  from resend.com > API Keys
    NOTIFY_EMAIL    where enquiries go, e.g. infintco@gmail.com
    FROM_BOOKINGS   optional, sender for the booking form (default INFINT Bookings <bookings@infint.co.za>)
    FROM_INFO       optional, sender for the contact form (default INFINT Info <info@infint.co.za>)
  infint.co.za is verified in Resend, so both senders work. Replies go to the visitor.
*/

const SENDERS = {
  booking: "INFINT Bookings <bookings@infint.co.za>",
  contact: "INFINT Info <info@infint.co.za>"
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const clean = (v, max = 4000) => String(v ?? "").slice(0, max).trim();

export async function onRequestPost({ request, env }) {
  let data;
  try { data = await request.json(); } catch { return json({ ok: false, error: "Bad request" }, 400); }

  // Hidden "company" field: real visitors never fill it, spam bots usually do.
  if (clean(data.company)) return json({ ok: true });

  const name = clean(data.name, 120);
  const message = clean(data.message);
  const email = clean(data.email, 200);
  const phone = clean(data.phone, 40);
  if (!name || !message) return json({ ok: false, error: "Missing name or message" }, 400);
  if (!env.RESEND_API_KEY) return json({ ok: false, error: "Email not configured" }, 500);

  const subject = clean(data.subject, 150) || (data.kind === "booking" ? "New booking enquiry: INFINT" : "New message: INFINT site");
  const text = message + "\n\n" + "Sent from the INFINT website" + (phone ? "\nPhone: " + phone : "") + (email ? "\nEmail: " + email : "");

  const payload = {
    from: data.kind === "booking" ? (env.FROM_BOOKINGS || SENDERS.booking) : (env.FROM_INFO || SENDERS.contact),
    to: [env.NOTIFY_EMAIL || "infintco@gmail.com"],
    subject,
    text
  };
  if (/^\S+@\S+\.\S+$/.test(email)) payload.reply_to = email;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) return json({ ok: false, error: "Email provider error" }, 502);
  return json({ ok: true });
}

export async function onRequest() {
  return json({ ok: false, error: "Use POST" }, 405);
}
