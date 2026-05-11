import { converter } from 'culori';
import type { Oklch } from './color';

const toOklab = converter('oklab');
const toOklch = converter('oklch');

/**
 * Extract a palette of N dominant colors from an image using k-means
 * clustering in OKLAB space (perceptually uniform).
 */
export async function extractPalette(file: File, k = 6): Promise<Oklch[]> {
  const dataUrl = await fileToDataUrl(file);
  const img = await loadImage(dataUrl);
  const pixels = sampleImagePixels(img, 120);
  return kmeansOklab(pixels, k);
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function sampleImagePixels(img: HTMLImageElement, maxDim: number): number[][] {
  const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.max(1, Math.floor(img.width * ratio));
  const h = Math.max(1, Math.floor(img.height * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;

  const out: number[][] = [];
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 128) continue;
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const lab = toOklab({ mode: 'rgb', r, g, b });
    if (!lab) continue;
    out.push([lab.l ?? 0, lab.a ?? 0, lab.b ?? 0]);
  }
  return out;
}

function kmeansOklab(points: number[][], k: number, maxIter = 24): Oklch[] {
  if (points.length === 0) return [];
  const actualK = Math.min(k, points.length);
  // k-means++ initialization
  const centroids: number[][] = [];
  centroids.push(points[Math.floor(Math.random() * points.length)].slice());
  while (centroids.length < actualK) {
    const dists = points.map((p) => {
      let min = Infinity;
      for (const c of centroids) {
        const d = sqDist(p, c);
        if (d < min) min = d;
      }
      return min;
    });
    const sum = dists.reduce((a, b) => a + b, 0);
    if (sum === 0) {
      centroids.push(points[Math.floor(Math.random() * points.length)].slice());
      continue;
    }
    let r = Math.random() * sum;
    let chosenIdx = 0;
    for (let i = 0; i < dists.length; i++) {
      r -= dists[i];
      if (r <= 0) { chosenIdx = i; break; }
    }
    centroids.push(points[chosenIdx].slice());
  }

  const assignments = new Int32Array(points.length);

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;
    for (let i = 0; i < points.length; i++) {
      let best = 0;
      let bestD = Infinity;
      for (let j = 0; j < centroids.length; j++) {
        const d = sqDist(points[i], centroids[j]);
        if (d < bestD) { bestD = d; best = j; }
      }
      if (assignments[i] !== best) {
        assignments[i] = best;
        changed = true;
      }
    }
    if (!changed && iter > 0) break;

    const sums = centroids.map(() => [0, 0, 0]);
    const counts = new Int32Array(centroids.length);
    for (let i = 0; i < points.length; i++) {
      const a = assignments[i];
      sums[a][0] += points[i][0];
      sums[a][1] += points[i][1];
      sums[a][2] += points[i][2];
      counts[a]++;
    }
    for (let j = 0; j < centroids.length; j++) {
      if (counts[j] === 0) continue;
      centroids[j][0] = sums[j][0] / counts[j];
      centroids[j][1] = sums[j][1] / counts[j];
      centroids[j][2] = sums[j][2] / counts[j];
    }
  }

  // Sort by cluster size (most dominant first)
  const counts = new Int32Array(centroids.length);
  for (let i = 0; i < points.length; i++) counts[assignments[i]]++;
  const sorted = centroids
    .map((c, i) => ({ c, n: counts[i] }))
    .sort((a, b) => b.n - a.n)
    .map((x) => x.c);

  return sorted.map((lab) => {
    const oklch = toOklch({ mode: 'oklab', l: lab[0], a: lab[1], b: lab[2] });
    return {
      mode: 'oklch' as const,
      l: oklch?.l ?? 0,
      c: oklch?.c ?? 0,
      h: oklch?.h ?? 0,
    };
  });
}

function sqDist(a: number[], b: number[]): number {
  const d0 = a[0] - b[0];
  const d1 = a[1] - b[1];
  const d2 = a[2] - b[2];
  return d0 * d0 + d1 * d1 + d2 * d2;
}
