# CLAUDE.md: INFINT website

Read this first, then read HANDOVER.md for the full history and the latest handover note.

## What this is

Portfolio and booking site for INFINT, the Johannesburg photography business of Tshedza Tshiololi.
Plain HTML, CSS and JavaScript with no build step and no framework. Live at https://infint.co.za.

- `index.html` page shell
- `css/style.css` all styling, design tokens in `:root`
- `js/content.js` photos, categories, rates, contact details, FAQ and copy (most edits happen here)
- `js/app.js` router and page logic (`V.home`, `V.work`, `V.rates`, `V.book`, `V.contact`, `V.about`, `V.socials`). Pages have real paths (`/work`, `/rates?s=day`); old `#/` links are swapped for the path on arrival. Cloudflare serves `index.html` for any path without a file, because there is no `404.html` (keep it that way)
- `functions/api/enquiry.js` Cloudflare Pages Function that emails form enquiries through Resend
- `assets/thumbs` (720 px) and `assets/photos` (2000 px), same file name in both
- `tools/` photo resize script, photo list, local preview server
- `ASSETS.md` every photo, its original file and where it appears

## How changes go live

- Pushing to `main` deploys to production (infint.co.za) automatically through Cloudflare Pages, in about a minute.
- **Never push to `main` without Tshedza's explicit go-ahead.**
- Work on the `preview` branch. Pushing `preview` publishes it to https://preview.infint.pages.dev for Tshedza to check on any device.
- When he approves, merge `preview` into `main` and push.
- For a quick local look, start the preview server (`.claude/launch.json` is set up; or run `powershell -ExecutionPolicy Bypass -File tools\serve.ps1` and open http://localhost:8000). The forms can't send email locally or on the preview branch; they fall back to the WhatsApp and email buttons, which is expected.
- Git for Windows is installed at `C:\Program Files\Git\cmd`. The remote is `https://github.com/CHPTMT/infint-website.git`.
- Commit messages should be plain and short.

## Rules for any text on the site or in documents written for Tshedza

- Never use em dashes or en dashes. Use commas, full stops or "to" for ranges.
- Plain, direct language. No filler or AI-sounding words (delve, intricate, tapestry, pivotal, robust, seamless, elevate, crucial, foster, testament, landscape, enhance, profound, cutting-edge, world-class).
- No fake testimonials, invented statistics or claims that aren't true.
- No personal pronoun "we" for INFINT; Tshedza is a one-person business and the site speaks as "I".
- Documents he asks for (Word, PDF): Times New Roman 12 pt, no italics, no comments.

## Design rules

- Colours: ink `#0E1115`, white, bone `#F5F5F3`, amber accent `#FFA000` (from his logo). Keep these.
- Fonts: Outfit (modern sans: body, most headings, labels, buttons; body and small text at 400 or 500, white or bone, never thin or grey) and Montserrat Bold or Black (big titles, menu links, prices and big numbers, About text). Both self-hosted in `assets/fonts`. No italic accent words.
- About photo is black and white with extra contrast; keep it that height.
- No thin decorative lines beside headings. No client gallery, admin page or database (removed on purpose).
- Within each Work category, photos are ordered so frames from the same shoot never sit next to each other. `node tools/order-photos.js --write` does this: it works out shoots from the original file names and checks the real grid at 2 to 6 columns. Run it after adding photos.
- No low-res photos: `srcset` widths must be each file's real width (thumbs are 720 px on the LONG side). Photos shown big (hero pools, rates teaser) also have 2600 px copies in `assets/hero`; rebuild them with `tools\resize-hero.ps1` after changing a pool, and only put photos into a hero pool whose original is at least 2600 px on the long side.

## Adding photos

See ASSETS.md. Originals live on Tshedza's PC in `C:\Users\tshed\Pictures\INF JPG\Website Commits\` (sorted into folders). Add rows to `tools/photos.csv`, run `tools\resize-photos.ps1`, then add entries to `PHOTOS` in `js/content.js` using the sizes in `tools/photos-manifest.csv`, then run `node tools/order-photos.js --write`.

## Secrets

Never put keys in the repo. The repo is public. `RESEND_API_KEY` lives only in Cloudflare (Pages project `infint`, Settings, Variables and secrets).

## Handover protocol

Tshedza moves between this Claude Code session and a Claude chat that automates his browser and PC. When he says "export handover" (or similar):
1. Update the "Latest handover" section at the top of HANDOVER.md: date, what changed this session, what's on `preview` vs `main`, open questions, next steps.
2. Commit it (to the current branch) and tell him the file is ready to attach to the chat.
When he pastes or attaches a handover from the chat, read it, then update HANDOVER.md's "Latest handover" with anything new before starting work.
