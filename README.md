# x402 MCP Marketplace

Marketplace for AI agent tools with x402 micropayments on Solana.

## Quick Start (for tool publishers)

```bash
# 1. Register your tool
curl -X POST https://api.x402mcp.dev/tools \
  -H "Content-Type: application/json" \
  -d '{"name": "my-tool", "endpoint": "https://...", "price_usdc": 0.001}'

# 2. Users discover and pay via MCP protocol
# 3. You receive USDC per call
```

## Core Flow

Browse tools → pay USDC per call → use tool via MCP protocol.

## Stack

- Anchor (Rust) — payment escrow and tool registry
- Next.js — marketplace frontend
- Node.js gateway — payment verification + MCP proxy
- MCP SDK

## Development

```bash
anchor build && anchor deploy
cd gateway && npm install && npm start
cd web && npm install && npm run dev
```

## API Reference

> Coming soon

## License

MIT
