'use client';

import { useMemo, type ReactNode } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';

// Type assertions — React 18/19 type incompatibility with wallet adapter
const Connection = ConnectionProvider as any;
const Wallet = WalletProvider as any;
const WalletModal = WalletModalProvider as any;

export function WalletContextProvider({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <Connection endpoint={endpoint}>
      <Wallet wallets={wallets} autoConnect>
        <WalletModal>
          {children}
        </WalletModal>
      </Wallet>
    </Connection>
  );
}
