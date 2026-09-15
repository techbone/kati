const sharp = require('sharp');
const fs = require('fs');

const BRAND = '#1F5F4A';
const GIVEN = '#2E7D5B';
const DARK_BG = '#131311';
const RULE = '#D6E0DA';
const NAME = '#B7C4BC';

// The mark, in a 1024 box. `mono` renders a white silhouette with the stamp
// body cut out (for Android monochrome / notification icons).
function mark({ mono = false, scale = 1, shadow = true } = {}) {
  const white = '#FFFFFF';
  const cx = 512, cy = 516;
  const t = `translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`;

  const cardShadow = !mono && shadow
    ? `<rect x="282" y="222" width="500" height="640" rx="52" fill="rgba(0,0,0,0.28)" transform="rotate(-6 512 516)"/>`
    : '';

  const cardBody = `
    <g transform="rotate(-6 512 516)">
      <rect x="262" y="196" width="500" height="640" rx="52" fill="${white}"/>
      ${mono ? '' : `
      <circle cx="352" cy="292" r="40" fill="${BRAND}"/>
      <path d="M352 272v40M332 292h40" stroke="${white}" stroke-width="13" stroke-linecap="round"/>
      <path d="M418 292h222" stroke="${NAME}" stroke-width="20" stroke-linecap="round"/>
      <path d="M330 412h364M330 512h364M330 612h364M330 712h260" stroke="${RULE}" stroke-width="16" stroke-linecap="round"/>
      `}
    </g>`;

  const stampT = `rotate(10 652 706)`;
  const stamp = mono
    ? `
    <g transform="${stampT}">
      <circle cx="652" cy="706" r="172" fill="${white}"/>
    </g>`
    : `
    <g transform="${stampT}">
      <circle cx="652" cy="706" r="172" fill="${white}"/>
      <circle cx="652" cy="706" r="156" fill="${GIVEN}"/>
      <circle cx="652" cy="706" r="124" fill="none" stroke="${white}" stroke-width="8"/>
      <path d="M584 713l50 50l94-116" fill="none" stroke="${white}" stroke-width="42" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`;

  if (!mono) {
    return `<g transform="${t}">${cardShadow}${cardBody}${stamp}</g>`;
  }

  // Silhouette: card + ring, with the stamp body punched out, then the tick drawn back in.
  return `
    <defs>
      <mask id="punch">
        <rect width="1024" height="1024" fill="white"/>
        <g transform="${t}"><circle cx="652" cy="706" r="150" fill="black" transform="${stampT}"/></g>
      </mask>
    </defs>
    <g mask="url(#punch)"><g transform="${t}">${cardBody}${stamp}</g></g>
    <g transform="${t}"><g transform="${stampT}">
      <path d="M584 713l50 50l94-116" fill="none" stroke="${white}" stroke-width="46" stroke-linecap="round" stroke-linejoin="round"/>
    </g></g>`;
}

function svg(inner, bg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    ${bg ? `<rect width="1024" height="1024" fill="${bg}"/>` : ''}
    ${inner}
  </svg>`;
}

async function png(svgStr, out, { size = 1024, trim = false, opaque = false } = {}) {
  let buf = await sharp(Buffer.from(svgStr), { density: 300 }).resize(size, size).png().toBuffer();
  if (trim) buf = await sharp(buf).trim({ threshold: 1 }).toBuffer();
  if (opaque) buf = await sharp(buf).removeAlpha().toBuffer();
  await sharp(buf).png().toFile(out);
  const m = await sharp(out).metadata();
  console.log(out.padEnd(34), `${m.width}x${m.height}`, m.hasAlpha ? 'alpha' : 'opaque');
}

(async () => {
  fs.mkdirSync('out', { recursive: true });
  // iOS app icon: full bleed, opaque, light + dark
  await png(svg(mark(), BRAND), 'out/icon.png', { opaque: true });
  await png(svg(mark(), DARK_BG), 'out/icon-dark.png', { opaque: true });
  // Splash: mark only on transparent, trimmed tight; the plugin sets the bg colour
  await png(svg(mark({ scale: 1 })), 'out/splash-icon.png', { trim: true });
  // Android adaptive: foreground within the central safe zone, solid bg, monochrome
  await png(svg(mark({ scale: 0.62 })), 'out/android-icon-foreground.png');
  await png(svg('', BRAND), 'out/android-icon-background.png', { opaque: true });
  await png(svg(mark({ mono: true, scale: 0.62 })), 'out/android-icon-monochrome.png');
  // Notification (Android status bar): white silhouette
  await png(svg(mark({ mono: true, scale: 1 })), 'out/notification-icon.png', { size: 256 });
  // Web favicon
  await png(svg(mark(), BRAND), 'out/favicon.png', { size: 64, opaque: true });
  // Preview sheet: the icon at home-screen sizes so we judge it where it lives
  const base = await sharp('out/icon.png').toBuffer();
  const sizes = [180, 120, 87, 60, 40];
  const tiles = await Promise.all(sizes.map((s) => sharp(base).resize(s, s).toBuffer()));
  let x = 40;
  const composites = tiles.map((buf, i) => { const c = { input: buf, left: x, top: 60 }; x += sizes[i] + 40; return c; });
  await sharp({ create: { width: x + 20, height: 300, channels: 4, background: '#F6F5F1' } })
    .composite(composites).png().toFile('out/preview-sizes.png');
  console.log('done');
})();
