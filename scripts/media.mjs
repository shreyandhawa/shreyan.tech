// Writes an 840px-wide copy (<name>-840.avif / .webp) beside every image in public/media wider than that,
// so small frames (Home cards) don't download the full screenshot. Skips copies that exist.
// 840 is SMALL in content/projects.ts. Run after adding media: npm run media
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const SMALL = 840;
const root = join(import.meta.dirname, "..", "public", "media");

for (const dir of readdirSync(root)) {
  for (const file of readdirSync(join(root, dir))) {
    const m = file.match(/^(.+?)(-\d+)?\.(avif|webp)$/);
    if (!m || m[2]) continue;
    const src = join(root, dir, file);
    const out = join(root, dir, `${m[1]}-${SMALL}.${m[3]}`);
    if (existsSync(out) || (await sharp(src).metadata()).width <= SMALL) continue;
    const img = sharp(src).resize({ width: SMALL });
    await (m[3] === "avif" ? img.avif({ quality: 60 }) : img.webp({ quality: 85 })).toFile(out);
    console.log("wrote", out);
  }
}
