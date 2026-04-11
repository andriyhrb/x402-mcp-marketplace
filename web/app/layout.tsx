import './globals.css';
import { WalletContextProvider } from './providers';
import { HeaderNav } from './header-nav';

export const metadata = {
  title: 'x402 MCP Marketplace',
  description: 'Pay-per-call AI tool marketplace on Solana',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletContextProvider>
          <HeaderNav />
          <main>{children}</main>
        </WalletContextProvider>
      </body>
    </html>
  );
}
