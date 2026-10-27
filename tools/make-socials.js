/*
  Makes the profile screenshots on the Socials page and the home page "Follow along" section.
  Refresh the screenshots every few months:
    1. Save new phone screenshots as instagram.png, tiktok.png and youtube.png in
       C:\Users\tshed\Pictures\INF JPG\Website Commits\socials
    2. npm --prefix tools install   (once, installs sharp)
    3. node tools/make-socials.js
  Each one is resized to 1000 px tall and saved as PNG and WebP in assets/socials.
  On Instagram the "Followed by ..." row shows other people, so it is blurred. BLUR is that row as fractions of
  the screenshot (top and height), so it still fits if the new screenshot is a slightly different size.
  Check the result: if Instagram moves the row, change the numbers.
*/
const fs = require("fs"), path = require("path");
const sharp = require(path.join(__dirname, "node_modules", "sharp"));

const SRC = "C:\\Users\\tshed\\Pictures\\INF JPG\\Website Commits\\socials";
const OUT = path.join(__dirname, "..", "assets", "socials");
const HEIGHT = 1000;
const BLUR = { instagram: { top: 0.355, height: 0.068 } };
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  for (const name of ["instagram", "tiktok", "youtube"]) {
    let img = sharp(path.join(SRC, name + ".png"));
    const { width, height } = await img.metadata();
    const b = BLUR[name];
    if (b) {
      const top = Math.round(height * b.top), h = Math.round(height * b.height);
      const patch = await sharp(path.join(SRC, name + ".png")).extract({ left: 0, top, width, height: h }).blur(28).toBuffer();
      img = sharp(await img.composite([{ input: patch, left: 0, top }]).toBuffer());
    }
    const resized = await img.resize({ height: HEIGHT }).toBuffer();
    await sharp(resized).png({ compressionLevel: 9, palette: false }).toFile(path.join(OUT, name + ".png"));
    await sharp(resized).webp({ quality: 82, effort: 5 }).toFile(path.join(OUT, name + ".webp"));
    const m = await sharp(resized).metadata();
    console.log(name, m.width + "x" + m.height);
  }
})().catch(e => { console.error(e); process.exit(1); });
