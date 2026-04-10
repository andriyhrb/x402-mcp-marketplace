/**
 * Demo MCP Tool — Solana Balance Checker
 *
 * A simple MCP-compatible tool that returns SOL + token balances
 * for any Solana wallet address.
 *
 * Start: npm start (default port 4001)
 */

const express = require('express');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

const app = express();
app.use(express.json());

const PORT = process.env.TOOL_PORT || 4001;
const RPC_URL = process.env.RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(RPC_URL, 'confirmed');

// MCP tool metadata
const TOOL_MANIFEST = {
  name: 'solana-balance',
  description: 'Check SOL and token balances for any Solana wallet',
  version: '0.1.0',
  inputSchema: {
    type: 'object',
    properties: {
      walletAddress: {
        type: 'string',
        description: 'Solana wallet public key (base58)',
      },
    },
    required: ['walletAddress'],
  },
};

// MCP-compatible endpoint
app.post('/', async (req, res) => {
  const { method, params, id } = req.body;

  // Handle tool discovery
  if (method === 'tools/list') {
    return res.json({
      jsonrpc: '2.0',
      id,
      result: { tools: [TOOL_MANIFEST] },
    });
  }

  // Handle tool call
  if (method === 'tools/call') {
    const toolName = params?.name || 'solana-balance';
    const args = params?.arguments || params || {};
    const walletAddress = args.walletAddress;

    if (!walletAddress) {
      return res.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32602, message: 'walletAddress is required' },
      });
    }

    try {
      const pubkey = new PublicKey(walletAddress);

      // Fetch SOL balance
      const solBalance = await connection.getBalance(pubkey);
      const solAmount = solBalance / LAMPORTS_PER_SOL;

      // Fetch token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      });

      const tokens = tokenAccounts.value.map(acc => {
        const info = acc.account.data.parsed.info;
        return {
          mint: info.mint,
          amount: info.tokenAmount.uiAmountString,
          decimals: info.tokenAmount.decimals,
        };
      }).filter(t => parseFloat(t.amount) > 0);

      return res.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [{
            type: 'text',
            text: JSON.stringify({
              wallet: walletAddress,
              solBalance: solAmount,
              tokens,
              network: RPC_URL.includes('devnet') ? 'devnet' : 'mainnet',
            }, null, 2),
          }],
        },
      });

    } catch (err) {
      return res.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32000, message: `Balance check failed: ${err.message}` },
      });
    }
  }

  return res.json({
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Unknown method: ${method}` },
  });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', tool: 'solana-balance' });
});

app.listen(PORT, () => {
  console.log(`[solana-balance] MCP tool running on port ${PORT}`);
});
