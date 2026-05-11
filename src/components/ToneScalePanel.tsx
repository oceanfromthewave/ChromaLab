import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useStore } from '../store';
import { TONE_STOPS, bestTextColor, generateToneScale, toHex } from '../lib/color';
import { useToast } from '../hooks/useToast';

export function ToneScalePanel() {
  const swatches = useStore((s) => s.swatches);
  const push = useToast((s) => s.push);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function copy(value: string, key: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      push(`${value} copied`, 'success');
      setTimeout(() => setCopiedKey(null), 1000);
    });
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-fg-muted">
        Each base color is expanded into an <span className="font-mono text-fg">11-stop OKLCH tone scale</span> — drop-in
        ready for Tailwind's color system. Click any swatch to copy.
      </p>
      <div className="space-y-4">
        {swatches.map((s) => {
          const scale = generateToneScale(s.color);
          return (
            <div key={s.id} className="card overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-bg-soft">
                <span
                  className="size-5 rounded-md border border-border-strong"
                  style={{ backgroundColor: toHex(s.color) }}
                />
                <span className="text-sm font-medium text-fg">{s.name}</span>
                <span className="ml-auto text-[11px] font-mono text-fg-subtle">{toHex(s.color).toUpperCase()}</span>
              </div>
              <div className="grid grid-cols-11 gap-px bg-border">
                {TONE_STOPS.map((stop) => {
                  const c = scale[stop];
                  const hex = toHex(c);
                  const fg = toHex(bestTextColor(c));
                  const key = `${s.id}-${stop}`;
                  const isCopied = copiedKey === key;
                  return (
                    <button
                      key={stop}
                      onClick={() => copy(hex, key)}
                      className="group relative flex flex-col items-start justify-end h-20 px-2 py-1.5 transition-transform hover:scale-[1.04] hover:z-10"
                      style={{ backgroundColor: hex }}
                      title={`${stop} · ${hex.toUpperCase()}`}
                    >
                      <span
                        className="text-[10px] font-mono font-semibold opacity-0 group-hover:opacity-100 transition-opacity self-end"
                        style={{ color: fg }}
                      >
                        {isCopied ? <Check className="size-3" /> : <Copy className="size-3" />}
                      </span>
                      <span
                        className="text-[10px] font-mono font-semibold leading-tight"
                        style={{ color: fg }}
                      >
                        {stop}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
