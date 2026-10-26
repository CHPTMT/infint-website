# ASSETS.md

Every image on the site, where it comes from, and where it shows up.

## Folders

| Folder | What is in it | Size |
|---|---|---|
| `assets/thumbs/` | Small copies used in the photo grids | 720 px on the long edge |
| `assets/photos/` | Large copies used in the full-screen viewer and the homepage header | 2000 px on the long edge |

Each portfolio photo has the same file name in both folders, for example `assets/thumbs/event-03.jpg` and `assets/photos/event-03.jpg`. The file name without `.jpg` is the photo's id in `js/content.js`.

## Where the originals are

All originals live in `C:\Users\tshed\Pictures\INF JPG\Website Commits\`, in the folders Tshedza sorted them into. The 40 photos that only existed in the 2026 portfolio PDF were pulled out at full resolution into `Website Commits\From Portfolio 2026\`. Photos that appear in both the PDF and the folders are only used once. `tools/photos.csv` maps every id to its original.

## Display order

The order of `PHOTOS` in `js/content.js` is the order on the site. Within each category it is shuffled so that frames from the same shoot, or that look alike, never sit next to each other. The "Everything" view then takes one photo from each category in turn.

## Special images

| File | Where it appears |
|---|---|
| `assets/photos/fashion-01.jpg` | Homepage header image (set by `HOME.hero`) and the link preview on WhatsApp and social |
| `assets/photos/about-tshedza.jpg` | About page, shown in black and white with extra contrast (filter in `css/style.css`, `.about-photo img`) |

## Homepage "recent frames"

These 16 appear on the homepage in this order (set by `HOME.featured`): `portrait-01`, `event-01`, `active-01`, `fashion-02`, `matric-01`, `street-01`, `event-02`, `detail-01`, `matric-02`, `active-02`, `event-04`, `fashion-03`, `portrait-27`, `event-07`, `active-03`, `street-03`.

## Portfolio photos (227)


### Events (`event`), 69 photos

| Id | Original file | Shape | Homepage |
|---|---|---|---|
| `event-01` | `Event\_CHP8757.jpg` | Portrait | Recent frames |
| `event-02` | `Event\_CHP2127.jpg` | Portrait | Recent frames |
| `event-03` | `Event\_CHP1012.jpg` | Portrait |  |
| `event-04` | `Event\Homba-2.jpg` | Portrait | Recent frames |
| `event-05` | `Event\infint-9189.jpg` | Portrait |  |
| `event-06` | `Event\_CHP4076.jpg` | Portrait |  |
| `event-07` | `Event\_CHP5360.jpg` | Landscape | Recent frames |
| `event-08` | `Event\SaiHle-1.jpg` | Portrait |  |
| `event-09` | `Event\infintco-5629.jpg` | Portrait |  |
| `event-10` | `Event\_CHP6547.jpg` | Portrait |  |
| `event-11` | `Event\infint-9406.jpg` | Portrait |  |
| `event-12` | `Event\_CHP6389.jpg` | Portrait |  |
| `event-13` | `Event\infintco-6520.jpg` | Portrait |  |
| `event-14` | `Baby Shower\infint-0890.jpg` | Portrait |  |
| `event-15` | `Event\_CHP1004.jpg` | Portrait |  |
| `event-16` | `Event\_CHP1025.jpg` | Portrait |  |
| `event-17` | `Event\_CHP1038.jpg` | Landscape |  |
| `event-18` | `Event\_CHP1646.jpg` | Portrait |  |
| `event-19` | `Event\_CHP2118.jpg` | Portrait |  |
| `event-20` | `Event\_CHP2431.jpg` | Portrait |  |
| `event-21` | `Event\_CHP2435.jpg` | Portrait |  |
| `event-22` | `Event\_CHP2495.jpg` | Portrait |  |
| `event-23` | `Event\_CHP2626.jpg` | Portrait |  |
| `event-24` | `Event\_CHP2633.jpg` | Portrait |  |
| `event-25` | `Event\_CHP4462.jpg` | Portrait |  |
| `event-26` | `Event\_CHP5352.jpg` | Landscape |  |
| `event-27` | `Event\_CHP5396.jpg` | Portrait |  |
| `event-28` | `Event\_CHP5785.jpg` | Landscape |  |
| `event-29` | `Event\_CHP6419.jpg` | Portrait |  |
| `event-30` | `Event\_CHP6421.jpg` | Landscape |  |
| `event-31` | `Event\_CHP6447.jpg` | Portrait |  |
| `event-32` | `Event\_CHP6450.jpg` | Portrait |  |
| `event-33` | `Event\_CHP6457.jpg` | Portrait |  |
| `event-34` | `Event\_CHP6477.jpg` | Portrait |  |
| `event-35` | `Event\_CHP6494.jpg` | Landscape |  |
| `event-36` | `Event\_CHP6509.jpg` | Portrait |  |
| `event-37` | `Event\_CHP6524.jpg` | Portrait |  |
| `event-38` | `Event\_CHP6583.jpg` | Portrait |  |
| `event-39` | `Event\_CHP6585.jpg` | Portrait |  |
| `event-40` | `Event\_CHP6613.jpg` | Landscape |  |
| `event-41` | `Event\_CHP6618.jpg` | Landscape |  |
| `event-42` | `Event\_CHP8706.jpg` | Portrait |  |
| `event-43` | `Event\Amanda-6.jpg` | Portrait |  |
| `event-44` | `Event\infint-9187.jpg` | Portrait |  |
| `event-45` | `Event\infint-9192.jpg` | Landscape |  |
| `event-46` | `Event\infint-9262.jpg` | Landscape |  |
| `event-47` | `Event\infint-9312.jpg` | Landscape |  |
| `event-48` | `Event\infint-9411.jpg` | Portrait |  |
| `event-49` | `Event\infintco-5418.jpg` | Portrait |  |
| `event-50` | `Event\infintco-5423.jpg` | Portrait |  |
| `event-51` | `Event\infintco-5643.jpg` | Landscape |  |
| `event-52` | `Event\infintco-6535.jpg` | Portrait |  |
| `event-53` | `Event\infintco-6536.jpg` | Portrait |  |
| `event-54` | `Event\infintco-6539.jpg` | Portrait |  |
| `event-55` | `Event\SaiHle-4.jpg` | Portrait |  |
| `event-56` | `Baby Shower\infint-0742.jpg` | Portrait |  |
| `event-57` | `From Portfolio 2026\portfolio-2026-007-025.jpg` | Portrait |  |
| `event-58` | `From Portfolio 2026\portfolio-2026-001-005.jpg` | Portrait |  |
| `event-59` | `From Portfolio 2026\portfolio-2026-007-024.jpg` | Portrait |  |
| `event-60` | `From Portfolio 2026\portfolio-2026-008-029.jpg` | Portrait |  |
| `event-61` | `From Portfolio 2026\portfolio-2026-008-030.jpg` | Portrait |  |
| `event-62` | `From Portfolio 2026\portfolio-2026-008-032.jpg` | Portrait |  |
| `event-63` | `From Portfolio 2026\portfolio-2026-008-033.jpg` | Landscape |  |
| `event-64` | `From Portfolio 2026\portfolio-2026-009-034.jpg` | Portrait |  |
| `event-65` | `From Portfolio 2026\portfolio-2026-009-036.jpg` | Portrait |  |
| `event-66` | `From Portfolio 2026\portfolio-2026-009-038.jpg` | Portrait |  |
| `event-67` | `From Portfolio 2026\portfolio-2026-010-041.jpg` | Portrait |  |
| `event-68` | `From Portfolio 2026\portfolio-2026-010-042.jpg` | Portrait |  |
| `event-69` | `From Portfolio 2026\portfolio-2026-010-043.jpg` | Portrait |  |

### Portraits (`portrait`), 33 photos

| Id | Original file | Shape | Homepage |
|---|---|---|---|
| `portrait-01` | `Potrait\_CHP3640.jpg` | Portrait | Recent frames |
| `portrait-02` | `Studio\infint-2104.jpg` | Portrait |  |
| `portrait-03` | `Potrait\_CHP3296.jpg` | Portrait |  |
| `portrait-04` | `Potrait\infint-0350.jpg` | Portrait |  |
| `portrait-05` | `Studio\infint-2203.jpg` | Portrait |  |
| `portrait-06` | `Potrait\_CHP3647-2.jpg` | Portrait |  |
| `portrait-07` | `Maternity\infint-0992.jpg` | Portrait |  |
| `portrait-08` | `Potrait\_CHP3281.jpg` | Portrait |  |
| `portrait-09` | `Potrait\_CHP3301.jpg` | Portrait |  |
| `portrait-10` | `Potrait\_CHP3374.jpg` | Portrait |  |
| `portrait-11` | `Potrait\_CHP3645.jpg` | Portrait |  |
| `portrait-12` | `Potrait\_CHP3730.jpg` | Portrait |  |
| `portrait-13` | `Potrait\infint-0325.jpg` | Portrait |  |
| `portrait-14` | `Potrait\infint-0347.jpg` | Portrait |  |
| `portrait-15` | `Potrait\infint-0355.jpg` | Portrait |  |
| `portrait-16` | `Studio\infint-2116.jpg` | Portrait |  |
| `portrait-17` | `Studio\infint-2122.jpg` | Portrait |  |
| `portrait-18` | `Studio\infint-2190.jpg` | Portrait |  |
| `portrait-19` | `Studio\infint-2198.jpg` | Portrait |  |
| `portrait-20` | `Studio\infint-2202.jpg` | Portrait |  |
| `portrait-21` | `Studio\infint-2225.jpg` | Portrait |  |
| `portrait-22` | `Maternity\infint-0985.jpg` | Portrait |  |
| `portrait-23` | `Maternity\infint-1036.jpg` | Portrait |  |
| `portrait-24` | `Maternity\infint-1060.jpg` | Portrait |  |
| `portrait-25` | `From Portfolio 2026\portfolio-2026-003-010.jpg` | Portrait |  |
| `portrait-26` | `From Portfolio 2026\portfolio-2026-003-011.jpg` | Portrait |  |
| `portrait-27` | `From Portfolio 2026\portfolio-2026-003-012.jpg` | Portrait | Recent frames |
| `portrait-28` | `From Portfolio 2026\portfolio-2026-003-013.jpg` | Portrait |  |
| `portrait-29` | `From Portfolio 2026\portfolio-2026-004-014.jpg` | Portrait |  |
| `portrait-30` | `From Portfolio 2026\portfolio-2026-005-020.jpg` | Portrait |  |
| `portrait-31` | `From Portfolio 2026\portfolio-2026-005-021.jpg` | Portrait |  |
| `portrait-32` | `From Portfolio 2026\portfolio-2026-005-022.jpg` | Portrait |  |
| `portrait-33` | `From Portfolio 2026\portfolio-2026-001-006.jpg` | Portrait |  |

### Matric dance (`matric`), 16 photos

| Id | Original file | Shape | Homepage |
|---|---|---|---|
| `matric-01` | `ND\infintco-7662.jpg` | Portrait | Recent frames |
| `matric-02` | `ND\infintco-8903.jpg` | Portrait | Recent frames |
| `matric-03` | `ND\infintco-7554.jpg` | Portrait |  |
| `matric-04` | `ND\infintco-9045.jpg` | Portrait |  |
| `matric-05` | `ND\infintco-7345.jpg` | Portrait |  |
| `matric-06` | `ND\infintco-7324.jpg` | Portrait |  |
| `matric-07` | `ND\infintco-7371.jpg` | Portrait |  |
| `matric-08` | `ND\infintco-7549-2.jpg` | Portrait |  |
| `matric-09` | `ND\infintco-7629.jpg` | Portrait |  |
| `matric-10` | `ND\infintco-8898.jpg` | Portrait |  |
| `matric-11` | `ND\infintco-8918.jpg` | Portrait |  |
| `matric-12` | `ND\infintco-9000.jpg` | Portrait |  |
| `matric-13` | `ND\infintco-9054.jpg` | Portrait |  |
| `matric-14` | `From Portfolio 2026\portfolio-2026-003-009.jpg` | Portrait |  |
| `matric-15` | `From Portfolio 2026\portfolio-2026-005-023.jpg` | Portrait |  |
| `matric-16` | `From Portfolio 2026\portfolio-2026-014-056.jpg` | Portrait |  |

### Sports & active (`active`), 48 photos

| Id | Original file | Shape | Homepage |
|---|---|---|---|
| `active-01` | `Sports + Active\infintco-6195.jpg` | Portrait | Recent frames |
| `active-02` | `Sports + Active\_CHP8824.jpg` | Portrait | Recent frames |
| `active-03` | `Sports + Active\infintco-5821.jpg` | Portrait | Recent frames |
| `active-04` | `Sports + Active\infint-8396.jpg` | Portrait |  |
| `active-05` | `Sports + Active\_CHP8893.jpg` | Portrait |  |
| `active-06` | `Sports + Active\infintco-6118.jpg` | Portrait |  |
| `active-07` | `Sports + Active\infint-8260.jpg` | Landscape |  |
| `active-08` | `Sports + Active\infintco-6250.jpg` | Portrait |  |
| `active-09` | `Sports + Active\infintco-6138.jpg` | Landscape |  |
| `active-10` | `Sports + Active\infint-8412.jpg` | Portrait |  |
| `active-11` | `Sports + Active\_CHP8841.jpg` | Portrait |  |
| `active-12` | `Sports + Active\_CHP8861.jpg` | Portrait |  |
| `active-13` | `Sports + Active\_CHP8887.jpg` | Portrait |  |
| `active-14` | `Sports + Active\infint-8114.jpg` | Landscape |  |
| `active-15` | `Sports + Active\infint-8160.jpg` | Landscape |  |
| `active-16` | `Sports + Active\infint-8170.jpg` | Landscape |  |
| `active-17` | `Sports + Active\infint-8176.jpg` | Landscape |  |
| `active-18` | `Sports + Active\infint-8180.jpg` | Portrait |  |
| `active-19` | `Sports + Active\infint-8391.jpg` | Portrait |  |
| `active-20` | `Sports + Active\infint-8392.jpg` | Portrait |  |
| `active-21` | `Sports + Active\infint-8398.jpg` | Portrait |  |
| `active-22` | `Sports + Active\infint-8409.jpg` | Landscape |  |
| `active-23` | `Sports + Active\infint-8520.jpg` | Portrait |  |
| `active-24` | `Sports + Active\infint-8564.jpg` | Portrait |  |
| `active-25` | `Sports + Active\infintco-5444.jpg` | Landscape |  |
| `active-26` | `Sports + Active\infintco-5526.jpg` | Portrait |  |
| `active-27` | `Sports + Active\infintco-5532.jpg` | Portrait |  |
| `active-28` | `Sports + Active\infintco-5912.jpg` | Portrait |  |
| `active-29` | `Sports + Active\infintco-6042.jpg` | Landscape |  |
| `active-30` | `Sports + Active\infintco-6093.jpg` | Portrait |  |
| `active-31` | `Sports + Active\infintco-6115.jpg` | Portrait |  |
| `active-32` | `Sports + Active\infintco-6130.jpg` | Portrait |  |
| `active-33` | `Sports + Active\infintco-6153.jpg` | Portrait |  |
| `active-34` | `Sports + Active\infintco-6187.jpg` | Portrait |  |
| `active-35` | `Sports + Active\infintco-6200.jpg` | Portrait |  |
| `active-36` | `Sports + Active\infintco-6201.jpg` | Portrait |  |
| `active-37` | `Sports + Active\infintco-6203.jpg` | Portrait |  |
| `active-38` | `Sports + Active\infintco-6233.jpg` | Landscape |  |
| `active-39` | `Sports + Active\infintco-6254.jpg` | Landscape |  |
| `active-40` | `Sports + Active\infintco-6263.jpg` | Portrait |  |
| `active-41` | `Sports + Active\infintco-6265.jpg` | Portrait |  |
| `active-42` | `Sports + Active\infintco-6286.jpg` | Landscape |  |
| `active-43` | `Sports + Active\infintco-6374.jpg` | Portrait |  |
| `active-44` | `Sports + Active\infintco-6466.jpg` | Portrait |  |
| `active-45` | `Sports + Active\infintco-6486.jpg` | Portrait |  |
| `active-46` | `From Portfolio 2026\portfolio-2026-016-060.jpg` | Portrait |  |
| `active-47` | `From Portfolio 2026\portfolio-2026-016-061.jpg` | Portrait |  |
| `active-48` | `From Portfolio 2026\portfolio-2026-017-064.jpg` | Portrait |  |

### Fashion & editorial (`fashion`), 20 photos

| Id | Original file | Shape | Homepage |
|---|---|---|---|
| `fashion-01` | `Fashion\018-Silk&Cotton.jpg` | Landscape | Header |
| `fashion-02` | `Fashion\004-Silk&Cotton.jpg` | Portrait | Recent frames |
| `fashion-03` | `Fashion\068-Silk&Cotton.jpg` | Portrait | Recent frames |
| `fashion-04` | `Fashion\020-Silk&Cotton.jpg` | Portrait |  |
| `fashion-05` | `Fashion\085-Silk&Cotton.jpg` | Portrait |  |
| `fashion-06` | `Fashion\059-Silk&Cotton.jpg` | Portrait |  |
| `fashion-07` | `Fashion\011-Silk&Cotton.jpg` | Portrait |  |
| `fashion-08` | `Fashion\006-Silk&Cotton.jpg` | Portrait |  |
| `fashion-09` | `Fashion\007-Silk&Cotton.jpg` | Portrait |  |
| `fashion-10` | `Fashion\008-Silk&Cotton.jpg` | Portrait |  |
| `fashion-11` | `Fashion\012-Silk&Cotton.jpg` | Portrait |  |
| `fashion-12` | `Fashion\014-Silk&Cotton.jpg` | Portrait |  |
| `fashion-13` | `Fashion\023-Silk&Cotton.jpg` | Landscape |  |
| `fashion-14` | `Fashion\029-Silk&Cotton.jpg` | Portrait |  |
| `fashion-15` | `Fashion\062-Silk&Cotton.jpg` | Portrait |  |
| `fashion-16` | `Fashion\070-Silk&Cotton.jpg` | Portrait |  |
| `fashion-17` | `Fashion\073-Silk&Cotton.jpg` | Portrait |  |
| `fashion-18` | `Fashion\074-Silk&Cotton.jpg` | Portrait |  |
| `fashion-19` | `Fashion\087-Silk&Cotton.jpg` | Portrait |  |
| `fashion-20` | `Fashion\091-Silk&Cotton.jpg` | Portrait |  |

### Street (`street`), 18 photos

| Id | Original file | Shape | Homepage |
|---|---|---|---|
| `street-01` | `Street\_CHP7503.jpg` | Portrait | Recent frames |
| `street-02` | `Street\_CHP7395.jpg` | Portrait |  |
| `street-03` | `Street\_CHP7529.jpg` | Portrait | Recent frames |
| `street-04` | `Street\_CHP7814.jpg` | Portrait |  |
| `street-05` | `Street\_CHP7389.jpg` | Portrait |  |
| `street-06` | `Street\_CHP7853.jpg` | Portrait |  |
| `street-07` | `Street\_CHP7344.jpg` | Portrait |  |
| `street-08` | `Street\_CHP7494.jpg` | Portrait |  |
| `street-09` | `Street\_CHP7497.jpg` | Portrait |  |
| `street-10` | `Street\_CHP7505.jpg` | Portrait |  |
| `street-11` | `Street\_CHP7506.jpg` | Portrait |  |
| `street-12` | `Street\_CHP7514.jpg` | Portrait |  |
| `street-13` | `Street\_CHP7595.jpg` | Portrait |  |
| `street-14` | `Street\_CHP7801.jpg` | Portrait |  |
| `street-15` | `Street\_CHP7803.jpg` | Portrait |  |
| `street-16` | `Street\_CHP7841.jpg` | Portrait |  |
| `street-17` | `Street\_CHP7843.jpg` | Portrait |  |
| `street-18` | `Street\_CHP7860.jpg` | Portrait |  |

### Details (`detail`), 23 photos

| Id | Original file | Shape | Homepage |
|---|---|---|---|
| `detail-01` | `Engagement\_CHP8060.jpg` | Portrait | Recent frames |
| `detail-02` | `Details\infint-9065.jpg` | Portrait |  |
| `detail-03` | `Maternity\infint-1057.jpg` | Portrait |  |
| `detail-04` | `Details\infint-9071.jpg` | Portrait |  |
| `detail-05` | `Engagement\_CHP8531.jpg` | Portrait |  |
| `detail-06` | `Details\infint-9060.jpg` | Portrait |  |
| `detail-07` | `Details\infint-9069.jpg` | Portrait |  |
| `detail-08` | `Engagement\_CHP8016.jpg` | Portrait |  |
| `detail-09` | `Engagement\_CHP8286.jpg` | Portrait |  |
| `detail-10` | `Engagement\_CHP8424.jpg` | Portrait |  |
| `detail-11` | `Engagement\_CHP8580.jpg` | Portrait |  |
| `detail-12` | `From Portfolio 2026\portfolio-2026-012-044.jpg` | Portrait |  |
| `detail-13` | `From Portfolio 2026\portfolio-2026-012-045.jpg` | Landscape |  |
| `detail-14` | `From Portfolio 2026\portfolio-2026-012-046.jpg` | Portrait |  |
| `detail-15` | `From Portfolio 2026\portfolio-2026-012-048.jpg` | Portrait |  |
| `detail-16` | `From Portfolio 2026\portfolio-2026-013-049.jpg` | Portrait |  |
| `detail-17` | `From Portfolio 2026\portfolio-2026-013-051.jpg` | Portrait |  |
| `detail-18` | `From Portfolio 2026\portfolio-2026-013-052.jpg` | Portrait |  |
| `detail-19` | `From Portfolio 2026\portfolio-2026-013-053.jpg` | Portrait |  |
| `detail-20` | `From Portfolio 2026\portfolio-2026-014-054.jpg` | Portrait |  |
| `detail-21` | `From Portfolio 2026\portfolio-2026-014-055.jpg` | Portrait |  |
| `detail-22` | `From Portfolio 2026\portfolio-2026-014-057.jpg` | Portrait |  |
| `detail-23` | `From Portfolio 2026\portfolio-2026-014-058.jpg` | Portrait |  |

## Adding more photos

1. Drop the original JPEG into the matching folder in `Website Commits`.
2. Add a line to `tools/photos.csv` with the next id in that category (e.g. `event-70`) and its path, e.g. `Event\new-photo.jpg`.
3. Run `powershell -ExecutionPolicy Bypass -File tools\resize-photos.ps1`. It rebuilds both image folders and writes `tools/photos-manifest.csv` with each photo's size.
4. Add the photo to `PHOTOS` in `js/content.js`: `{"id": "event-70", "cat": "event", "r": 0.667, "alt": "Short description"}`, where `r` is width divided by height. Put it somewhere in the middle of its category rather than next to a frame from the same shoot.

Or ask Claude Code to do steps 2 to 4. A new category needs one line in `CATEGORIES` in `js/content.js` as well.
