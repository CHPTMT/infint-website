# HANDOVER.md: INFINT website

## Latest handover

**From:** Claude Code  **To:** Claude chat
**Date:** 27 October 2026

**Three branches, three sites (all in the Cloudflare Pages project `infint`):**

| Branch | Site | What it is for |
|---|---|---|
| `main` | https://infint.co.za | The live site. Only merge into it when Tshedza says so. |
| `preview` | https://preview.infint.pages.dev | Small changes to the current design, and the booking Accept and Decline flow. Folder: `C:\Users\tshed\Pictures\INF JPG\infint-website`. |
| `redesign` | https://redesign.infint.pages.dev | The new "after dark" redesign. Folder: `C:\Users\tshed\Pictures\INF JPG\infint-redesign`. Push only to `origin redesign`; never touch `main` or `preview` from here. |

**State:**
- `main` (live): new contact details, tab title "Infint", tab icons. Nothing pending.
- `preview`: booking Accept and Decline (commit 7472e37), waiting for Tshedza to add `BOOKING_SECRET` (and `RESEND_API_KEY`, `NOTIFY_EMAIL` for Preview) in Cloudflare and test. Banking details for the acceptance email are still a placeholder in `CONFIG.booking.payment`.
- `redesign`: this round of his feedback is done and pushed (below). It branched from `main` at 690f813, so it does **not** have the booking Accept and Decline work. Before the redesign goes live, merge `preview` (or `main`, once the bookings are live) into `redesign` and resolve `js/app.js` (booking form validation and success screen), `js/content.js` (`CONFIG.booking` gets `replyHours` and `payment`, plus the `globalThis.INFINT_CONFIG` line the functions need) and `functions/`.

**Redesign feedback round 1, done on `redesign`:**
1. Photos vanishing or flickering on phones (top right of the 2-column grids, with a faded "SELECTED · 010" caption). Cause: the grids used CSS multi-column layout with every tile on its own GPU layer and animated; WebKit paints transformed items at the top of a later column wrongly. The touch "lift" also moved the very element its observer measured, so it could flip on and off. Fix: `layoutMasonry()` builds real flex columns, the forced layers are gone, and the lift moves an inner `.tile-in`. Tested with iPhone and Pixel emulation in Chromium, scrolling down and up. Real iOS Safari (WebKit) could not be run here, so Tshedza should confirm on his phone.
2. No photo counts anywhere (categories, Work page, hero, captions, viewer). The hero stat is now "JHB, Home base".
3. "Matric dance" shows as "Prom" everywhere. Internal ids (`matric`, `matric-01.jpg`) unchanged.
4. Large faded footer wordmark removed.
5. Filter pills removed. One burger menu at every width: Work with all categories under it, then Rates, About, Socials, Contact, Book a shoot. Also fixed: the menu used to open only 104 px tall after scrolling (the blurred header trapped it).
6. Fonts: Outfit (thin) for body, most headings and UI; Montserrat Black for big titles, menu links and prices. Archivo and Inter removed. Italic accent words removed. DESIGN.md and CLAUDE.md updated.
7. Starting prices read "From R1 200" (home price list, home rates photo, rates page section headers). Package prices unchanged.
8. Hero slides and the two photo strips pick at random on each page load from curated pools in `HOME.slides` and `HOME.strips` (`js/content.js`). Strip neighbours never share a category.
9. About photo crop moved up (`object-position: 50% 10%`) so his whole head shows.

**Redesign feedback round 2, done on `redesign`:**
1. Photos within each category reordered so frames from the same shoot are spread out. Shoots come from the original file names (camera frame numbers close together); the order is checked against the real grid at 2 to 6 columns, phones first. Result: on phones and at 5 columns no near-identical frames touch in any category. Categories that are mostly one shoot (Fashion is all Silk & Cotton, Sports is mostly one match day, Street is one walk) cannot be fully separated; Street can still have 2 near-identical pairs touching on tablets. Script: `tools/order-photos.js`.
2. "Sports & active" now shows as "Sports".
3. Low-res check: every site photo is 2000 px on the long side (one PDF photo is 1953 px, its original size). The softness came from the code: `srcset` claimed portrait thumbs were 720 px wide (they are about 480), and category and social cards only ever used thumbs. Fixed, and the photos shown biggest (hero, rates teaser) now have 2600 px copies in `assets/hero` (`tools/resize-hero.ps1`). Measured on iPhone (3x), a 1440 px retina laptop (2x) and a 1920 px monitor: every visible photo now gets at least the pixels it is drawn at. PDF photos without a 2600 px original were taken out of the hero pools (they stay in the grid).
4. Opening reel (hero) reverted to the original five photos (fashion-16, matric-11, active-02, event-13, portrait-02), the same on every visit: he did not like the random selection. The photo strips under it still change per visit.
5. `tools/serve.ps1` no longer stops when a browser cancels a download.

**Open questions:**
1. From before: banking details for booking acceptance emails (`CONFIG.booking.payment` on `preview`).

**Next steps:** Tshedza tests https://redesign.infint.pages.dev on his phone: photo grids on iPhone (no blank or flickering photos), photo order on each Work category, sharpness of the hero and cards, the burger menu. Then he sends the next round of feedback. Nothing from the redesign goes to `main` until he says so.

**Brand files (in the repo, use these, don't recreate the logo):**
- `assets/brand/infint-logo-white-on-black.png`: white INFINT wordmark on dark grey #262626, 1080 px square. Tshedza's preferred version.
- `assets/brand/infint-logo-black-on-white.png`: dark wordmark on white, 1080 px square.
- `assets/brand/infint-wordmark-white-transparent.png` and `infint-wordmark-ink-transparent.png`: the wordmark alone, cropped, transparent background (white, and ink #0E1115).
- `assets/brand/infint-qr.png`: his INFINT QR code.
- `assets/icons/`: tab icons cut from the white-on-black logo (favicon.ico, icon-16/32/48/180/192/512.png). Linked in index.html, plus `site.webmanifest` (192 and 512, theme #0E1115).
- In page titles the brand is written "Infint" (his request); the logo itself stays uppercase.

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
- **Form email:** `functions/api/enquiry.js` posts to Resend. Booking enquiries arrive from "INFINT Bookings <bookings@infint.co.za>", contact messages from "INFINT Info <info@infint.co.za>" (set in the code; optional overrides `FROM_BOOKINGS` and `FROM_INFO`). Cloudflare variables (production): `RESEND_API_KEY` (secret), `NOTIFY_EMAIL=infintco@gmail.com`, `BOOKING_SECRET` (secret, needed for the booking buttons). Contact messages no longer repeat the visitor's contact at the bottom. The old `FROM_EMAIL` variable is no longer read. Reply-to is the visitor's email. Hidden "company" field drops bots.
- **Booking flow (on `preview`):** `functions/api/enquiry.js` validates the booking (shoot type, date from today, location, name, phone with 9+ digits, email), emails Tshedza at `NOTIFY_EMAIL` from bookings@ with reply-to the client, one clean summary and Accept and Decline buttons, then emails the client an acknowledgement ("I'll reply within 24 hours"). The buttons open `/api/booking-response`, which shows the booking, a message box and a confirm button. Only the confirm POST sends the acceptance or decline to the client (from bookings@, copy to `NOTIFY_EMAIL`). Links carry the booking itself, signed with HMAC-SHA256 using `BOOKING_SECRET`, and expire after 30 days. No database: a second send is blocked by Resend's Idempotency-Key (24 hours) and a note in Cloudflare's cache (best effort, works on infint.co.za, not on pages.dev). Shared code in `functions/_shared/booking.js`; it reads deposit, terms, services and phone from `CONFIG` (bank details come from the `BANK_DETAILS` secret) in `js/content.js`. Without `BOOKING_SECRET` the enquiry still arrives, just without buttons.
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
- 27 Oct 2026, Claude Code: contact details, tab title and icons live on main; booking Accept and Decline built on preview.
- 27 Oct 2026, Claude Code: redesign feedback rounds 1 and 2 done on the redesign branch (see Latest handover).
