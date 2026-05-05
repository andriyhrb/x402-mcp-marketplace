# Changelog

## [phase 5] — after-hours editorial redesign

### Added
- `[ui]` ink/lime palette + Syne display font, 3D tilt cards, scroll reveals
- `[ui]` magnetic buttons, kinetic hero, live activity ticker, animated stats
- `[usage]` per-wallet analytics — 90-day bars, 12-month area, category donut, top-tools hbar, 7×24 heatmap, recent-30 table
- `[publish]` waitlist teaser with blur-to-`soon` CTA
- `[ui]` custom cursor with reduced-motion fallback, focus-visible rings, native cursor on inputs
- `[web]` `<noscript>` fallback, viewport metadata, copy buttons on curl/input/output blocks

### Changed
- `[ui]` accessibility audit: `prefers-reduced-motion`, `:focus-visible`, native cursor on form fields
- `[gateway]` CORS whitelist + 60 req/min rate-limit + 64kb body cap + 404 catch-all + NaN-guarded timeout

### Fixed
- 30+ audit findings across charts, usage math, layout shifts
- Empty-data guards on all chart components
- Days-active and monthly-gap calculations corrected in usage aggregator

## [phase 4] — registry + gateway

### Added
- Anchor registry program with publish/update/unpublish flow
- Node.js gateway with x402 payment verification
- Tool detail pages with server-wrapped real `notFound()` 404s
- MCP reference clients in node + python
