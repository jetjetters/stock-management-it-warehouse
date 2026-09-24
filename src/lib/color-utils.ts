export type RgbColor = {
  r: number;
  g: number;
  b: number;
};

export function hexToRgb(hex: string): RgbColor {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((char) => char + char)
      .join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) {
    return { r: 185, g: 0, b: 81 }; // Default Pertamina magenta fallback
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function adjustBrightness(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 + percent / 100;
  const clamp = (val: number) => Math.min(255, Math.max(0, Math.round(val)));
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(clamp(r * factor))}${toHex(clamp(g * factor))}${toHex(clamp(b * factor))}`;
}

export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
