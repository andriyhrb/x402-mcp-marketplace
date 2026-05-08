# x402 protocol — v0.2 draft

The minimum interaction protocol an AI agent uses to discover, pay for,
and call a tool on the marketplace. This is the wire-level spec; product
flows live in CONTRIBUTING.

## Tool discovery

```http
GET /v1/tools
GET /v1/tools/{toolId}
```

Response shape (single tool):

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "category": "string",
  "endpoint": "https://...",
  "priceUsdc": "50000",
  "currency": "USDC",
  "payTo": "<solana-pubkey>",
  "schema": { "input": {...}, "output": {...} },
  "rateLimit": { "perMinute": 60 }
}
```

## Payment flow

1. Agent calls `/v1/tools/{id}/invoke` without payment → receives
   `402 payment_required` with `payTo` and `priceUsdc`.
2. Agent submits a Solana tx transferring USDC to `payTo` with a memo
   matching the tool ID.
3. Agent retries `/v1/tools/{id}/invoke` with `X-Payment-Signature` header
   set to the tx signature.

The gateway verifies:
- Memo matches tool ID
- Recipient matches `payTo`
- Amount ≥ `priceUsdc`
- Tx confirmed on Solana devnet

## Headers

| header                  | direction | meaning                               |
|-------------------------|-----------|---------------------------------------|
| `X-Payment-Signature`   | request   | Solana tx signature for the payment   |
| `X-Caller-Pubkey`       | request   | calling wallet (for allowlists)       |
| `X-Tool-Id`             | request   | tool id (mirrored for log convenience)|
| `X-RateLimit-Remaining` | response  | calls remaining in current window     |
| `X-RateLimit-Reset`     | response  | unix ts of window rollover            |
| `Retry-After`           | response  | seconds to wait before retry          |

## Status codes

See `gateway/docs/error-codes.md` for the full table.

## Versioning

The protocol semver follows the pattern `MAJOR.MINOR.PATCH`:
- MAJOR breaks call shape (rare)
- MINOR adds new headers / response fields
- PATCH clarifies behavior

Clients SHOULD send `X-Protocol-Version: 0.2` for forward compatibility.
