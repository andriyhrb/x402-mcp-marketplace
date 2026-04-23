export interface ToolRecord {
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

export const TOOLS: Record<string, ToolRecord> = {
  'sol-balance': {
    id: 'sol-balance', name: 'Solana Balance Checker', description: 'Check SOL and SPL token balances for any wallet address on Solana. Returns native SOL balance, all SPL token accounts with mint, amount, and decimals.', category: 'Data', pricePerCall: 0.001, totalCalls: 12450, rating: 4.8, publisher: '7xKz…3nPq', endpoint: 'https://tools.example.com/sol-balance', methods: ['getBalance', 'getTokenAccounts'],
    exampleInput: '{ "method": "getBalance", "params": { "address": "7xKz...3nPq" } }',
    exampleOutput: '{ "sol": 12.45, "tokens": [{ "mint": "EPjFWdd5...", "amount": 1500.00, "symbol": "USDC" }] }',
  },
  'nft-metadata': {
    id: 'nft-metadata', name: 'NFT Metadata Resolver', description: 'Fetch and parse metadata for any Solana NFT including traits, image URLs, collection info, and royalty configuration from Metaplex standards.', category: 'NFT', pricePerCall: 0.002, totalCalls: 8920, rating: 4.6, publisher: '9mBq…7kLx', endpoint: 'https://tools.example.com/nft-metadata', methods: ['getMetadata', 'getTraits', 'getCollection'],
    exampleInput: '{ "method": "getMetadata", "params": { "mint": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" } }',
    exampleOutput: '{ "name": "Mad Lad #4231", "symbol": "MAD", "image": "https://arweave.net/abc...", "traits": [{ "trait_type": "Background", "value": "Purple" }] }',
  },
  'tx-decoder': {
    id: 'tx-decoder', name: 'Transaction Decoder', description: 'Decode Solana transactions into human-readable format with program labels, account annotations, and instruction data parsing.', category: 'Developer', pricePerCall: 0.003, totalCalls: 6340, rating: 4.9, publisher: '3pRx…5mWz', endpoint: 'https://tools.example.com/tx-decode', methods: ['decode', 'summarize'],
    exampleInput: '{ "method": "decode", "params": { "signature": "5xM2z..." } }',
    exampleOutput: '{ "program": "Jupiter v6", "action": "Swap", "from": "SOL", "to": "USDC", "amount": 1.5 }',
  },
  'price-feed': {
    id: 'price-feed', name: 'DeFi Price Aggregator', description: 'Real-time token prices aggregated from Jupiter, Raydium, and Orca with VWAP calculation, 24h change, and liquidity depth across pools.', category: 'DeFi', pricePerCall: 0.001, totalCalls: 24100, rating: 4.7, publisher: '5nTy…2jKv', endpoint: 'https://tools.example.com/price-feed', methods: ['getPrice', 'getVWAP', 'getDepth'],
    exampleInput: '{ "method": "getPrice", "params": { "token": "SOL", "quote": "USDC" } }',
    exampleOutput: '{ "price": 148.32, "change24h": 3.15, "volume24h": 892400000, "vwap": 147.89 }',
  },
  'wallet-scorer': {
    id: 'wallet-scorer', name: 'Wallet Risk Scorer', description: 'Score wallet risk based on transaction history, token holdings, DeFi exposure, interaction with flagged addresses, and on-chain behavior patterns.', category: 'Analytics', pricePerCall: 0.005, totalCalls: 3200, rating: 4.4, publisher: '8kHz…9wQp', endpoint: 'https://tools.example.com/wallet-scorer', methods: ['scoreWallet', 'getBreakdown'],
    exampleInput: '{ "method": "scoreWallet", "params": { "address": "8kHz...9wQp" } }',
    exampleOutput: '{ "riskScore": 23, "level": "low", "recommendation": "Low risk wallet with diversified DeFi activity" }',
  },
  'cpi-analyzer': {
    id: 'cpi-analyzer', name: 'CPI Call Analyzer', description: 'Analyze cross-program invocation patterns for any deployed Solana program. Maps instruction flow, tracks CPI depth, and detects recursive call patterns.', category: 'Developer', pricePerCall: 0.004, totalCalls: 1890, rating: 4.5, publisher: '2mFx…6tNr', endpoint: 'https://tools.example.com/cpi-analyzer', methods: ['analyzeProgram', 'getCPITree', 'getStats'],
    exampleInput: '{ "method": "analyzeProgram", "params": { "programId": "JUP6LkMUe1MjxCPUv2uVbS6bRkaJaiJR9sWNo6v4FWEL" } }',
    exampleOutput: '{ "program": "Jupiter v6", "totalCPIs": 12, "maxDepth": 3, "avgComputeUnits": 185000 }',
  },
  'airdrop-check': {
    id: 'airdrop-check', name: 'Airdrop Eligibility', description: 'Check wallet eligibility for upcoming Solana ecosystem airdrops. Scans on-chain activity against known snapshot criteria and protocol requirements.', category: 'Data', pricePerCall: 0.002, totalCalls: 45200, rating: 4.3, publisher: '6qWz…1yBk', endpoint: 'https://tools.example.com/airdrop-check', methods: ['checkEligibility', 'listUpcoming'],
    exampleInput: '{ "method": "checkEligibility", "params": { "address": "6qWz...1yBk" } }',
    exampleOutput: '{ "eligible": [{ "protocol": "Parcl", "status": "likely", "criteria_met": 3 }] }',
  },
  'program-audit': {
    id: 'program-audit', name: 'Quick Security Scan', description: 'Automated security scan for Anchor programs. Checks for missing signer validation, unchecked math, PDA seed collisions, and other common Solana vulnerabilities.', category: 'Security', pricePerCall: 0.01, totalCalls: 780, rating: 4.8, publisher: '4jLx…8mRv', endpoint: 'https://tools.example.com/program-audit', methods: ['scanProgram', 'getReport'],
    exampleInput: '{ "method": "scanProgram", "params": { "programId": "4jLx...8mRv", "depth": "standard" } }',
    exampleOutput: '{ "vulnerabilities": [{ "severity": "high", "type": "missing_signer_check" }], "score": 72, "grade": "B" }',
  },
};
