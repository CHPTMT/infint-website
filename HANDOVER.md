# HANDOVER.md: INFINT website

## Latest handover

**From:** Claude Code  **To:** Claude chat
**Date:** 28 October 2026

**The redesign is live on https://infint.co.za** (merge commit 9a1efc5 on `main`, with booking Accept and Decline included).

### For the Claude chat (Desktop Commander): what Claude Code could not do

Claude Code has no access to Tshedza's Chrome (the Claude in Chrome extension is not connected), no Cloudflare login or CLI (wrangler is not installed), and cannot read his inbox. Please do these in his browser, in this order. Never print, paste or screenshot a secret's value; names only. Tshedza types any secret values himself.

1. **Cloudflare Production variables.** Cloudflare dashboard, Workers & Pages, project `infint`, Settings, Variables and secrets, environment **Production**. Report which of these names exist: `RESEND_API_KEY`, `NOTIFY_EMAIL`, `BOOKING_SECRET`, `BANK_DETAILS`. `RESEND_API_KEY` is already proven to work (the live forms sent email). If any of the other three are missing, help him add them:
   - `NOTIFY_EMAIL`: plain text, `infintco@gmail.com` (or wherever he wants enquiries). Without it, enquiries still go to infintco@gmail.com.
   - `BOOKING_SECRET` (secret): any long random string. Without it, the booking email to him has no Accept and Decline buttons.
   - `BANK_DETAILS` (secret): his bank details as he wants clients to see them, one item per line. Only used in the acceptance email; without it that email leaves them out.
   - A Turnstile secret is **not** needed: Turnstile (spam check) is not built into the site.
   After adding or changing a variable, Cloudflare only uses it on the next deployment: Deployments tab, latest Production deployment, "Retry deployment".
2. **Preview variables (optional).** The forms on https://preview.infint.pages.dev cannot send email because the **Preview** environment has no variables (the API answers "Email not configured" and visitors get the WhatsApp and email buttons instead). If he wants to test forms on preview before going live, add the same four names under the Preview environment.
3. **Inbox check (infintco@gmail.com).** On 28 October Claude Code sent through the live site: a contact message ("Test from Claude (go-live check)") and a booking ("Test from Claude", Portraits & headshots, Saturday 28 November). Expect three emails: the contact message, the booking enquiry, and the client acknowledgement "I've got your booking enquiry". Check spam too. If the booking email has Accept and Decline buttons, `BOOKING_SECRET` is set. Tshedza presses **Accept** himself; the acceptance email goes to infintco@gmail.com and shows whether `BANK_DETAILS` is set.
4. **www address (optional).** https://www.infint.co.za shows the site directly instead of forwarding to https://infint.co.za. It works, and search engines are pointed at infint.co.za, but a forward is tidier: Cloudflare, domain infint.co.za, Rules, Redirect Rules, "Redirect from WWW to root" template (301, keep the path and query). Ask him first.
5. **Google Search Console (optional).** The site now has real page addresses and a sitemap. If he wants Google to pick them up faster: add the property infint.co.za and submit `https://infint.co.za/sitemap.xml`. Ask him first.
6. **Phone check.** Real iPhone Safari was never tested (only emulation). He should scroll the Work categories and the Socials page on his phone and report anything odd.
7. **Lighthouse scores** were never run. If he wants them: Chrome DevTools, Lighthouse, mobile and desktop, for https://infint.co.za/ and https://infint.co.za/work.

**Waiting on `preview`, not live yet:** "Infint" (not "INFINT") in all text, as he asked: site text, page description, photo descriptions, footer, booking form, email sender names ("Infint Bookings", "Infint Info"), email subjects ("Your Infint booking ..."), the email sign-off ("Tshedza, Infint") and the Accept and Decline page. Also no grey text in the emails or on the Accept and Decline page. Goes live when Tshedza says "push it live" (Claude Code merges `preview` into `main`).

**Left for Claude Code, not urgent:** the WebP photo copies (`tools/make-webp.js`, output in `infint-redesign\assets\w`) are made but the site does not use them yet; wiring them in would make pages lighter.

**Rollback point:** `690f813` (the old design, `main` before the merge). If the live site breaks, ask Tshedza first, then undo the merge with:
`git checkout main && git revert -m 1 9a1efc5 && git push origin main`

**Branches now:** `main`, `preview` and `redesign` all point at the same commit. `preview` (https://preview.infint.pages.dev, folder `C:\Users\tshed\Pictures\INF JPG\infint-website`) is again the place for small changes: work there, Tshedza checks it, then merge into `main` when he says "push it live". `redesign` and its folder `infint-redesign` are no longer needed for new work.

**Final round before going live (28 October):**
1. No grey text: body and supporting text is white (`--text`) or bone (`--mute` is now `#F5F5F3`), Outfit at 400 or 500, a size up everywhere (home intro, rates descriptions, package details and notes, labels, captions, form hints, footer). Checked at 390, 1440 and 1920 px.
2. Footer links bigger, in the body font, weight and colour.
3. About: "Infint" instead of "INFINT" in the text (the logo image is unchanged), and a new "People first." section in his voice (`CONFIG.aboutMe` in `js/content.js`).
4. Socials page and home "Follow along": real profile screenshots (Instagram @infint_co, TikTok @infint_co, YouTube @tshedza_tt "Infint Co") in phone frames, each with an Open button; the phone opens the profile too. Files in `assets/socials` (PNG and WebP, 1000 px tall), made by `node tools/make-socials.js` from `Website Commits\socials`. The Instagram "Followed by" row is blurred (other people). **Refresh these screenshots every few months** (steps in ASSETS.md).
5. Real page paths: `/work`, `/work?f=fashion`, `/rates`, `/about`, `/book`, `/contact`, `/socials`. Old `#/` links are swapped for the path in the browser. Cloudflare serves `index.html` for any path without a file (there is no `404.html`; keep it that way). New `robots.txt` and `sitemap.xml`. `tools/serve.ps1` does the same locally.
6. Unfinished WebP work (`tools/make-webp.js`) is committed, but its output `assets/w/` is not used by the site and is kept out of git.

**Checked after going live:** every page loads on infint.co.za and www.infint.co.za (www serves the site directly; the canonical link points search engines at infint.co.za), old `#/` links redirect, menu categories work, tab titles and icons show, robots.txt and sitemap.xml are real files, no console errors or broken files. A test contact message and a test booking (to infintco@gmail.com) returned success, and the booking acknowledgement went out.

**Cloudflare Production variables:** could not be read directly (no browser or CLI access). `RESEND_API_KEY` is confirmed by the live API. Not confirmed: `NOTIFY_EMAIL` (falls back to infintco@gmail.com), `BOOKING_SECRET` (without it the booking email has no Accept and Decline buttons), `BANK_DETAILS` (without it the acceptance email leaves the bank details out). There is no Turnstile in the code, so no Turnstile secret is needed yet.

**Open questions:**
1. Turnstile (spam check on the forms) is not built. Add it only if spam becomes a problem.

**Next steps:** the chat works through the list above; Claude Code puts the "Infint" change live when Tshedza says so.

---

### Earlier: redesign rounds 1 and 2 (now live)

**Redesign feedback round 1:**
1. Photos vanishing or flickering on phones (top right of the 2-column grids, with a faded "SELECTED · 010" caption). Cause: the grids used CSS multi-column layout with every tile on its own GPU layer and animated; WebKit paints transformed items at the top of a later column wrongly. The touch "lift" also moved the very element its observer measured, so it could flip on and off. Fix: `layoutMasonry()` builds real flex columns, the forced layers are gone, and the lift moves an inner `.tile-in`. Tested with iPhone and Pixel emulation in Chromium, scrolling down and up. Real iOS Safari (WebKit) could not be run here, so Tshedza should confirm on his phone.
2. No photo counts anywhere (categories, Work page, hero, captions, viewer). The hero stat is now "JHB, Home base".
3. "Matric dance" shows as "Prom" everywhere. Internal ids (`matric`, `matric-01.jpg`) unchanged.
4. Large faded footer wordmark removed.
5. Filter pills removed. One burger menu at every width: Work with all categories under it, then Rates, About, Socials, Contact, Book a shoot. Also fixed: the menu used to open only 104 px tall after scrolling (the blurred header trapped it).
6. Fonts: Outfit (thin) for body, most headings and UI; Montserrat Black for big titles, menu links and prices. Archivo and Inter removed. Italic accent words removed. DESIGN.md and CLAUDE.md updated.
7. Starting prices read "From R1 200" (home price list, home rates photo, rates page section headers). Package prices unchanged.
8. Hero slides and the two photo strips pick at random on each page load from curated pools in `HOME.slides` and `HOME.strips` (`js/content.js`). Strip neighbours never share a category.
9. About photo crop moved up (`object-position: 50% 10%`) so his whole head shows.

**Redesign feedback round 2:**
1. Photos within each category reordered so frames from the same shoot are spread out. Shoots come from the original file names (camera frame numbers close together); the order is checked against the real grid at 2 to 6 columns, phones first. Result: on phones and at 5 columns no near-identical frames touch in any category. Categories that are mostly one shoot (Fashion is all Silk & Cotton, Sports is mostly one match day, Street is one walk) cannot be fully separated; Street can still have 2 near-identical pairs touching on tablets. Script: `tools/order-photos.js`.
2. "Sports & active" now shows as "Sports".
3. Low-res check: every site photo is 2000 px on the long side (one PDF photo is 1953 px, its original size). The softness came from the code: `srcset` claimed portrait thumbs were 720 px wide (they are about 480), and category and social cards only ever used thumbs. Fixed, and the photos shown biggest (hero, rates teaser) now have 2600 px copies in `assets/hero` (`tools/resize-hero.ps1`). Measured on iPhone (3x), a 1440 px retina laptop (2x) and a 1920 px monitor: every visible photo now gets at least the pixels it is drawn at. PDF photos without a 2600 px original were taken out of the hero pools (they stay in the grid).
4. Opening reel (hero) reverted to the original five photos (fashion-16, matric-11, active-02, event-13, portrait-02), the same on every visit: he did not like the random selection. The photo strips under it still change per visit.
5. `tools/serve.ps1` no longer stops when a browser cancels a download.

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
