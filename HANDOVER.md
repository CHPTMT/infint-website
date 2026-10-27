# HANDOVER.md: INFINT website

## Latest handover

**From:** Claude chat (browser and PC automation)  **To:** Claude Code
**Date:** 27 October 2026

**State:** Everything is live and working. Nothing is pending on `main`. The `preview` branch exists and matches `main`. Latest change: new addresses tshedza@, bookings@ and info@infint.co.za (all forward to infintco@gmail.com) and form emails sent as "INFINT Bookings" and "INFINT Info".

**What Tshedza wants next:** to make changes to the website and see them before they go live. Work on `preview`, push it, send him https://preview.infint.pages.dev to check, and only merge to `main` when he says so.

**Known small issues worth fixing early (ask him first):**
1. Enquiry emails list the visitor's contact twice ("Contact:" in the message body and "Email:" in the footer). `functions/api/enquiry.js` appends phone and email after the message; the contact form already includes them. Remove the duplicate footer lines when the message already contains them.
2. The `preview` branch has no `RESEND_API_KEY` (Cloudflare keeps preview variables separate), so forms on preview fall back to WhatsApp and email. That's fine for checking layout.

**Brand files (in the repo, use these, don't recreate the logo):**
- `assets/brand/infint-logo-white-on-black.png`: white INFINT wordmark on dark grey #262626, 1080 px square. Tshedza's preferred version.
- `assets/brand/infint-logo-black-on-white.png`: dark wordmark on white, 1080 px square.
- `assets/brand/infint-wordmark-white-transparent.png` and `infint-wordmark-ink-transparent.png`: the wordmark alone, cropped, transparent background (white, and ink #0E1115).
- `assets/brand/infint-qr.png`: his INFINT QR code.
- `assets/icons/`: tab icons cut from the white-on-black logo (favicon.ico, icon-16/32/48/180/192/512.png). Linked in index.html, plus `site.webmanifest` (192 and 512, theme #0E1115).
- In page titles the brand is written "Infint" (his request); the logo itself stays uppercase.

**Pending prompts from Tshedza (from the chat, 27 Oct):**
1. Tab title "Infint" and link the icons in `assets/icons`.
2. Contact details: phone and WhatsApp both 073 296 5528 (+27 73 296 5528, wa.me/27732965528), remove 066 332 4581 everywhere. Site email becomes info@infint.co.za (main) and tshedza@infint.co.za (direct); booking fallback bookings@. Gmail stays only as NOTIFY_EMAIL.
3. Booking flow with Accept and Decline: client acknowledgement email, signed (HMAC, BOOKING_SECRET) accept/decline links that open a confirm page, confirmation or decline email to the client from bookings@.

**Open questions:** none.

---

## Accounts and services (all under tshedzatt34@gmail.com unless noted)

| Service | What it does | Plan and cost |
|---|---|---|
| HostAfrica | Registrar for infint.co.za | R49 first year (paid 27 Oct 2026). Auto-renew ON, renews 27 Oct 2027 at about R208, which looks like the domain (about R109) plus the optional R99 "Domain Warranty & Privacy" add-on. Tshedza decides on the add-on |
| Cloudflare | DNS, hosting (Pages project `infint`), SSL, email forwarding | Free |
| GitHub | Code, repo `CHPTMT/infint-website` (public) | Free |
| Resend | Sends form enquiries from bookings@ and info@infint.co.za | Free, 3,000 emails a month, 100 a day |

Total running cost: about R208 a year, or about R109 without the add-on.

## Live setup

- **Domain:** infint.co.za, registered at HostAfrica, nameservers `bella.ns.cloudflare.com` and `guy.ns.cloudflare.com`.
- **Hosting:** Cloudflare Pages project `infint`, connected to GitHub `main`. Domains: infint.co.za, www.infint.co.za, infint.pages.dev. Build: framework None, no build command, output `/`.
- **SSL:** Cloudflare Universal SSL, issued by Google Trust Services, renews automatically. http redirects to https.
- **Form email:** `functions/api/enquiry.js` posts to Resend. Booking enquiries arrive from "INFINT Bookings <bookings@infint.co.za>", contact messages from "INFINT Info <info@infint.co.za>" (set in the code; optional overrides `FROM_BOOKINGS` and `FROM_INFO`). Cloudflare variables (production): `RESEND_API_KEY` (secret), `NOTIFY_EMAIL=infintco@gmail.com`. The old `FROM_EMAIL` variable is no longer read. Reply-to is the visitor's email. Hidden "company" field drops bots.
- **Resend domain:** infint.co.za verified (DKIM TXT `resend._domainkey`, CNAMEs `rsend` and `send`, DMARC `_dmarc` `v=DMARC1; p=none;`, all DNS only in Cloudflare).
- **Inbox:** Cloudflare Email Routing forwards tshedza@, bookings@, info@ and hello@infint.co.za to infintco@gmail.com. Tshedza must click Cloudflare's verification email in infintco@gmail.com once for this to start working. Optional later: Gmail "Send mail as" for any of these through smtp.resend.com port 465, user `resend`, password a Resend API key.
- **DNS records in Cloudflare:** CNAME `@` and `www` to infint.pages.dev (proxied), the Resend records above, and the Email Routing MX/TXT records Cloudflare added.

## History (how it got here)

1. **Design phase (Aug to Oct 2026):** built as a single-file site through many rounds in Claude chat. Tshedza's design decisions that stand: amber accent from his logo, Archivo/Inter/Montserrat, no lines beside headings, About photo black and white with higher contrast, About text in Montserrat Bold and black, "what i've shot" heading, no fake testimonials, no "Hours" row on Contact, no long dashes anywhere, smooth page and button animations.
2. **Simplified (26 Oct):** client galleries, admin page, PIN-protected galleries and the Renda photos were removed on purpose. The goal is a clean portfolio with booking.
3. **Split into files and rebuilt the portfolio (26 to 27 Oct):** 187 photos from his sorted folders (`Website Commits`) plus 40 new ones extracted from the 2026 portfolio PDF (duplicates removed by image matching), 227 in total. Categories: Events 69, Portraits 33 (includes graduation and maternity), Matric dance 16, Sports & active 48, Fashion & editorial 20, Street 18, Details 23. Each category shuffled so similar frames don't sit together. Homepage header is `fashion-01`.
4. **Hosting chosen:** Cloudflare Pages over Vercel (Vercel's free plan bans commercial use). No database: photos are static files. Railway was suggested by a friend but isn't needed; Resend does the email.
5. **Went live (27 Oct):** GitHub repo created, Git installed on his PC, Cloudflare connected. Cloudflare couldn't clone the private repo ("Repository not found") even with correct app access, so the repo was made public with Tshedza's approval. Nothing secret is in it.
6. **Domain (27 Oct):** an earlier HostAfrica order had been wrongly set up as a transfer of an unregistered name and sat pending for three months. HostAfrica support (ticket #5019517) fixed it and registered infint.co.za. Nameservers moved to Cloudflare, custom domains attached, Resend verified, Email Routing set up, and test enquiries confirmed arriving.

## His PC

- Repo folder: `C:\Users\tshed\Pictures\INF JPG\infint-website`
- Photo originals: `C:\Users\tshed\Pictures\INF JPG\Website Commits\` (folders: Event, Baby Shower, Sports + Active, Fashion, Potrait, Studio, Maternity, ND (matric dance), Street, Details, Engagement, From Portfolio 2026)
- Older site versions (ignore): `C:\Users\tshed\Pictures\INF JPG\_gallery_export\`
- No Python or Node installed. Git is installed. Use `tools\serve.ps1` for local preview.

## Business facts used on the site

- Tshedza Tshiololi, INFINT, Johannesburg (Braamfontein for travel distance).
- Phone and WhatsApp: 073 296 5528 (+27 73 296 5528, wa.me/27732965528). The old 066 332 4581 is no longer used.
- Email on the site: info@infint.co.za (main: footer, general queries, contact form email fallback), tshedza@infint.co.za (direct, Contact page), bookings@infint.co.za (booking form email fallback). All forward to infintco@gmail.com, which appears only as `NOTIFY_EMAIL`. Set in `CONFIG.contact` in `js/content.js`.
- Instagram and TikTok @infint_co, YouTube @tshedza_tt, linktr.ee/tshedzatt.
- Rates in `js/content.js` match his 2026 rate cards (graduation R1,200 / R1,700 / R2,400; short shoots R1,200 to R2,500; day rate R3,000 for 2 hours to R9,000 for 8 hours, R1,000 per extra hour, max 12 hours).

## Handover log

- 27 Oct 2026, chat to Claude Code: initial handover (this document).
- 27 Oct 2026, chat: added tshedza@, bookings@ and info@infint.co.za forwarding; form emails now sent as "INFINT Bookings" and "INFINT Info".
- 27 Oct 2026, chat: logo files and tab icons added to assets/brand and assets/icons; Claude Code CLI, Node.js and Python installed on his PC; skills impeccable and emil-design-eng plus Playwright MCP set up for this folder. Resend key "gmail-send-as" created for Gmail "Send mail as".
