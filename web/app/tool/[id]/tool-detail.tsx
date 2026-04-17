'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { Reveal } from '../../../components/reveal';
import { CopyButton } from '../../../components/copy-button';
import type { ToolRecord } from './tools-registry';

type RunStatus = 'idle' | 'loading' | 'success' | 'wallet-required';

export function ToolDetail({ tool }: { tool: ToolRecord }) {
  const { publicKey, connected } = useWallet();
  const [tryInput, setTryInput] = useState('');
  const [tryOutput, setTryOutput] = useState('');
  const [runStatus, setRunStatus] = useState<RunStatus>('idle');
  const [runNote, setRunNote] = useState<'none' | 'payment-required' | 'gateway-down'>('none');

  const handleRun = async () => {
    if (!connected) {
      setRunStatus('wallet-required');
      setTryOutput('');
      return;
    }

    setRunStatus('loading');
    setTryOutput('');
    setRunNote('none');

    let inputPayload = tryInput || tool.exampleInput;
    let parsedInput: unknown;
    try {
      parsedInput = JSON.parse(inputPayload);
    } catch {
      setRunStatus('success');
      setTryOutput('{"error":"invalid JSON in input"}');
      return;
    }

    try {
      const response = await fetch(`/api/tools/${tool.id}/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-caller-pubkey': publicKey?.toBase58() || '',
        },
        body: JSON.stringify(parsedInput),
      });

      if (response.status === 402) {
        setRunNote('payment-required');
        setTryOutput(tool.exampleOutput);
        setRunStatus('success');
        return;
      }

      if (!response.ok) throw new Error(`gateway_error_${response.status}`);

      const result = await response.json();
      setTryOutput(JSON.stringify(result, null, 2));
      setRunStatus('success');
    } catch {
      setRunNote('gateway-down');
      setTryOutput(tool.exampleOutput);
      setRunStatus('success');
    }
  };

  const callerAddress = publicKey?.toBase58() || '<your_pubkey>';

  const runButtonLabel = (() => {
    if (runStatus === 'loading') return 'Running…';
    if (!connected) return `Run · ${tool.pricePerCall} USDC`;
    return `Run demo · ${tool.pricePerCall} USDC`;
  })();

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-bone mb-10">
        <span>←</span> <span>back to marketplace</span>
      </Link>

      <Reveal>
        <div className="mb-10">
          <span className="inline-block text-[11px] font-mono tracking-widest uppercase text-lime border border-lime/30 bg-lime/5 px-2.5 py-1 rounded-full mb-5">
            {tool.category}
          </span>
          <h1 className="font-display font-bold tracking-tight text-5xl md:text-6xl leading-[1.02] mb-5">
            {tool.name}
          </h1>
          <p className="text-bone-dim text-lg leading-relaxed max-w-2xl">{tool.description}</p>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        <MetaCard label="Per call" value={`${tool.pricePerCall} USDC`} />
        <MetaCard label="Total calls" value={tool.totalCalls.toLocaleString()} />
        <MetaCard label="Rating" value={`★ ${tool.rating}`} />
        <MetaCard label="Publisher" value={tool.publisher} mono />
      </div>

      <section className="mb-10">
        <h2 className="font-display font-semibold text-2xl mb-4">Methods</h2>
        <div className="flex flex-wrap gap-2">
          {tool.methods.map((m) => (
            <span key={m} className="font-mono text-sm bg-ink-1 border border-line-soft px-3 py-1.5 rounded-full text-bone-dim">{m}()</span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-ink-1 border border-line-soft p-8 mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-2xl">Try it</h2>
          <span className="text-xs font-mono text-muted bg-ink border border-line-soft px-3 py-1 rounded-full">
            ⛽ {tool.pricePerCall} USDC / call
          </span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-mono uppercase tracking-widest text-muted">Input</label>
          <CopyButton text={tryInput || tool.exampleInput} />
        </div>
        <div className="relative mb-5">
          <textarea
            value={tryInput || tool.exampleInput}
            onChange={(e) => setTryInput(e.target.value)}
            rows={3}
            spellCheck={false}
            style={{ backgroundColor: 'var(--ink)', color: 'var(--bone)' }}
            className="w-full font-mono text-sm border border-line-soft rounded-xl p-4 resize-none"
          />
        </div>

        <button
          type="button"
          onClick={handleRun}
          disabled={runStatus === 'loading'}
          className="inline-flex items-center gap-2 bg-lime text-lime-ink font-semibold text-sm px-6 py-3 rounded-full transition-all hover:shadow-[0_20px_50px_-15px_rgba(212,255,58,0.6)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {runButtonLabel}
        </button>

        {runStatus === 'wallet-required' && (
          <div className="mt-5 bg-coral/10 border border-coral/30 text-coral text-sm rounded-xl p-3">
            Connect your wallet first to run this tool.
          </div>
        )}

        {runStatus === 'loading' && (
          <div className="mt-5 flex items-center gap-2 text-sm text-muted">
            <div className="w-4 h-4 border-2 border-lime border-t-transparent rounded-full animate-spin" />
            calling gateway…
          </div>
        )}

        {tryOutput && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-mono uppercase tracking-widest text-muted">Output</label>
                {runNote === 'payment-required' && (
                  <span className="text-[10px] font-mono text-lime bg-lime/10 border border-lime/30 px-2 py-0.5 rounded-full">payment required · showing sample</span>
                )}
                {runNote === 'gateway-down' && (
                  <span className="text-[10px] font-mono text-coral bg-coral/10 px-2 py-0.5 rounded-full">gateway unreachable · showing sample</span>
                )}
              </div>
              <CopyButton text={tryOutput} />
            </div>
            <pre className="font-mono text-sm bg-ink border border-line-soft rounded-xl p-4 overflow-x-auto text-bone-dim">{tryOutput}</pre>
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-ink-1 border border-line-soft p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-2xl">Integration</h2>
          <CopyButton
            label="copy curl"
            text={`curl -X POST ${tool.endpoint} \\\n  -H "x-payment-signature: <tx_sig>" \\\n  -H "x-caller-pubkey: ${callerAddress}" \\\n  -H "Content-Type: application/json" \\\n  -d '${tool.exampleInput}'`}
          />
        </div>
        {connected && (
          <div className="mb-4 bg-mint/10 border border-mint/30 text-mint text-xs rounded-xl p-3 font-mono">
            connected · {callerAddress}
          </div>
        )}
        <pre className="font-mono text-sm bg-ink border border-line-soft rounded-xl p-5 overflow-x-auto text-bone-dim">{`curl -X POST ${tool.endpoint} \\
  -H "x-payment-signature: <tx_sig>" \\
  -H "x-caller-pubkey: ${callerAddress}" \\
  -H "Content-Type: application/json" \\
  -d '${tool.exampleInput}'`}</pre>
      </section>
    </div>
  );
}

function MetaCard({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl bg-ink-1 border border-line-soft p-4">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1.5">{label}</div>
      <div className={`font-semibold ${mono ? 'font-mono text-sm' : 'text-lg'} text-bone`}>{value}</div>
    </div>
  );
}
