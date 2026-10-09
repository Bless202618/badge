// Generates PWA icons from public/icons/itopp-icon.svg.
// Usage: node scripts/gen-icons.cjs  (needs `sharp` installed)
const sharp = require("sharp");
const path = require("node:path");

const dir = path.join(__dirname, "..", "public", "icons");
const master = path.join(dir, "itopp-icon.svg");

async function main() {
  await sharp(master).resize(192, 192).png().toFile(path.join(dir, "icon-192.png"));
  await sharp(master).resize(512, 512).png().toFile(path.join(dir, "icon-512.png"));
  // Maskable: logo at 80% centered on brand-navy (safe zone for OS masks).
  const logo = await sharp(master).resize(410, 410).png().toBuffer();
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: "#0A1633" },
  })
    .composite([{ input: logo, left: 51, top: 51 }])
    .png()
    .toFile(path.join(dir, "maskable-512.png"));
  await sharp(master).resize(180, 180).png().toFile(path.join(dir, "..", "apple-touch-icon.png"));
  console.log("ICONS DONE");
}

main().catch((e) => {
  console.error("ICON FAIL:" + e.message);
  process.exit(1);
});
