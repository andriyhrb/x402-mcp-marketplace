export interface DailyPoint { date: string; day: number; month: number; calls: number; cost: number; }
export interface MonthPoint { month: string; calls: number; cost: number; }
export interface CategorySlice { category: string; calls: number; cost: number; color: string; }
export interface ToolRow { tool: string; id: string; calls: number; cost: number; avgLatency: number; category: string; }
export interface RecentCall { tool: string; toolId: string; ts: number; cost: number; status: 'success' | 'failed'; latency: number; }

export interface UsageData {
  totalCalls: number;
  totalSpent: number;
  successRate: number;
  avgLatency: number;
  streak: number;
  percentile: number;
  joinedAt: number;
  favoriteTool: string;
  daily: DailyPoint[];
  monthly: MonthPoint[];
  byCategory: CategorySlice[];
  byTool: ToolRow[];
  heatmap: number[][];
  recent: RecentCall[];
}

const TOOLS: { id: string; name: string; category: string; price: number }[] = [
  { id: 'sol-balance', name: 'Solana Balance Checker', category: 'Data', price: 0.001 },
  { id: 'nft-metadata', name: 'NFT Metadata Resolver', category: 'NFT', price: 0.002 },
  { id: 'tx-decoder', name: 'Transaction Decoder', category: 'Developer', price: 0.003 },
  { id: 'price-feed', name: 'DeFi Price Aggregator', category: 'DeFi', price: 0.001 },
  { id: 'wallet-scorer', name: 'Wallet Risk Scorer', category: 'Analytics', price: 0.005 },
  { id: 'cpi-analyzer', name: 'CPI Call Analyzer', category: 'Developer', price: 0.004 },
  { id: 'airdrop-check', name: 'Airdrop Eligibility', category: 'Data', price: 0.002 },
  { id: 'program-audit', name: 'Quick Security Scan', category: 'Security', price: 0.01 },
];

const CAT_COLORS: Record<string, string> = {
  Data: '#d4ff3a',
  DeFi: '#7ef0c9',
  Developer: '#a78bfa',
  NFT: '#ff5a36',
  Analytics: '#f4ece0',
  Security: '#ff7a7a',
};

function seedFromString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(rng: () => number, arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const range = (rng: () => number, a: number, b: number) => a + rng() * (b - a);
const intRange = (rng: () => number, a: number, b: number) => Math.floor(range(rng, a, b + 1));

export function generateUsageData(walletAddr: string): UsageData {
  const rng = mulberry32(seedFromString(walletAddr));

  // Persona: casual / regular / power user
  const intensity = range(rng, 0.4, 4.2);

  // Tool preference bias — 2-3 favorite tools get most calls
  const toolWeights = TOOLS.map(() => Math.pow(rng(), 2.2));
  const weightSum = toolWeights.reduce((a, b) => a + b, 0);
  const normWeights = toolWeights.map((w) => w / weightSum);

  // Daily activity for last 90 days
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const daily: DailyPoint[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const weekday = d.getDay();
    const weekendBoost = weekday === 0 || weekday === 6 ? range(rng, 0.5, 0.9) : 1;
    const seasonal = 1 + Math.sin((i / 14) + rng() * 3) * 0.25;
    const base = range(rng, 2, 18) * intensity * weekendBoost * seasonal;
    const isQuiet = rng() < 0.08;
    const calls = isQuiet ? intRange(rng, 0, 2) : Math.max(0, Math.round(base));
    let cost = 0;
    for (let c = 0; c < calls; c++) {
      const tIdx = weightedPick(rng, normWeights);
      cost += TOOLS[tIdx].price;
    }
    daily.push({
      date: d.toISOString().slice(0, 10),
      day: d.getDate(),
      month: d.getMonth(),
      calls,
      cost,
    });
  }

  // Monthly aggregation for last 12 months — fully synthetic for months older than
  // the 90-day daily window; scaled up from daily for the current-ish month.
  const monthly: MonthPoint[] = [];
  for (let m = 11; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    // Always synthesize a plausible monthly total — stable per seed.
    const base = range(rng, 80, 320) * intensity * (1 + Math.sin(m * 0.6) * 0.2);
    const calls = Math.round(base);
    const cost = calls * range(rng, 0.0018, 0.0048);
    monthly.push({ month: label, calls, cost });
  }

  // "Total calls" = lifetime (daily window + older months 3..11); skip the most recent
  // 3 synthetic months because they overlap with `daily`.
  const historicalMonths = monthly.slice(0, 9); // oldest 9 (indices 0..8 = m=11..3)
  const totalCalls =
    daily.reduce((s, p) => s + p.calls, 0) +
    historicalMonths.reduce((s, p) => s + p.calls, 0);
  const totalSpent =
    daily.reduce((s, p) => s + p.cost, 0) +
    historicalMonths.reduce((s, p) => s + p.cost, 0);

  // Per-tool breakdown — sum of tool calls equals totalCalls; sum of tool cost equals totalSpent-ish
  const byTool: ToolRow[] = TOOLS.map((t, i) => {
    const calls = Math.round(totalCalls * normWeights[i]);
    return {
      id: t.id,
      tool: t.name,
      category: t.category,
      calls,
      cost: calls * t.price,
      avgLatency: Math.round(range(rng, 80, 620)),
    };
  })
    .filter((r) => r.calls > 0)
    .sort((a, b) => b.calls - a.calls);

  const favoriteTool = byTool[0]?.tool ?? TOOLS[0].name;

  // Category aggregation
  const catMap = new Map<string, { calls: number; cost: number }>();
  for (const r of byTool) {
    const cur = catMap.get(r.category) || { calls: 0, cost: 0 };
    cur.calls += r.calls;
    cur.cost += r.cost;
    catMap.set(r.category, cur);
  }
  const byCategory: CategorySlice[] = [...catMap.entries()]
    .map(([category, v]) => ({ category, calls: v.calls, cost: v.cost, color: CAT_COLORS[category] ?? '#f4ece0' }))
    .sort((a, b) => b.calls - a.calls);

  // Hour × Weekday heatmap (7 rows = Mon..Sun, 24 cols)
  const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (let w = 0; w < 7; w++) {
    for (let h = 0; h < 24; h++) {
      // Peak activity during work hours on weekdays
      const isWeekend = w >= 5;
      const workHour = h >= 9 && h <= 19 ? 1.6 : h >= 20 && h <= 23 ? 1.1 : h >= 2 && h <= 7 ? 0.1 : 0.6;
      const base = intensity * workHour * (isWeekend ? 0.55 : 1) * range(rng, 0.4, 1.6);
      heatmap[w][h] = Math.max(0, Math.round(base * range(rng, 0.5, 2.2)));
    }
  }

  // Recent calls (last 30)
  const recent: RecentCall[] = [];
  for (let i = 0; i < 30; i++) {
    const tIdx = weightedPick(rng, normWeights);
    const t = TOOLS[tIdx];
    const ts = Date.now() - Math.floor(range(rng, 0, 72) * 60 * 60 * 1000);
    recent.push({
      tool: t.name,
      toolId: t.id,
      ts,
      cost: t.price,
      status: rng() < 0.96 ? 'success' : 'failed',
      latency: Math.round(range(rng, 65, 680)),
    });
  }
  recent.sort((a, b) => b.ts - a.ts);

  // Streak — count trailing days with at least 1 call
  let streak = 0;
  for (let i = daily.length - 1; i >= 0; i--) {
    if (daily[i].calls > 0) streak++;
    else break;
  }

  const successRate = 0.93 + rng() * 0.065;
  const avgLatency = Math.round(range(rng, 140, 380));
  const percentile = Math.round(range(rng, 52, 97));
  const joinedAt = Date.now() - intRange(rng, 45, 420) * 24 * 60 * 60 * 1000;

  return {
    totalCalls,
    totalSpent,
    successRate,
    avgLatency,
    streak,
    percentile,
    joinedAt,
    favoriteTool,
    daily,
    monthly,
    byCategory,
    byTool,
    heatmap,
    recent,
  };
}

function weightedPick(rng: () => number, weights: number[]): number {
  const r = rng();
  let acc = 0;
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i];
    if (r < acc) return i;
  }
  return weights.length - 1;
}
