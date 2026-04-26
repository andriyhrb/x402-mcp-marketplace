# Gateway Error Codes

All errors returned by the x402 gateway follow the same envelope:

```json
{
  "error": {
    "code": "<machine-readable code>",
    "message": "<human description>",
    "retryAfter": 30
  }
}
```

Where `retryAfter` is present, it's the suggested seconds before retry.

## 4xx — Client errors

| HTTP | code                  | meaning                                          | retry? |
|------|-----------------------|--------------------------------------------------|--------|
| 400  | `invalid_request`     | malformed JSON or missing required fields        | no     |
| 400  | `invalid_signature`   | payment signature doesn't decode to a valid Solana tx | no |
| 401  | `unauthorized`        | missing or invalid bearer token                  | no     |
| 402  | `payment_required`    | tool call requires upfront USDC payment          | yes (after pay) |
| 402  | `payment_insufficient`| paid amount below tool's price                   | yes (after pay) |
| 402  | `payment_unconfirmed` | tx submitted but not yet finalized               | yes (~5s) |
| 403  | `forbidden`           | caller wallet not on tool's allowlist            | no     |
| 404  | `tool_not_found`      | toolId not registered                            | no     |
| 404  | `endpoint_unreachable`| upstream tool endpoint returned 5xx              | maybe  |
| 413  | `body_too_large`      | request body exceeds 64 KiB                      | no     |
| 429  | `rate_limited`        | per-wallet 60 req/min cap hit                    | yes    |

## 5xx — Server errors

| HTTP | code                  | meaning                                          | retry? |
|------|-----------------------|--------------------------------------------------|--------|
| 500  | `internal_error`      | unexpected gateway failure                       | yes    |
| 502  | `upstream_unreachable`| tool endpoint timed out or refused               | yes    |
| 503  | `service_unavailable` | gateway in maintenance / circuit-breaker open    | yes    |

## Retry headers

For `429` and `503`, the response includes:

- `Retry-After: <seconds>` — when to try again
- `X-RateLimit-Remaining: <int>` — calls left in current window
- `X-RateLimit-Reset: <unix>` — when window rolls over

## Examples

### Payment required

```bash
curl -X POST https://gateway.x402.market/v1/tools/abc/invoke \
     -H 'Content-Type: application/json' \
     -d '{"input":"hello"}'
```

```json
{
  "error": {
    "code": "payment_required",
    "message": "tool 'abc' requires 0.05 USDC per call",
    "price": "50000",
    "currency": "USDC",
    "payTo": "9xQePh..."
  }
}
```

### Rate limited

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 28
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1714589000

{"error":{"code":"rate_limited","message":"60 calls/min quota exhausted","retryAfter":28}}
```
