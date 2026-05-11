import { AnimatePresence, motion } from 'framer-motion';
import { Check, AlertCircle, Info } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const ICONS = {
  success: Check,
  error: AlertCircle,
  info: Info,
};

export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 flex flex-col items-center gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.tone ?? 'info'];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="pointer-events-auto flex items-center gap-2 rounded-full bg-bg-elev border border-border shadow-pop px-3.5 py-2 text-sm text-fg"
            >
              <Icon className="size-4 text-accent" />
              <span>{t.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
