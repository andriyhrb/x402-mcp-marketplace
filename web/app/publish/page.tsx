'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { Reveal } from '../../components/reveal';

export default function PublishPage() {
  const { publicKey, connected } = useWallet();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [price, setPrice] = useState('0.001');
  const [category, setCategory] = useState('Data');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const walletAddress = publicKey?.toBase58() || '';
  const canPublish = connected && name.trim() && description.trim() && endpoint.trim();

  const priceNum = Number.isFinite(parseFloat(price)) ? Math.max(0.0001, parseFloat(price)) : 0.001;

  const onSoonClick = () => {
    if (!connected) {
      setToast('Connect a wallet first — waitlist opens with v1.0');
      return;
    }
    if (!canPublish) {
      setToast('Fill name, description and endpoint to join the queue');
      return;
    }
    setToast(`Thanks — we\u2019ll reach out to ${walletAddress.slice(0, 4)}…${walletAddress.slice(-4)} when the registry opens`);
  };

  return (
    <div className="max-w-2xl mx-auto px-8 py-16">
      <Reveal>
        <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted">/ Publish</span>
        <h1 className="font-display font-bold tracking-tight text-5xl md:text-6xl mt-3 mb-4">
          Ship a tool.<br />
          <span className="text-lime italic">Get paid.</span>
        </h1>
        <p className="text-bone-dim mb-10 max-w-lg">
          Register your MCP tool on-chain and start earning USDC per call. No Stripe, no middlemen, no monthly invoice.
          <span className="block mt-2 text-xs text-muted">Open publishing launches with v1.0 — submit your details below to join the waitlist.</span>
        </p>
      </Reveal>

      <div className="space-y-5">
        <Field label="Tool name">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Solana Balance Checker" className="input" />
        </Field>
        <Field label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What does your tool do?" className="input" />
        </Field>
        <Field label="MCP endpoint URL">
          <input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="https://your-server.com/mcp" className="input font-mono" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (USDC)">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              step="0.001"
              min="0.0001"
              className="input"
              onBlur={() => setPrice(priceNum.toString())}
            />
          </Field>
          <Field label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
              {['Data', 'DeFi', 'Developer', 'NFT', 'Analytics', 'Security'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        {connected && (
          <div className="bg-mint/10 border border-mint/30 text-mint text-xs rounded-xl p-3 font-mono">
            waitlisting as · {walletAddress}
          </div>
        )}

        <button
          type="button"
          onClick={onSoonClick}
          aria-label="Submit for review — coming soon"
          className="soon-btn group relative w-full flex items-center justify-center gap-3 font-semibold py-4 rounded-full text-sm overflow-hidden bg-ink-1 border border-line text-bone hover:border-lime transition-colors"
        >
          <span className="soon-label inline-flex items-center gap-3">
            Submit for review
            <span className="w-6 h-6 rounded-full border border-line flex items-center justify-center group-hover:border-lime group-hover:bg-lime transition-colors">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 5h8M5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-bone group-hover:text-ink transition-colors" />
              </svg>
            </span>
          </span>
          <span className="soon-overlay absolute inset-0 flex items-center justify-center font-display font-bold tracking-tight text-lime text-lg">
            soon<span className="inline-flex ml-0.5">
              <span className="soon-dot" style={{ animationDelay: '0ms' }}>.</span>
              <span className="soon-dot" style={{ animationDelay: '180ms' }}>.</span>
              <span className="soon-dot" style={{ animationDelay: '360ms' }}>.</span>
            </span>
          </span>
        </button>

        <p className="text-xs text-muted text-center">
          Submissions are reviewed before being listed on-chain. Open registry launches with v1.0.
        </p>

        <Link href="/" className="block text-center text-xs text-muted hover:text-bone mt-4">
          ← cancel
        </Link>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-32px)] bg-ink-1 border border-line rounded-2xl px-5 py-3.5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] text-sm text-bone flex items-start gap-3 animate-[toast-in_0.3s_cubic-bezier(.2,.8,.2,1)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-lime flex-shrink-0 mt-2 pulse-dot" />
          <span className="flex-1 leading-relaxed">{toast}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-muted hover:text-bone text-lg leading-none flex-shrink-0"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      <style jsx>{`
        .input {
          width: 100%;
          background: var(--ink-1);
          border: 1px solid var(--line-soft);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          color: var(--bone);
        }
        .input::placeholder { color: var(--muted); }
        @keyframes toast-in {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-mono uppercase tracking-widest text-muted mb-2 block">{label}</label>
      {children}
    </div>
  );
}
