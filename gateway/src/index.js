/**
 * MCP Gateway — x402 MCP Marketplace
 *
 * Receives tool call requests from AI agents.
 * Verifies on-chain USDC payment (PaymentRecord exists).
 * Proxies the call to the actual MCP tool endpoint.
 * Returns result to the caller.
 *
 * Start: npm start
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { verifyPayment } = require('./payment-verifier');
const { proxyToolCall } = require('./proxy');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.GATEWAY_PORT || 4000;

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mcp-gateway' });
});

/**
 * POST /v1/tools/:toolId/call
 *
 * Headers:
 *   x-payment-signature: <solana tx signature of pay_for_tool>
 *   x-caller-pubkey: <caller wallet pubkey>
 *
 * Body: { method, params }
 *
 * Flow:
 *   1. Verify payment on-chain
 *   2. Lookup tool endpoint from registry
 *   3. Proxy call to MCP tool server
 *   4. Return result
 */
app.post('/v1/tools/:toolId/call', async (req, res) => {
  const { toolId } = req.params;
  const paymentSignature = req.headers['x-payment-signature'];
  const callerPubkey = req.headers['x-caller-pubkey'];

  if (!paymentSignature) {
    return res.status(402).json({
      error: 'Payment Required',
      message: 'Include x-payment-signature header with pay_for_tool transaction signature',
    });
  }

  if (!callerPubkey) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Include x-caller-pubkey header',
    });
  }

  try {
    // Step 1: Verify payment on-chain
    const paymentValid = await verifyPayment(paymentSignature, callerPubkey, toolId);
    if (!paymentValid.verified) {
      return res.status(402).json({
        error: 'Payment Not Verified',
        message: paymentValid.reason || 'On-chain payment verification failed',
      });
    }

    // Step 2: Lookup tool endpoint
    const toolEndpoint = paymentValid.toolEndpoint;
    if (!toolEndpoint) {
      return res.status(404).json({
        error: 'Tool Not Found',
        message: `No endpoint registered for tool ${toolId}`,
      });
    }

    // Step 3: Proxy call to MCP tool
    const { method, params } = req.body;
    const toolResult = await proxyToolCall(toolEndpoint, method, params);

    // Step 4: Return result
    return res.json({
      toolId,
      result: toolResult,
      paymentVerified: true,
    });

  } catch (err) {
    console.error(`[gateway] error processing tool call: ${err.message}`);
    return res.status(500).json({
      error: 'Gateway Error',
      message: 'Failed to process tool call',
    });
  }
});

/**
 * GET /v1/tools/:toolId
 *
 * Returns tool info from on-chain registry (cached).
 */
app.get('/v1/tools/:toolId', async (req, res) => {
  const { toolId } = req.params;
  try {
    const { fetchToolInfo } = require('./payment-verifier');
    const toolInfo = await fetchToolInfo(toolId);
    if (!toolInfo) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    return res.json(toolInfo);
  } catch (err) {
    console.error(`[gateway] error fetching tool: ${err.message}`);
    return res.status(500).json({ error: 'Failed to fetch tool info' });
  }
});

/**
 * GET /v1/tools
 *
 * List all registered tools (basic discovery).
 */
app.get('/v1/tools', async (_req, res) => {
  try {
    const { fetchAllTools } = require('./payment-verifier');
    const tools = await fetchAllTools();
    return res.json({ tools, count: tools.length });
  } catch (err) {
    console.error(`[gateway] error listing tools: ${err.message}`);
    return res.status(500).json({ error: 'Failed to list tools' });
  }
});

app.listen(PORT, () => {
  console.log(`[gateway] MCP Gateway running on port ${PORT}`);
  console.log(`[gateway] Payment verification: ${process.env.GATEWAY_RPC_URL ? 'configured' : 'using devnet'}`);
});
