// Draws the carved-wood panel shown beside the Jardí terapèutic title.
// Run from web_page/:  node scripts/make-carving.js
// Writes public/assets/images/jardi/garden-carving.svg
//
// How it works: everything drawn in the "cut" layer is gouged out of the board.
// The background inside the arch is cut away (so the motifs stand up in relief),
// then fine lines are incised into the motifs. One SVG filter turns that layer
// into wood: grain from noise, and light from the top left on the cut depth.

const fs = require('fs');
const path = require('path');

const W = 600, H = 720;
const r = (n) => Math.round(n * 10) / 10;

// ---------- shapes ----------
const board = `M0 ${H} V300 A300 300 0 0 1 600 300 V${H} Z`;
const field = `M34 ${H - 34} V300 A266 266 0 0 1 566 300 V${H - 34} Z`;
const groove = `M17 ${H - 17} V300 A283 283 0 0 1 583 300 V${H - 17} Z`;

// sun: disk + tapered rays
function sun(cx, cy) {
  let d = `M${cx - 32} ${cy} a32 32 0 1 0 64 0 a32 32 0 1 0 -64 0 Z`;
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2, w = 0.11;
    const p = (rad, ang) => `${r(cx + rad * Math.cos(ang))} ${r(cy + rad * Math.sin(ang))}`;
    const len = i % 2 ? 58 : 68;
    d += ` M${p(42, a - w)} L${p(len, a)} L${p(42, a + w)} Z`;
  }
  return d;
}
// crescent moon
const moon = (cx, cy, R) => `M${cx} ${cy - R} A${R} ${R} 0 1 0 ${cx} ${cy + R} A${R * 1.25} ${R * 1.25} 0 0 1 ${cx} ${cy - R} Z`;
// four-point star
const star = (cx, cy, s) => `M${cx} ${cy - s} Q${cx + s * 0.18} ${cy - s * 0.18} ${cx + s} ${cy} Q${cx + s * 0.18} ${cy + s * 0.18} ${cx} ${cy + s} Q${cx - s * 0.18} ${cy + s * 0.18} ${cx - s} ${cy} Q${cx - s * 0.18} ${cy - s * 0.18} ${cx} ${cy - s} Z`;

// the xop: a tall poplar, like the association's logo
const canopy = 'M300 196 C268 250 226 332 228 424 C230 494 262 528 300 530 C338 528 370 494 372 424 C374 332 332 250 300 196 Z';
const trunk = 'M291 522 L287 602 Q276 622 246 632 L354 632 Q324 622 313 602 L309 522 Z';
const ground = `M34 ${H - 34} V626 C120 604 200 614 300 618 C400 622 480 604 566 620 V${H - 34} Z`;

// half-width of the canopy at height y (for the leaf chevrons)
function canopyHalf(y) {
  if (y < 196) return 0;
  if (y <= 424) return 72 * Math.pow((y - 196) / 228, 0.75);
  return 72 * Math.sqrt(Math.max(0, 1 - Math.pow((y - 424) / 106, 2)));
}
let chevrons = 'M300 222 V516';
for (let y = 246; y <= 512; y += 22) {
  const w = canopyHalf(y) * 0.78;
  if (w < 8) continue;
  chevrons += ` M300 ${y} Q${r(300 - w * 0.5)} ${y - 4} ${r(300 - w)} ${r(y - 20)} M300 ${y} Q${r(300 + w * 0.5)} ${y - 4} ${r(300 + w)} ${r(y - 20)}`;
}

// pomegranate, with its little crown
const pomegranate = (cx, cy) => `M${cx - 36} ${cy} a36 34 0 1 0 72 0 a36 34 0 1 0 -72 0 Z
  M${cx - 12} ${cy - 30} L${cx - 15} ${cy - 46} L${cx - 6} ${cy - 38} L${cx} ${cy - 50} L${cx + 6} ${cy - 38} L${cx + 15} ${cy - 46} L${cx + 12} ${cy - 30} Z`;
const pomegranateCuts = (cx, cy) => `M${cx - 6} ${cy - 37} V${cy - 31} M${cx + 6} ${cy - 37} V${cy - 31}
  M${cx - 22} ${cy + 4} Q${cx - 20} ${cy - 16} ${cx - 4} ${cy - 22}`;

// quince: a lumpy pear with one leaf
const quince = (cx, cy) => `M${cx} ${cy - 40} C${cx + 16} ${cy - 40} ${cx + 18} ${cy - 22} ${cx + 22} ${cy - 10}
  C${cx + 36} ${cy + 4} ${cx + 38} ${cy + 36} ${cx} ${cy + 40} C${cx - 38} ${cy + 36} ${cx - 36} ${cy + 4} ${cx - 22} ${cy - 10}
  C${cx - 18} ${cy - 22} ${cx - 16} ${cy - 40} ${cx} ${cy - 40} Z
  M${cx + 2} ${cy - 42} C${cx + 14} ${cy - 66} ${cx + 40} ${cy - 66} ${cx + 52} ${cy - 56} C${cx + 38} ${cy - 40} ${cx + 16} ${cy - 38} ${cx + 2} ${cy - 42} Z`;
const quinceCuts = (cx, cy) => `M${cx + 6} ${cy - 46} Q${cx + 26} ${cy - 54} ${cx + 44} ${cy - 55}
  M${cx - 20} ${cy + 18} Q${cx - 22} ${cy - 2} ${cx - 12} ${cy - 14}`;

// medlar: round fruit with the open five-pointed crown on top
const medlar = (cx, cy) => `M${cx - 30} ${cy + 4} a30 28 0 1 0 60 0 a30 28 0 1 0 -60 0 Z`;
function medlarCuts(cx, cy) {
  let d = `M${cx - 17} ${cy - 16} Q${cx} ${cy - 6} ${cx + 17} ${cy - 16} M${cx - 17} ${cy - 16} Q${cx} ${cy - 28} ${cx + 17} ${cy - 16}`;
  for (const dx of [-11, -4, 4, 11]) d += ` M${cx + dx} ${cy - 15} L${cx + dx * 1.3} ${cy - 25}`;
  d += ` M${cx - 22} ${cy + 14} Q${cx - 22} ${cy} ${cx - 14} ${cy - 6}`;
  return d;
}

// hazelnut: a round nut sitting in its frilled husk
const nut = (cx, cy) => `M${cx - 26} ${cy + 6} a26 26 0 1 0 52 0 a26 26 0 1 0 -52 0 Z
  M${cx - 30} ${cy - 4} L${cx - 34} ${cy - 22} L${cx - 22} ${cy - 18} L${cx - 18} ${cy - 34} L${cx - 6} ${cy - 24} L${cx} ${cy - 38}
  L${cx + 6} ${cy - 24} L${cx + 18} ${cy - 34} L${cx + 22} ${cy - 18} L${cx + 34} ${cy - 22} L${cx + 30} ${cy - 4} Q${cx} ${cy - 12} ${cx - 30} ${cy - 4} Z`;
const nutCuts = (cx, cy) => `M${cx - 29} ${cy - 4} Q${cx} ${cy - 12} ${cx + 29} ${cy - 4}
  M${cx - 14} ${cy + 22} Q${cx - 18} ${cy + 10} ${cx - 12} ${cy}`;

// ginkgo: the fan leaf
const ginkgo = (cx, cy) => `M${cx - 3} ${cy + 36} L${cx - 3} ${cy + 6} L${cx - 42} ${cy - 22}
  A50 50 0 0 1 ${cx - 5} ${cy - 42} L${cx} ${cy - 30} L${cx + 5} ${cy - 42} A50 50 0 0 1 ${cx + 42} ${cy - 22}
  L${cx + 3} ${cy + 6} L${cx + 3} ${cy + 36} Z`;
function ginkgoCuts(cx, cy) {
  let d = '';
  for (const a of [-60, -38, -18, 18, 38, 60]) {
    const t = (a * Math.PI) / 180;
    d += ` M${r(cx + 6 * Math.sin(t))} ${r(cy + 2)} L${r(cx + 30 * Math.sin(t))} ${r(cy - 30 * Math.cos(t) + 4)}`;
  }
  return d;
}

// olive sprig: a twig with paired narrow leaves and two hanging olives
const OLIVE = { x0: -46, y0: 46, x1: 42, y1: -42 };
function olive(cx, cy) {
  const leaf = (x, y, ang, len) => {
    const t = (ang * Math.PI) / 180, ex = x + len * Math.cos(t), ey = y + len * Math.sin(t);
    const nx = -Math.sin(t) * 10, ny = Math.cos(t) * 10, mx = (x + ex) / 2, my = (y + ey) / 2;
    return ` M${r(x)} ${r(y)} Q${r(mx + nx)} ${r(my + ny)} ${r(ex)} ${r(ey)} Q${r(mx - nx)} ${r(my - ny)} ${r(x)} ${r(y)} Z`;
  };
  const at = (k) => [cx + OLIVE.x0 + (OLIVE.x1 - OLIVE.x0) * k, cy + OLIVE.y0 + (OLIVE.y1 - OLIVE.y0) * k];
  let d = '';
  [[0.22, 34], [0.48, 36], [0.74, 32]].forEach(([k, len]) => {
    const [x, y] = at(k);
    d += leaf(x, y, -100, len) + leaf(x, y, 10, len);
  });
  const [tx, ty] = at(1); d += leaf(tx - 4, ty + 4, -45, 30);
  const [ax, ay] = at(0.36), [bx, by] = at(0.62);
  d += ` M${r(ax - 2)} ${r(ay + 22)} a9 11 0 1 0 18 0 a9 11 0 1 0 -18 0 Z M${r(bx - 4)} ${r(by + 24)} a9 11 0 1 0 18 0 a9 11 0 1 0 -18 0 Z`;
  return d;
}
const oliveStem = (cx, cy) => `M${cx + OLIVE.x0} ${cy + OLIVE.y0} L${cx + OLIVE.x1} ${cy + OLIVE.y1}`;

// herbs: a few blades rising from the ground
function herbs(x0) {
  let d = '';
  [[0, -38, -8], [10, -50, 0], [20, -34, 9], [-12, -26, -16], [32, -24, 16]].forEach(([dx, h, lean]) => {
    const x = x0 + dx, y = 622;
    d += ` M${x - 3} ${y} Q${x - 2 + lean * 0.4} ${y + h * 0.6} ${x + lean} ${y + h} Q${x + 2 + lean * 0.4} ${y + h * 0.6} ${x + 3} ${y} Z`;
  });
  return d;
}

// a little labyrinth spiral and the furrows of the horta, cut into the ground
function spiral(cx, cy) {
  let d = '';
  for (let i = 0; i <= 160; i++) {
    const t = (i / 160) * Math.PI * 5.2, rad = 3 + t * 1.25;
    d += (i ? ' L' : 'M') + `${r(cx + rad * Math.cos(t))} ${r(cy + rad * Math.sin(t) * 0.62)}`;
  }
  return d;
}
const furrows = `M360 650 Q440 640 540 648 M372 668 Q450 660 546 668`;

// ---------- layers ----------
const raised = [
  sun(300, 112), moon(170, 178, 24), star(432, 168, 11), star(470, 226, 7), star(128, 252, 7),
  canopy, trunk, ground,
  pomegranate(144, 404), quince(456, 388), medlar(456, 518), nut(146, 520),
  ginkgo(186, 302), olive(418, 292), herbs(470),
].join(' ');

const cuts = [
  chevrons, 'M300 540 V600',
  pomegranateCuts(144, 404), quinceCuts(456, 388), medlarCuts(456, 518), nutCuts(146, 520), ginkgoCuts(186, 302),
  spiral(150, 652), furrows,
].join(' ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>Carved garden panel</title>
  <defs>
    <clipPath id="board"><path d="${board}"/></clipPath>
    <mask id="relief" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
      <path d="${field}" fill="#fff"/>
      <path d="${raised}" fill="#000" fill-rule="nonzero"/>
      <path d="${oliveStem(418, 292)}" fill="none" stroke="#000" stroke-width="9" stroke-linecap="round"/>
    </mask>
    <filter id="wood" filterUnits="userSpaceOnUse" x="-80" y="-80" width="${W + 160}" height="${H + 160}" color-interpolation-filters="sRGB">
      <!-- grain: stretched noise bent by slow noise, so it reads as plank grain,
           mapped to a pale wood tinted towards the page's sage ground (#e3e5da) -->
      <feTurbulence type="fractalNoise" baseFrequency="0.0025 0.09" numOctaves="3" seed="11" result="streaks"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="2" seed="3" result="warp"/>
      <feDisplacementMap in="streaks" in2="warp" scale="70" xChannelSelector="R" yChannelSelector="G" result="noise"/>
      <feColorMatrix in="noise" type="matrix" values="
        0.20 0 0 0 0.76
        0.20 0 0 0 0.755
        0.22 0 0 0 0.675
        0 0 0 0 1" result="grain"/>
      <!-- fine gouge marks only on the cut floor -->
      <feTurbulence type="turbulence" baseFrequency="0.09 0.03" numOctaves="2" seed="4" result="chips"/>
      <feColorMatrix in="chips" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.9 0 0 0 0.62" result="chipsA"/>
      <!-- depth: the cut layer, softened, lit from the top left; negative scale = carved in -->
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="depth"/>
      <feDiffuseLighting in="depth" surfaceScale="-5" diffuseConstant="1.32" lighting-color="#fff" result="light">
        <feDistantLight azimuth="225" elevation="48"/>
      </feDiffuseLighting>
      <feBlend in="grain" in2="light" mode="multiply" result="lit"/>
      <!-- the floor of every cut is darker and a little rough -->
      <feFlood flood-color="#8a8468" flood-opacity="0.3"/>
      <feComposite in2="SourceAlpha" operator="in" result="floor"/>
      <feFlood flood-color="#6e6a52" flood-opacity="0.22"/>
      <feComposite in2="chipsA" operator="in"/>
      <feComposite in2="SourceAlpha" operator="in" result="floorChips"/>
      <feBlend in="floor" in2="lit" mode="multiply" result="cut"/>
      <feBlend in="floorChips" in2="cut" mode="multiply"/>
    </filter>
  </defs>
  <g clip-path="url(#board)">
    <g filter="url(#wood)">
      <!-- invisible full-size rect so the filter covers the whole board -->
      <rect width="${W}" height="${H}" fill="#000" fill-opacity="0"/>
      <path d="${field}" mask="url(#relief)"/>
      <path d="${groove}" fill="none" stroke="#000" stroke-width="2.6"/>
      <path d="${cuts}" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </g>
</svg>
`;

const out = path.join(__dirname, '..', 'public', 'assets', 'images', 'jardi');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'garden-carving.svg'), svg);
console.log('wrote assets/images/jardi/garden-carving.svg (' + svg.length + ' bytes)');
