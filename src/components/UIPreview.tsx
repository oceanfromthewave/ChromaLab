import { Sparkles, ArrowRight, Zap, Bell, Activity, TrendingUp } from 'lucide-react';
import { useStore } from '../store';
import { bestTextColor, generateToneScale, toHex } from '../lib/color';

export function UIPreview() {
  const swatches = useStore((s) => s.swatches);
  const primary = swatches[0]?.color;
  const secondary = swatches[1]?.color ?? primary;
  const accent = swatches[2]?.color ?? primary;
  const surface = swatches[Math.min(3, swatches.length - 1)]?.color ?? primary;
  const muted = swatches[Math.min(4, swatches.length - 1)]?.color ?? primary;

  if (!primary) return null;

  const primaryScale = generateToneScale(primary);
  const surfaceScale = generateToneScale(surface);

  const styleVars: React.CSSProperties = {
    ['--p-primary' as string]: toHex(primary),
    ['--p-primary-fg' as string]: toHex(bestTextColor(primary)),
    ['--p-secondary' as string]: toHex(secondary),
    ['--p-accent' as string]: toHex(accent),
    ['--p-surface' as string]: toHex(surfaceScale[50]),
    ['--p-surface-2' as string]: toHex(surfaceScale[100]),
    ['--p-fg' as string]: toHex(surfaceScale[900]),
    ['--p-fg-muted' as string]: toHex(surfaceScale[600]),
    ['--p-border' as string]: toHex(surfaceScale[200]),
    ['--p-tint' as string]: toHex(primaryScale[100]),
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-border shadow-soft"
      style={{ backgroundColor: 'var(--p-surface)', color: 'var(--p-fg)', ...styleVars }}
    >
      {/* fake browser chrome */}
      <div
        className="flex items-center gap-1.5 px-3 py-2 border-b"
        style={{ borderColor: 'var(--p-border)', backgroundColor: 'var(--p-surface-2)' }}
      >
        <span className="size-2.5 rounded-full" style={{ backgroundColor: '#ff5f57' }} />
        <span className="size-2.5 rounded-full" style={{ backgroundColor: '#ffbd2e' }} />
        <span className="size-2.5 rounded-full" style={{ backgroundColor: '#28c840' }} />
        <span
          className="ml-3 text-[11px] font-mono px-2 py-0.5 rounded"
          style={{ backgroundColor: 'var(--p-surface)', color: 'var(--p-fg-muted)' }}
        >
          your-app.com
        </span>
      </div>

      <div className="p-6 sm:p-8">
        {/* Hero */}
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="space-y-3 max-w-md">
            <div
              className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full"
              style={{ backgroundColor: 'var(--p-tint)', color: 'var(--p-primary)' }}
            >
              <Sparkles className="size-3" />
              <span>새 릴리스 · v2.4</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-display font-semibold tracking-tight leading-tight"
              style={{ color: 'var(--p-fg)' }}
            >
              더 잘 다듬은 제품을, 더 빠르게.
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--p-fg-muted)' }}>
              디테일에 진심인 팀을 위한 모던 툴킷. 실제 컴포넌트, 실제 타이포, 실제 색이론으로 만들어졌습니다.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: 'var(--p-primary)', color: 'var(--p-primary-fg)' }}
              >
                시작하기 <ArrowRight className="size-3.5" />
              </button>
              <button
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors hover:opacity-80"
                style={{ borderColor: 'var(--p-border)', color: 'var(--p-fg)', backgroundColor: 'transparent' }}
              >
                문서 보기
              </button>
            </div>
          </div>

          {/* Right side: a small dashboard card */}
          <div
            className="flex-1 min-w-[220px] max-w-[320px] rounded-xl border p-4"
            style={{ backgroundColor: 'var(--p-surface-2)', borderColor: 'var(--p-border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="grid place-items-center size-7 rounded-md"
                  style={{ backgroundColor: 'var(--p-tint)', color: 'var(--p-primary)' }}
                >
                  <Activity className="size-3.5" />
                </span>
                <span className="text-xs font-medium" style={{ color: 'var(--p-fg-muted)' }}>
                  활성 사용자
                </span>
              </div>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                style={{ backgroundColor: 'var(--p-tint)', color: 'var(--p-primary)' }}
              >
                +12.4%
              </span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--p-fg)' }}>
                12,840
              </div>
              <div className="text-[11px]" style={{ color: 'var(--p-fg-muted)' }}>
                지난주 11,422 대비
              </div>
            </div>
            <Sparkline color={toHex(primary)} bg={toHex(primaryScale[100])} />
          </div>
        </div>

        {/* Feature row */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Zap, title: '즉시 반응', body: '1초 미만의 피드백 루프' },
            { icon: Bell, title: '스마트 알림', body: '필요한 것만, 조용하게' },
            { icon: TrendingUp, title: '분석', body: '내장된 제품 인사이트' },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border p-3"
              style={{ borderColor: 'var(--p-border)', backgroundColor: 'var(--p-surface-2)' }}
            >
              <span
                className="grid place-items-center size-7 rounded-md mb-2"
                style={{ backgroundColor: 'var(--p-tint)', color: 'var(--p-primary)' }}
              >
                <Icon className="size-3.5" />
              </span>
              <div className="text-sm font-medium" style={{ color: 'var(--p-fg)' }}>
                {title}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--p-fg-muted)' }}>
                {body}
              </div>
            </div>
          ))}
        </div>

        {/* tag chips */}
        <div className="mt-6 flex flex-wrap items-center gap-1.5">
          {swatches.slice(0, 5).map((s, i) => {
            const fg = toHex(bestTextColor(s.color));
            return (
              <span
                key={s.id}
                className="text-[11px] font-medium px-2 py-1 rounded-full"
                style={{ backgroundColor: toHex(s.color), color: fg }}
              >
                태그 {i + 1}
              </span>
            );
          })}
        </div>
        <span className="block text-[10px] text-right mt-2" style={{ color: 'var(--p-fg-muted)' }}>
          서피스는 톤 <span className="font-mono">50</span> 사용 · 무드는 <span className="font-mono">{toHex(muted).toUpperCase()}</span> 기반
        </span>
      </div>
    </div>
  );
}

function Sparkline({ color, bg }: { color: string; bg: string }) {
  const points = [4, 6, 5, 8, 7, 11, 9, 14, 12, 17, 15, 20];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const w = 240;
  const h = 56;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / (max - min || 1)) * (h - 8) - 4;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full h-auto">
      <path d={area} fill={bg} />
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
