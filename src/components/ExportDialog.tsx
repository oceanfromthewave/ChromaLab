import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, X, Download } from 'lucide-react';
import { useStore } from '../store';
import { exportAll, type ExportFormat } from '../lib/export';
import { useToast } from '../hooks/useToast';

const FORMATS: { id: ExportFormat; label: string; ext: string; lang: string }[] = [
  { id: 'tailwind', label: 'Tailwind config', ext: 'js', lang: 'js' },
  { id: 'css',      label: 'CSS variables',   ext: 'css', lang: 'css' },
  { id: 'scss',     label: 'SCSS map',        ext: 'scss', lang: 'scss' },
  { id: 'json',     label: 'JSON',            ext: 'json', lang: 'json' },
  { id: 'svg',      label: 'SVG card',        ext: 'svg', lang: 'svg' },
];

type Props = { open: boolean; onClose: () => void };

export function ExportDialog({ open, onClose }: Props) {
  const swatches = useStore((s) => s.swatches);
  const paletteName = useStore((s) => s.paletteName);
  const push = useToast((s) => s.push);
  const [format, setFormat] = useState<ExportFormat>('tailwind');
  const [copied, setCopied] = useState(false);

  const content = useMemo(
    () =>
      exportAll(
        format,
        paletteName,
        swatches.map((s) => ({ name: s.name, color: s.color })),
      ),
    [format, paletteName, swatches],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function copyContent() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      push('Copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 1300);
    });
  }

  function downloadContent() {
    const fmt = FORMATS.find((f) => f.id === format)!;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = paletteName.replace(/[^\w-]+/g, '-').toLowerCase() || 'palette';
    a.href = url;
    a.download = `${safeName}.${fmt.ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          initial={{ backgroundColor: 'rgba(0,0,0,0)' }}
          animate={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          exit={{ backgroundColor: 'rgba(0,0,0,0)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="card w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-pop"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <div>
                <h2 className="text-base font-semibold text-fg">Export palette</h2>
                <p className="text-xs text-fg-subtle">{paletteName} · {swatches.length} colors</p>
              </div>
              <button onClick={onClose} className="btn-ghost size-9 !p-0">
                <X className="size-4" />
              </button>
            </div>

            <div className="px-5 pt-4">
              <div className="flex items-center gap-1 bg-bg-soft border border-border rounded-lg p-0.5 overflow-x-auto">
                {FORMATS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`relative px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      format === f.id ? 'text-fg' : 'text-fg-subtle hover:text-fg-muted'
                    }`}
                  >
                    {format === f.id && (
                      <motion.span
                        layoutId="export-pill"
                        className="absolute inset-0 bg-bg-elev rounded-md border border-border shadow-soft"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className="relative">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-auto px-5 pt-4 pb-2">
              <pre className="bg-bg-soft border border-border rounded-lg text-[12px] font-mono text-fg leading-relaxed overflow-auto p-4 max-h-[50vh]">
                <code>{content}</code>
              </pre>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border">
              <button onClick={downloadContent} className="btn-outline">
                <Download className="size-4" /> Download
              </button>
              <button onClick={copyContent} className="btn-primary">
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
