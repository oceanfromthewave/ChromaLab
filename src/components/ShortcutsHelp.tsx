import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useStore } from '../store';

const SHORTCUTS: { keys: string[]; description: string }[] = [
  { keys: ['Space'], description: 'Shuffle palette (locked colors stay)' },
  { keys: ['L'], description: 'Lock / unlock selected swatch' },
  { keys: ['T'], description: 'Toggle dark / light theme' },
  { keys: ['I'], description: 'Toggle contrast inspector' },
  { keys: ['C'], description: 'Copy a shareable URL' },
  { keys: ['⌘', 'S'], description: 'Save palette' },
  { keys: ['?'], description: 'Show this help' },
  { keys: ['Esc'], description: 'Close any popover or dialog' },
];

export function ShortcutsHelp() {
  const open = useStore((s) => s.showShortcuts);
  const toggleShortcuts = useStore((s) => s.toggleShortcuts);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          initial={{ backgroundColor: 'rgba(0,0,0,0)' }}
          animate={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          exit={{ backgroundColor: 'rgba(0,0,0,0)' }}
          onClick={toggleShortcuts}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="card max-w-md w-full p-5 shadow-pop"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-fg">Keyboard shortcuts</h2>
              <button onClick={toggleShortcuts} className="btn-ghost size-9 !p-0">
                <X className="size-4" />
              </button>
            </div>
            <ul className="divide-y divide-border">
              {SHORTCUTS.map(({ keys, description }) => (
                <li key={description} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-fg-muted">{description}</span>
                  <span className="flex items-center gap-1">
                    {keys.map((k, i) => (
                      <span key={i} className="kbd !h-6 !min-w-[1.6rem] !text-[11px]">
                        {k}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
