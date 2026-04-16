# Dallas Buyers Club: Deployment & Development

## Quick Start

```bash
npm install
npm run dev
# http://localhost:5173
```

## Prerequisites

- Node.js 18+, npm
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
npm run dev        # Dev server
npm test           # Run tests
npm run build      # Production build
```

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

---

## Aleo Leo Deployment

```bash
# Install Leo
curl -Ls https://install.aleo.org | bash
source ~/.bashrc

# Build Aleo verifier
cd programs/aleo_verifier
leo build

# Deploy to Aleo devnet
leo deploy --network devnet
```

**Deployed Program:**
- Program ID: `dbc_verifier.aleo`
- Transaction: `at1njg2utaxa3sx3c4w36jl8w6q7shl2y02epdawlhnvkvu6eer5qfqhvygqx`

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
| Aleo Verifier | `dbc_verifier.aleo` |

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
