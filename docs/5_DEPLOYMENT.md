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
3. Paste `programs/case_study/src/lib.rs`
4. Build & Deploy
5. Copy Program ID

Repeat for `programs/dbc_token/src/lib.rs`

### Update Config

```typescript
// src/config/solana.ts
blockchain: {
  caseStudyProgramId: 'YOUR_PROGRAM_ID',
  dbcTokenProgramId: 'YOUR_PROGRAM_ID',
  dbcMintAddress: 'YOUR_MINT_ADDRESS',
}
```

---

## Testing

- [ ] `/experiences` loads
- [ ] Wallet connects
- [ ] Case study encrypts
- [ ] Form submits

---

## Devnet Addresses

| Program | Address |
|---------|---------|
| DBC Token | `21okj31tGEvtSBMvzjMa8uzxz89FxzNdtPaYQMfDm7FB` |
| DBC Mint | `8aNpSwFq7idN5LsX27wHndmfe46ApQkps9PgnSCLGwVT` |
| Treasury | `C5UAymmKGderVikGFiLJY88X3ZL5C49eEKTVdkKxh6nk` |
| Membership | `CB6yknfo1cBWhVH2ifkMAS2tKaDa9c9mgRiZpCzHwjzu` |
| Case Study | `8tma3jnv8ZazAKxawZsE5yh3NPt1ymsEoysS2B1w2Gxx` |

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
cd circuits/symptom_improvement && nargo test
cd circuits/duration_verification && nargo test
cd circuits/data_completeness && nargo test
cd circuits/cost_range && nargo test
```
