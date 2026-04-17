'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { TiltCard } from '../components/tilt-card';
import { Magnetic } from '../components/magnetic';
import { Reveal } from '../components/reveal';
import { Counter } from '../components/counter';
import { LiveTicker } from '../components/live-ticker';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  pricePerCall: number;
  totalCalls: number;
  rating: number;
  publisher: string;
  tag?: 'hot' | 'new' | 'featured';
}

const DEMO_TOOLS: Tool[] = [
  { id: 'sol-balance', name: 'Solana Balance Checker', description: 'Check SOL and SPL token balances for any wallet address on Solana.', category: 'Data', pricePerCall: 0.001, totalCalls: 12450, rating: 4.8, publisher: '7xKz…3nPq', tag: 'hot' },
  { id: 'nft-metadata', name: 'NFT Metadata Resolver', description: 'Fetch and parse metadata for any Solana NFT including traits and image URLs.', category: 'NFT', pricePerCall: 0.002, totalCalls: 8920, rating: 4.6, publisher: '9mBq…7kLx' },
  { id: 'tx-decoder', name: 'Transaction Decoder', description: 'Decode Solana transactions into human-readable format with program labels.', category: 'Developer', pricePerCall: 0.003, totalCalls: 6340, rating: 4.9, publisher: '3pRx…5mWz', tag: 'featured' },
  { id: 'price-feed', name: 'DeFi Price Aggregator', description: 'Real-time token prices from Jupiter, Raydium and Orca with VWAP calculation.', category: 'DeFi', pricePerCall: 0.001, totalCalls: 24100, rating: 4.7, publisher: '5nTy…2jKv', tag: 'hot' },
  { id: 'wallet-scorer', name: 'Wallet Risk Scorer', description: 'Score wallet risk based on history, holdings and DeFi exposure patterns.', category: 'Analytics', pricePerCall: 0.005, totalCalls: 3200, rating: 4.4, publisher: '8kHz…9wQp' },
  { id: 'cpi-analyzer', name: 'CPI Call Analyzer', description: 'Analyze cross-program invocation patterns for any Solana program.', category: 'Developer', pricePerCall: 0.004, totalCalls: 1890, rating: 4.5, publisher: '2mFx…6tNr', tag: 'new' },
  { id: 'airdrop-check', name: 'Airdrop Eligibility', description: 'Check wallet eligibility for upcoming Solana ecosystem airdrops.', category: 'Data', pricePerCall: 0.002, totalCalls: 45200, rating: 4.3, publisher: '6qWz…1yBk', tag: 'hot' },
  { id: 'program-audit', name: 'Quick Security Scan', description: 'Automated security scan for Anchor programs — flags common vulnerabilities.', category: 'Security', pricePerCall: 0.01, totalCalls: 780, rating: 4.8, publisher: '4jLx…8mRv', tag: 'new' },
];

const CATEGORIES = ['All', 'Data', 'DeFi', 'Developer', 'NFT', 'Analytics', 'Security'];

const REGISTRY_TOTAL = 1428;
const DISPLAY_LIMIT = 9;

const CATEGORY_ACCENT: Record<string, string> = {
  Data: 'var(--lime)',
  DeFi: 'var(--mint)',
  Developer: 'var(--violet)',
  NFT: 'var(--coral)',
  Analytics: 'var(--bone)',
  Security: 'var(--coral)',
};

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [allTools, setAllTools] = useState<Tool[]>(DEMO_TOOLS);
  const [sort, setSort] = useState<'trending' | 'cheapest' | 'rating' | 'calls'>('trending');

  useEffect(() => {
    const published = JSON.parse(localStorage.getItem('x402_published_tools') || '[]') as Tool[];
    if (published.length > 0) setAllTools([...published, ...DEMO_TOOLS]);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = allTools.filter((t) => {
      const s = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      const c = cat === 'All' || t.category === cat;
      return s && c;
    });
    const sorted = [...base];
    if (sort === 'cheapest') sorted.sort((a, b) => a.pricePerCall - b.pricePerCall);
    else if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    else if (sort === 'calls') sorted.sort((a, b) => b.totalCalls - a.totalCalls);
    else sorted.sort((a, b) => b.totalCalls * b.rating - a.totalCalls * a.rating);
    return sorted.slice(0, DISPLAY_LIMIT);
  }, [allTools, search, cat, sort]);

  const totalCalls = allTools.reduce((s, t) => s + t.totalCalls, 0);
  const totalVolume = allTools.reduce((s, t) => s + t.totalCalls * t.pricePerCall, 0);

  return (
    <>
      {/* ========= HERO ========= */}
      <section className="relative overflow-hidden">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        <div className="relative max-w-[1280px] mx-auto px-8 pt-24 pb-20">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted">/ 01 — Marketplace</span>
            <span className="flex-1 h-px bg-line-soft" />
            <span className="text-[11px] font-mono text-muted">v0.4 · devnet</span>
          </div>

          <h1 className="font-display font-bold tracking-tightest leading-[0.9] text-[clamp(56px,10vw,148px)]">
            <span className="block kinetic">Rent tools.</span>
            <span className="block">
              <span className="text-bone/30">Pay </span>
              <span className="relative inline-block">
                <span className="text-lime">per-call.</span>
                <svg className="absolute -bottom-3 left-0 w-full" viewBox="0 0 300 20" preserveAspectRatio="none" fill="none">
                  <path d="M2 14 Q 75 2, 150 10 T 298 6" stroke="currentColor" className="text-lime" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </span>
            <span className="block text-bone/90">On-chain.</span>
          </h1>

          <div className="mt-10 grid md:grid-cols-[1fr_auto] gap-10 items-end">
            <p className="max-w-xl text-[17px] leading-relaxed text-bone-dim">
              A marketplace where AI agents discover MCP tools and settle micropayments in USDC on Solana —
              <span className="text-bone"> no subscriptions, no API keys, no middlemen.</span> Publish once, get paid every invocation.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Magnetic as="a" href="#tools" className="group">
                <span className="inline-flex items-center gap-3 bg-lime text-lime-ink font-semibold text-sm px-6 py-3.5 rounded-full hover:shadow-[0_20px_60px_-15px_rgba(212,255,58,0.6)] transition-shadow">
                  Explore tools
                  <span className="w-5 h-5 rounded-full bg-ink flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 5h8M5 1l4 4-4 4" stroke="var(--lime)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                </span>
              </Magnetic>
              <Magnetic as="a" href="/publish">
                <span className="inline-flex items-center gap-2 text-bone font-medium text-sm px-6 py-3.5 rounded-full border border-line hover:border-bone transition-colors">
                  Publish a tool
                </span>
              </Magnetic>
            </div>
          </div>
        </div>
      </section>

      {/* ========= LIVE TICKER ========= */}
      <LiveTicker />

      {/* ========= STATS ========= */}
      <section className="border-b border-line-soft">
        <div className="max-w-[1280px] mx-auto px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          <Reveal>
            <Stat label="Registered tools" value={<Counter to={REGISTRY_TOTAL} />} suffix="and growing" />
          </Reveal>
          <Reveal delay={80}>
            <Stat label="Calls routed" value={<Counter to={totalCalls * 184} />} />
          </Reveal>
          <Reveal delay={160}>
            <Stat label="USDC settled" value={<Counter to={totalVolume * 184} decimals={2} prefix="$" />} />
          </Reveal>
          <Reveal delay={240}>
            <Stat label="Active publishers" value={<Counter to={312} />} suffix="on devnet" />
          </Reveal>
        </div>
      </section>

      {/* ========= MARKETPLACE GRID ========= */}
      <section id="tools" className="relative">
        <div className="max-w-[1280px] mx-auto px-8 py-20">
          <Reveal>
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted">/ 02 — Browse</span>
                <h2 className="font-display font-bold tracking-tight text-5xl md:text-6xl mt-3">
                  The <span className="text-lime italic">tool</span> shelf
                </h2>
              </div>
              <div className="hidden md:block text-right">
                <div className="font-mono text-xs text-muted uppercase tracking-widest mb-1">Showing</div>
                <div className="font-display text-2xl">
                  {filtered.length}
                  {cat === 'All' && !search.trim() && (
                    <span className="text-muted"> / {REGISTRY_TOTAL.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Filter bar */}
          <div className="sticky top-16 z-20 -mx-8 px-8 py-4 bg-ink/80 backdrop-blur-xl border-y border-line-soft mb-8">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[220px]">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search 1,400+ MCP tools…"
                  className="w-full bg-ink-1 border border-line rounded-full pl-11 pr-4 py-2.5 text-sm text-bone placeholder:text-muted"
                />
              </div>
              <div className="flex items-center gap-1 bg-ink-1 border border-line rounded-full p-1">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    className={`relative px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      cat === c ? 'text-lime-ink' : 'text-bone-dim hover:text-bone'
                    }`}
                  >
                    {cat === c && <span className="absolute inset-0 bg-lime rounded-full" aria-hidden />}
                    <span className="relative">{c}</span>
                  </button>
                ))}
              </div>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="appearance-none bg-ink-1 border border-line rounded-full pl-4 pr-9 py-2 text-xs text-bone-dim font-mono hover:text-bone hover:border-line cursor-none"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                >
                  <option value="trending">Sort · Trending</option>
                  <option value="cheapest">Sort · Cheapest</option>
                  <option value="rating">Sort · Top rated</option>
                  <option value="calls">Sort · Most called</option>
                </select>
                <svg
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  width="10" height="10" viewBox="0 0 10 10" fill="none"
                >
                  <path d="M1 3.5 5 7.5 9 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((tool, i) => (
              <Reveal key={tool.id} delay={i * 40}>
                <Link href={`/tool/${tool.id}`} className="block h-full">
                  <TiltCard className="h-full rounded-2xl bg-ink-1 border border-line-soft hover:border-line transition-colors p-6 overflow-hidden">
                    <div className="flex items-start justify-between mb-5">
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border"
                        style={{
                          color: CATEGORY_ACCENT[tool.category],
                          borderColor: CATEGORY_ACCENT[tool.category] + '33',
                          background: CATEGORY_ACCENT[tool.category] + '0d',
                        }}
                      >
                        <span className="w-1 h-1 rounded-full" style={{ background: CATEGORY_ACCENT[tool.category] }} />
                        {tool.category}
                      </span>
                      {tool.tag && <TagBadge kind={tool.tag} />}
                    </div>

                    <h3 className="font-display font-semibold text-xl text-bone mb-2 leading-snug">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-bone-dim leading-relaxed mb-7 line-clamp-3">{tool.description}</p>

                    <div className="flex items-end justify-between pt-5 border-t border-line-soft">
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-0.5">per call</div>
                        <div className="font-display font-bold text-2xl text-bone">
                          {tool.pricePerCall}
                          <span className="text-sm font-mono text-muted ml-1">USDC</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1 text-xs text-bone-dim mb-1">
                          <svg width="11" height="11" className="text-lime fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                          {tool.rating.toFixed(1)}
                        </div>
                        <div className="text-[11px] font-mono text-muted">
                          {tool.totalCalls.toLocaleString()} calls
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-line-soft flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar seed={tool.publisher} />
                        <span className="font-mono text-[11px] text-muted">{tool.publisher}</span>
                      </div>
                      <span className="text-[11px] font-mono text-lime opacity-0 group-hover:opacity-100 transition-opacity">
                        open →
                      </span>
                    </div>
                  </TiltCard>
                </Link>
              </Reveal>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="font-display text-3xl text-bone-dim mb-2">Nothing here.</div>
              <p className="text-sm text-muted">Try a different query or category.</p>
            </div>
          )}
        </div>
      </section>

      {/* ========= HOW IT WORKS ========= */}
      <section className="border-t border-line-soft relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-8 py-24">
          <Reveal>
            <div className="mb-16">
              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted">/ 03 — How it works</span>
              <h2 className="font-display font-bold tracking-tight text-5xl md:text-6xl mt-3 max-w-3xl">
                Four steps between <span className="text-lime">intent</span> and <span className="italic">answer</span>.
              </h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-px bg-line-soft">
            {[
              { n: '01', title: 'Agent discovers', body: 'An autonomous agent queries the on-chain registry for a tool it needs — filtered by schema, price, rating.', accent: 'var(--lime)' },
              { n: '02', title: 'Payment signed', body: 'Agent signs a pay-for-tool instruction in USDC. The transaction creates a PaymentRecord PDA bound to this exact call.', accent: 'var(--mint)' },
              { n: '03', title: 'Gateway verifies', body: 'Our gateway reads the PDA, confirms the payment hasn\'t been spent, and proxies the MCP call to the tool\'s endpoint.', accent: 'var(--violet)' },
              { n: '04', title: 'Publisher earns', body: 'USDC lands in the publisher\'s vault the moment the call settles. No settlement delay, no Stripe, no chargebacks.', accent: 'var(--coral)' },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 100} className="bg-ink">
                <div className="p-10 group hover:bg-ink-1 transition-colors h-full">
                  <div className="flex items-baseline gap-4 mb-5">
                    <span className="font-mono text-xs text-muted">{step.n}</span>
                    <span className="h-px flex-1" style={{ background: step.accent, opacity: 0.3 }} />
                    <span className="w-2 h-2 rounded-full" style={{ background: step.accent }} />
                  </div>
                  <h3 className="font-display font-semibold text-2xl mb-3">{step.title}</h3>
                  <p className="text-bone-dim text-[15px] leading-relaxed">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========= BIG CTA ========= */}
      <section className="relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-8 py-32 text-center">
          <Reveal>
            <div className="font-mono text-xs text-muted tracking-[0.3em] uppercase mb-6">/ 04 — Ship it</div>
            <h2 className="font-display font-bold tracking-tightest text-[clamp(48px,9vw,128px)] leading-[0.9]">
              Every <span className="kinetic">tool</span>
              <br />
              has a <span className="text-lime italic">price tag.</span>
            </h2>
            <p className="mt-8 max-w-xl mx-auto text-bone-dim leading-relaxed">
              Publish a tool in under five minutes. On-chain registry, USDC payouts, instant discovery.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
              <Magnetic as="a" href="/publish" strength={0.5}>
                <span className="inline-flex items-center gap-3 bg-lime text-lime-ink font-semibold text-base px-8 py-4 rounded-full">
                  Publish your tool
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </span>
              </Magnetic>
              <Magnetic as="a" href="#tools" strength={0.3}>
                <span className="inline-flex items-center gap-2 text-bone font-medium text-base px-8 py-4 rounded-full border border-line hover:border-bone transition-colors">
                  Browse marketplace
                </span>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========= FOOTER ========= */}
      <footer className="border-t border-line-soft">
        <div className="max-w-[1280px] mx-auto px-8 py-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-mint pulse-dot" />
            <span className="font-mono">gateway online · devnet · {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-muted font-mono">
            <span className="text-muted/60">docs · soon</span>
            <span className="text-muted/60">github · soon</span>
            <a href="https://modelcontextprotocol.io/" target="_blank" rel="noreferrer" className="hover:text-bone">mcp spec ↗</a>
            <a href="https://www.x402.org/" target="_blank" rel="noreferrer" className="hover:text-bone">x402 ↗</a>
          </div>
        </div>
      </footer>
    </>
  );
}

function Stat({ label, value, suffix }: { label: string; value: React.ReactNode; suffix?: string }) {
  return (
    <div className="group">
      <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted mb-3">{label}</div>
      <div className="font-display font-bold text-4xl md:text-5xl tracking-tight text-bone">{value}</div>
      {suffix && <div className="text-xs text-muted mt-1">{suffix}</div>}
    </div>
  );
}

function TagBadge({ kind }: { kind: 'hot' | 'new' | 'featured' }) {
  const style: Record<string, { label: string; fg: string; bg: string }> = {
    hot: { label: '🔥 Trending', fg: 'var(--coral)', bg: 'rgba(255,90,54,0.1)' },
    new: { label: '✦ New', fg: 'var(--mint)', bg: 'rgba(126,240,201,0.1)' },
    featured: { label: '★ Featured', fg: 'var(--lime)', bg: 'rgba(212,255,58,0.12)' },
  };
  const s = style[kind];
  return (
    <span
      className="text-[10px] font-medium px-2 py-1 rounded-full"
      style={{ color: s.fg, background: s.bg }}
    >
      {s.label}
    </span>
  );
}

function Avatar({ seed }: { seed: string }) {
  const hue = Math.abs([...seed].reduce((h, c) => (h << 5) - h + c.charCodeAt(0), 0)) % 360;
  return (
    <span
      className="w-5 h-5 rounded-full border border-line"
      style={{ background: `conic-gradient(from 0deg, hsl(${hue}, 70%, 55%), hsl(${(hue + 80) % 360}, 60%, 60%), hsl(${hue}, 70%, 55%))` }}
      aria-hidden
    />
  );
}
