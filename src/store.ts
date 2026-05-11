import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Oklch, Harmony } from './lib/color';
import { generateHarmony, parseColor, randomBase, toHex } from './lib/color';
import { nameSwatch } from './lib/name';

export type Swatch = {
  id: string;
  color: Oklch;
  name: string;
  locked: boolean;
};

export type SavedPalette = {
  id: string;
  name: string;
  swatches: Swatch[];
  harmony: Harmony;
  createdAt: number;
};

type Theme = 'light' | 'dark';

type State = {
  swatches: Swatch[];
  harmony: Harmony;
  selectedId: string | null;
  paletteName: string;
  theme: Theme;
  saved: SavedPalette[];
  showShortcuts: boolean;
  showInspector: boolean;
};

type Actions = {
  setHarmony: (h: Harmony) => void;
  shuffle: () => void;
  setBaseFromHex: (hex: string) => void;
  setSwatchColor: (id: string, color: Oklch) => void;
  toggleLock: (id: string) => void;
  removeSwatch: (id: string) => void;
  addSwatch: () => void;
  setFromExtracted: (colors: Oklch[]) => void;
  setSelected: (id: string | null) => void;
  setPaletteName: (n: string) => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  savePalette: () => void;
  loadPalette: (id: string) => void;
  deleteSaved: (id: string) => void;
  toggleShortcuts: () => void;
  toggleInspector: () => void;
  exportShareUrl: () => string;
  loadFromHash: (hash: string) => boolean;
};

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function swatchFrom(color: Oklch, locked = false): Swatch {
  return { id: makeId(), color, name: nameSwatch(color), locked };
}

function regenerate(base: Oklch, harmony: Harmony, existing: Swatch[]): Swatch[] {
  const generated = generateHarmony(base, harmony);
  // Keep locked swatches in their positions; replace unlocked ones in order.
  let genIdx = 0;
  const out: Swatch[] = [];
  const targetLen = Math.max(existing.length, generated.length);
  for (let i = 0; i < targetLen; i++) {
    const e = existing[i];
    if (e?.locked) {
      out.push(e);
    } else {
      const c = generated[genIdx++ % generated.length];
      out.push(e ? { ...e, color: c, name: nameSwatch(c) } : swatchFrom(c));
    }
  }
  return out.slice(0, 5);
}

const initialBase = randomBase();
const initialHarmony: Harmony = 'analogous';
const initialSwatches = generateHarmony(initialBase, initialHarmony).map((c) => swatchFrom(c));

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      swatches: initialSwatches,
      harmony: initialHarmony,
      selectedId: initialSwatches[0]?.id ?? null,
      paletteName: 'Untitled palette',
      theme: 'dark',
      saved: [],
      showShortcuts: false,
      showInspector: false,

      setHarmony: (h) => {
        const { swatches } = get();
        const base = swatches.find((s) => s.locked)?.color ?? swatches[0]?.color ?? randomBase();
        set({ harmony: h, swatches: regenerate(base, h, swatches) });
      },

      shuffle: () => {
        const { harmony, swatches } = get();
        const lockedBase = swatches.find((s) => s.locked)?.color;
        const base = lockedBase ?? randomBase();
        set({ swatches: regenerate(base, harmony, swatches) });
      },

      setBaseFromHex: (hex) => {
        const c = parseColor(hex);
        if (!c) return;
        const { harmony, swatches } = get();
        set({ swatches: regenerate(c, harmony, swatches) });
      },

      setSwatchColor: (id, color) => {
        set((state) => ({
          swatches: state.swatches.map((s) =>
            s.id === id ? { ...s, color, name: nameSwatch(color) } : s,
          ),
        }));
      },

      toggleLock: (id) => {
        set((state) => ({
          swatches: state.swatches.map((s) =>
            s.id === id ? { ...s, locked: !s.locked } : s,
          ),
        }));
      },

      removeSwatch: (id) => {
        set((state) => ({
          swatches: state.swatches.length > 2
            ? state.swatches.filter((s) => s.id !== id)
            : state.swatches,
        }));
      },

      addSwatch: () => {
        const { swatches, harmony } = get();
        if (swatches.length >= 8) return;
        const base = swatches[0]?.color ?? randomBase();
        const generated = generateHarmony(base, harmony);
        const next = generated[swatches.length % generated.length] ?? randomBase();
        set({ swatches: [...swatches, swatchFrom(next)] });
      },

      setFromExtracted: (colors) => {
        if (colors.length === 0) return;
        const swatches = colors.slice(0, 6).map((c) => swatchFrom(c));
        set({
          swatches,
          selectedId: swatches[0].id,
          harmony: 'monochromatic',
          paletteName: 'From image',
        });
      },

      setSelected: (id) => set({ selectedId: id }),

      setPaletteName: (n) => set({ paletteName: n }),

      setTheme: (t) => {
        document.documentElement.classList.toggle('dark', t === 'dark');
        set({ theme: t });
      },

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        document.documentElement.classList.toggle('dark', next === 'dark');
        set({ theme: next });
      },

      savePalette: () => {
        const { swatches, harmony, paletteName, saved } = get();
        const palette: SavedPalette = {
          id: makeId(),
          name: paletteName || 'Untitled palette',
          swatches: swatches.map((s) => ({ ...s })),
          harmony,
          createdAt: Date.now(),
        };
        set({ saved: [palette, ...saved].slice(0, 30) });
      },

      loadPalette: (id) => {
        const p = get().saved.find((x) => x.id === id);
        if (!p) return;
        set({
          swatches: p.swatches.map((s) => ({ ...s, id: makeId() })),
          harmony: p.harmony,
          paletteName: p.name,
          selectedId: null,
        });
      },

      deleteSaved: (id) => {
        set((state) => ({ saved: state.saved.filter((p) => p.id !== id) }));
      },

      toggleShortcuts: () => set((s) => ({ showShortcuts: !s.showShortcuts })),
      toggleInspector: () => set((s) => ({ showInspector: !s.showInspector })),

      exportShareUrl: () => {
        const { swatches, harmony, paletteName } = get();
        const compact = swatches.map((s) => toHex(s.color).slice(1)).join('-');
        const params = new URLSearchParams({
          c: compact,
          h: harmony,
          n: paletteName,
        });
        return `${window.location.origin}${window.location.pathname}#${params.toString()}`;
      },

      loadFromHash: (hash) => {
        const h = hash.startsWith('#') ? hash.slice(1) : hash;
        if (!h) return false;
        const params = new URLSearchParams(h);
        const c = params.get('c');
        if (!c) return false;
        const colors = c.split('-')
          .map((hex) => parseColor(`#${hex}`))
          .filter((x): x is Oklch => x !== null);
        if (colors.length === 0) return false;
        const harmony = (params.get('h') as Harmony) || 'analogous';
        const name = params.get('n') || 'Shared palette';
        set({
          swatches: colors.map((c) => swatchFrom(c)),
          harmony,
          paletteName: name,
          selectedId: null,
        });
        return true;
      },
    }),
    {
      name: 'chroma-lab',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        saved: s.saved,
        theme: s.theme,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (state?.theme === 'light') {
          document.documentElement.classList.remove('dark');
        }
      },
    },
  ),
);
