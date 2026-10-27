# PRODUCT.md: INFINT

Product truth for the INFINT site. Visual decisions live in DESIGN.md.

## Who and what

- INFINT is the photography business of Tshedza Tshiololi, one person, based in Johannesburg (Braamfontein for travel distance).
- Work: events, portraits (graduation, headshots, maternity), prom (matric dance; shown as "Prom" on the site, internal id `matric`), sport and active, fashion and editorial, street, details. Also weddings and corporate days on request.
- The site speaks as "I". Never "we".

## Who visits and what they need

- Students and families booking graduation and prom shoots, mostly on phones, often from Instagram or TikTok.
- Brands and event organisers checking the portfolio before asking for a day rate, mostly on laptops.
- Success: they see enough real work to trust him, find the price that fits, and send a booking enquiry or a WhatsApp.

## Surfaces and modes

| Route | Mode | Job |
|---|---|---|
| Home `/` | Persuade / Experience | First impression, the work up front, path to Work, Rates and Book |
| Work `/work` | Experience | Browse photos by category (from the menu), open the viewer |
| Rates `/rates` | Persuade | Packages, hourly rates, add-ons, day-rate estimator |
| Book `/book` | Operate | 3-step enquiry form, WhatsApp and email fallback |
| Contact `/contact` | Operate | Details plus a short message form |
| About `/about` | Read | Who he is, how to prepare, FAQ |
| Socials `/socials` | Persuade | Instagram, TikTok and YouTube profiles |

## Truths and limits

- Real numbers only: prices from his 2026 rate cards. No photo counts anywhere on the site (his request). No invented stats, follower counts, posts or testimonials.
- Contact: phone and WhatsApp 073 296 5528, info@infint.co.za (main), tshedza@infint.co.za (direct), bookings@infint.co.za (booking fallback).
- Socials: Instagram and TikTok @infint_co, YouTube @tshedza_tt, linktr.ee/tshedzatt.
- Plain HTML, CSS and JS, no build step, hosted on Cloudflare Pages. Forms post to `functions/api/enquiry.js`.
- Writing rules from CLAUDE.md apply to every word: no em or en dashes, plain language, none of the banned filler words.
