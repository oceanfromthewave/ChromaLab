# Chroma Lab

A palette studio for designers and developers. Drop in an image, pick a base hue,
or sample a harmony rule — Chroma Lab generates a perceptually uniform palette,
expands each color into an 11-stop OKLCH tone scale, and ships it straight into
your Tailwind config, CSS variables, JSON, or SCSS map.

```
        ▌▌  ▌    ▌      ▌
   ▌  ▌ ▌▌  ▌  ▌ ▌▌▌▌  ▌▌▌
   ▌  ▌ ▌▌  ▌  ▌ ▌▌▌▌  ▌▌▌
        ▌▌  ▌    ▌      ▌
   chroma   ·   lab
```

## What it does

- **Color extraction** — drag any image onto the toolbar. K-means clustering in
  OKLAB space produces 6 perceptually distinct dominant colors.
- **Color theory** — pick from monochromatic, analogous, complementary, split,
  triadic, tetradic, and compound harmonies. Each rule is implemented in OKLCH
  for hue-stable shifts.
- **OKLCH tone scales** — every base color expands into a Tailwind-style
  `50–950` ramp. Lightness is a fixed perceptual ladder; chroma envelopes peak
  near the mid-tones to keep the scale visually balanced.
- **WCAG inspector** — pairwise contrast across the palette, with AA / AAA
  badges and large-text fallback.
- **Live UI preview** — see the palette applied to a real hero, dashboard
  card, feature row, and tag chips.
- **One-click export** — Tailwind config, CSS variables, SCSS map, JSON, or
  an SVG palette card. Copy or download.
- **Local-first** — palettes you save live in your browser. No accounts, no
  servers. A shareable URL hash carries the palette without anyone touching
  your data.

## Try it

```bash
npm install
npm run dev      # → http://localhost:5173
```

Build for production:

```bash
npm run build
npm run preview
```

## Keyboard shortcuts

| Key      | Action                                  |
| -------- | --------------------------------------- |
| `Space`  | Shuffle palette (locked colors stay)    |
| `L`      | Lock / unlock the selected swatch       |
| `T`      | Toggle dark / light theme               |
| `I`      | Open contrast inspector                 |
| `C`      | Copy a shareable URL                    |
| `⌘/Ctrl+S` | Save palette                          |
| `?`      | Open shortcuts overlay                  |

## File structure

```
src/
  App.tsx                       # top-level layout
  store.ts                      # zustand store + localStorage persistence
  lib/
    color.ts                    # OKLCH primitives, harmonies, tone scale, WCAG
    extract.ts                  # k-means image color extraction
    export.ts                   # Tailwind / CSS / SCSS / JSON / SVG generators
    name.ts                     # human-readable swatch naming
  components/
    Header.tsx                  # logo, palette title, save / share / export / theme
    Toolbar.tsx                 # harmony picker, base color, image dropzone
    PaletteStrip.tsx            # full-width swatch row
    Swatch.tsx                  # individual swatch (lock, edit, copy, remove)
    ColorEditor.tsx             # popover with L / C / H sliders + hex input
    PreviewTabs.tsx             # tab switcher
    UIPreview.tsx               # live UI mockup using palette tokens
    ToneScalePanel.tsx          # 11-stop scale per base color
    ContrastInspector.tsx       # NxN WCAG matrix
    SavedPalettes.tsx           # locally-saved palette gallery
    ExportDialog.tsx            # multi-format export modal
    ShortcutsHelp.tsx           # keyboard shortcuts overlay
    Toast.tsx                   # transient notifications
  hooks/
    useShortcuts.ts             # global keyboard shortcuts
    useToast.ts                 # toast queue
```

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v3 with CSS-variable design tokens
- Framer Motion for transitions, layout-pill nav, and modal choreography
- Zustand for global state with `persist` middleware
- culori for OKLCH / OKLAB conversions and WCAG contrast

## Roadmap

- Drag-to-reorder swatches inside the strip
- "Suggest fix" for failing contrast pairs (auto-nudge L until AA)
- Plugin output: Figma variables JSON, Adobe `.ase`, Sketch palette
- PWA manifest + offline cache so it works without a network
- Built-in palette gallery seeded from popular OKLCH-friendly designs
