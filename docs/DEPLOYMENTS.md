# Dallas Buyers Club - Deployment Guide

## Network Environments

### Mainnet-Beta
Production environment with real DBC tokens.

| Program | Address | Status |
|---------|---------|--------|
| DBC Token (pump.fun) | `J4q4vfHwe57x7hRjcQMJfV3YoE5ToqJhGeg3aaxGpump` | ✅ Live |
| Treasury | TBD | 🔜 Pending |
| Membership | TBD | 🔜 Pending |
| Case Study | TBD | 🔜 Pending |

### Devnet
Test environment with devnet DBC tokens for development.

| Program | Address | Status |
|---------|---------|--------|
| DBC Token Program | `21okj31tGEvtSBMvzjMa8uzxz89FxzNdtPaYQMfDm7FB` | ✅ Deployed |
| DBC Mint (devnet) | `8aNpSwFq7idN5LsX27wHndmfe46ApQkps9PgnSCLGwVT` | ✅ Created |
| Treasury | `C5UAymmKGderVikGFiLJY88X3ZL5C49eEKTVdkKxh6nk` | ✅ Initialized |
| Membership | `CB6yknfo1cBWhVH2ifkMAS2tKaDa9c9mgRiZpCzHwjzu` | ✅ Deployed |
| Case Study | `8tma3jnv8ZazAKxawZsE5yh3NPt1ymsEoysS2B1w2Gxx` | ✅ Deployed |

---

## DBC Token Configuration

### Mainnet (pump.fun)
- **Mint:** `J4q4vfHwe57x7hRjcQMJfV3YoE5ToqJhGeg3aaxGpump`
- **Program:** Standard SPL Token (`TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`)
- **Supply:** Fixed, community-owned
- **Mint Authority:** Burned (no new tokens can be minted)

### Devnet (our program)
- **Program:** `21okj31tGEvtSBMvzjMa8uzxz89FxzNdtPaYQMfDm7FB`
- **Mint:** `8aNpSwFq7idN5LsX27wHndmfe46ApQkps9PgnSCLGwVT`
- **Supply:** Mintable for testing
- **Mint Authority:** Deployer wallet (for testing)
- **Decimals:** 6

---

## Deployment Steps

### 1. Deploy DBC Token Program (Done)
```bash
# In SolPG: Build & Deploy dbc_token
# Program ID: 21okj31tGEvtSBMvzjMa8uzxz89FxzNdtPaYQMfDm7FB
```

### 2. Create DBC Mint on Devnet
```typescript
// In SolPG Client tab, run:
await createDbcMint();
// Copy the mint address and update:
// - programs/dbc_token/client.ts (DBC_MINT)
// - programs/treasury/client.ts (TREASURY_DBC_MINT)
// - src/config/solana.ts (dbcMintAddressDevnet)
```

### 3. Initialize DBC Token
```typescript
// After updating DBC_MINT, run:
await initializeToken();
```

### 4. Mint Test Tokens
```typescript
// Mint tokens for testing:
await mintDbc(10000); // 10,000 DBC
```

### 5. Initialize Treasury
```typescript
// In treasury client.ts:
await createTreasuryTokenAccount();
await initializeTreasury();
```

---

## Configuration Files

Update these after deployment:

1. **`src/config/solana.ts`** - Frontend config
2. **`programs/*/client.ts`** - SolPG client scripts
3. **`Anchor.toml`** - Anchor config
4. **`programs/*/src/lib.rs`** - Program IDs in `declare_id!()`

---

## Treasury Wallet

All fee payments go to:
```
BpHqwwKRqhNRzyZHT5U4un9vfyivcbvcgrmFRfboGJsK
```

---

## Testing Checklist

- [x] DBC Token Program deployed (`21okj31tGEvtSBMvzjMa8uzxz89FxzNdtPaYQMfDm7FB`)
- [x] DBC Mint created on devnet (`8aNpSwFq7idN5LsX27wHndmfe46ApQkps9PgnSCLGwVT`)
- [x] DBC Token initialized
- [x] Test tokens minted (10,000 DBC)
- [ ] Treasury token account created
- [ ] Treasury initialized
- [ ] Membership initialized
- [ ] Can purchase membership
- [ ] Can stake DBC for validation
