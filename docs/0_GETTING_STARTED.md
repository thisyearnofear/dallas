# Getting Started (Judge-Ready)

This repo contains:
- **Web app** (Vite + Preact) in `src/`
- **Vercel Serverless API** in `api/` (telemetry, pilot storage, etc.)
- **Solana programs** in `programs/`
- **Noir circuits** in `circuits/`
- **Mobile app** in `mobile/`

## 1) Install

```bash
pnpm install
```

## 2) Run (devnet/testnet first)

```bash
# devnet | testnet | mainnet-beta
VITE_SOLANA_NETWORK=devnet pnpm dev
```

Open: `http://localhost:5173`

### Important: local dev vs deployed API
This project uses Vercel-style serverless functions under `api/*`.

- `pnpm dev` (Vite) runs the **web app only**
- `api/*` endpoints are available when you:
  - run `vercel dev` (recommended for pilots), or
  - deploy to Vercel

Some pilot features fall back to local-only behavior in Vite dev:
- encrypted log storage falls back to **localStorage** (single-browser)
- telemetry viewer reads from **localStorage** when `/api/events` is not reachable

## 3) Core flows to demo

### Discover → Submit → Validate
- Discover: `/experiences?tab=discover`
- Submit: `/experiences?tab=share`
- Validate: `/validators`

### Pilot telemetry
- `/pilot` shows recent events (server-backed when deployed; local fallback in Vite dev)

## 4) Tests and build

```bash
pnpm test
pnpm build
```

## 5) Noir circuits (optional local verification)

```bash
cd circuits/benchmark_delta && nargo test
cd ../execution_duration && nargo test
cd ../data_completeness && nargo test
cd ../resource_range && nargo test
```

## 6) Environment variables

See `.env.example` for a curated list.

Key variables:
- `VITE_SOLANA_NETWORK` — `devnet | testnet | mainnet-beta`
- `VITE_SOLANA_RPC_ENDPOINT` — optional override
- `VITE_ENABLE_ALEO` — optional dual-chain verification layer

## 7) Pilot runbook

- [Pilot Checklist](PILOT_CHECKLIST.md)

