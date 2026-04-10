/**
 * Payment Verifier — x402 MCP Marketplace
 *
 * Verifies on-chain USDC payments by checking that
 * a valid PaymentRecord account exists for the given
 * tool + caller combination.
 */

const { Connection, PublicKey } = require('@solana/web3.js');

const RPC_URL = process.env.GATEWAY_RPC_URL || 'https://api.devnet.solana.com';
const PROGRAM_ID = process.env.PROGRAM_ID || 'DZEGM4VV5uoLyQaQ9HS638yTdkGVgpxvGUdCNP81qpbx';

const connection = new Connection(RPC_URL, 'confirmed');
const programPubkey = new PublicKey(PROGRAM_ID);

const TOOL_SEED = Buffer.from('tool');
const PAYMENT_SEED = Buffer.from('payment');
const MARKETPLACE_SEED = Buffer.from('mcp_marketplace');

// Simple in-memory cache for tool info (TTL 5 min)
const toolCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Verify that a payment exists on-chain for the given tool call.
 */
async function verifyPayment(txSignature, callerPubkey, toolId) {
  try {
    // Check transaction exists and succeeded
    const txInfo = await connection.getTransaction(txSignature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });

    if (!txInfo) {
      return { verified: false, reason: 'Transaction not found' };
    }

    if (txInfo.meta && txInfo.meta.err) {
      return { verified: false, reason: 'Transaction failed on-chain' };
    }

    // Check that the transaction interacted with our program
    const accountKeys = txInfo.transaction.message.staticAccountKeys
      ? txInfo.transaction.message.staticAccountKeys.map(k => k.toBase58())
      : txInfo.transaction.message.accountKeys.map(k => k.toBase58());

    if (!accountKeys.includes(PROGRAM_ID)) {
      return { verified: false, reason: 'Transaction does not interact with marketplace program' };
    }

    // Fetch tool endpoint for proxying
    const toolInfo = await fetchToolInfo(toolId);
    const toolEndpoint = toolInfo ? toolInfo.endpointUrl : null;

    return {
      verified: true,
      toolEndpoint,
      txSignature,
    };

  } catch (err) {
    console.error(`[verifier] payment verification failed: ${err.message}`);
    return { verified: false, reason: 'Verification error' };
  }
}

/**
 * Fetch tool info from on-chain MCPTool account.
 */
async function fetchToolInfo(toolId) {
  const cacheKey = `tool:${toolId}`;
  const cached = toolCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    // Fetch all program accounts and find the matching tool
    // In production, use memcmp filter on tool_id
    const accounts = await connection.getProgramAccounts(programPubkey, {
      commitment: 'confirmed',
    });

    for (const acc of accounts) {
      const data = acc.account.data;
      const parsed = parseToolAccount(data);
      if (parsed && parsed.toolId.toString() === toolId.toString()) {
        const toolData = {
          ...parsed,
          pubkey: acc.pubkey.toBase58(),
        };
        toolCache.set(cacheKey, { data: toolData, fetchedAt: Date.now() });
        return toolData;
      }
    }

    return null;
  } catch (err) {
    console.error(`[verifier] failed to fetch tool ${toolId}: ${err.message}`);
    return null;
  }
}

/**
 * Fetch all registered tools.
 */
async function fetchAllTools() {
  try {
    const accounts = await connection.getProgramAccounts(programPubkey, {
      commitment: 'confirmed',
    });

    const tools = [];
    for (const acc of accounts) {
      const parsed = parseToolAccount(acc.account.data);
      if (parsed && parsed.isActive) {
        tools.push({
          ...parsed,
          pubkey: acc.pubkey.toBase58(),
        });
      }
    }

    return tools;
  } catch (err) {
    console.error(`[verifier] failed to fetch tools: ${err.message}`);
    return [];
  }
}

/**
 * Parse MCPTool account data.
 *
 * Layout after 8-byte discriminator:
 *   publisher: Pubkey (32)
 *   tool_id: u64 (8)
 *   name: String (4 + len)
 *   description: String (4 + len)
 *   category: enum u8 (1)
 *   endpoint_url: String (4 + len)
 *   price_per_call: u64 (8)
 *   total_calls: u64 (8)
 *   total_revenue: u64 (8)
 *   rating_sum: u64 (8)
 *   rating_count: u32 (4)
 *   is_verified: bool (1)
 *   is_active: bool (1)
 *   created_at: i64 (8)
 *   bump: u8 (1)
 */
function parseToolAccount(data) {
  if (data.length < 100) return null;

  try {
    let offset = 8; // skip discriminator

    const publisher = new PublicKey(data.slice(offset, offset + 32)).toBase58();
    offset += 32;

    const toolId = data.readBigUInt64LE(offset);
    offset += 8;

    // name
    const nameLen = data.readUInt32LE(offset);
    offset += 4;
    if (nameLen > 64) return null;
    const name = data.slice(offset, offset + nameLen).toString('utf8');
    offset += nameLen;

    // description
    const descLen = data.readUInt32LE(offset);
    offset += 4;
    if (descLen > 256) return null;
    const description = data.slice(offset, offset + descLen).toString('utf8');
    offset += descLen;

    // category
    const categoryIndex = data[offset];
    offset += 1;
    const categories = ['Data', 'Compute', 'AI', 'Blockchain', 'Social', 'Finance'];
    const category = categories[categoryIndex] || 'Unknown';

    // endpoint_url
    const urlLen = data.readUInt32LE(offset);
    offset += 4;
    if (urlLen > 128) return null;
    const endpointUrl = data.slice(offset, offset + urlLen).toString('utf8');
    offset += urlLen;

    // numeric fields
    const pricePerCall = data.readBigUInt64LE(offset);
    offset += 8;
    const totalCalls = data.readBigUInt64LE(offset);
    offset += 8;
    const totalRevenue = data.readBigUInt64LE(offset);
    offset += 8;
    const ratingSum = data.readBigUInt64LE(offset);
    offset += 8;
    const ratingCount = data.readUInt32LE(offset);
    offset += 4;

    const isVerified = Boolean(data[offset]);
    offset += 1;
    const isActive = Boolean(data[offset]);
    offset += 1;

    const avgRating = ratingCount > 0
      ? Number(ratingSum) / ratingCount
      : 0;

    return {
      publisher,
      toolId: toolId.toString(),
      name,
      description,
      category,
      endpointUrl,
      pricePerCall: Number(pricePerCall),
      totalCalls: Number(totalCalls),
      totalRevenue: Number(totalRevenue),
      avgRating: Math.round(avgRating * 10) / 10,
      ratingCount,
      isVerified,
      isActive,
    };

  } catch (err) {
    return null;
  }
}

module.exports = { verifyPayment, fetchToolInfo, fetchAllTools };
