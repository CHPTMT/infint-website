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

- `preview`: nothing for the site, only this log.
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

## Branch `preview-ideas` (separate from `preview`, not merged anywhere)

**Date:** 1 November 2026. Made from `main` at `df10f41`. Preview link: https://preview-ideas.infint.pages.dev

Builds three of the B4 proposals (on `preview` in this log): the phone booking bar, the phone hero, and the link preview image.

**a. Booking bar on phones** (`index.html`, `css/style.css`, `updateBar()` in `js/app.js`)
- Shown at 960 px wide and below, where the header hides its Book a shoot button. Desktop unchanged.
- "Book a shoot" in amber and a WhatsApp button (same number and opening message as the Contact page).
- Home page: appears once the Book button on the hero photo has scrolled off screen, so there are never two at once. Other pages: there from the start.
- Not shown on Book and Contact (both already are the booking and contact pages).
- Slides away while the footer is on screen, so it never covers it. Sits under the photo viewer and the menu, and hides while the menu is open.
- Leaves room for the iPhone home bar. No slide animation for people who turn motion off.

**d. Hero on phones** (`js/app.js` home view, `css/style.css`)
- At 640 px and below, the headline "Your day, shot properly." and the Book a shoot button sit on the lower part of the hero photo, over a darker fade, with the slide word and counter just above them (smaller). The timeline bars moved to the top of the photo.
- Checked on 390 x 844 (iPhone 14 size) and 375 x 667 (iPhone SE size): headline and button fully on the first screen on both.
- The panel under the photo keeps the intro text, General enquiry, See the work and the three facts. Its h1 is still there for screen readers and search (hidden on screen on phones only), and its Book button is hidden on phones because the one on the photo replaces it.
- Desktop: the slide word, headline and buttons measured at exactly the same positions as on infint.co.za.

**b. Link preview image** (`assets/og/infint-home.jpg`, `index.html`, `tools/og-image.html`)
- 1200 x 630, 65 KB: the `fashion-01` photo (the one used for previews before), the white wordmark and "Photography · Johannesburg" in Outfit, with the dot in amber. Wordmark kept in the middle so WhatsApp's small square preview still shows it.
- Tags: `og:image` with width, height, type and alt text, `og:site_name`, and the X card tags (`summary_large_image`).
- To remake it (new photo, or later one per page): open `tools/og-image.html` on the local preview server, `?p=<photo id>` swaps the photo; steps are in the file.
- **The tags point at infint.co.za**, the address that stays once this goes live. Until then that file only exists on the preview link, so a WhatsApp preview of the preview link shows no image. To see the image now: https://preview-ideas.infint.pages.dev/assets/og/infint-home.jpg. WhatsApp also remembers old previews for a while; once live, test with a fresh link such as `https://infint.co.za/?v=1`.

**Version tags:** `?v=20261101b`.

**Lighthouse mobile, home page (3 runs each, preview-ideas against preview.infint.pages.dev, which has the same site as live):** performance 84, 87, 99 against 86, 90, 91; LCP 2.1 to 2.9 s against 2.7 to 2.8 s; layout shift 0 on both; accessibility 100 on both. The spread is run to run noise (blocking time moves between 70 and 340 ms on the same page); the largest element is the same hero photo on both. No drop.
