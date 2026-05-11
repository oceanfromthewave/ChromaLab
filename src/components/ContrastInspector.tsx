import { Check, X, Minus } from 'lucide-react';
import { useStore } from '../store';
import { contrast, getApcaContrast, getApcaRating, toHex, wcagLevel } from '../lib/color';

const LEVEL_BADGE: Record<ReturnType<typeof wcagLevel>, { label: string; cls: string }> = {
  AAA:        { label: 'AAA',     cls: 'bg-success/15 text-success border-success/30' },
  AA:         { label: 'AA',      cls: 'bg-accent/15 text-accent border-accent/30' },
  'AA-large': { label: 'AA Large', cls: 'bg-warn/15 text-warn border-warn/30' },
  fail:       { label: 'Fail',    cls: 'bg-danger/12 text-danger border-danger/30' },
};

export function ContrastInspector() {
  const swatches = useStore((s) => s.swatches);
  const n = swatches.length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-fg-muted max-w-xl">
            Pairwise WCAG 2.1 and APCA contrast. <strong className="text-fg">AA</strong> requires
            ≥ 4.5; <strong className="text-fg">APCA Lc 75</strong> is preferred for body text.
          </p>
        </div>
        <Legend />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="bg-bg-soft text-fg-subtle text-[11px] uppercase tracking-wider font-semibold p-2 border-b border-border" />
                {swatches.map((s) => (
                  <th
                    key={s.id}
                    className="p-2 border-b border-border bg-bg-soft"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className="size-7 rounded-md border border-border-strong shadow-soft"
                        style={{ backgroundColor: toHex(s.color) }}
                      />
                      <span className="text-[10px] font-mono text-fg-subtle">
                        {toHex(s.color).toUpperCase().slice(1)}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {swatches.map((row) => (
                <tr key={row.id}>
                  <th className="p-2 border-b border-border bg-bg-soft">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-5 rounded-md border border-border-strong"
                        style={{ backgroundColor: toHex(row.color) }}
                      />
                      <span className="text-[10px] font-mono text-fg-subtle">
                        {toHex(row.color).toUpperCase().slice(1)}
                      </span>
                    </div>
                  </th>
                  {swatches.map((col) => {
                    if (col.id === row.id) {
                      return (
                        <td
                          key={col.id}
                          className="p-2 border-b border-border text-center text-fg-subtle"
                        >
                          <Minus className="size-3.5 mx-auto" />
                        </td>
                      );
                    }
                    const ratio = contrast(row.color, col.color);
                    const level = wcagLevel(ratio);
                    const badge = LEVEL_BADGE[level];
                    const apcaScore = getApcaContrast(row.color, col.color);
                    const apcaRating = getApcaRating(apcaScore);
                    return (
                      <td
                        key={col.id}
                        className="p-2 border-b border-border text-center"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className="grid place-items-center w-12 h-9 rounded-md text-xs font-semibold"
                            style={{
                              backgroundColor: toHex(col.color),
                              color: toHex(row.color),
                            }}
                          >
                            Aa
                          </span>
                          <span className="text-[10px] font-mono text-fg-muted">
                            {ratio.toFixed(2)}
                          </span>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${badge.cls}`}>
                            {badge.label}
                          </span>
                          <div className="mt-1 pt-1 border-t border-border/50 w-full">
                            <div className="text-[8px] text-fg-subtle font-bold uppercase">APCA</div>
                            <div className="text-[10px] font-mono font-bold">
                              {apcaScore}
                            </div>
                            <div className="text-[8px] text-fg-subtle">
                              {apcaRating.label}
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {n < 2 && (
        <p className="text-sm text-fg-subtle">Add at least two colors to see contrast pairings.</p>
      )}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-1.5 flex-wrap text-xs">
      {(['AAA', 'AA', 'AA-large', 'fail'] as const).map((l) => (
        <span
          key={l}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border font-semibold text-[10px] ${LEVEL_BADGE[l].cls}`}
        >
          {l === 'fail' ? <X className="size-3" /> : <Check className="size-3" />}
          {LEVEL_BADGE[l].label}
        </span>
      ))}
    </div>
  );
}
