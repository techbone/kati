// Renders "Kati" in Fraunces SemiBold as outlines → transparent PNG, and
// composes the splash image (mark + wordmark). Run from assets/brand with
// `node build-icons.js` first so the mark exists.
const fontkit = require('fontkit');
const sharp = require('sharp');
const fs = require('fs');

const [FONT, MARK, OUT] = process.argv.slice(2);

async function wordmarkPng(text, size, fill) {
  const font = fontkit.openSync(FONT);
  const run = font.layout(text);
  const k = size / font.unitsPerEm;
  let x = 0;
  const parts = [];
  run.glyphs.forEach((g, i) => {
    const p = run.positions[i];
    parts.push(g.path.scale(k, -k).translate(x + p.xOffset * k, 0).toSVG());
    x += p.xAdvance * k;
  });
  const asc = font.ascent * k, desc = font.descent * k;
  const w = Math.ceil(x), h = Math.ceil(asc - desc);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 ${-asc} ${w} ${h}"><path d="${parts.join(' ')}" fill="${fill}"/></svg>`;
  return sharp(Buffer.from(svg), { density: 300 }).png().toBuffer();
}

(async () => {
  const word = await sharp(await wordmarkPng('Kati', 200, '#FFFFFF')).trim({ threshold: 1 }).resize({ width: 300 }).png().toBuffer();
  const wm = await sharp(word).metadata();
  const w = 450;
  const mark = await sharp(MARK).resize({ width: w }).toBuffer();
  const mm = await sharp(mark).metadata();
  const gap = 56;
  const W = Math.max(w, wm.width), H = mm.height + gap + wm.height;
  await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: mark, left: Math.round((W - w) / 2), top: 0 },
      { input: word, left: Math.round((W - wm.width) / 2), top: mm.height + gap },
    ]).png().toFile(OUT);
  console.log('wrote', OUT, `${W}x${H}`);
})();
