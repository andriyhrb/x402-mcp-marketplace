'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';

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
  'nft-metadata': {
    id: 'nft-metadata', name: 'NFT Metadata Resolver', description: 'Fetch and parse metadata for any Solana NFT including traits, image URLs, collection info, and royalty configuration from Metaplex standards.', category: 'NFT', pricePerCall: 0.002, totalCalls: 8920, rating: 4.6, publisher: '9mBq...7kLx', endpoint: 'https://tools.example.com/nft-metadata', methods: ['getMetadata', 'getTraits', 'getCollection'],
    exampleInput: '{ "method": "getMetadata", "params": { "mint": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" } }',
    exampleOutput: '{ "name": "Mad Lad #4231", "symbol": "MAD", "image": "https://arweave.net/abc...", "traits": [{ "trait_type": "Background", "value": "Purple" }], "collection": "Mad Lads", "royalty": 5.0 }',
  },
  'tx-decoder': {
    id: 'tx-decoder', name: 'Transaction Decoder', description: 'Decode Solana transactions into human-readable format with program labels, account annotations, and instruction data parsing.', category: 'Developer', pricePerCall: 0.003, totalCalls: 6340, rating: 4.9, publisher: '3pRx...5mWz', endpoint: 'https://tools.example.com/tx-decode', methods: ['decode', 'summarize'],
    exampleInput: '{ "method": "decode", "params": { "signature": "5xM2z..." } }',
    exampleOutput: '{ "program": "Jupiter v6", "action": "Swap", "from": "SOL", "to": "USDC", "amount": 1.5 }',
  },
  'price-feed': {
    id: 'price-feed', name: 'DeFi Price Aggregator', description: 'Real-time token prices aggregated from Jupiter, Raydium, and Orca with VWAP calculation, 24h change, and liquidity depth across pools.', category: 'DeFi', pricePerCall: 0.001, totalCalls: 24100, rating: 4.7, publisher: '5nTy...2jKv', endpoint: 'https://tools.example.com/price-feed', methods: ['getPrice', 'getVWAP', 'getDepth'],
    exampleInput: '{ "method": "getPrice", "params": { "token": "SOL", "quote": "USDC" } }',
    exampleOutput: '{ "price": 148.32, "change24h": 3.15, "volume24h": 892400000, "sources": ["Jupiter", "Raydium", "Orca"], "vwap": 147.89 }',
  },
  'wallet-scorer': {
    id: 'wallet-scorer', name: 'Wallet Risk Scorer', description: 'Score wallet risk based on transaction history, token holdings, DeFi exposure, interaction with flagged addresses, and on-chain behavior patterns.', category: 'Analytics', pricePerCall: 0.005, totalCalls: 3200, rating: 4.4, publisher: '8kHz...9wQp', endpoint: 'https://tools.example.com/wallet-scorer', methods: ['scoreWallet', 'getBreakdown'],
    exampleInput: '{ "method": "scoreWallet", "params": { "address": "8kHz...9wQp" } }',
    exampleOutput: '{ "riskScore": 23, "level": "low", "factors": { "age_days": 342, "unique_programs": 18, "defi_exposure_usd": 4500, "flagged_interactions": 0 }, "recommendation": "Low risk wallet with diversified DeFi activity" }',
  },
  'cpi-analyzer': {
    id: 'cpi-analyzer', name: 'CPI Call Analyzer', description: 'Analyze cross-program invocation patterns for any deployed Solana program. Maps instruction flow, tracks CPI depth, and detects recursive call patterns.', category: 'Developer', pricePerCall: 0.004, totalCalls: 1890, rating: 4.5, publisher: '2mFx...6tNr', endpoint: 'https://tools.example.com/cpi-analyzer', methods: ['analyzeProgram', 'getCPITree', 'getStats'],
    exampleInput: '{ "method": "analyzeProgram", "params": { "programId": "JUP6LkMUe1MjxCPUv2uVbS6bRkaJaiJR9sWNo6v4FWEL" } }',
    exampleOutput: '{ "program": "Jupiter v6", "totalCPIs": 12, "maxDepth": 3, "targets": ["TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc"], "avgComputeUnits": 185000 }',
  },
  'airdrop-check': {
    id: 'airdrop-check', name: 'Airdrop Eligibility', description: 'Check wallet eligibility for upcoming Solana ecosystem airdrops. Scans on-chain activity against known snapshot criteria and protocol requirements.', category: 'Data', pricePerCall: 0.002, totalCalls: 45200, rating: 4.3, publisher: '6qWz...1yBk', endpoint: 'https://tools.example.com/airdrop-check', methods: ['checkEligibility', 'listUpcoming'],
    exampleInput: '{ "method": "checkEligibility", "params": { "address": "6qWz...1yBk" } }',
    exampleOutput: '{ "eligible": [{ "protocol": "Parcl", "status": "likely", "criteria_met": 3, "criteria_total": 4 }], "ineligible": [{ "protocol": "Tensor", "reason": "No marketplace activity" }], "checked_at": "2026-04-10T12:00:00Z" }',
  },
  'program-audit': {
    id: 'program-audit', name: 'Quick Security Scan', description: 'Automated security scan for Anchor programs. Checks for missing signer validation, unchecked math, PDA seed collisions, and other common Solana vulnerabilities.', category: 'Security', pricePerCall: 0.01, totalCalls: 780, rating: 4.8, publisher: '4jLx...8mRv', endpoint: 'https://tools.example.com/program-audit', methods: ['scanProgram', 'getReport'],
    exampleInput: '{ "method": "scanProgram", "params": { "programId": "4jLx...8mRv", "depth": "standard" } }',
    exampleOutput: '{ "vulnerabilities": [{ "severity": "high", "type": "missing_signer_check", "location": "withdraw instruction" }, { "severity": "medium", "type": "unchecked_arithmetic", "location": "calculate_payout" }], "score": 72, "grade": "B", "scanned_instructions": 8 }',
  },
};

type RunStatus = 'idle' | 'loading' | 'success' | 'wallet-required';

export default function ToolDetailPage() {
  const params = useParams();
  const toolId = params.id as string;
  const tool = TOOLS[toolId];
  const { publicKey, connected } = useWallet();
  const [tryInput, setTryInput] = useState('');
  const [tryOutput, setTryOutput] = useState('');
  const [runStatus, setRunStatus] = useState<RunStatus>('idle');
  const [gatewayOffline, setGatewayOffline] = useState(false);

  if (!tool) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Tool Not Found</h1>
        <p className="text-gray-500 mb-4">This tool doesn&apos;t exist in the registry.</p>
        <Link href="/" className="text-blue-600 hover:underline text-sm">Back to marketplace</Link>
      </div>
    );
  }

  const handleRun = async () => {
    if (!connected) {
      setRunStatus('wallet-required');
      setTryOutput('');
      return;
    }

    setRunStatus('loading');
    setTryOutput('');
    setGatewayOffline(false);

    try {
      const inputPayload = tryInput || tool.exampleInput;
      const parsedInput = JSON.parse(inputPayload);

      const response = await fetch(`/api/tools/${toolId}/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-caller-pubkey': publicKey?.toBase58() || '',
        },
        body: JSON.stringify(parsedInput),
      });

      if (!response.ok) throw new Error('gateway_error');

      const result = await response.json();
      setTryOutput(JSON.stringify(result, null, 2));
      setRunStatus('success');
    } catch {
      setGatewayOffline(true);
      setTryOutput(tool.exampleOutput);
      setRunStatus('success');
    }
  };

  const callerAddress = publicKey?.toBase58() || '<your_pubkey>';

  const runButtonLabel = (() => {
    if (runStatus === 'loading') return 'Running...';
    if (!connected) return `Run (costs ${tool.pricePerCall} USDC)`;
    return `Run demo (${tool.pricePerCall} USDC)`;
  })();

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Try it</h2>
          <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
            Cost: {tool.pricePerCall} USDC per call
          </span>
        </div>
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
          onClick={handleRun}
          disabled={runStatus === 'loading'}
          className="bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-wait mb-4"
        >
          {runButtonLabel}
        </button>

        {runStatus === 'wallet-required' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">Connect your wallet first to run this tool.</p>
          </div>
        )}

        {runStatus === 'loading' && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-500">Calling gateway...</span>
          </div>
        )}

        {tryOutput && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="text-sm text-gray-500">Output</label>
              {gatewayOffline && (
                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded">gateway offline — example output</span>
              )}
            </div>
            <pre className="font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto">{tryOutput}</pre>
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-3">Integration</h2>
        {connected && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-green-700">Connected as <span className="font-mono">{callerAddress}</span></p>
          </div>
        )}
        <pre className="font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">{`curl -X POST ${tool.endpoint} \\
  -H "x-payment-signature: <tx_sig>" \\
  -H "x-caller-pubkey: ${callerAddress}" \\
  -H "Content-Type: application/json" \\
  -d '${tool.exampleInput}'`}</pre>
      </div>
    </div>
  );
}
