'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  pricePerCall: number;
  totalCalls: number;
  rating: number;
  publisher: string;
  endpoint: string;
  methods: string[];
  exampleInput: string;
  exampleOutput: string;
}

const TOOLS: Record<string, Tool> = {
  'sol-balance': {
    id: 'sol-balance', name: 'Solana Balance Checker', description: 'Check SOL and SPL token balances for any wallet address on Solana. Returns native SOL balance, all SPL token accounts with mint, amount, and decimals.', category: 'Data', pricePerCall: 0.001, totalCalls: 12450, rating: 4.8, publisher: '7xKz...3nPq', endpoint: 'https://tools.example.com/sol-balance', methods: ['getBalance', 'getTokenAccounts'],
    exampleInput: '{ "method": "getBalance", "params": { "address": "7xKz...3nPq" } }',
    exampleOutput: '{ "sol": 12.45, "tokens": [{ "mint": "EPjFWdd5...", "amount": 1500.00, "symbol": "USDC" }] }',
  },
  'tx-decoder': {
    id: 'tx-decoder', name: 'Transaction Decoder', description: 'Decode Solana transactions into human-readable format with program labels, account annotations, and instruction data parsing.', category: 'Developer', pricePerCall: 0.003, totalCalls: 6340, rating: 4.9, publisher: '3pRx...5mWz', endpoint: 'https://tools.example.com/tx-decode', methods: ['decode', 'summarize'],
    exampleInput: '{ "method": "decode", "params": { "signature": "5xM2z..." } }',
    exampleOutput: '{ "program": "Jupiter v6", "action": "Swap", "from": "SOL", "to": "USDC", "amount": 1.5 }',
  },
};

export default function ToolDetailPage() {
  const params = useParams();
  const toolId = params.id as string;
  const tool = TOOLS[toolId];
  const [tryInput, setTryInput] = useState('');
  const [tryOutput, setTryOutput] = useState('');

  if (!tool) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Tool Not Found</h1>
        <p className="text-gray-500 mb-4">This tool doesn&apos;t exist in the registry.</p>
        <Link href="/" className="text-blue-600 hover:underline text-sm">Back to marketplace</Link>
      </div>
    );
  }

  const handleTry = () => {
    setTryOutput(tool.exampleOutput);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block">&larr; Back to marketplace</Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded mb-2 inline-block">{tool.category}</span>
          <h1 className="text-2xl font-bold tracking-tight">{tool.name}</h1>
          <p className="text-gray-500 mt-2 leading-relaxed max-w-2xl">{tool.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Price per call</div>
          <div className="font-semibold">{tool.pricePerCall} USDC</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Total calls</div>
          <div className="font-semibold">{tool.totalCalls.toLocaleString()}</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Rating</div>
          <div className="font-semibold flex items-center gap-1">
            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
            {tool.rating}
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Publisher</div>
          <div className="font-mono text-sm">{tool.publisher}</div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="font-semibold text-lg mb-3">Available Methods</h2>
        <div className="flex gap-2">
          {tool.methods.map((m) => (
            <span key={m} className="font-mono text-sm bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md">{m}</span>
          ))}
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-lg mb-4">Try it</h2>
        <div className="mb-4">
          <label className="text-sm text-gray-500 mb-1 block">Input</label>
          <textarea
            value={tryInput || tool.exampleInput}
            onChange={(e) => setTryInput(e.target.value)}
            rows={3}
            className="w-full font-mono text-sm border border-gray-200 rounded-lg p-3 outline-none focus:border-blue-400"
          />
        </div>
        <button
          onClick={handleTry}
          className="bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 mb-4"
        >
          Run (costs {tool.pricePerCall} USDC)
        </button>
        {tryOutput && (
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Output</label>
            <pre className="font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto">{tryOutput}</pre>
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-3">Integration</h2>
        <pre className="font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">{`curl -X POST ${tool.endpoint} \\
  -H "x-payment-signature: <tx_sig>" \\
  -H "x-caller-pubkey: <your_pubkey>" \\
  -H "Content-Type: application/json" \\
  -d '${tool.exampleInput}'`}</pre>
      </div>
    </div>
  );
}
