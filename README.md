# x402 MCP Marketplace

Marketplace for AI agent tools with x402 micropayments on Solana.

## Core Flow

Browse tools → pay USDC per call → use tool via MCP protocol.

## What's in the box

- **`/` marketplace** — searchable grid of tools (category filter, sort, 1,428 registry hint)
- **`/usage`** — per-wallet analytics dashboard: 90-day daily bars, 12-month area chart, category donut, top-tools bar, 7×24 hourly heatmap, recent-30 call table. Data is deterministically seeded from the connected wallet's public key.
- **`/publish`** — waitlist form (open registry launches with v1.0)
- **`/tool/[id]`** — tool detail with on-page Try-it + copy-to-clipboard curl

## Stack

- Anchor (Rust) — payment escrow and tool registry
- Next.js 14 (app router) — marketplace frontend
- Node.js / Express gateway — payment verification + MCP proxy
- MCP SDK — JSON-RPC 2.0 over HTTP

## Development

```bash
# 1. Anchor program
anchor build && anchor deploy

# 2. Gateway (port 4000)
cd gateway && npm install && npm start

# 3. Web (port 3002)
cd web && npm install && npm run dev
```

## Gateway env

```bash
GATEWAY_PORT=4000                     # default 4000
GATEWAY_RPC_URL=https://...           # default devnet
GATEWAY_CORS_ORIGINS=http://localhost:3002,https://x402mcp.dev
GATEWAY_RATE_LIMIT=60                 # req/min per IP
PROXY_TIMEOUT_MS=15000
PROGRAM_ID=DZEGM4VV5uoLyQaQ9HS638yTdkGVgpxvGUdCNP81qpbx
```

## Gateway endpoints

```
GET  /health                     { status: 'ok' }
GET  /v1/tools                   list all registered tools
GET  /v1/tools/:toolId           fetch one tool
POST /v1/tools/:toolId/call      verify on-chain payment + proxy to MCP endpoint
                                 headers:
                                   x-payment-signature: <solana tx sig>
                                   x-caller-pubkey: <wallet pubkey>
```

Status codes: `402` payment required, `400` missing caller pubkey, `404` tool/route not found, `413` body > 64 KB, `429` rate limited, `403` CORS origin not whitelisted.

## Frontend features

- Custom cursor (dot + ring, morphs into I-beam over inputs)
- 3D tilt cards with radial spotlight
- Magnetic buttons
- Live activity marquee
- Scroll-reveal animations (with `prefers-reduced-motion` + no-JS fallback)
- Deterministic per-wallet seeded usage analytics

## License

MIT
