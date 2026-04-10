import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'x402 MCP Marketplace',
  description: 'Pay-per-call AI tool marketplace on Solana',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-semibold text-lg tracking-tight">
                <span className="text-blue-600">x402</span> MCP
              </Link>
              <nav className="flex gap-1">
                <Link href="/" className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-50">
                  Browse
                </Link>
                <Link href="/publish" className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-50">
                  Publish
                </Link>
              </nav>
            </div>
            <button className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800">
              Connect Wallet
            </button>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
