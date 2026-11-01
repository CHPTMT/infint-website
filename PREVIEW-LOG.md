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
