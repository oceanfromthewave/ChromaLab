import type { Oklch } from './color';
import { toCss, toHex, generateToneScale, TONE_STOPS } from './color';

export type ExportFormat = 'tailwind' | 'css' | 'json' | 'scss' | 'svg' | 'tokens';

function slug(name: string, fallback: string): string {
  const s = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return s || fallback;
}

export function exportDesignTokens(
  paletteName: string,
  swatches: { name: string; color: Oklch }[],
): string {
  const tokens: Record<string, any> = {};

  swatches.forEach(({ name, color }, i) => {
    const key = slug(name, `c${i + 1}`);
    const scale = generateToneScale(color);
    const colorGroup: Record<string, any> = {};

    TONE_STOPS.forEach((stop) => {
      colorGroup[stop] = {
        $value: toHex(scale[stop]),
        $type: 'color'
      };
    });

    tokens[key] = colorGroup;
  });

  return JSON.stringify({
    metadata: {
      name: paletteName,
      generatedBy: 'Chroma Lab'
    },
    ...tokens
  }, null, 2);
}

export function exportTailwind(
  paletteName: string,
  swatches: { name: string; color: Oklch }[],
): string {
  const colorEntries = swatches
    .map(({ name, color }, i) => {
      const key = slug(name, `c${i + 1}`);
      const scale = generateToneScale(color);
      const lines = TONE_STOPS.map((stop) => `      ${stop}: '${toHex(scale[stop])}',`).join('\n');
      return `    ${key}: {\n${lines}\n    },`;
    })
    .join('\n');

  return `// Generated with Chroma Lab — ${paletteName}
// Add this to tailwind.config.js → theme.extend.colors
module.exports = {
  theme: {
    extend: {
      colors: {
${colorEntries}
      },
    },
  },
};
`;
}

export function exportCssVariables(
  paletteName: string,
  swatches: { name: string; color: Oklch }[],
): string {
  const lines: string[] = [];
  swatches.forEach(({ name, color }, i) => {
    const key = slug(name, `c${i + 1}`);
    const scale = generateToneScale(color);
    TONE_STOPS.forEach((stop) => {
      lines.push(`  --${key}-${stop}: ${toHex(scale[stop])};`);
    });
  });
  return `/* Chroma Lab — ${paletteName} */
:root {
${lines.join('\n')}
}
`;
}

export function exportScss(
  paletteName: string,
  swatches: { name: string; color: Oklch }[],
): string {
  const blocks = swatches.map(({ name, color }, i) => {
    const key = slug(name, `c${i + 1}`);
    const scale = generateToneScale(color);
    const stops = TONE_STOPS.map((stop) => `  ${stop}: ${toHex(scale[stop])},`).join('\n');
    return `$${key}: (\n${stops}\n);`;
  });
  return `// Chroma Lab — ${paletteName}\n${blocks.join('\n\n')}\n`;
}

export function exportJson(
  paletteName: string,
  swatches: { name: string; color: Oklch }[],
): string {
  const obj: Record<string, unknown> = {
    name: paletteName,
    generatedBy: 'Chroma Lab',
    swatches: swatches.map(({ name, color }, i) => {
      const key = slug(name, `c${i + 1}`);
      const scale = generateToneScale(color);
      return {
        name: key,
        base: {
          hex: toHex(color),
          oklch: toCss(color, 'oklch'),
        },
        scale: Object.fromEntries(
          TONE_STOPS.map((stop) => [stop, toHex(scale[stop])]),
        ),
      };
    }),
  };
  return JSON.stringify(obj, null, 2);
}

export function exportSvg(
  paletteName: string,
  swatches: { name: string; color: Oklch }[],
): string {
  const w = 120;
  const h = 200;
  const swatchWidth = w;
  const totalW = w * swatches.length;
  const cards = swatches
    .map(({ name, color }, i) => {
      const x = i * swatchWidth;
      const hex = toHex(color);
      return `  <g transform="translate(${x},0)">
    <rect width="${w}" height="${h}" fill="${hex}"/>
    <text x="12" y="${h - 28}" font-family="Inter, system-ui, sans-serif" font-size="11" font-weight="600" fill="${textColor(hex)}">${escape(name)}</text>
    <text x="12" y="${h - 14}" font-family="ui-monospace, monospace" font-size="10" fill="${textColor(hex, 0.7)}">${hex.toUpperCase()}</text>
  </g>`;
    })
    .join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${h}" viewBox="0 0 ${totalW} ${h}">
  <title>${escape(paletteName)}</title>
${cards}
</svg>
`;
}

function escape(s: string): string {
  return s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c] as string));
}

function textColor(hex: string, alpha = 1): string {
  // Quick perceptual check based on luminance approximation
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const c = lum > 0.55 ? '0,0,0' : '255,255,255';
  return `rgba(${c},${alpha})`;
}

export function exportAll(
  format: ExportFormat,
  paletteName: string,
  swatches: { name: string; color: Oklch }[],
): string {
  switch (format) {
    case 'tailwind': return exportTailwind(paletteName, swatches);
    case 'css': return exportCssVariables(paletteName, swatches);
    case 'json': return exportJson(paletteName, swatches);
    case 'scss': return exportScss(paletteName, swatches);
    case 'svg': return exportSvg(paletteName, swatches);
    case 'tokens': return exportDesignTokens(paletteName, swatches);
  }
}
