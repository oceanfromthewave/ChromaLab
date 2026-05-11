import {
  parse,
  formatHex,
  formatCss,
  converter,
  wcagContrast,
  wcagLuminance,
  clampChroma,
  type Color,
} from 'culori';

const toOklch = converter('oklch');
const toRgb = converter('rgb');

export type Oklch = { mode: 'oklch'; l: number; c: number; h: number; alpha?: number };

export const HARMONY_RULES = [
  'monochromatic',
  'analogous',
  'complementary',
  'split-complementary',
  'triadic',
  'tetradic',
  'compound',
] as const;
export type Harmony = (typeof HARMONY_RULES)[number];

export const TONE_STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type ToneStop = (typeof TONE_STOPS)[number];

const TONE_LIGHTNESS: Record<ToneStop, number> = {
  50: 0.975, 100: 0.945, 200: 0.885, 300: 0.81, 400: 0.71,
  500: 0.62, 600: 0.535, 700: 0.455, 800: 0.375, 900: 0.305, 950: 0.235,
};

export function parseColor(input: string): Oklch | null {
  const parsed = parse(input);
  if (!parsed) return null;
  const oklch = toOklch(parsed) as Oklch | undefined;
  if (!oklch) return null;
  return {
    mode: 'oklch',
    l: oklch.l ?? 0,
    c: oklch.c ?? 0,
    h: oklch.h ?? 0,
    alpha: oklch.alpha,
  };
}

export function toHex(c: Oklch): string {
  const safe = clampChroma(c, 'oklch');
  return formatHex(safe) ?? '#000000';
}

export function toCss(c: Oklch, mode: 'hex' | 'rgb' | 'oklch' | 'hsl' = 'hex'): string {
  if (mode === 'hex') return toHex(c);
  const safe = clampChroma(c, 'oklch') as Color;
  if (mode === 'oklch') return formatCss(safe) ?? toHex(c);
  const converted = converter(mode)(safe);
  return formatCss(converted as Color) ?? toHex(c);
}

export function withL(c: Oklch, l: number): Oklch {
  return { ...c, l };
}
export function withH(c: Oklch, h: number): Oklch {
  return { ...c, h: ((h % 360) + 360) % 360 };
}
export function withC(c: Oklch, chroma: number): Oklch {
  return { ...c, c: Math.max(0, chroma) };
}
export function rotateH(c: Oklch, deg: number): Oklch {
  return withH(c, c.h + deg);
}

/* ----------------------------- contrast ------------------------------ */

export function contrast(a: Oklch, b: Oklch): number {
  return wcagContrast(toHex(a), toHex(b));
}

export function luminance(c: Oklch): number {
  return wcagLuminance(toHex(c));
}

export type WcagLevel = 'AAA' | 'AA' | 'AA-large' | 'fail';

export function wcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA-large';
  return 'fail';
}

/* ----------------------------- harmonies ----------------------------- */

export function generateHarmony(base: Oklch, harmony: Harmony, count = 5): Oklch[] {
  const result: Oklch[] = [base];
  switch (harmony) {
    case 'monochromatic': {
      const offsets = [-0.22, -0.11, 0, 0.11, 0.22];
      return offsets.map((o) =>
        clampOklch({ ...base, l: clamp01(base.l + o), c: base.c * (1 - Math.abs(o) * 0.6) }),
      );
    }
    case 'analogous': {
      // -30, -15, 0, +15, +30
      const offsets = [-30, -15, 0, 15, 30];
      return offsets.map((d) => rotateH(base, d));
    }
    case 'complementary': {
      const comp = rotateH(base, 180);
      return [
        withL(base, clamp01(base.l + 0.18)),
        base,
        withL(base, clamp01(base.l - 0.18)),
        comp,
        withL(comp, clamp01(comp.l - 0.18)),
      ];
    }
    case 'split-complementary': {
      return [base, rotateH(base, 150), rotateH(base, 210), withL(base, clamp01(base.l - 0.2)), withL(base, clamp01(base.l + 0.2))];
    }
    case 'triadic': {
      return [
        withL(base, clamp01(base.l + 0.15)),
        base,
        rotateH(base, 120),
        rotateH(base, 240),
        withL(rotateH(base, 240), clamp01(base.l - 0.18)),
      ];
    }
    case 'tetradic': {
      return [
        base,
        rotateH(base, 60),
        rotateH(base, 180),
        rotateH(base, 240),
        withL(base, clamp01(base.l - 0.22)),
      ];
    }
    case 'compound': {
      return [
        withL(base, clamp01(base.l + 0.16)),
        base,
        rotateH(base, 30),
        rotateH(base, 195),
        rotateH(base, 165),
      ];
    }
  }
  return result.slice(0, count).map(clampOklch);
}

/* --------------------------- tone scale 50-950 ----------------------- */

/**
 * Generate a Tailwind-style 11-stop tone scale from a base color.
 * Uses OKLCH lightness targets and a chroma curve that peaks near the mid-tone.
 */
export function generateToneScale(base: Oklch): Record<ToneStop, Oklch> {
  const out = {} as Record<ToneStop, Oklch>;
  const baseChroma = base.c || 0.12;
  for (const stop of TONE_STOPS) {
    const l = TONE_LIGHTNESS[stop];
    // Chroma envelope: high in mid-lightness (0.4-0.7), tapers at the edges.
    const lightnessDelta = Math.abs(l - 0.6);
    const chromaScale = Math.max(0.18, 1 - lightnessDelta * 1.4);
    out[stop] = clampOklch({
      mode: 'oklch',
      l,
      c: baseChroma * chromaScale,
      h: base.h,
    });
  }
  return out;
}

/* --------------------------- helpers --------------------------------- */

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export function clampOklch(c: Oklch): Oklch {
  const clamped = clampChroma({ mode: 'oklch', l: clamp01(c.l), c: Math.max(0, c.c), h: ((c.h % 360) + 360) % 360 }, 'oklch') as Oklch;
  return {
    mode: 'oklch',
    l: clamp01(clamped.l ?? 0),
    c: Math.max(0, clamped.c ?? 0),
    h: ((clamped.h ?? 0) % 360 + 360) % 360,
  };
}

export function isLight(c: Oklch): boolean {
  return luminance(c) > 0.5;
}

export function bestTextColor(bg: Oklch): Oklch {
  const white: Oklch = { mode: 'oklch', l: 1, c: 0, h: 0 };
  const black: Oklch = { mode: 'oklch', l: 0, c: 0, h: 0 };
  return contrast(bg, white) >= contrast(bg, black) ? white : black;
}

/* --------------------------- random base ----------------------------- */

export function randomBase(): Oklch {
  const h = Math.random() * 360;
  const l = 0.55 + Math.random() * 0.15;
  const c = 0.12 + Math.random() * 0.12;
  return clampOklch({ mode: 'oklch', l, c, h });
}

/* ------------------------ rgb helpers for canvas --------------------- */

export function oklchToRgb255(c: Oklch): { r: number; g: number; b: number } {
  const safe = clampChroma(c, 'oklch');
  const rgb = toRgb(safe);
  if (!rgb) return { r: 0, g: 0, b: 0 };
  return {
    r: Math.round(Math.max(0, Math.min(1, rgb.r ?? 0)) * 255),
    g: Math.round(Math.max(0, Math.min(1, rgb.g ?? 0)) * 255),
    b: Math.round(Math.max(0, Math.min(1, rgb.b ?? 0)) * 255),
  };
}
