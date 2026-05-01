"""Reference MCP client (Python) — x402 MCP Marketplace.

Three-step flow:
    1. Send ``pay_for_tool`` tx on-chain (caller signs).
    2. Wait for confirmation, capture the signature.
    3. Call the gateway with the signature header — get the tool result.

Run:
    GATEWAY_URL=http://localhost:4000 TOOL_ID=demo \
    PAYMENT_SIGNATURE=... CALLER_PUBKEY=... \
    python examples/client.py
"""
from __future__ import annotations

import json
import os
import sys
from urllib import error, parse, request


def call_tool(method: str, params: dict) -> dict:
    gateway = os.environ.get("GATEWAY_URL", "http://localhost:4000")
    tool_id = os.environ.get("TOOL_ID", "demo")
    sig = os.environ["PAYMENT_SIGNATURE"]
    caller = os.environ["CALLER_PUBKEY"]

    url = f"{gateway}/v1/tools/{parse.quote(tool_id)}/call"
    body = json.dumps({"method": method, "params": params}).encode("utf-8")
    req = request.Request(
        url,
        data=body,
        headers={
            "Content-Type": "application/json",
            "x-payment-signature": sig,
            "x-caller-pubkey": caller,
        },
        method="POST",
    )
    try:
        with request.urlopen(req, timeout=30) as resp:
            print(
                f"rate-limit: {resp.headers.get('X-RateLimit-Remaining')}/"
                f"{resp.headers.get('X-RateLimit-Limit')}",
                file=sys.stderr,
            )
            return json.loads(resp.read())
    except error.HTTPError as e:
        sys.stderr.write(f"gateway {e.code}: {e.read().decode('utf-8', 'replace')}\n")
        sys.exit(1)


if __name__ == "__main__":
    out = call_tool("summarise", {"url": "https://solana.com"})
    print(json.dumps(out, indent=2))
