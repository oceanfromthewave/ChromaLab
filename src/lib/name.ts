import type { Oklch } from './color';

const HUE_NAMES: { range: [number, number]; name: string }[] = [
  { range: [0, 15], name: 'Crimson' },
  { range: [15, 35], name: 'Ember' },
  { range: [35, 55], name: 'Amber' },
  { range: [55, 80], name: 'Honey' },
  { range: [80, 110], name: 'Lime' },
  { range: [110, 145], name: 'Moss' },
  { range: [145, 175], name: 'Jade' },
  { range: [175, 200], name: 'Teal' },
  { range: [200, 225], name: 'Cerulean' },
  { range: [225, 255], name: 'Sapphire' },
  { range: [255, 285], name: 'Indigo' },
  { range: [285, 315], name: 'Violet' },
  { range: [315, 340], name: 'Magenta' },
  { range: [340, 360], name: 'Rose' },
];

const QUALIFIERS = [
  { lt: 0.25, name: 'Ink' },
  { lt: 0.4, name: 'Deep' },
  { lt: 0.55, name: 'Bold' },
  { lt: 0.7, name: 'Bright' },
  { lt: 0.85, name: 'Soft' },
  { lt: 1.01, name: 'Pale' },
];

export function nameSwatch(c: Oklch): string {
  if (c.c < 0.02) {
    if (c.l < 0.15) return 'Obsidian';
    if (c.l < 0.35) return 'Graphite';
    if (c.l < 0.55) return 'Slate';
    if (c.l < 0.75) return 'Mist';
    if (c.l < 0.92) return 'Pearl';
    return 'Snow';
  }
  const h = ((c.h % 360) + 360) % 360;
  const hue = HUE_NAMES.find((r) => h >= r.range[0] && h < r.range[1]) ?? HUE_NAMES[0];
  const qual = QUALIFIERS.find((q) => c.l < q.lt) ?? QUALIFIERS[QUALIFIERS.length - 1];
  return `${qual.name} ${hue.name}`;
}
