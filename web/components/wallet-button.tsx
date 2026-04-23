'use client';

import dynamic from 'next/dynamic';

// Single dynamic import shared across the app so we don't duplicate the chunk
export const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((m) => m.WalletMultiButton),
  { ssr: false }
);
