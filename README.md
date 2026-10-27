# INFINT website

Portfolio and booking site for INFINT, Tshedza Tshiololi's photography business in Johannesburg. Plain HTML, CSS and JavaScript with no build step. The one bit of server code is a small function that emails form enquiries.

## Files

```
index.html                 page shell: header, footer, photo viewer
css/style.css              all styling (colours and fonts at the top in :root)
js/content.js              photos, categories, rates, contact details, FAQ, copy
js/app.js                  page logic and router (pages are V.home, V.work, V.rates, V.book, V.contact, V.about)
functions/api/enquiry.js   Cloudflare Pages Function that emails form enquiries through Resend
assets/thumbs/             grid images, 720 px
assets/photos/             full-size images, 2000 px
tools/resize-photos.ps1    rebuilds both image folders from the original JPEGs (Windows PowerShell)
tools/photos.csv           list of every photo id and its original file
ASSETS.md                  every image listed with its source file and where it appears
```

Most day-to-day changes (prices, a new photo, a new FAQ answer) only touch `js/content.js`.

## Pages

| URL | Page |
|---|---|
| `#/` | Home: header image, what I shoot, recent frames, how it works |
| `#/work` | Portfolio, 227 photos, with filters: Events, Portraits, Matric dance, Sports & active, Fashion & editorial, Street, Details |
| `#/rates` | Graduation packages, short shoots, day rates, add-ons, day-rate estimator |
| `#/book` | Three-step booking enquiry |
| `#/contact` | Contact details and message form |
| `#/about` | About, before-your-shoot tips, FAQ |

There is no client gallery, admin page or database. Photos are plain files served by Cloudflare, so no database is needed for them. The full set of 227 photos is about 85 MB; Cloudflare Pages allows 20,000 files per site on the free plan, so there is room for thousands more photos. If the collection ever outgrows the repository, the next step is Cloudflare R2 (10 GB free, no charge for visitors viewing images).

## Run it locally

From this folder:

```
powershell -ExecutionPolicy Bypass -File tools\serve.ps1
```

(Claude Code's desktop app can start this itself from `.claude/launch.json`.) To preview online instead, push the `preview` branch and open https://preview.infint.pages.dev.

Then open http://localhost:8000. Everything works locally except the forms actually sending email, because the email function only runs on Cloudflare. Locally the forms fall back to "use WhatsApp or email instead", with the message already filled in.

## Hosting: Cloudflare Pages (free)

1. Put this folder in a GitHub repository (private is fine).
2. In Cloudflare: Workers & Pages > Create > Pages > Connect to Git, pick the repository.
3. Build settings: framework preset None, build command empty, output directory `/`.
4. Deploy. The site goes live on a `*.pages.dev` address.
5. Custom domain: Pages project > Custom domains > add `infint.co.za` (or whatever is bought) and follow the DNS steps.

After that, every push to the main branch redeploys automatically in about a minute.

## Making the forms send email (Resend, free tier)

1. Sign up at resend.com and create an API key.
2. In the Cloudflare Pages project: Settings > Variables and secrets, add:
   - `RESEND_API_KEY` (as a secret): the key from Resend
   - `NOTIFY_EMAIL`: `infintco@gmail.com`
3. Redeploy.

Until a domain is verified in Resend, emails come from `onboarding@resend.dev` and Resend only delivers them to the address the Resend account was created with, so sign up to Resend with infintco@gmail.com. The domain infint.co.za is now verified in Resend. Booking enquiries are sent as "INFINT Bookings <bookings@infint.co.za>" and contact messages as "INFINT Info <info@infint.co.za>". To change either, edit `SENDERS` in `functions/api/enquiry.js` or set `FROM_BOOKINGS` / `FROM_INFO` in Cloudflare.

Reply-to is set to the visitor's email, so hitting reply in Gmail answers the client directly. A hidden "company" field quietly drops most spam bots.

## Working on it with Claude Code

Open the repository in Claude Code and ask in plain words, for example:

- "Change the Signature graduation package to R1,800."
- "Add these five photos to the Events filter." (attach them)
- "Swap the homepage header photo for street-04."
- "Add a Matric dance rate card to the Rates page."

Writing rules for any copy on the site: no long dashes, plain direct language, no filler words.

## Design notes

- Colours: ink `#0E1115`, white, bone `#F5F5F3`, amber accent `#FFA000`, set in `css/style.css`.
- Fonts: Archivo (headings, wordmark), Inter (body), Montserrat Bold (About text), all from Google Fonts.
- The photo grid is a CSS column masonry, 4 columns on desktop, 3 on tablet, 2 on phones.
- Photos lazy-load, and each grid image carries its width and height so the page doesn't jump while loading.
