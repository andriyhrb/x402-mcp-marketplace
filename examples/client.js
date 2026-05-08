/**
 * Reference MCP client (Node.js) — x402 MCP Marketplace
 *
 * Walks through the three-step flow:
 *   1. Send `pay_for_tool` tx on-chain (caller signs).
 *   2. Wait for confirmation, capture the signature.
 *   3. Call the gateway with the signature header — get the tool result back.
 *
 * Run: GATEWAY_URL=http://localhost:4000 TOOL_ID=demo node examples/client.js
 */

const fetch = require('node-fetch');

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:4000';
const TOOL_ID = process.env.TOOL_ID || 'demo';
const PAYMENT_SIGNATURE = process.env.PAYMENT_SIGNATURE;
const CALLER_PUBKEY = process.env.CALLER_PUBKEY;

async function callTool(method, params) {
  if (!PAYMENT_SIGNATURE || !CALLER_PUBKEY) {
    throw new Error('PAYMENT_SIGNATURE and CALLER_PUBKEY env vars required');
  }

  const url = `${GATEWAY_URL}/v1/tools/${encodeURIComponent(TOOL_ID)}/call`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-payment-signature': PAYMENT_SIGNATURE,
      'x-caller-pubkey': CALLER_PUBKEY,
    },
    body: JSON.stringify({ method, params }),
  });

  const limit = res.headers.get('x-ratelimit-limit');
  const remaining = res.headers.get('x-ratelimit-remaining');
  console.error(`rate-limit: ${remaining}/${limit}`);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`gateway ${res.status}: ${body}`);
  }
  return res.json();
}

(async () => {
  const result = await callTool('summarise', { url: 'https://solana.com' });
  console.log(JSON.stringify(result, null, 2));
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
