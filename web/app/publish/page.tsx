'use client';

import { useState } from 'react';

export default function PublishPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [price, setPrice] = useState('0.001');
  const [category, setCategory] = useState('Data');

  const canPublish = name.trim() && description.trim() && endpoint.trim();

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

        <button disabled={!canPublish} className="w-full bg-gray-900 text-white font-medium py-3 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-sm">
          Publish Tool (requires wallet)
        </button>
        <p className="text-xs text-gray-400 text-center">Publishing registers your tool on-chain via the marketplace program. A small SOL fee applies for account creation.</p>
      </div>
    </div>
  );
}
