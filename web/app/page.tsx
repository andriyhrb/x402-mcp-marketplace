'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  pricePerCall: number;
  totalCalls: number;
  rating: number;
  publisher: string;
}

const DEMO_TOOLS: Tool[] = [
  { id: 'sol-balance', name: 'Solana Balance Checker', description: 'Check SOL and SPL token balances for any wallet address on Solana', category: 'Data', pricePerCall: 0.001, totalCalls: 12450, rating: 4.8, publisher: '7xKz...3nPq' },
  { id: 'nft-metadata', name: 'NFT Metadata Resolver', description: 'Fetch and parse metadata for any Solana NFT including traits and image URLs', category: 'NFT', pricePerCall: 0.002, totalCalls: 8920, rating: 4.6, publisher: '9mBq...7kLx' },
  { id: 'tx-decoder', name: 'Transaction Decoder', description: 'Decode Solana transactions into human-readable format with program labels', category: 'Developer', pricePerCall: 0.003, totalCalls: 6340, rating: 4.9, publisher: '3pRx...5mWz' },
  { id: 'price-feed', name: 'DeFi Price Aggregator', description: 'Real-time token prices from Jupiter, Raydium, and Orca with VWAP calculation', category: 'DeFi', pricePerCall: 0.001, totalCalls: 24100, rating: 4.7, publisher: '5nTy...2jKv' },
  { id: 'wallet-scorer', name: 'Wallet Risk Scorer', description: 'Score wallet risk based on transaction history, token holdings, and DeFi exposure', category: 'Analytics', pricePerCall: 0.005, totalCalls: 3200, rating: 4.4, publisher: '8kHz...9wQp' },
  { id: 'cpi-analyzer', name: 'CPI Call Analyzer', description: 'Analyze cross-program invocation patterns for any Solana program', category: 'Developer', pricePerCall: 0.004, totalCalls: 1890, rating: 4.5, publisher: '2mFx...6tNr' },
  { id: 'airdrop-check', name: 'Airdrop Eligibility', description: 'Check wallet eligibility for upcoming Solana ecosystem airdrops', category: 'Data', pricePerCall: 0.002, totalCalls: 45200, rating: 4.3, publisher: '6qWz...1yBk' },
  { id: 'program-audit', name: 'Quick Security Scan', description: 'Automated security scan for Anchor programs — checks common vulnerabilities', category: 'Security', pricePerCall: 0.01, totalCalls: 780, rating: 4.8, publisher: '4jLx...8mRv' },
];

const CATEGORIES = ['All', 'Data', 'DeFi', 'Developer', 'NFT', 'Analytics', 'Security'];

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = DEMO_TOOLS.filter((t) => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || t.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">MCP Tool Marketplace</h1>
        <p className="text-gray-500">Pay-per-call AI tools powered by x402 micropayments on Solana</p>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tools..."
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
        />
        <div className="flex gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tool) => (
          <Link
            key={tool.id}
            href={`/tool/${tool.id}`}
            className="border border-gray-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {tool.category}
              </span>
              <span className="text-xs text-gray-400 font-mono">{tool.pricePerCall} USDC</span>
            </div>
            <h3 className="font-semibold text-base mb-1.5 group-hover:text-blue-600 transition-colors">
              {tool.name}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">{tool.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{tool.totalCalls.toLocaleString()} calls</span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                {tool.rating}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-1">No tools found</p>
          <p className="text-sm">Try a different search or category</p>
        </div>
      )}
    </div>
  );
}
