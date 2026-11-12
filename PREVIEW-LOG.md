# PREVIEW-LOG.md

A running log of work in two tracks. Track A goes live on `main`. Track B stays on `preview` until Tshedza says to merge.

## Status, 1 November 2026

The same status section is at the top of this file on `main`, `preview` and `preview-ideas`.

### 1. Links

| Name | URL | What it is for |
|---|---|---|
| Live site | https://infint.co.za | The real site. Updates when `main` is pushed. |
| Live site, www | https://www.infint.co.za | Same site. Shows it directly instead of redirecting to infint.co.za. |
| Preview (small changes) | https://preview.infint.pages.dev | The `preview` branch. Small changes are checked here before they go live. |
| Preview (ideas) | https://preview-ideas.infint.pages.dev | The `preview-ideas` branch: booking bar, phone hero, link preview image. |
| Old redesign preview | https://redesign.infint.pages.dev | The `redesign` branch. Old; everything in it is already live. |
| Pages project address | https://infint.pages.dev | Cloudflare's own address for the live site. |
| Link preview image | https://preview-ideas.infint.pages.dev/assets/og/infint-home.jpg | The new image for links shared on WhatsApp (ideas preview only). |
| Cloudflare Pages project | https://dash.cloudflare.com, then Workers & Pages, then `infint` | Deploys, and the secrets (Settings, Variables and secrets). |
| GitHub repo | https://github.com/CHPTMT/infint-website | All code. Public, so no keys in it. |
| Resend dashboard | https://resend.com/emails | Sent form emails and delivery status. |

### 2. Branches and commits

| Branch | Latest commit | Compared with `main` |
|---|---|---|
| `main` | `df10f41` | The live site. |
| `preview` | `c870ccf` | 2 commits ahead, both only this log file (Track A live check, B4 proposals). No site changes. |
| `preview-ideas` | `866b92d` | 2 commits ahead: the booking bar, phone hero and link preview image (`1d99eec`), plus this log. |
| `redesign` | `faba37b` | Nothing new. 5 commits behind `main`; everything in it is already on `main`. |

### 3. Live now

infint.co.za is on `main` at `df10f41`: the October redesign and email work, plus the 12 new photos (6 portraits, 6 corporate event photos) added on 1 November 2026.

### 4. On a preview and not yet live

- Body text in Work Sans on every device: live on `main` since 1 November 2026 (see "Body font" below).
- `preview-ideas`: bottom bar on phones with Book a shoot and WhatsApp.
- `preview-ideas`: headline and Book a shoot button on the first phone screen, over the hero photo.
- `preview-ideas`: new 1200 x 630 link preview image with the matching tags, and `tools/og-image.html` to remake it.

### 5. Pending work

- Wording changes (B1): waiting for your list of line IDs.
- Gradient motion (B2): waiting for the skills and repo links (B3), to be read first.
- Proposal c, booking emails laid out like a ticket: not built.
- Proposal e, real proof (recent jobs list, Google reviews): not built.
- Proposal f, easier package comparison on phones: not built.
- Proposal g, opening statement and mixed photo block: not built.
- Separate link preview images for each page: later, after b goes live.
- References 8 to 10 (posts.design, deck.gallery, adfolio.design): for later, not reviewed in depth.
- From the last handover, still open: redirect www.infint.co.za to infint.co.za, submit the sitemap in Google Search Console, Turnstile only if spam starts.

### 6. Unfinished or risky

- `preview-ideas` is not merged. It goes live only when you say so; then merge into `main` (and `preview`).
- The link preview image tags point at infint.co.za, so WhatsApp shows no image for it until `preview-ideas` is live.
- 12 photos depend on `C:\Users\tshed\Pictures\INF JPG\Website Imports` (`event-70` to `event-75`, `portrait-34` to `portrait-39`). The site does not need it, but a full rebuild with `tools\resize-photos.ps1` does. Keep the folder.
- Cloudflare variables: Production has `RESEND_API_KEY`, `NOTIFY_EMAIL`, `BOOKING_SECRET` and `BANK_DETAILS` (confirmed 28 October). The Preview environment has none, so forms on any preview fall back to WhatsApp and email. That is expected; nothing to set unless you want forms to send from previews. Confirm `BANK_DETAILS` holds your current FNB details.
- `skills-lock.json` in the project folder is not saved in git. It was there before this work; leave it or tell me what it is for.
- Phone checks still to do: the new photos in Work (Portraits and Events) and the home strips on infint.co.za; on the ideas preview, the hero, the bottom bar, WhatsApp from the bar, the photo viewer and menu covering the bar, and the bar clearing the iPhone home bar; the Work grid and Socials page on your real iPhone (open since October).

### 7. Branches you can delete

- `redesign`: yes. Everything in it is live. It is still open in the `infint-redesign` folder, so that folder can go too. Ask me and I will remove both.
- Keep `main`, `preview` and `preview-ideas`.

---

## Track A: new photos (live on main)

**Date:** 1 November 2026

**Source:** `C:\Users\tshed\Pictures\INF JPG\Website Imports` (8 portrait frames, 17 corporate event frames). Originals not edited or moved.

**Picked (12 of 25):**

| Id | Original | Shape | Why |
|---|---|---|---|
| `portrait-34` | `Portraits\_CHP2875.jpg` | Portrait | Close, eyes closed in the sun |
| `portrait-35` | `Portraits\_CHP2891.jpg` | Portrait | Close, laughing, hands up |
| `portrait-36` | `Portraits\_CHP2894.jpg` | Portrait | Close, hand on head |
| `portrait-37` | `Portraits\_CHP2973.jpg` | Portrait | Wide, seated with the building and palms |
| `portrait-38` | `Portraits\_CHP3140.jpg` | Portrait | From behind, arms up, garden |
| `portrait-39` | `Portraits\_CHP3281.jpg` | Portrait | Wide, railing by the lake |
| `event-70` | `Events\_CHP3612.jpg` | Landscape | Wide group photo |
| `event-71` | `Events\_CHP3606.jpg` | Portrait | Close portrait of a guest |
| `event-72` | `Events\_CHP3701.jpg` | Portrait | Speaker at the podium |
| `event-73` | `Events\_CHP3812.jpg` | Portrait | Candid conversation at a table |
| `event-74` | `Events\_CHP4491.jpg` | Portrait | Guest laughing at dinner |
| `event-75` | `Events\_CHP4641.jpg` | Portrait | Prize handover |

Left out: `_CHP2991` (near copy of 2973), `_CHP3143` (same pose as 3140, flare blows out the frame), and 11 event frames that repeat the ones above (banner shots, more podium and audience frames).

**What changed:**
1. 12 new files each in `assets/thumbs` (720 px long side, quality 80) and `assets/photos` (2000 px, quality 84), made with the same resize code as `tools/resize-photos.ps1` but only for the new ids. The full rebuild was not run; no existing thumbnail or photo file changed.
2. WebP copies for the new photos only (`node tools/make-webp.js` skips files that already exist).
3. 12 entries added to `PHOTOS` in `js/content.js` with alt text and aspect ratio. Existing entries unchanged; `tools/order-photos.js --write` then placed the new ones within Events and Portraits (this moves where some existing photos sit in those two grids, as it does whenever photos are added).
4. Homepage photo strips: `HOME.strips` in `js/content.js` feeds both strips. Added `event-70`, `event-72`, `event-74`, `event-75` and `portrait-35`, `portrait-37`, `portrait-38`, `portrait-39` to the pools.
5. `tools/photos.csv`, `tools/photos-manifest.csv` and `ASSETS.md` updated.
6. `tools/order-photos.js`: files from `Website Imports` count as their own series. The camera's frame numbers have wrapped: `_CHP3281` is both `portrait-08` (already on the site) and the new `portrait-39`, two different photos. Without this the new shoot would have been mixed up with older ones.
7. `?v=` tags in `index.html` set to `20261101`.

**Keep the `Website Imports` folder:** `tools/photos.csv` points at it for these 12, so a full rebuild needs it.

**Shipped:** commit `df10f41` pushed to `main` and `preview` on 1 November 2026 (both branches on the same commit afterwards, so no merge was needed). Live about 20 seconds later.

**Checked live on infint.co.za (phone size, 390 px):**
- Work page: all 239 photos load, including the 12 new ones. Events shows 75, Portraits 39.
- Home photo strips: new photos appear (strips pick at random per visit).
- Home, Work, Events, Portraits, Rates, About, Socials, Book, Contact: no broken images, no script errors.
- Old photos unchanged: git shows no existing image file modified or deleted, and 8 sample files downloaded from the live site match the previous commit byte for byte.
- Grid order: within Events and Portraits, no two frames from the same setup touch at 2 to 6 columns. Other categories keep their exact order.

**Rollback if needed:** `git revert --no-edit df10f41 && git push origin HEAD:main` (last good: `1abc148`).

## Track B (preview only)

Waiting on Tshedza: B1 wording list; B3 skills and repo links (read before starting B2). B4 notes below.

### B4. Design references (ideas only, nothing built)

Visited 1 November 2026 at desktop size, then checked infint.co.za at phone size so the ideas fit what is already there. Ideas only: no code, text or images copied, no testimonials, reviews or client logos invented. Amber accent, Outfit and Montserrat, and the no long dashes rule all stay.

Already on the site, so not proposed again: "Book a shoot" and "General enquiry" in the header (desktop), tier cards with a featured package on Rates, the day rate estimator, the closing "Let's put your date in the diary" call.

**Proposals, ranked by impact:**

1. **Book button that follows you on phones.** Source: navbar.gallery (sticky bars with one clear call to action). Page: every page, phones only. On a phone the header shows only the logo and the menu button, so booking is two taps away. Add a slim bar pinned to the bottom of the screen once the hero has scrolled past: "Book a shoot" in amber plus a WhatsApp button. Hidden on /book and /contact and when the footer is in view. Work: small.
2. **Proper link previews for WhatsApp and Instagram.** Source: ogimage.gallery (photo with a big wordmark, one image per page). Page: all shared links. Today every link shows the same preview (`fashion-01`, a 3:2 photo with no size tags), because WhatsApp does not run the site's JavaScript, so /rates and /book look like the home page. Step 1: one 1200 x 630 image (a strong photo, the white wordmark, "Photography in Johannesburg"), plus image size tags and a large-card tag for X. Step 2: separate previews for /rates, /book and each Work category, set by a small Cloudflare function before the page is sent. Work: step 1 small, step 2 medium.
3. **Booking emails laid out like a ticket.** Source: reallygoodemails.com (airline check-in and confirmation emails). Page: booking acknowledgement, Booked email, contact reply. Open each booking email with one block: the date set big, then time, shoot type, location and a status line ("Enquiry received" or "Booked"). Under it, "What happens next" in three short steps. The Booked email adds a short "What to bring" list per shoot type (you would give me the lists, for example gown and scroll for graduations). The contact reply gets the same header and stays short. Work: medium (`functions/_shared/booking.js`, test sends to infintco@gmail.com).
4. **Headline and Book button on the first phone screen.** Source: supahero.io (portfolio heroes with a short stacked headline over the photo). Page: Home. On a 390 x 844 phone, "Your day, shot properly." starts at the very bottom edge and the buttons are below the fold. On phones, move the headline and one amber button onto the lower part of the hero photo over a dark fade, keeping the slide word and counter. Work: medium, mostly CSS; check that Lighthouse LCP does not drop.
5. **Real proof, nothing invented.** Source: socialproofexamples.com (the patterns that work for one person: real faces, small case studies, asking at the right moment). Pages: Home and About. (a) A short "Recent jobs" list: month, shoot type, place, for example "October 2026, postgraduate awards evening, Johannesburg". You confirm every line; a client is named only with their permission. (b) Ask for a Google review in the delivery message, and show quotes (first name and shoot type) only once real ones exist. Work: (a) small; (b) depends on reviews coming in.
6. **Easier package comparison on phones.** Source: pricingpages.design (tier feature tables, plan switchers). Page: Rates. On a phone the graduation cards stack, so comparing them takes a lot of scrolling. Add a three-way switch above the cards (one package at a time, same card design), or a compact "What's in each package" table with ticks under them. Work: medium.
7. **Opening statement and a mixed photo block.** Source: land-book.com (photographer sites: a first-person line under the hero, then a loose cluster of photos of different sizes). Page: Home. After the strips, one large line in your own words (you write it), then 5 or 6 photos of different sizes from different categories instead of only the uniform grid. Work: medium.

**For later (8 to 10):** posts.design for Instagram post layouts, deck.gallery for a client or sponsor deck, adfolio.design for ads. Not reviewed in depth yet.

## Body font (live)

**Date:** 1 November 2026. Commits `6931012` (temporary test page), `1e2543e` (the change), `30c2e25` (preload). Preview: https://preview.infint.pages.dev

**What changed**
- Small text now uses `-apple-system, BlinkMacSystemFont, 'Work Sans', system-ui, sans-serif` instead of Outfit: paragraphs, labels, buttons, rate card names, the FAQ, the small category list in the menu, form labels, the booking steps, contact rows, tags, footer links. iPhones, iPads and Macs show Apple's system font (SF) and never download Work Sans. Windows and Android show Work Sans.
- Work Sans is self-hosted: `assets/fonts/worksans-latin-400.woff2`, `-500`, `-600` (about 20 KB each, Latin only, `font-display: swap`, not preloaded).
- Unchanged: Montserrat Black titles, prices and numbers, the big menu links, the About intro text, and Outfit for the large light section headings, the word "From" in prices, the hero slide counter, the large footer sentence and the big text on the Book and Contact photos.
- Outfit is no longer preloaded, because it now only shows in headings. Montserrat is still preloaded.
- The temporary `/fonts-test` page and the Inter, DM Sans, Manrope and Hanken Grotesk files are deleted.
- Not changed: the Accept and Decline page that only Tshedza sees (`functions/api/booking-response.js`) still uses Outfit.
- `?v=` tags set to `20261101f`.

**Line breaks (Work Sans, measured against the old font on Home, Rates, About, Book, Contact and Socials)**
No button wraps. Buttons are 2 to 8 px wider; the widest phone button is 290 px. Work Sans is wider, so these now take one more line:
- Phone, menu: "Fashion & editorial" breaks onto two lines.
- Phone, Rates: "Each additional hour" leaves "hour" alone on the second line; "Printed album (20 spreads)" takes two lines.
- Phone, Book: step label "02 Your details" takes two lines, like "03 Review and send" already did.
- Phone, About: three FAQ questions take two lines.
- Desktop, Book: the option "Portraits & headshots" takes two lines. Desktop, Contact: "Johannesburg, shooting Gauteng and beyond" takes two lines.
- Paragraphs on every page run about one line longer in places.
On Apple devices the system font is narrower than Work Sans, so fewer of these happen there. That could not be measured here (no Apple device).

**Update, 1 November 2026: Work Sans for everyone, now live.** Tshedza asked for Work Sans on all devices, including Apple. The stack is now `'Work Sans', system-ui, sans-serif`, so iPhones download the same three files and show the same line breaks as listed above. Still not preloaded. `?v=` tags set to `20261101g`. Merged into `main` on his go-ahead.

**Lighthouse mobile, home page.** 5 runs each, taken in turns so both had the same conditions: live (old font) against preview (new font). Median performance 95 against 94; first paint 1.54 s against 1.76 s; LCP 2.79 s against 2.94 s; accessibility 100 on both. A small drop: Lighthouse acts as an Android phone, which downloads the three Work Sans files (62 KB). iPhones do not download them.

## Portfolio link (preview only)

**Date:** 12 November 2026. Preview: https://preview.infint.pages.dev/work

**What changed**
- New setting `CONFIG.portfolioUrl` in `js/content.js` holds the Google Drive link to the portfolio PDF. Change the link there and both places update.
- Work page: a ghost button "Infint Portfolio" under the heading and intro, above "Choose a category". It also shows on each category page.
- Footer, Site list: "Infint Portfolio" under Work.
- Both open in a new tab with `rel="noopener"`. Visitors only see the words, never the address.
- `?v=` tags set to `20261112`.

**Checks**
- The Drive link opens in a signed-out browser with no access request: "Infint Portfolio 2026.pdf", 17 pages, viewable and downloadable.
- Phone (390 px): the button is 223 px wide, one line, no sideways scroll. Desktop (1440 px): button and footer link in place. No console errors.

Not merged to `main`.
