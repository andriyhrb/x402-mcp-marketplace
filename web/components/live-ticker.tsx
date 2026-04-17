'use client';

import { useEffect, useState } from 'react';

const TOOLS = [
  'sol-balance', 'nft-metadata', 'tx-decoder', 'price-feed',
  'wallet-scorer', 'cpi-analyzer', 'airdrop-check', 'program-audit',
];
const ADDRS = ['7xKz…3nPq', '9mBq…7kLx', '3pRx…5mWz', '5nTy…2jKv', '8kHz…9wQp', '2mFx…6tNr', '6qWz…1yBk', 'AgNt…bot1', 'Jup…v6', 'MrkT…mkr'];

interface Call {
  id: number;
  tool: string;
  caller: string;
  price: number;
}

let uid = 0;
function makeCall(): Call {
  uid += 1;
  const tool = TOOLS[Math.floor(Math.random() * TOOLS.length)];
  const caller = ADDRS[Math.floor(Math.random() * ADDRS.length)];
  const price = [0.001, 0.002, 0.003, 0.004, 0.005, 0.01][Math.floor(Math.random() * 6)];
  return { id: uid, tool, caller, price };
}

// Deterministic SSR-safe seed so hydration matches — regenerated client-side after mount
const SSR_SEED: Call[] = Array.from({ length: 14 }, (_, i) => ({
  id: i + 1,
  tool: TOOLS[i % TOOLS.length],
  caller: ADDRS[i % ADDRS.length],
  price: [0.001, 0.002, 0.003][i % 3],
}));

export function LiveTicker() {
  const [calls, setCalls] = useState<Call[]>(SSR_SEED);

  useEffect(() => {
    // Randomize after mount so hydration HTML matches server
    uid = SSR_SEED.length;
    setCalls(Array.from({ length: 14 }, () => makeCall()));

    const iv = window.setInterval(() => {
      setCalls((prev) => [makeCall(), ...prev].slice(0, 28));
    }, 2200);
    return () => window.clearInterval(iv);
  }, []);

  const loop = [...calls, ...calls];

  return (
    <div className="relative overflow-hidden border-y border-line-soft bg-ink-1/60 backdrop-blur-sm py-3">
      <div className="marquee-track flex gap-3 whitespace-nowrap w-max">
        {loop.map((c, i) => (
          <span key={`${c.id}-${i < calls.length ? 'a' : 'b'}`} className="tick-chip">
            <span className="w-1.5 h-1.5 rounded-full bg-mint pulse-dot" />
            <span className="font-mono text-[11px] text-muted">{c.caller}</span>
            <span className="text-bone-dim">called</span>
            <span className="text-lime font-medium">{c.tool}</span>
            <span className="text-muted">·</span>
            <span className="font-mono text-[11px] text-bone-dim">{c.price.toFixed(3)} USDC</span>
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink to-transparent" />
    </div>
  );
}
