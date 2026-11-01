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
