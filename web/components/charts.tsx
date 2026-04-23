'use client';

import { ReactNode, useState } from 'react';

function EmptyChart({ height = 180, label = 'no data' }: { height?: number; label?: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl border border-dashed border-line-soft bg-ink/50 text-[11px] font-mono uppercase tracking-widest text-muted"
      style={{ height }}
    >
      {label}
    </div>
  );
}

interface DailyBarsProps {
  data: { date: string; day: number; calls: number }[];
  color?: string;
}
export function DailyBars({ data, color = '#d4ff3a' }: DailyBarsProps) {
  const [hover, setHover] = useState<number | null>(null);
  if (!data.length) return <EmptyChart />;
  const max = Math.max(1, ...data.map((d) => d.calls));
  return (
    <div className="relative">
      <div className="flex items-end gap-[3px] h-48">
        {data.map((d, i) => {
          const h = (d.calls / max) * 100;
          const isHover = hover === i;
          return (
            <div
              key={d.date}
              className="flex-1 relative group"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div
                className="w-full rounded-sm transition-all duration-150"
                style={{
                  height: `${Math.max(2, h)}%`,
                  background: isHover ? color : `${color}55`,
                  boxShadow: isHover ? `0 0 16px ${color}80` : 'none',
                }}
              />
              {isHover && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 whitespace-nowrap bg-ink-2 border border-line rounded-lg px-2.5 py-1.5 text-[11px] text-bone font-mono pointer-events-none">
                  <div className="text-muted">{d.date}</div>
                  <div className="text-lime">{d.calls} calls</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] font-mono text-muted mt-2">
        <span>{data[0]?.date.slice(5)}</span>
        <span>{data[Math.floor(data.length / 2)]?.date.slice(5)}</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}

interface MonthAreaProps {
  data: { month: string; calls: number; cost: number }[];
}
export function MonthArea({ data }: MonthAreaProps) {
  if (data.length < 2) return <EmptyChart label={data.length === 0 ? 'no data' : 'need ≥2 months'} />;

  const w = 560;
  const h = 180;
  const pad = { l: 8, r: 8, t: 10, b: 22 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const max = Math.max(...data.map((d) => d.calls), 1);
  const step = iw / (data.length - 1);
  const pts = data.map((d, i) => ({
    x: pad.l + i * step,
    y: pad.t + ih - (d.calls / max) * ih,
    v: d.calls,
    cost: d.cost,
    label: d.month,
  }));
  const linePath = pts.map((p, i) => (i === 0 ? `M${p.x} ${p.y}` : `L${p.x} ${p.y}`)).join(' ');
  const areaPath = `${linePath} L${pts[pts.length - 1].x} ${pad.t + ih} L${pts[0].x} ${pad.t + ih} Z`;
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        <defs>
          <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4ff3a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#d4ff3a" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t} x1={pad.l} x2={w - pad.r} y1={pad.t + ih * t} y2={pad.t + ih * t} stroke="#2a2a38" strokeDasharray="2 4" />
        ))}
        <path d={areaPath} fill="url(#area-grad)" />
        <path d={linePath} fill="none" stroke="#d4ff3a" strokeWidth="1.6" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <rect x={p.x - step / 2} y={pad.t} width={step} height={ih} fill="transparent" />
            <circle cx={p.x} cy={p.y} r={hover === i ? 5 : 2.5} fill="#d4ff3a" opacity={hover === i ? 1 : 0.6} />
            <text x={p.x} y={h - 6} textAnchor="middle" className="fill-muted" style={{ fontSize: 10, fontFamily: 'Geist Mono, monospace' }}>
              {p.label}
            </text>
          </g>
        ))}
      </svg>
      {hover !== null && (
        <div
          className="absolute z-10 bg-ink-2 border border-line rounded-lg px-3 py-2 text-xs pointer-events-none"
          style={{ left: `${(pts[hover].x / w) * 100}%`, top: `${(pts[hover].y / h) * 100}%`, transform: 'translate(-50%, -120%)' }}
        >
          <div className="font-mono text-muted">{pts[hover].label}</div>
          <div className="text-lime font-semibold">{pts[hover].v.toLocaleString()} calls</div>
          <div className="text-bone-dim font-mono text-[11px]">${pts[hover].cost.toFixed(2)} USDC</div>
        </div>
      )}
    </div>
  );
}

interface DonutProps {
  data: { category: string; calls: number; color: string }[];
}
export function Donut({ data }: DonutProps) {
  const total = data.reduce((s, d) => s + d.calls, 0);
  const [hover, setHover] = useState<number | null>(null);

  if (!data.length || total <= 0) {
    return (
      <div className="flex items-center gap-6">
        <div className="relative w-[180px] h-[180px] flex-shrink-0">
          <svg viewBox="-100 -100 200 200" className="w-full h-full">
            <circle cx="0" cy="0" r="80" fill="none" stroke="#171722" strokeWidth="24" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-display font-bold text-2xl text-muted">—</div>
            <div className="text-[10px] font-mono text-muted uppercase tracking-widest mt-0.5">no calls yet</div>
          </div>
        </div>
        <div className="text-xs text-muted flex-1">Nothing to visualize yet. Make a call from any tool to populate this chart.</div>
      </div>
    );
  }

  const R = 80;
  const r = 56;
  const C = 2 * Math.PI * R;
  let acc = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-[180px] h-[180px] flex-shrink-0">
        <svg viewBox="-100 -100 200 200" className="w-full h-full -rotate-90">
          <circle cx="0" cy="0" r={R} fill="none" stroke="#171722" strokeWidth={R - r} />
          {data.map((d, i) => {
            const frac = d.calls / total;
            const len = frac * C;
            const offset = -acc;
            acc += len;
            return (
              <circle
                key={d.category}
                cx="0"
                cy="0"
                r={R}
                fill="none"
                stroke={d.color}
                strokeWidth={R - r}
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={offset}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                className="transition-all duration-200"
                style={{ opacity: hover === null || hover === i ? 1 : 0.3, cursor: 'pointer' }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="font-display font-bold text-3xl text-bone">{hover !== null ? data[hover].calls.toLocaleString() : total.toLocaleString()}</div>
          <div className="text-[10px] font-mono text-muted uppercase tracking-widest mt-0.5">
            {hover !== null ? data[hover].category : 'Total calls'}
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-2.5">
        {data.map((d, i) => (
          <div
            key={d.category}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className={`flex items-center justify-between gap-3 py-1.5 px-2 rounded-lg transition-colors ${
              hover === i ? 'bg-ink-2' : ''
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
              <span className="text-sm text-bone truncate">{d.category}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xs text-muted font-mono">{((d.calls / total) * 100).toFixed(1)}%</span>
              <span className="text-xs text-bone-dim font-mono w-12 text-right">{d.calls.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface HBarProps {
  data: { tool: string; calls: number; cost: number; category: string }[];
  colorMap: Record<string, string>;
}
export function HBar({ data, colorMap }: HBarProps) {
  if (!data.length) return <EmptyChart height={120} label="no tool usage yet" />;
  const max = Math.max(...data.map((d) => d.calls), 1);
  return (
    <div className="space-y-3">
      {data.map((d) => {
        const w = (d.calls / max) * 100;
        const color = colorMap[d.category] ?? '#d4ff3a';
        return (
          <div key={d.tool}>
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <span className="text-bone truncate">{d.tool}</span>
              <span className="font-mono text-muted flex-shrink-0 ml-3">{d.calls.toLocaleString()} · ${d.cost.toFixed(2)}</span>
            </div>
            <div className="relative h-2 bg-ink-2 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all"
                style={{ width: `${w}%`, background: `linear-gradient(90deg, ${color}55, ${color})` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface HeatmapProps {
  data: number[][]; // 7 x 24
}
export function Heatmap({ data }: HeatmapProps) {
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);
  if (!data.length || !data[0]?.length) return <EmptyChart label="no hourly data" />;

  const flat = data.flat();
  const max = Math.max(...flat, 1);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hourLabels = [0, 6, 12, 18, 23];
  return (
    <div>
      <div className="flex">
        <div className="flex flex-col justify-around pr-2 py-1 text-[10px] font-mono text-muted w-10">
          {days.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="flex-1 relative">
          <div className="grid gap-[3px]" style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}>
            {data.map((row, r) => (
              <div key={r} className="grid gap-[3px]" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
                {row.map((v, c) => {
                  const intensity = v / max;
                  const alpha = 0.08 + intensity * 0.92;
                  const isHov = hover?.r === r && hover?.c === c;
                  return (
                    <div
                      key={c}
                      onMouseEnter={() => setHover({ r, c })}
                      onMouseLeave={() => setHover(null)}
                      className="aspect-square rounded-[3px] transition-transform hover:scale-110"
                      style={{
                        background: v === 0 ? '#171722' : `rgba(212, 255, 58, ${alpha})`,
                        boxShadow: isHov ? '0 0 12px rgba(212, 255, 58, 0.6)' : 'none',
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="relative mt-2 h-4">
            {hourLabels.map((hr) => (
              <span
                key={hr}
                className="absolute text-[10px] font-mono text-muted"
                style={{ left: `calc(${(hr / 23) * 100}% - 6px)` }}
              >
                {String(hr).padStart(2, '0')}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4 text-[10px] font-mono text-muted">
        <span>less</span>
        {[0.15, 0.35, 0.55, 0.75, 1].map((a) => (
          <span key={a} className="w-3 h-3 rounded-sm" style={{ background: `rgba(212, 255, 58, ${a})` }} />
        ))}
        <span>more</span>
        {hover && (
          <span className="ml-auto text-bone">
            {days[hover.r]} · {String(hover.c).padStart(2, '0')}:00 — <span className="text-lime">{data[hover.r][hover.c]} calls</span>
          </span>
        )}
      </div>
    </div>
  );
}

export function Sparkline({ values, color = '#d4ff3a' }: { values: number[]; color?: string }) {
  const w = 120;
  const h = 32;
  if (values.length < 2) {
    return <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full"><line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke={color} strokeOpacity="0.3" strokeWidth="1" /></svg>;
  }
  const max = Math.max(...values, 1);
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${i * step} ${h - (v / max) * h}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      <path d={pts} fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StatTile({ label, value, delta, icon }: { label: string; value: ReactNode; delta?: string; icon?: ReactNode }) {
  return (
    <div className="rounded-xl bg-ink-1 border border-line-soft p-5 relative overflow-hidden">
      {icon && <div className="absolute top-4 right-4 text-muted opacity-60">{icon}</div>}
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-2">{label}</div>
      <div className="font-display font-bold text-3xl text-bone leading-tight">{value}</div>
      {delta && <div className="text-xs text-mint font-mono mt-1">{delta}</div>}
    </div>
  );
}
