# Contributing

Thanks for considering a contribution to x402! Quick guide below — if anything's
unclear, open a discussion before opening a PR.

## Layout

```
.
├── gateway/     [gateway] payment verification + rate limiting + routing
├── web/         [ui] Next.js storefront + /usage dashboard
├── examples/    [mcp] reference clients (node, python, bash)
├── contracts/   on-chain registry program
└── docs/        protocol spec + integration guides
```

## Local dev

```bash
# Gateway
cd gateway && npm i && npm run dev

# Storefront
cd web && npm i && npm run dev

# Reference clients
cd examples/node && npm i && node client.js
```

## Commit style

Area-tag prefix in square brackets:

```
[gateway] tighten 429 envelope
[ui] tool detail copy buttons
[mcp] node client retry-after handling
[docs] protocol spec v0.2 draft
[registry] tool publishing flow
```

Bracket the most-relevant area; if a change spans two, pick the one with
the bigger diff.

## Pull requests

1. Branch from `main` — `feat/<topic>` or `fix/<bug>`
2. One logical change per PR. Splits welcome over a single 2k-line PR.
3. Include a one-line summary plus a "why" paragraph in the description
4. CI must be green: `npm run lint && npm run test` in each package

## Releases

Maintainers tag releases `v0.x.y` after merging to `main`. We follow semver
loosely: x bumps for protocol-breaking changes; y for compatible changes
plus features; z for fixes.

## Code of conduct

Be excellent to each other. Disagree on technical merit, not on style.
