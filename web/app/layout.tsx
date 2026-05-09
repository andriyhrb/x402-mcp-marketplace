import './globals.css';
import { WalletContextProvider } from './wallet-context';
import { HeaderNav } from './header-nav';
import { CustomCursor } from '../components/custom-cursor';
import { ScrollProgress } from '../components/scroll-progress';

export const metadata = {
  title: 'x402 · MCP Marketplace for autonomous agents',
  description: 'Pay-per-call AI tool marketplace on Solana. USDC micropayments, on-chain registry, instant gateway.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0e',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletContextProvider>
          <div className="ambient" aria-hidden />
          <div className="grain" aria-hidden />
          <ScrollProgress />
          <CustomCursor />
          <HeaderNav />
          <main className="relative z-[1]">{children}</main>
        </WalletContextProvider>
      </body>
    </html>
  );
}
