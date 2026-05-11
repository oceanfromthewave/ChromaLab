import { Trash2, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { toHex } from '../lib/color';
import { useToast } from '../hooks/useToast';

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
        <h3 className="font-medium text-fg mb-1">No saved palettes yet</h3>
        <p className="text-sm text-fg-muted max-w-sm mx-auto">
          Hit <kbd className="kbd">⌘ S</kbd> or click <strong className="text-fg">Save</strong> in the header to keep palettes you love.
        </p>
        <button
          className="btn-outline mt-4 mx-auto"
          onClick={() => { savePalette(); push('Palette saved', 'success'); }}
        >
          <Bookmark className="size-3.5" /> Save current palette
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
              title="Load palette"
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
                    {p.swatches.length} colors · {p.harmony}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSaved(p.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity size-7 grid place-items-center rounded-md text-fg-subtle hover:text-danger hover:bg-danger/10"
                  title="Delete"
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
