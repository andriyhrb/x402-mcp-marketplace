'use client';

import { useState } from 'react';

type State = 'idle' | 'copied' | 'error';

interface Props {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = 'copy', className = '' }: Props) {
  const [state, setState] = useState<State>('idle');

  const onCopy = async () => {
    let success = false;
    try {
      if (navigator.clipboard && window.isSecureContext !== false) {
        await navigator.clipboard.writeText(text);
        success = true;
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        success = document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch {
      success = false;
    }
    setState(success ? 'copied' : 'error');
    window.setTimeout(() => setState('idle'), 1600);
  };

  const styles: Record<State, string> = {
    idle: 'text-muted border-line-soft bg-ink hover:text-bone hover:border-line',
    copied: 'text-lime-ink bg-lime border-lime',
    error: 'text-coral bg-coral/10 border-coral/40',
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className={`inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest px-2.5 py-1.5 rounded-full border transition-colors ${styles[state]} ${className}`}
      aria-label="Copy to clipboard"
    >
      {state === 'copied' && (
        <>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M2 7l3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          copied
        </>
      )}
      {state === 'error' && (
        <>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          failed
        </>
      )}
      {state === 'idle' && (
        <>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <rect x="4.25" y="4.25" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M2.25 9.75V3a.75.75 0 0 1 .75-.75h6.75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
