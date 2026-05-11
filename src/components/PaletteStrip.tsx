import { AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { Swatch } from './Swatch';

export function PaletteStrip() {
  const swatches = useStore((s) => s.swatches);

  return (
    <div className="relative w-full bg-bg-elev">
      <div className="flex h-[44vh] min-h-[280px] max-h-[480px] overflow-x-auto sm:overflow-visible">
        <AnimatePresence initial={false}>
          {swatches.map((s, i) => (
            <Swatch key={s.id} swatch={s} index={i} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
