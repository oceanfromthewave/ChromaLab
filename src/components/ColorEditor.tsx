import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { clampOklch, toHex, parseColor, type Oklch } from '../lib/color';

type Props = {
  color: Oklch;
  anchorHex: string;
  onChange: (c: Oklch) => void;
  onCommitHex: (hex: string) => void;
  onClose: () => void;
};

export function ColorEditor({ color, onChange, onCommitHex, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [hexDraft, setHexDraft] = useState(toHex(color));

  useEffect(() => {
    setHexDraft(toHex(color));
  }, [color]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  function update(patch: Partial<Oklch>) {
    const next = clampOklch({ ...color, ...patch });
    onChange(next);
  }

  function commitHex() {
    const parsed = parseColor(hexDraft);
    if (parsed) onCommitHex(hexDraft);
    else setHexDraft(toHex(color));
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      className="absolute z-30 top-12 right-3 w-72 card shadow-pop p-4 text-fg cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
          색 편집
        </span>
        <span className="text-[10px] font-mono text-fg-subtle">OKLCH</span>
      </div>

      <div className="space-y-3.5">
        <Slider
          label="L"
          help="밝기 (Lightness)"
          value={color.l}
          min={0}
          max={1}
          step={0.001}
          onChange={(v) => update({ l: v })}
          format={(v) => v.toFixed(3)}
        />
        <Slider
          label="C"
          help="채도 (Chroma)"
          value={color.c}
          min={0}
          max={0.4}
          step={0.001}
          onChange={(v) => update({ c: v })}
          format={(v) => v.toFixed(3)}
        />
        <Slider
          label="H"
          help="색상 (Hue)"
          value={color.h}
          min={0}
          max={360}
          step={0.5}
          onChange={(v) => update({ h: v })}
          format={(v) => `${Math.round(v)}°`}
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span
          className="size-9 rounded-md border border-border-strong shadow-soft"
          style={{ backgroundColor: toHex(color) }}
        />
        <input
          value={hexDraft}
          onChange={(e) => setHexDraft(e.target.value)}
          onBlur={commitHex}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          className="input flex-1 uppercase"
          spellCheck={false}
        />
      </div>
    </motion.div>
  );
}

function Slider({
  label, help, value, min, max, step, onChange, format,
}: {
  label: string;
  help: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-fg-muted" title={help}>{label}</span>
        <span className="text-xs font-mono text-fg-subtle">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-accent"
      />
    </div>
  );
}
