import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Copy, X, Check, Sliders } from 'lucide-react';
import { useStore } from '../store';
import { bestTextColor, parseColor, toHex } from '../lib/color';
import type { Swatch as SwatchT } from '../store';
import { useToast } from '../hooks/useToast';
import { ColorEditor } from './ColorEditor';

type Props = {
  swatch: SwatchT;
  index: number;
};

export function Swatch({ swatch, index }: Props) {
  const toggleLock = useStore((s) => s.toggleLock);
  const removeSwatch = useStore((s) => s.removeSwatch);
  const setSelected = useStore((s) => s.setSelected);
  const setSwatchColor = useStore((s) => s.setSwatchColor);
  const swatchesLen = useStore((s) => s.swatches.length);
  const isSelected = useStore((s) => s.selectedId === swatch.id);
  const push = useToast((s) => s.push);

  const [copied, setCopied] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  const hex = toHex(swatch.color);
  const fg = bestTextColor(swatch.color);
  const fgHex = toHex(fg);
  const isLightFg = fgHex === '#ffffff';

  function copyHex(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(hex.toUpperCase()).then(() => {
      setCopied(true);
      push(`${hex.toUpperCase()} copied`, 'success');
      setTimeout(() => setCopied(false), 1200);
    });
  }

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28, delay: index * 0.03 }}
      onClick={() => setSelected(swatch.id)}
      className={`group relative flex-1 min-w-[100px] sm:min-w-[140px] cursor-pointer overflow-hidden transition-all
        ${isSelected ? 'ring-2 ring-inset ring-accent z-10' : ''}`}
      style={{ backgroundColor: hex }}
    >
      <motion.div
        key={hex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0"
        style={{ backgroundColor: hex }}
      />

      {/* Top: tools (visible on hover) */}
      <div
        className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10"
      >
        <IconBtn
          onClick={(e) => { e.stopPropagation(); setEditorOpen(true); }}
          fg={fgHex}
          isLight={isLightFg}
          title="Edit color"
        >
          <Sliders className="size-3.5" />
        </IconBtn>
        <IconBtn
          onClick={(e) => { e.stopPropagation(); toggleLock(swatch.id); }}
          fg={fgHex}
          isLight={isLightFg}
          active={swatch.locked}
          title={swatch.locked ? 'Unlock (preserved on shuffle)' : 'Lock to keep on shuffle'}
        >
          {swatch.locked ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
        </IconBtn>
        <IconBtn
          onClick={(e) => { e.stopPropagation(); removeSwatch(swatch.id); }}
          fg={fgHex}
          isLight={isLightFg}
          title="Remove"
          disabled={swatchesLen <= 2}
        >
          <X className="size-3.5" />
        </IconBtn>
      </div>

      {/* Persistent lock indicator */}
      {swatch.locked && (
        <div
          className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-medium backdrop-blur"
          style={{
            backgroundColor: isLightFg ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.4)',
            color: fgHex,
          }}
        >
          <Lock className="size-2.5" /> LOCKED
        </div>
      )}

      {/* Bottom: name and hex */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 flex flex-col gap-1 z-10">
        <button
          onClick={copyHex}
          className="group/hex flex items-center gap-2 self-start text-left -ml-1 px-1 py-0.5 rounded transition-colors hover:bg-black/5"
          style={{ color: fgHex }}
        >
          <span className="text-lg sm:text-xl font-mono font-semibold tracking-tight">
            {hex.toUpperCase().slice(1)}
          </span>
          {copied ? (
            <Check className="size-3.5 opacity-90" />
          ) : (
            <Copy className="size-3.5 opacity-0 group-hover/hex:opacity-70 transition-opacity" />
          )}
        </button>
        <div
          className="text-[11px] font-medium uppercase tracking-wider"
          style={{ color: fgHex, opacity: 0.7 }}
        >
          {swatch.name}
        </div>
      </div>

      {editorOpen && (
        <ColorEditor
          color={swatch.color}
          anchorHex={hex}
          onChange={(c) => setSwatchColor(swatch.id, c)}
          onClose={() => setEditorOpen(false)}
          onCommitHex={(hex) => {
            const parsed = parseColor(hex);
            if (parsed) setSwatchColor(swatch.id, parsed);
          }}
        />
      )}
    </motion.div>
  );
}

function IconBtn({
  children,
  onClick,
  fg,
  isLight,
  active,
  title,
  disabled,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  fg: string;
  isLight: boolean;
  active?: boolean;
  title?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="size-7 grid place-items-center rounded-md backdrop-blur transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
      style={{
        backgroundColor: active
          ? (isLight ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.5)')
          : (isLight ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.32)'),
        color: fg,
      }}
    >
      {children}
    </button>
  );
}
