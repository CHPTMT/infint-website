# DESIGN.md: INFINT redesign

The visual system for the redesigned site. If code and this file disagree, fix one of them.

## Direction: "after dark"

A darkroom at night. Near-black ink surfaces, photographs as the only full colour, one warm amber light source (from the logo) that glows, never shouts. Three ideas from Tshedza's references, combined:

1. **Split screen** (ref-1): a full-height photo on one side, an ink panel with crisp 1 px line details on the other. Huge condensed numbers and titles sit over the photo.
2. **Editorial type** (ref-2): heavy sans titles set against thin ones, and large flat colour-block panels (amber, bone) with lots of space.
3. **Premium dark** (ref-3, ref-4): ink background, a slow amber radial glow, faint grid lines behind heroes, rounded cards.

The photos are the star. Interface chrome stays quiet and thin so colour in the pictures carries the page.

## Colour

| Token | Value | Use |
|---|---|---|
| `--ink` | `#0E1115` | Page background, the brand dark |
| `--ink-2` | `#08090B` | Deepest panels, viewer, footer base |
| `--ink-3` | `#151A20` | Raised surfaces: cards, inputs, chips |
| `--line` | `rgba(255,255,255,.09)` | 1 px hairlines, card borders, grid lines |
| `--line-2` | `rgba(255,255,255,.16)` | Hover borders, input borders |
| `--white` | `#FFFFFF` | Headings |
| `--text` | `#E9E7E3` | Body copy on ink (warm white) |
| `--mute` | `#9BA1A9` | Secondary text on ink (passes 4.5:1 on `--ink`) |
| `--bone` | `#F5F5F3` | Light colour-block panels (About text, rate notes) |
| `--accent` | `#FFA000` | Amber: primary buttons, active states, glows, one word per heading at most |
| `--accent-2` | `#FF7A00` | Deeper orange, only inside gradients |
| `--warm` | `#FFE2B0` | Warm white, only inside gradients and glows |

Rules:
- Amber is the only hue in the interface. No green, blue or purple anywhere, including glows, focus rings and selection.
- Text on amber is always `--ink`.
- Gradients run amber to orange to transparent on ink. Never gradient text.

### Glow and mesh

- **Hero mesh:** three blurred radial gradients (amber, orange, warm white at low alpha) on a pseudo-element, drifting on a 24 s loop with `transform` only.
- **Section glow:** one soft radial `radial-gradient(closest-side, rgba(255,160,0,.18), transparent)` placed off-centre behind key panels.
- **Grid lines:** 1 px lines at 80 px spacing, `--line` strength, masked with a radial fade so they only show near the glow. Used on the home hero panel, the rates estimator and the socials header. Nowhere else.
- **Photo hover glow:** `0 30px 60px -20px rgba(0,0,0,.8)` plus `0 0 0 1px rgba(255,160,0,.55)` plus `0 0 40px -6px rgba(255,160,0,.45)`.

## Type

Fonts, both self-hosted in `assets/fonts` (Latin subset): **Outfit** (variable 200 to 600), a thin modern sans for body text, most headings and all UI; **Montserrat** (variable 700 to 900) for heavy display text: big page titles, the hero line, menu links, category and social card names, and every price or big number. About text stays Montserrat Bold. Tokens: `--display` and `--body` are Outfit, `--heavy` is Montserrat.

| Role | Font | Size | Weight | Tracking |
|---|---|---|---|---|
| Mega number (prices, steps, hero word) | Montserrat | per component, e.g. `clamp(3.2rem, 5.2vw, 6rem)` on rate cards | 900 | -0.03em, line-height .9 |
| Display (page titles, hero, CTA) | Montserrat | `clamp(2.6rem, 6.4vw, 6rem)` | 900 | -0.035em, line-height .92 |
| H2 (section headings) | Outfit | `clamp(2.2rem, 4.4vw, 4.4rem)` | 300 | -0.035em |
| H3 | Outfit | `clamp(1.2rem, 1.6vw, 1.5rem)` | 500 | -0.015em |
| Body | Outfit | 1rem | 400 | 0 |
| Lede | Outfit | `clamp(1.05rem, 1.3vw, 1.22rem)` | 300 | 0 |
| Label, button | Outfit | .72rem to .82rem | 600, uppercase | .12em to .16em |

- No italic accent words (removed with the move away from Archivo). Emphasis comes from the heavy and thin contrast.
- Numbers use the mega style with `font-variant-numeric: tabular-nums`. Starting prices read "From R1 200".
- Montserrat is wide, so heavy sizes are smaller than the old condensed ones; check long words ("PORTRAITS", "Book a shoot") at 390 px.
- `font-synthesis: none`: never fake a weight the files do not have.
- No eyebrow labels above headings. Headings carry themselves.
- Body measure 60 to 70 characters.

## Layout

- `--max: 1600px` main container, `--max-wide: 1880px` for photo grids. Gutters `clamp(20px, 4vw, 64px)`.
- Heroes and photo sections are full bleed.
- Work grid: masonry columns, 2 at phone, 3 at 760 px, 4 at 1100 px, 5 at 1440 px, 6 at 1800 px.
- Split screen (photo plus ink panel) is the signature layout: Home hero, Book and Contact. On phones the photo stacks on top at a fixed height.
- Section rhythm: `clamp(80px, 11vw, 180px)` vertical padding. More space above a heading than below.

## Shape and depth

- Radii: photos and cards 14 px, inputs 10 px, buttons and chips 999 px (pills).
- Elevation is declared once: either a 1 px `--line` border (flat cards) or a shadow (lifted photo), never both at rest.
- Colour-block panels (amber, bone) are full width with 24 px radius inside the container, or full bleed.

## Motion

Library: none. CSS transitions and keyframes, IntersectionObserver for reveals, the View Transitions API for route changes (falls back to a CSS fade), and one small `requestAnimationFrame` loop for parallax. No CDN dependency.

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(.23,1,.32,1)` | Entrances, hovers, reveals |
| `--ease-in-out` | `cubic-bezier(.77,0,.175,1)` | On-screen movement, hero slide changes |
| Hover | 220 to 320 ms | Photo lift, buttons |
| Press | 140 ms, `scale(.97)` | Every button |
| Reveal | 900 ms, 70 ms stagger | Sections and grids |
| Route | 380 ms out and in | Page changes |

Moments, in order of importance:
1. **Hero:** photos crossfade with a slow zoom (7 s each), the big condensed category word swaps with a clip reveal, and the amber mesh drifts.
2. **Photo lift:** the hovered photo scales to 1.04, rises 6 px, gains the amber edge glow; siblings dim to 55% brightness and desaturate slightly. Pure CSS (`:has()`), so moving across the grid stays smooth. On touch screens the photo nearest the middle of the screen lifts as you scroll.
3. **Reveal on scroll:** elements fade up 28 px with a light blur, grid items stagger by 50 ms within a row.
4. **Marquee:** a horizontal strip of photos drifting at a constant linear speed, pausing on hover.
5. **Parallax:** large images move up to 8% of their height against scroll. Desktop only.
6. **Buttons:** primary amber pills have a soft amber glow that grows on hover and follow the pointer by up to 6 px (magnetic). Desktop only.

`prefers-reduced-motion: reduce` turns off the marquee drift, parallax, magnetic pull, hero zoom and reveal movement. Opacity fades stay.

## Components

- **Header:** transparent over the hero, turns into blurred ink with a hairline once you scroll. White wordmark image (`assets/brand/infint-wordmark-white-transparent.png`). Links: Work, Rates, About, Socials, Contact, plus an amber "Book a shoot" pill. On phones a full-screen ink menu with large type.
- **Buttons:** `.btn` (amber pill), `.btn.ghost` (1 px line pill), `.btn.light` (white pill on photos). Arrow icon slides 3 px on hover.
- **Chips:** pill filters with counts, active chip is amber.
- **Photo tile:** 14 px radius, caption fades in on hover, lifts as described above.
- **Category card:** tall photo, name in condensed display over a bottom gradient, count in the corner.
- **Rate card:** ink-3 surface, mega price, includes list with hairlines. The featured card has an amber ring and glow.
- **Rate table:** large rows, condensed price on the right.
- **Estimator:** glow panel with grid lines, inputs on the left, mega number output on the right.
- **Steps:** three segments with condensed numbers and an amber progress fill.
- **Inputs:** ink-3 fill, 1 px border, amber focus ring.
- **FAQ:** hairline accordion, plus icon rotates to a cross.
- **Viewer:** full-screen ink, image fades and scales in from .98, counter in condensed type, arrow buttons as round line icons.
- **Social card:** full photo, platform icon, handle, "Open on Instagram" style action. No counts.
- **Colour-block CTA:** full-width amber panel with ink text and an ink button.

## Browser surfaces

- `::selection` amber on ink text.
- Caret amber. Focus ring `2px solid var(--accent)`, offset 3 px.
- Scrollbar thin, ink track, `#2A3038` thumb.
- `color-scheme: dark`.
