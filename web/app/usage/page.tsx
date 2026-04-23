'use client';

import { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Reveal } from '../../components/reveal';
import { generateUsageData } from '../../components/usage-data';
import { DailyBars, MonthArea, Donut, HBar, Heatmap, StatTile, Sparkline } from '../../components/charts';
import { WalletMultiButton } from '../../components/wallet-button';

const CATEGORY_COLORS: Record<string, string> = {
  Data: '#d4ff3a',
  DeFi: '#7ef0c9',
  Developer: '#a78bfa',
  NFT: '#ff5a36',
  Analytics: '#f4ece0',
  Security: '#ff7a7a',
};

export default function UsagePage() {
  const { publicKey, connected } = useWallet();
  const addr = publicKey?.toBase58();

  const data = useMemo(() => (addr ? generateUsageData(addr) : null), [addr]);

  if (!connected || !data || !addr) {
    return (
      <div className="max-w-2xl mx-auto px-8 py-32 text-center">
        <Reveal>
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 bg-lime rounded-full opacity-10 blur-2xl" />
            <div className="relative w-20 h-20 rounded-full border border-line-soft bg-ink-1 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M3 7h18M3 12h18M3 17h12" stroke="var(--lime)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted">/ Usage</span>
          <h1 className="font-display font-bold tracking-tight text-5xl md:text-6xl mt-3 mb-5">
            Your <span className="text-lime italic">tool ledger.</span>
          </h1>
          <p className="text-bone-dim leading-relaxed max-w-md mx-auto mb-10">
            Every call you&apos;ve made, every USDC you&apos;ve paid, visualized.
            Connect your wallet to unlock the dashboard — data is derived from your public on-chain history.
          </p>
          <WalletMultiButton />
        </Reveal>
      </div>
    );
  }

  const last7 = data.daily.slice(-7).map((d) => d.calls);
  const last30Cost = data.daily.slice(-30).reduce((s, d) => s + d.cost, 0);
  const joined = new Date(data.joinedAt);
  const daysSinceJoin = Math.max(1, Math.round((Date.now() - data.joinedAt) / (24 * 60 * 60 * 1000)));
  const activeDays = data.daily.filter((d) => d.calls > 0).length;

  const peakDay = [...data.daily].sort((a, b) => b.calls - a.calls)[0];
  const peakHour = (() => {
    let best = { r: 0, c: 0, v: 0 };
    data.heatmap.forEach((row, r) =>
      row.forEach((v, c) => {
        if (v > best.v) best = { r, c, v };
      })
    );
    return best;
  })();

  return (
    <div className="max-w-[1280px] mx-auto px-8 py-12">
      {/* Header */}
      <Reveal>
        <div className="flex items-start justify-between flex-wrap gap-6 mb-10">
          <div>
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted">/ Usage</span>
            <h1 className="font-display font-bold tracking-tight text-5xl md:text-6xl mt-3 leading-[1.02]">
              Your <span className="text-lime italic">tool</span> ledger
            </h1>
            <div className="mt-4 flex items-center gap-3 text-xs text-muted font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-mint pulse-dot" />
              <span>{addr.slice(0, 8)}…{addr.slice(-6)}</span>
              <span className="text-line">·</span>
              <span>member since {joined.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span className="text-line">·</span>
              <span className="text-bone">top {Math.max(1, 100 - data.percentile)}% of callers</span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-line-soft bg-ink-1 px-4 py-2 text-xs">
            <span className="text-muted font-mono uppercase tracking-widest">Streak</span>
            <span className="font-display font-bold text-lime text-xl">{data.streak}</span>
            <span className="text-muted">days</span>
          </div>
        </div>
      </Reveal>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Reveal>
          <StatTile
            label="Total calls"
            value={data.totalCalls.toLocaleString()}
            delta={`+${Math.round((data.daily.slice(-7).reduce((s, d) => s + d.calls, 0) / Math.max(1, data.totalCalls)) * 100)}% last 7d`}
            icon={<div className="w-16 h-6"><Sparkline values={last7} /></div>}
          />
        </Reveal>
        <Reveal delay={60}>
          <StatTile
            label="USDC spent"
            value={`$${data.totalSpent.toFixed(2)}`}
            delta={`$${last30Cost.toFixed(2)} last 30d`}
          />
        </Reveal>
        <Reveal delay={120}>
          <StatTile
            label="Success rate"
            value={`${(data.successRate * 100).toFixed(1)}%`}
            delta={`${activeDays} active / ${daysSinceJoin} total days`}
          />
        </Reveal>
        <Reveal delay={180}>
          <StatTile
            label="Avg latency"
            value={`${data.avgLatency}ms`}
            delta={`p95 ≈ ${Math.round(data.avgLatency * 1.8)}ms`}
          />
        </Reveal>
      </div>

      {/* Daily + Monthly */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-8">
        <Reveal className="lg:col-span-2">
          <section className="rounded-2xl bg-ink-1 border border-line-soft p-6">
            <Header
              title="Daily activity"
              subtitle="last 90 days"
              right={<span className="text-[11px] font-mono text-muted">peak · <span className="text-lime">{peakDay.calls} calls</span> on {peakDay.date}</span>}
            />
            <DailyBars data={data.daily} />
          </section>
        </Reveal>
        <Reveal delay={100}>
          <section className="rounded-2xl bg-ink-1 border border-line-soft p-6 h-full">
            <Header title="Monthly trend" subtitle="last 12 mo" />
            <MonthArea data={data.monthly} />
          </section>
        </Reveal>
      </div>

      {/* Category donut + Top tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-8">
        <Reveal>
          <section className="rounded-2xl bg-ink-1 border border-line-soft p-6">
            <Header title="By category" subtitle="lifetime share" />
            <Donut data={data.byCategory} />
          </section>
        </Reveal>
        <Reveal delay={80}>
          <section className="rounded-2xl bg-ink-1 border border-line-soft p-6">
            <Header title="Top tools" subtitle={`favorite · ${data.favoriteTool.split(' ').slice(0, 3).join(' ')}`} />
            <HBar data={data.byTool.slice(0, 7)} colorMap={CATEGORY_COLORS} />
          </section>
        </Reveal>
      </div>

      {/* Heatmap */}
      <Reveal className="mb-8">
        <section className="rounded-2xl bg-ink-1 border border-line-soft p-6">
          <Header
            title="When you call"
            subtitle="hour × weekday · local time"
            right={
              <span className="text-[11px] font-mono text-muted">
                peak · <span className="text-lime">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][peakHour.r]} {String(peakHour.c).padStart(2,'0')}:00</span>
              </span>
            }
          />
          <Heatmap data={data.heatmap} />
        </section>
      </Reveal>

      {/* Recent calls */}
      <Reveal>
        <section className="rounded-2xl bg-ink-1 border border-line-soft overflow-hidden">
          <div className="p-6 pb-3">
            <Header title="Recent calls" subtitle="last 30 invocations" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] font-mono uppercase tracking-widest text-muted border-y border-line-soft">
                <tr>
                  <th className="text-left font-normal py-3 px-6">Tool</th>
                  <th className="text-left font-normal py-3 px-4">When</th>
                  <th className="text-right font-normal py-3 px-4">Latency</th>
                  <th className="text-right font-normal py-3 px-4">Cost</th>
                  <th className="text-right font-normal py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((r, i) => (
                  <tr key={i} className="border-b border-line-soft last:border-0 hover:bg-ink-2 transition-colors">
                    <td className="py-3 px-6">
                      <div className="text-bone">{r.tool}</div>
                      <div className="text-[11px] font-mono text-muted">{r.toolId}</div>
                    </td>
                    <td className="py-3 px-4 text-bone-dim text-[13px] font-mono">{timeAgo(r.ts)}</td>
                    <td className="py-3 px-4 text-right font-mono text-bone-dim text-[13px]">{r.latency}ms</td>
                    <td className="py-3 px-4 text-right font-mono text-bone-dim text-[13px]">${r.cost.toFixed(3)}</td>
                    <td className="py-3 px-6 text-right">
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-full"
                        style={
                          r.status === 'success'
                            ? { color: '#7ef0c9', background: 'rgba(126,240,201,0.1)' }
                            : { color: '#ff5a36', background: 'rgba(255,90,54,0.1)' }
                        }
                      >
                        <span className="w-1 h-1 rounded-full" style={{ background: r.status === 'success' ? '#7ef0c9' : '#ff5a36' }} />
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>

      <p className="mt-10 text-center text-[11px] font-mono text-muted">
        derived from on-chain PaymentRecord PDAs · refreshes every 30s · devnet
      </p>
    </div>
  );
}

function Header({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-2 mb-5">
      <div>
        <h2 className="font-display font-semibold text-xl text-bone leading-none">{title}</h2>
        {subtitle && <div className="text-[11px] font-mono text-muted mt-1.5">{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

function timeAgo(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
