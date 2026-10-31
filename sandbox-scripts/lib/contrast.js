// Pure colour maths: no browser or page access.

const HEX = /^#[0-9a-f]{6}$/i;

function parseHex(hex) {
  if (!HEX.test(hex)) throw new Error(`Not a #rrggbb colour: ${hex}`);
  return [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
}

const toHex = (rgb) => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;

function luminance(rgb) {
  const [r, g, b] = rgb.map((c) => {
    const channel = c / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(hexA, hexB) {
  const a = luminance(parseHex(hexA));
  const b = luminance(parseHex(hexB));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

// Smallest move of the text colour towards black or white that reaches `target`,
// so the hue stays as close as possible to the original. Returns null if neither
// direction can reach it.
export function adjustForegroundToContrast(fgHex, bgHex, target) {
  const fg = parseHex(fgHex);
  const bg = parseHex(bgHex);
  const candidates = [];

  for (const end of [0, 255]) {
    if (contrastRatio(toHex([end, end, end]), bgHex) < target) continue;
    let low = 0;
    let high = 1;
    for (let i = 0; i < 20; i += 1) {
      const mid = (low + high) / 2;
      const mixed = toHex(fg.map((c) => c + (end - c) * mid));
      if (contrastRatio(mixed, toHex(bg)) >= target) high = mid;
      else low = mid;
    }
    candidates.push({ amount: high, color: toHex(fg.map((c) => c + (end - c) * high)) });
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.amount - b.amount);
  return candidates[0].color;
}

// Machado et al. (2009) severity 1.0 matrices.
const SIMULATION = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
};

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

function simulate(rgb, matrix) {
  const linear = rgb.map((c) => toLinear(c / 255));
  return matrix.map((row) => {
    const value = row.reduce((sum, weight, i) => sum + weight * linear[i], 0);
    return toSrgb(Math.min(1, Math.max(0, value))) * 255;
  });
}

const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// RGB distance between two colours as seen normally and under each simulation.
// Input is [r, g, b]. A small simulated distance is evidence, not a verdict.
export function simulatedDifference(rgbA, rgbB) {
  return {
    normal: Math.round(distance(rgbA, rgbB)),
    protanopia: Math.round(distance(simulate(rgbA, SIMULATION.protanopia), simulate(rgbB, SIMULATION.protanopia))),
    deuteranopia: Math.round(distance(simulate(rgbA, SIMULATION.deuteranopia), simulate(rgbB, SIMULATION.deuteranopia))),
  };
}
