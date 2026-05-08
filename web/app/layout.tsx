import './globals.css';
import { WalletContextProvider } from './wallet-context';
import { HeaderNav } from './header-nav';
import { CustomCursor } from '../components/custom-cursor';
import { ScrollProgress } from '../components/scroll-progress';

export const metadata = {
  title: 'x402 · MCP Marketplace for autonomous agents',
  description: 'Pay-per-call AI tool marketplace on Solana. USDC micropayments, on-chain registry, instant gateway.',
  openGraph: {
    title: 'x402 · MCP Marketplace',
    description: 'Pay-per-call AI tools. Micro USDC. Discoverable via MCP.',
    type: 'website',
    images: ['/og.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og.svg'],
  },
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
