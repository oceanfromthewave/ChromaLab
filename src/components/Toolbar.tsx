import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Plus, ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { HARMONY_RULES, parseColor, toHex } from '../lib/color';
import { extractPalette } from '../lib/extract';
import { useToast } from '../hooks/useToast';

const HARMONY_LABEL: Record<typeof HARMONY_RULES[number], string> = {
  monochromatic: '단색',
  analogous: '유사색',
  complementary: '보색',
  'split-complementary': '분할보색',
  triadic: '삼원색',
  tetradic: '사각색',
  compound: '복합',
};

export function Toolbar() {
  const harmony = useStore((s) => s.harmony);
  const setHarmony = useStore((s) => s.setHarmony);
  const shuffle = useStore((s) => s.shuffle);
  const addSwatch = useStore((s) => s.addSwatch);
  const swatchesLen = useStore((s) => s.swatches.length);
  const setBaseFromHex = useStore((s) => s.setBaseFromHex);
  const setFromExtracted = useStore((s) => s.setFromExtracted);
  const swatches = useStore((s) => s.swatches);
  const push = useToast((s) => s.push);

  const baseHex = swatches[0] ? toHex(swatches[0].color) : '#6366f1';
  const [hexDraft, setHexDraft] = useState(baseHex);
  const [hexFocused, setHexFocused] = useState(false);
  const [extracting, setExtracting] = useState(false);

  useEffect(() => {
    if (!hexFocused) setHexDraft(baseHex);
  }, [baseHex, hexFocused]);

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      setExtracting(true);
      try {
        const colors = await extractPalette(file, 6);
        if (colors.length === 0) {
          push('색을 추출하지 못했습니다', 'error');
          return;
        }
        setFromExtracted(colors);
        push(`${colors.length}개 색을 추출했습니다`, 'success');
      } catch {
        push('이미지를 읽을 수 없습니다', 'error');
      } finally {
        setExtracting(false);
      }
    },
    [setFromExtracted, push],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

  function commitHex() {
    const parsed = parseColor(hexDraft);
    if (parsed) {
      setBaseFromHex(hexDraft);
    } else {
      setHexDraft(baseHex);
    }
  }

  return (
    <div
      {...getRootProps()}
      className={`relative border-b border-border bg-bg-elev ${
        isDragActive ? 'ring-2 ring-accent/50 ring-inset' : ''
      }`}
    >
      <input {...getInputProps()} />
      {isDragActive && (
        <div className="absolute inset-0 z-20 grid-bg bg-accent/5 flex items-center justify-center text-accent font-medium pointer-events-none">
          <div className="flex items-center gap-2">
            <ImageIcon className="size-5" />
            이미지를 놓으면 팔레트를 추출합니다
          </div>
        </div>
      )}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-fg-subtle">색이론</span>
          <div className="flex items-center bg-bg-soft border border-border rounded-lg p-0.5 overflow-x-auto max-w-full hide-scrollbar">
            {HARMONY_RULES.map((h) => (
              <button
                key={h}
                onClick={() => setHarmony(h)}
                className={`relative px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  harmony === h
                    ? 'text-fg'
                    : 'text-fg-subtle hover:text-fg-muted'
                }`}
              >
                {harmony === h && (
                  <motion.span
                    layoutId="harmony-pill"
                    className="absolute inset-0 bg-bg-elev shadow-soft rounded-md border border-border"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{HARMONY_LABEL[h]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-fg-subtle">기준색</span>
          <label className="relative">
            <span
              className="absolute left-1.5 top-1/2 -translate-y-1/2 size-5 rounded-md border border-border-strong shadow-soft cursor-pointer"
              style={{ backgroundColor: baseHex }}
            >
              <input
                type="color"
                value={baseHex}
                onChange={(e) => setBaseFromHex(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </span>
            <input
              value={hexDraft}
              onChange={(e) => setHexDraft(e.target.value)}
              onFocus={() => setHexFocused(true)}
              onBlur={() => { setHexFocused(false); commitHex(); }}
              onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
              className="input pl-9 w-32 uppercase"
              spellCheck={false}
            />
          </label>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={open} className="btn-outline" disabled={extracting}>
            {extracting ? <Loader2 className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
            <span className="hidden sm:inline">{extracting ? '추출 중…' : '이미지에서'}</span>
          </button>
          <button
            onClick={addSwatch}
            disabled={swatchesLen >= 8}
            className="btn-outline"
            title="스왓치 추가"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">추가</span>
          </button>
          <button onClick={shuffle} className="btn-primary group" title="섞기 (Space)">
            <Sparkles className="size-4 group-hover:rotate-12 transition-transform" />
            섞기
            <kbd className="hidden sm:inline-flex items-center justify-center min-w-[1rem] h-4 px-1 ml-1 text-[10px] font-mono font-semibold rounded bg-white/15 text-accent-fg">
              ␣
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
}
