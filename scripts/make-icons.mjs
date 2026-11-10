// Rasterises the S-orbit mark into the icon files Next.js picks up from src/app:
//   favicon.ico     48/32/16 px from app/icon.svg (the tab cut), for browsers without SVG favicons
//   apple-icon.png  180 px full-bleed tile with the master artwork; iOS rounds the corners itself
// Usage: npm run icons. Needs sharp, which Next.js already installs for image optimisation.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const app = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "app");

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error("sharp is missing: run `npm i -D sharp` and try again.");
  process.exit(1);
}

// Same shapes as markArt() in src/components/Logo.tsx (120 grid).
const MASTER = `
  <polygon points="60,12 101.6,36 101.6,84 60,108 18.4,84 18.4,36" fill="none" stroke="#3db8ff" stroke-width="2.5" opacity=".6"/>
  <path d="M76 36 A16 16 0 1 0 60 60 A16 16 0 1 1 44 84" fill="none" stroke="#3ee0ff" stroke-width="6" stroke-linecap="round"/>
  <circle cx="60" cy="60" r="7" fill="#e8f7ff"/>
  <circle cx="76" cy="36" r="5" fill="#3ee0ff"/>
  <circle cx="44" cy="84" r="5.5" fill="#ff2e88"/>`;

// Master scaled 1.25x into a 180 tile, over a deep-blue halo, with a soft neon bloom.
const APPLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
  <radialGradient id="halo">
    <stop offset="0" stop-color="#0b4a99" stop-opacity=".7"/>
    <stop offset=".55" stop-color="#0b4a99" stop-opacity=".18"/>
    <stop offset="1" stop-color="#0b4a99" stop-opacity="0"/>
  </radialGradient>
  <filter id="bloom" x="-25%" y="-25%" width="150%" height="150%">
    <feGaussianBlur stdDeviation="2.6" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <rect width="180" height="180" fill="#02050b"/>
  <circle cx="90" cy="90" r="90" fill="url(#halo)"/>
  <g transform="translate(15 15) scale(1.25)" filter="url(#bloom)">${MASTER}</g>
</svg>`;

/** Renders an SVG straight at the target size, so small sizes are rasterised rather than downscaled. */
const png = (svg, size) => {
  const sized = svg.replace(/<svg\b[^>]*>/, (tag) =>
    tag.replace(/\s(width|height)="[^"]*"/g, "").replace("<svg", `<svg width="${size}" height="${size}"`),
  );
  return sharp(Buffer.from(sized)).png({ compressionLevel: 9 }).toBuffer();
};

/** ICO container with PNG-compressed entries (supported since Windows Vista and by every browser). */
function ico(images) {
  const head = Buffer.alloc(6 + 16 * images.length);
  head.writeUInt16LE(1, 2); // type: icon
  head.writeUInt16LE(images.length, 4);
  let offset = head.length;
  images.forEach(({ size, data }, i) => {
    const at = 6 + 16 * i;
    head.writeUInt8(size % 256, at); // 0 means 256
    head.writeUInt8(size % 256, at + 1);
    head.writeUInt16LE(1, at + 4); // colour planes
    head.writeUInt16LE(32, at + 6); // bits per pixel
    head.writeUInt32LE(data.length, at + 8);
    head.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });
  return Buffer.concat([head, ...images.map((im) => im.data)]);
}

const tab = readFileSync(join(app, "icon.svg"), "utf8");
// Largest first: Next.js reads the first entry for the <link sizes>, as with its default favicon.
const sizes = [48, 32, 16];
const favicon = ico(await Promise.all(sizes.map(async (size) => ({ size, data: await png(tab, size) }))));
writeFileSync(join(app, "favicon.ico"), favicon);

const apple = await png(APPLE, 180);
writeFileSync(join(app, "apple-icon.png"), apple);

console.log(`favicon.ico     ${sizes.join("/")} px, ${favicon.length} B`);
console.log(`apple-icon.png  180 px, ${apple.length} B`);
