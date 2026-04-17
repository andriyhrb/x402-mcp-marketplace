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

const ALLOWED_ORIGINS = (process.env.GATEWAY_CORS_ORIGINS || 'http://localhost:3002')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow tools-to-gateway server-to-server calls (no origin)
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-payment-signature', 'x-caller-pubkey'],
    maxAge: 86400,
  })
);

app.use(express.json({ limit: '64kb' }));

// Tiny in-memory per-IP rate-limiter — 60 reqs/min per IP
const rateLimitBuckets = new Map();
const RATE_LIMIT = parseInt(process.env.GATEWAY_RATE_LIMIT || '60', 10);
const RATE_WINDOW_MS = 60_000;

app.use((req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const bucket = rateLimitBuckets.get(ip) || { count: 0, reset: now + RATE_WINDOW_MS };
  if (now > bucket.reset) {
    bucket.count = 0;
    bucket.reset = now + RATE_WINDOW_MS;
  }
  bucket.count += 1;
  rateLimitBuckets.set(ip, bucket);
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT - bucket.count));
  if (bucket.count > RATE_LIMIT) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded (${RATE_LIMIT} req/min)`,
    });
  }
  next();
});

// Periodically prune the bucket map
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateLimitBuckets.entries()) {
    if (now > v.reset + RATE_WINDOW_MS) rateLimitBuckets.delete(k);
  }
}, 5 * 60_000).unref();

const PORT = parseInt(process.env.GATEWAY_PORT || '4000', 10);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mcp-gateway' });
});

// JSON body parser error guard
app.use((err, _req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload Too Large', message: 'Request body exceeds 64kb' });
  }
  next(err);
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
    const paymentValid = await verifyPayment(paymentSignature, callerPubkey, toolId);
    if (!paymentValid.verified) {
      return res.status(402).json({
        error: 'Payment Not Verified',
        message: paymentValid.reason || 'On-chain payment verification failed',
      });
    }

    const toolEndpoint = paymentValid.toolEndpoint;
    if (!toolEndpoint) {
      return res.status(404).json({
        error: 'Tool Not Found',
        message: `No endpoint registered for tool ${toolId}`,
      });
    }

    const { method, params } = req.body || {};
    const toolResult = await proxyToolCall(toolEndpoint, method, params);

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

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// Generic error handler (last)
app.use((err, _req, res, _next) => {
  if (res.headersSent) return;
  const status = err.message && err.message.startsWith('CORS:') ? 403 : 500;
  console.error(`[gateway] unhandled error: ${err.message}`);
  res.status(status).json({ error: status === 403 ? 'Forbidden' : 'Internal Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`[gateway] MCP Gateway running on port ${PORT}`);
  console.log(`[gateway] Payment verification: ${process.env.GATEWAY_RPC_URL ? 'configured' : 'using devnet'}`);
  console.log(`[gateway] CORS: ${ALLOWED_ORIGINS.join(', ')} · rate-limit: ${RATE_LIMIT}/min`);
});
