'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletMultiButton } from '../components/wallet-button';

export function HeaderNav() {
  const path = usePathname();

  const link = (href: string, label: string) => {
    const active = href === '/' ? path === '/' : path?.startsWith(href);
    return (
      <Link
        href={href}
        className={`relative px-3 py-1.5 text-sm transition-colors ${
          active ? 'text-bone' : 'text-muted hover:text-bone'
        }`}
      >
        {label}
        {active && <span className="absolute left-3 right-3 -bottom-[1px] h-px bg-lime" />}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line-soft bg-ink/70 backdrop-blur-xl">
      <div className="max-w-[1280px] mx-auto px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="relative w-7 h-7">
              <span className="absolute inset-0 bg-lime rounded-sm" />
              <span className="absolute inset-0 border border-bone/30 rounded-sm rotate-12" />
              <span className="absolute inset-[6px] bg-ink rounded-[2px]" />
              <span className="absolute inset-[10px] bg-lime rounded-[1px]" />
            </span>
            <span className="font-display font-bold tracking-tight text-[17px]">
              x402<span className="text-lime">·</span>mcp
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {link('/', 'Marketplace')}
            {link('/usage', 'Usage')}
            {link('/publish', 'Publish')}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-mint pulse-dot" />
            <span className="font-mono">devnet · 14.3k calls / 24h</span>
          </div>
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}
