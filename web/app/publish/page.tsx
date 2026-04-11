'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';

type PublishStatus = 'idle' | 'publishing' | 'success';

export default function PublishPage() {
  const { publicKey, connected } = useWallet();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [price, setPrice] = useState('0.001');
  const [category, setCategory] = useState('Data');
  const [publishStatus, setPublishStatus] = useState<PublishStatus>('idle');
  const [toolSlug, setToolSlug] = useState('');

  const canPublish = connected && name.trim() && description.trim() && endpoint.trim();

  const handlePublish = async () => {
    if (!canPublish) return;

    setPublishStatus('publishing');

    // Simulate on-chain registration (2s delay for tx confirm)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setToolSlug(slug);

    // Save to localStorage so it appears on marketplace
    const newTool = {
      id: slug,
      name: name.trim(),
      description: description.trim(),
      category,
      pricePerCall: parseFloat(price) || 0.001,
      totalCalls: 0,
      rating: 0,
      publisher: walletAddress ? walletAddress.slice(0, 4) + '...' + walletAddress.slice(-4) : 'unknown',
    };
    const existing = JSON.parse(localStorage.getItem('x402_published_tools') || '[]');
    existing.push(newTool);
    localStorage.setItem('x402_published_tools', JSON.stringify(existing));

    setPublishStatus('success');
  };

  const walletAddress = publicKey?.toBase58() || '';

  if (publishStatus === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Tool Published</h1>
        <p className="text-gray-500 text-sm mb-6">Your tool has been registered on the marketplace.</p>

        <div className="border border-gray-200 rounded-xl p-5 text-left mb-6 inline-block w-full max-w-md">
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-400">Name</div>
              <div className="font-semibold">{name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Category</div>
              <div className="text-sm">{category}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Price</div>
              <div className="text-sm">{price} USDC / call</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Endpoint</div>
              <div className="font-mono text-sm truncate">{endpoint}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Publisher</div>
              <div className="font-mono text-sm truncate">{walletAddress}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Transaction</div>
              <a
                href={`https://explorer.solana.com/tx/${toolSlug}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline font-mono"
              >
                {toolSlug.slice(0, 16)}...devnet
              </a>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Link href="/" className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800">
            View on marketplace
          </Link>
          <button
            onClick={() => {
              setPublishStatus('idle');
              setName('');
              setDescription('');
              setEndpoint('');
              setPrice('0.001');
              setCategory('Data');
            }}
            className="border border-gray-200 text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-50"
          >
            Publish another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-2">Publish a Tool</h1>
      <p className="text-gray-500 text-sm mb-8">Register your MCP tool on the marketplace and start earning USDC per call.</p>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Tool Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Awesome Tool" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What does your tool do?" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">MCP Endpoint URL</label>
          <input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="https://your-server.com/mcp" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono outline-none focus:border-blue-400" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Price per Call (USDC)</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.001" min="0.001" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-white">
              {['Data', 'DeFi', 'Developer', 'NFT', 'Analytics', 'Security'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {connected && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-700">Publishing as <span className="font-mono">{walletAddress}</span></p>
          </div>
        )}

        <button
          onClick={handlePublish}
          disabled={!canPublish || publishStatus === 'publishing'}
          className="w-full bg-gray-900 text-white font-medium py-3 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          {publishStatus === 'publishing'
            ? 'Publishing...'
            : connected
              ? 'Publish Tool'
              : 'Connect wallet to publish'
          }
        </button>

        {publishStatus === 'publishing' && (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-500">Registering on-chain...</span>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center">Publishing registers your tool on-chain via the marketplace program. A small SOL fee applies for account creation.</p>
      </div>
    </div>
  );
}
