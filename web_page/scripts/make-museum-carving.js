// Draws the carved-wood panel shown beside the Museu title.
// Run from web_page/:  node scripts/make-museum-carving.js
// Writes public/assets/images/museum/museum-carving.svg
//
// Same board, wood and lighting as the Jardí panel (scripts/make-carving.js),
// with the museum's own objects: the entrance mirror with the Pyrenees inside it,
// wheat, the suitcase, the milk churn, the scale, the sickle and a pear.
// Everything in the "cut" layers is gouged out of the board; the "raised"
// shapes are left standing in relief.

const fs = require('fs');
const path = require('path');

const W = 600, H = 720;
const r = (n) => Math.round(n * 10) / 10;

// ---------- board ----------
const board = `M0 ${H} V300 A300 300 0 0 1 600 300 V${H} Z`;
const field = `M34 ${H - 34} V300 A266 266 0 0 1 566 300 V${H - 34} Z`;
const groove = `M17 ${H - 17} V300 A283 283 0 0 1 583 300 V${H - 17} Z`;
const ground = `M34 ${H - 34} V626 C120 604 200 614 300 618 C400 622 480 604 566 620 V${H - 34} Z`;
const furrows = 'M60 652 Q150 642 250 650 M72 670 Q160 662 254 670 M350 650 Q440 640 540 648 M346 668 Q440 660 546 668';

// ---------- motifs ----------
const ell = (cx, cy, rx, ry) => `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${rx * 2} 0 a${rx} ${ry} 0 1 0 ${-rx * 2} 0 Z`;
// four-point star (as on the Jardí panel)
const star = (cx, cy, s) => `M${cx} ${cy - s} Q${cx + s * 0.18} ${cy - s * 0.18} ${cx + s} ${cy} Q${cx + s * 0.18} ${cy + s * 0.18} ${cx} ${cy + s} Q${cx - s * 0.18} ${cy + s * 0.18} ${cx - s} ${cy} Q${cx - s * 0.18} ${cy - s * 0.18} ${cx} ${cy - s} Z`;

// the entrance mirror: an oval frame with a hook, and the mountains the family came from inside it
const mirror = { cx: 300, cy: 158, rx: 66, ry: 84 };
const mirrorFrame = ell(mirror.cx, mirror.cy, mirror.rx, mirror.ry) + ' ' + ell(mirror.cx, 66, 9, 9);
const mirrorGlass = ell(mirror.cx, mirror.cy, mirror.rx - 13, mirror.ry - 13); // cut back out of the frame
const mountains = 'M252 196 L274 156 L288 176 L306 138 L330 180 L340 168 L350 196 Z';
const mountainCuts = 'M306 138 L300 154 M274 156 L270 166 M256 210 Q300 202 344 210 M262 224 Q300 218 338 224';

// a wheat ear: grains on alternate sides of the stem, each tilted towards the tip
function wheatGrains(x0, y0, x1, y1) {
  const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len, nx = -uy, ny = ux;
  const base = (Math.atan2(uy, ux) * 180) / Math.PI;
  let d = '';
  for (let k = 0.42; k <= 0.97; k += 0.09) {
    const x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k;
    for (const side of [-1, 1]) {
      const a = base + side * 32, t = (a * Math.PI) / 180;
      const cx = x + nx * side * 7 + ux * 3, cy = y + ny * side * 7 + uy * 3;
      const sx = cx - 9 * Math.cos(t), sy = cy - 9 * Math.sin(t), ex = cx + 9 * Math.cos(t), ey = cy + 9 * Math.sin(t);
      d += ` M${r(sx)} ${r(sy)} A9 4.4 ${r(a)} 1 0 ${r(ex)} ${r(ey)} A9 4.4 ${r(a)} 1 0 ${r(sx)} ${r(sy)} Z`;
    }
  }
  return d;
}

// the suitcase
const caseBody = 'M96 372 Q96 362 106 362 L198 362 Q208 362 208 372 L208 434 Q208 444 198 444 L106 444 Q96 444 96 434 Z';
const caseHandle = 'M134 362 V350 Q134 344 140 344 H164 Q170 344 170 350 V362';
const caseCuts = 'M96 384 H208 M122 362 V444 M182 362 V444 M146 384 V394 H158 V384';

// the milk churn
const churn = `M286 300 H314 V312 H308 V340 C330 350 352 362 352 386 V500 Q352 516 336 516 H264 Q248 516 248 500 V386
  C248 362 270 350 292 340 V312 H286 Z`;
const churnHandles = 'M248 400 Q232 400 232 416 Q232 432 248 432 M352 400 Q368 400 368 416 Q368 432 352 432';
const churnCuts = 'M252 372 Q300 380 348 372 M250 458 H350 M250 476 H350 M292 340 H308';

// the scale: post, beam, two pans and a foot
const scaleBody = `M444 340 H456 V452 H444 Z M418 452 H482 L490 466 H410 Z M388 336 H512 V346 H388 Z
  M362 400 H422 Q418 420 392 420 Q366 420 362 400 Z M478 400 H538 Q534 420 508 420 Q482 420 478 400 Z ${ell(450, 334, 9, 9)}`;
const scaleStrings = 'M392 346 L368 400 M392 346 L416 400 M508 346 L484 400 M508 346 L532 400';

// the sickle: a crescent blade with its wooden handle
const sickle = 'M104 540 A46 46 0 0 1 196 540 A58 58 0 0 0 104 540 Z M188 536 L202 536 L208 594 Q202 600 194 594 Z';
const sickleCuts = 'M198 552 V586';

// a pear for the market
const pear = (cx, cy) => `M${cx} ${cy - 44} C${cx + 14} ${cy - 44} ${cx + 16} ${cy - 24} ${cx + 20} ${cy - 12}
  C${cx + 36} ${cy + 4} ${cx + 38} ${cy + 36} ${cx} ${cy + 40} C${cx - 38} ${cy + 36} ${cx - 36} ${cy + 4} ${cx - 20} ${cy - 12}
  C${cx - 16} ${cy - 24} ${cx - 14} ${cy - 44} ${cx} ${cy - 44} Z
  M${cx + 2} ${cy - 46} C${cx + 14} ${cy - 70} ${cx + 40} ${cy - 70} ${cx + 52} ${cy - 60} C${cx + 38} ${cy - 44} ${cx + 16} ${cy - 42} ${cx + 2} ${cy - 46} Z`;
const pearCuts = (cx, cy) => `M${cx + 6} ${cy - 50} Q${cx + 26} ${cy - 58} ${cx + 44} ${cy - 59}
  M${cx - 20} ${cy + 18} Q${cx - 22} ${cy - 2} ${cx - 12} ${cy - 14}`;

// ---------- layers ----------
const raised = [
  mirrorFrame, mountains, ground,
  star(214, 92, 9), star(386, 92, 9), star(180, 140, 6), star(420, 140, 6),
  wheatGrains(170, 300, 136, 196), wheatGrains(430, 300, 464, 196),
  caseBody, churn, scaleBody, sickle, pear(456, 548),
].join(' ');
// thin raised parts (stems, handles, strings), drawn as strokes in the relief mask
const raisedStrokes = [
  { d: 'M172 312 L136 196 M428 312 L464 196', w: 5 },
  { d: caseHandle, w: 7 },
  { d: churnHandles, w: 7 },
  { d: scaleStrings, w: 3 },
];
const cutBack = mirrorGlass; // re-cut the glass inside the frame
const cuts = [mountainCuts, caseCuts, churnCuts, sickleCuts, pearCuts(456, 548), furrows, 'M300 540 V600'].join(' ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>Carved museum panel</title>
  <defs>
    <clipPath id="board"><path d="${board}"/></clipPath>
    <mask id="relief" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
      <path d="${field}" fill="#fff"/>
      <path d="${raised}" fill="#000" fill-rule="nonzero"/>
      <path d="${cutBack}" fill="#fff"/>
      <path d="${mountains}" fill="#000"/>
${raisedStrokes.map((s) => `      <path d="${s.d}" fill="none" stroke="#000" stroke-width="${s.w}" stroke-linecap="round" stroke-linejoin="round"/>`).join('\n')}
    </mask>
    <filter id="wood" filterUnits="userSpaceOnUse" x="-80" y="-80" width="${W + 160}" height="${H + 160}" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.0025 0.09" numOctaves="3" seed="17" result="streaks"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="2" seed="5" result="warp"/>
      <feDisplacementMap in="streaks" in2="warp" scale="70" xChannelSelector="R" yChannelSelector="G" result="noise"/>
      <feColorMatrix in="noise" type="matrix" values="
        0.20 0 0 0 0.76
        0.20 0 0 0 0.755
        0.22 0 0 0 0.675
        0 0 0 0 1" result="grain"/>
      <feTurbulence type="turbulence" baseFrequency="0.09 0.03" numOctaves="2" seed="4" result="chips"/>
      <feColorMatrix in="chips" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.9 0 0 0 0.62" result="chipsA"/>
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="depth"/>
      <feDiffuseLighting in="depth" surfaceScale="-5" diffuseConstant="1.32" lighting-color="#fff" result="light">
        <feDistantLight azimuth="225" elevation="48"/>
      </feDiffuseLighting>
      <feBlend in="grain" in2="light" mode="multiply" result="lit"/>
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
      <rect width="${W}" height="${H}" fill="#000" fill-opacity="0"/>
      <path d="${field}" mask="url(#relief)"/>
      <path d="${groove}" fill="none" stroke="#000" stroke-width="2.6"/>
      <path d="${cuts}" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </g>
</svg>
`;

const out = path.join(__dirname, '..', 'public', 'assets', 'images', 'museum');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'museum-carving.svg'), svg);
console.log('wrote assets/images/museum/museum-carving.svg (' + svg.length + ' bytes)');
