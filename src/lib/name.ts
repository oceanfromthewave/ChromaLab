import type { Oklch } from './color';

const HUE_NAMES: { range: [number, number]; name: string }[] = [
  { range: [0, 15], name: '진홍' },
  { range: [15, 35], name: '잉걸' },
  { range: [35, 55], name: '호박' },
  { range: [55, 80], name: '꿀빛' },
  { range: [80, 110], name: '라임' },
  { range: [110, 145], name: '이끼' },
  { range: [145, 175], name: '비취' },
  { range: [175, 200], name: '청록' },
  { range: [200, 225], name: '하늘' },
  { range: [225, 255], name: '사파이어' },
  { range: [255, 285], name: '남색' },
  { range: [285, 315], name: '보라' },
  { range: [315, 340], name: '자홍' },
  { range: [340, 360], name: '장미' },
];

const QUALIFIERS = [
  { lt: 0.25, name: '먹' },
  { lt: 0.4, name: '짙은' },
  { lt: 0.55, name: '진한' },
  { lt: 0.7, name: '선명한' },
  { lt: 0.85, name: '부드러운' },
  { lt: 1.01, name: '옅은' },
];

export function nameSwatch(c: Oklch): string {
  if (c.c < 0.02) {
    if (c.l < 0.15) return '흑요석';
    if (c.l < 0.35) return '흑연';
    if (c.l < 0.55) return '슬레이트';
    if (c.l < 0.75) return '안개';
    if (c.l < 0.92) return '진주';
    return '눈빛';
  }
  const h = ((c.h % 360) + 360) % 360;
  const hue = HUE_NAMES.find((r) => h >= r.range[0] && h < r.range[1]) ?? HUE_NAMES[0];
  const qual = QUALIFIERS.find((q) => c.l < q.lt) ?? QUALIFIERS[QUALIFIERS.length - 1];
  return `${qual.name} ${hue.name}`;
}
