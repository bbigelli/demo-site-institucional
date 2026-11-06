// WCAG 2.1 contrast checker for the Clinica Movimento palette.
// Usage: node build/check-contrast.mjs
//
// IMPORTANT, learned on demo 1 (2026-11-06): passing here is necessary but
// NOT sufficient. This script checks the palette we designed; it cannot see
// what the browser actually paints.
//
// On demo 1 Lighthouse found 74 failing elements on a page whose palette
// passed this check clean, because Elementor's global kit was painting every
// text widget #7A7A7A (4.29:1) over our CSS. The palette was fine. The render
// was not.
//
// So: run this when choosing colors, and ALSO audit the rendered page in a
// browser before calling contrast done. See docs/identidade-visual.md.

const srgbToLinear = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex) => {
  const [r, g, b] = hex.replace('#', '').match(/../g).map((h) => parseInt(h, 16));
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
};

const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// Teal frio e muito espaco em branco, deliberadamente oposto ao laranja
// quente da demo 1. Mesma arquitetura, leitura visual completamente outra.
const PALETTE = {
  ink: '#0F172A',
  inkSoft: '#475569',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFC',
  surfaceDeep: '#134E4A',
  primary: '#0F766E',
  primaryHover: '#115E59',
  primaryTint: '#F0FDFA',
  accent: '#0E7490',
  success: '#15803D',
  whatsapp: '#075E54',
  border: '#E2E8F0',
  // Nao faz parte da paleta: cor de texto do kit global do Elementor,
  // aqui para documentar por que precisa ser sobrescrita.
  elementorText: '#7A7A7A',
};

// [label, foreground, background, isLargeText]
const PAIRS = [
  ['body text on white', 'ink', 'surface', false],
  ['secondary text on white', 'inkSoft', 'surface', false],
  ['body text on surfaceAlt', 'ink', 'surfaceAlt', false],
  ['secondary text on surfaceAlt', 'inkSoft', 'surfaceAlt', false],
  ['white text on primary CTA', 'surface', 'primary', false],
  ['white text on primaryHover', 'surface', 'primaryHover', false],
  ['primary link on white', 'primary', 'surface', false],
  ['primary on primaryTint (badge)', 'primary', 'primaryTint', false],
  ['white text on surfaceDeep', 'surface', 'surfaceDeep', false],
  ['accent text on white', 'accent', 'surface', false],
  ['success text on white', 'success', 'surface', false],
  ['white text on whatsapp button', 'surface', 'whatsapp', false],
  ['border as text (AVOID)', 'border', 'surfaceAlt', false],
  ['Elementor kit text on white (AVOID)', 'elementorText', 'surface', false],
];

const threshold = (large) => (large ? 3.0 : 4.5);
let failures = 0;

console.log('WCAG 2.1 AA contrast report -- Clinica Movimento palette\n');
console.log('pair'.padEnd(38), 'ratio'.padEnd(8), 'need'.padEnd(6), 'verdict');
console.log('-'.repeat(72));

for (const [label, fg, bg, large] of PAIRS) {
  const r = ratio(PALETTE[fg], PALETTE[bg]);
  const need = threshold(large);
  const passAA = r >= need;
  const passAAA = r >= (large ? 4.5 : 7);
  const verdict = passAAA ? 'AAA' : passAA ? 'AA' : 'FAIL';
  if (!passAA && !label.includes('AVOID')) failures += 1;
  console.log(label.padEnd(38), r.toFixed(2).padEnd(8), need.toFixed(1).padEnd(6), verdict);
}

console.log('-'.repeat(72));
console.log(failures === 0 ? 'OK: no unexpected failures.' : `${failures} unexpected failure(s).`);
if (failures > 0) process.exit(1);
