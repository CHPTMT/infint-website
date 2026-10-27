/*
  Makes the WebP copies the site serves, and each photo's placeholder colour.
  Run after adding or changing photos (and after tools\resize-hero.ps1):
    npm --prefix tools install      (once, installs sharp)
    node tools/make-webp.js         (only makes missing files; add --all to redo every file)

  Sizes are the LONG side, so a portrait 720 file is 480 px wide:
    assets/w/360   small strips and cards on phones
    assets/w/720   same size as the JPEG thumbs
    assets/w/1200  phone screens at 2x and 3x, tiles on retina laptops
    assets/w/2000  same size as the JPEG full photos
    assets/w/2600  only the photos in assets/hero (shown biggest)
  The JPEGs in assets/thumbs, assets/photos and assets/hero stay as the fallback and for the lightbox.

  It also writes "c" (the photo's dominant colour) into each PHOTOS entry in js/content.js,
  which the grid shows behind a tile until its photo arrives.
*/
const fs = require("fs"), path = require("path");
const sharp = require(path.join(__dirname, "node_modules", "sharp"));

const ROOT = path.join(__dirname, "..");
const ALL = process.argv.includes("--all");
const SIZES = [360, 720, 1200, 2000];
const QUALITY = 78;
const out = long => path.join(ROOT, "assets", "w", String(long));
[...SIZES, 2600].forEach(s => fs.mkdirSync(out(s), { recursive: true }));

const ids = fs.readdirSync(path.join(ROOT, "assets", "photos")).filter(f => f.endsWith(".jpg")).map(f => f.slice(0, -4));
const heroIds = fs.readdirSync(path.join(ROOT, "assets", "hero")).filter(f => f.endsWith(".jpg")).map(f => f.slice(0, -4));

async function make(src, dest, long) {
  if (!ALL && fs.existsSync(dest)) return false;
  await sharp(src).rotate().resize({ width: long, height: long, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 5 }).toFile(dest);
  return true;
}

(async () => {
  let made = 0;
  const colours = {};
  for (const id of ids) {
    const src = path.join(ROOT, "assets", "photos", id + ".jpg");
    for (const long of SIZES) if (await make(src, path.join(out(long), id + ".webp"), long)) made++;
    const { dominant } = await sharp(path.join(out(360), id + ".webp")).stats();
    colours[id] = "#" + [dominant.r, dominant.g, dominant.b].map(v => Math.round(v * 0.55).toString(16).padStart(2, "0")).join(""); // darkened, so it sits in the dark page
  }
  for (const id of heroIds) if (await make(path.join(ROOT, "assets", "hero", id + ".jpg"), path.join(out(2600), id + ".webp"), 2600)) made++;
  // Remove WebP files whose photo is gone
  for (const long of [...SIZES, 2600]) for (const f of fs.readdirSync(out(long))) {
    const id = f.replace(/\.webp$/, "");
    if (!(long === 2600 ? heroIds : ids).includes(id)) { fs.unlinkSync(path.join(out(long), f)); console.log("removed", long + "/" + f); }
  }

  // Placeholder colours into js/content.js
  const file = path.join(ROOT, "js", "content.js");
  let c = fs.readFileSync(file, "utf8"), n = 0;
  c = c.replace(/\{"id": "([\w-]+)", "cat": "(\w+)", "r": ([\d.]+)(?:, "c": "#[0-9a-f]{6}")?/g, (m, id, cat, r) => {
    if (!colours[id]) return m;
    n++;
    return `{"id": "${id}", "cat": "${cat}", "r": ${r}, "c": "${colours[id]}"`;
  });
  fs.writeFileSync(file, c);
  console.log(`${made} WebP files written, ${n} placeholder colours set in js/content.js`);
})().catch(e => { console.error(e); process.exit(1); });
