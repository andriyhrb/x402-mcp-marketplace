#!/bin/bash
# x402 MCP Marketplace — bash reference client
# Demonstrates the payment + invoke flow using only curl + jq + solana CLI.
#
# Usage:
#   GATEWAY=https://gateway.x402.market \
#   TOOL_ID=summarize-text-v2 \
#   ./client.sh "your input text here"

set -euo pipefail

GATEWAY="${GATEWAY:-http://localhost:4030}"
TOOL_ID="${TOOL_ID:?set TOOL_ID}"
INPUT="${1:?usage: ./client.sh \"input text\"}"

# 1. Fetch tool metadata + price
META=$(curl -sS "$GATEWAY/v1/tools/$TOOL_ID")
PRICE=$(echo "$META" | jq -r '.priceUsdc')
PAY_TO=$(echo "$META" | jq -r '.payTo')
echo "tool: $TOOL_ID — price: $PRICE USDC → $PAY_TO"

# 2. Pay (devnet USDC mock mint)
USDC_MINT="${USDC_MINT:-Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB}"

PAYMENT_TX=$(spl-token transfer "$USDC_MINT" "$PRICE" "$PAY_TO" \
    --fund-recipient \
    --allow-unfunded-recipient \
    --output json | jq -r '.signature')
echo "payment signed: $PAYMENT_TX"

# 3. Invoke with payment signature
INVOKE_RESP=$(curl -sS -X POST "$GATEWAY/v1/tools/$TOOL_ID/invoke" \
    -H 'Content-Type: application/json' \
    -H "X-Payment-Signature: $PAYMENT_TX" \
    -H "X-Caller-Pubkey: $(solana address)" \
    --data-raw "$(jq -nc --arg input "$INPUT" '{input:$input}')")

echo "$INVOKE_RESP" | jq

# 4. Honor rate-limit headers when present
RATE_REMAINING=$(curl -sIX POST "$GATEWAY/v1/tools/$TOOL_ID/invoke" \
    -H 'Content-Type: application/json' \
    -H "X-Caller-Pubkey: $(solana address)" \
    -H "X-Payment-Signature: $PAYMENT_TX" \
    --data-raw '{"input":""}' \
    | grep -i 'x-ratelimit-remaining' | awk '{print $2}' | tr -d '\r')

echo "rate-limit remaining: $RATE_REMAINING"
