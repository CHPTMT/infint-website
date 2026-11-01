# PREVIEW-LOG.md

A running log of work in two tracks. Track A goes live on `main`. Track B stays on `preview` until Tshedza says to merge.

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
