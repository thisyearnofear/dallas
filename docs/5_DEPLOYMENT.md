# Dallas Buyers Club: Deployment & Development

## Quick Start

```bash
pnpm install
VITE_SOLANA_NETWORK=devnet pnpm dev
# http://localhost:5173
```

## Prerequisites

- Node.js 18+, pnpm
- Phantom wallet
- Git

### Solana CLI
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.18.20/install)"
solana config set --url https://api.devnet.solana.com
solana airdrop 2 <wallet-address> --url devnet
```

---

## Development

```bash
pnpm dev           # Dev server
pnpm test          # Run tests
pnpm build         # Production build
```

### Vercel API routes (pilots)
This repo uses Vercel-style serverless functions under `api/*` (telemetry, pilot storage).

- `pnpm dev` runs the web app only
- For pilot endpoints (`/api/events`, `/api/optimization-log`), run with `vercel dev` or deploy

---

## Smart Contract Deployment

### Solana Playground (Recommended)

1. Go to https://beta.solpg.io/
2. Create new project (Anchor template)
3. Paste `programs/optimization_log/src/lib.rs`
4. Build & Deploy
5. Copy Program ID

Repeat for `programs/dbc_token/src/lib.rs`

### Update Config

```typescript
// src/config/solana.ts
blockchain: {
  optimizationLogProgramId: 'YOUR_PROGRAM_ID',
  dbcTokenProgramId: 'YOUR_PROGRAM_ID',
  dbcMintAddress: 'YOUR_MINT_ADDRESS',
}
```

### Select network at runtime
Use:
```bash
VITE_SOLANA_NETWORK=devnet pnpm dev
```

---

## Testing

- [ ] `/experiences` loads
- [ ] Wallet connects
- [ ] Optimization log encrypts
- [ ] Form submits

---

## Devnet Addresses

| Program | Address |
|---------|---------|
| DBC Token | `21okj31tGEvtSBMvzjMa8uzxz89FxzNdtPaYQMfDm7FB` |
| DBC Mint | `8aNpSwFq7idN5LsX27wHndmfe46ApQkps9PgnSCLGwVT` |
| Treasury | `C5UAymmKGderVikGFiLJY88X3ZL5C49eEKTVdkKxh6nk` |
| Membership | `CB6yknfo1cBWhVH2ifkMAS2tKaDa9c9mgRiZpCzHwjzu` |
| Optimization Log | `B68o3Pnre8XgwGBKN4aQeP8gPmPARUVfb7EufFgnVUyj` |

## Mainnet

| Program | Address |
|---------|---------|
| DBC Token | `J4q4vfHwe57x7hRjcQMJfV3YoE5ToqJhGeg3aaxGpump` |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build failed | Check syntax, reload solpgf |
| Transaction failed | Request devnet SOL airdrop |
| Wallet won't connect | Set Phantom to devnet |

---

## Scripts

```bash
./scripts/quick_token_setup.sh      # Create token mint
npx ts-node scripts/test_token_integration.ts
```

---

## Noir Circuits

```bash
cd circuits/benchmark_delta && nargo test
cd circuits/execution_duration && nargo test
cd circuits/data_completeness && nargo test
cd circuits/resource_range && nargo test
```
