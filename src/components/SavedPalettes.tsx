import { Trash2, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { toHex, type Harmony } from '../lib/color';
import { useToast } from '../hooks/useToast';

const HARMONY_KO: Record<Harmony, string> = {
  monochromatic: '단색',
  analogous: '유사색',
  complementary: '보색',
  'split-complementary': '분할보색',
  triadic: '삼원색',
  tetradic: '사각색',
  compound: '복합',
};

export function SavedPalettes() {
  const saved = useStore((s) => s.saved);
  const loadPalette = useStore((s) => s.loadPalette);
  const deleteSaved = useStore((s) => s.deleteSaved);
  const savePalette = useStore((s) => s.savePalette);
  const push = useToast((s) => s.push);

  if (saved.length === 0) {
    return (
      <div className="card p-8 text-center">
        <Bookmark className="size-8 text-fg-subtle mx-auto mb-3" />
        <h3 className="font-medium text-fg mb-1">아직 저장된 팔레트가 없어요</h3>
        <p className="text-sm text-fg-muted max-w-sm mx-auto">
          마음에 드는 팔레트는 <kbd className="kbd">⌘ S</kbd> 또는 헤더의 <strong className="text-fg">저장</strong> 버튼으로 보관하세요.
        </p>
        <button
          className="btn-outline mt-4 mx-auto"
          onClick={() => { savePalette(); push('팔레트 저장됨', 'success'); }}
        >
          <Bookmark className="size-3.5" /> 현재 팔레트 저장
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <AnimatePresence>
        {saved.map((p) => (
          <motion.div
            key={p.id}
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="card overflow-hidden hover:shadow-pop transition-shadow group"
          >
            <button
              className="w-full block text-left"
              onClick={() => loadPalette(p.id)}
              title="팔레트 불러오기"
            >
              <div className="h-20 flex">
                {p.swatches.map((s) => (
                  <div
                    key={s.id}
                    className="flex-1 transition-transform group-hover:scale-y-105 origin-bottom"
                    style={{ backgroundColor: toHex(s.color) }}
                  />
                ))}
              </div>
              <div className="p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-fg truncate">{p.name}</div>
                  <div className="text-[11px] text-fg-subtle">
                    {p.swatches.length}색 · {HARMONY_KO[p.harmony] ?? p.harmony}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSaved(p.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity size-7 grid place-items-center rounded-md text-fg-subtle hover:text-danger hover:bg-danger/10"
                  title="삭제"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
