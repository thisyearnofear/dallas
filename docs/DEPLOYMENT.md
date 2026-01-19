# Dallas Buyers Club: Deployment Guide

## Quick Navigation

**Choose your deployment path:**

## 🚀 Fastest Path (Recommended)
**Estimated time: 12 minutes**

1. **Read this file** (5 minutes)
2. Follow [Solana Playground Quick Start](#solana-playground-quick-start) (12 minutes)

## 📋 Deployment Checklist

### Pre-Deployment
- ✅ System check: `cargo --version && solana --version && anchor --version`
- ✅ Code review: Look at smart contracts in `programs/*/src/lib.rs`
- ✅ All smart contracts compile

### Deployment Options

#### Option 1: Solana Playground (RECOMMENDED)
**Best for:** Quick testing, hackathon submission

```bash
1. Go to https://beta.solpg.io/
2. Create new project (Anchor template)
3. Paste case_study/src/lib.rs → Click Deploy (3 min)
4. Paste experience_token/src/lib.rs → Click Deploy (3 min)
5. Get token mint address (1 min)
6. Update src/config/solana.ts with IDs (1 min)
7. npm run dev and test (5 min)
```

#### Option 2: Local Build & Deploy
**Best for:** Production, full control

```bash
1. cargo build-sbf (10 min)
2. solana program deploy (10 min)
3. spl-token create-token (2 min)
4. Update config (1 min)
5. Test (5 min)
```

## Solana Playground Quick Start

### Step-by-Step

#### Step 1: Deploy Case Study Program (3 min)
1. Open https://beta.solpg.io/
2. Click "Create" → New Project (Anchor template)
3. Name: `dallas-case-study`
4. Delete existing code
5. Paste `programs/case_study/src/lib.rs` content
6. Click "Build" → Wait for checkmark
7. Click "Deploy" → Confirm in Phantom
8. **Copy Program ID**

#### Step 2: Deploy Experience Token Program (3 min)
1. New solpgf project: `dallas-experience-token`
2. Paste `programs/experience_token/src/lib.rs` content
3. Build and deploy
4. **Copy Program ID**

#### Step 3: Get Token Mint Address (1 min)
In solpgf terminal:
```bash
spl-token create-token --decimals 9
```
**Copy the token address**

#### Step 4: Update Frontend Config (1 min)
File: `src/config/solana.ts`
```typescript
blockchain: {
  caseStudyProgramId: 'PASTE_CASE_STUDY_ID_HERE',
  experienceTokenProgramId: 'PASTE_TOKEN_ID_HERE',
  experienceMintAddress: 'PASTE_MINT_ADDRESS_HERE',
}
```

#### Step 5: Test
```bash
npm run dev
# Navigate to http://localhost:5173/experiences
```

## After Deployment

### Wire Frontend to Blockchain

File: `src/components/EncryptedCaseStudyForm.tsx`
```typescript
import { BlockchainIntegration } from '../services/BlockchainIntegration';

// Add to submit handler
const result = await submitCaseStudyToBlockchain(
  blockchainService,
  publicKey,
  signTransaction,
  formData,
  encryptionKey
);
```

### Test End-to-End
```bash
npm run dev
# Go to /experiences
# Submit case study → See transaction on blockchain
```

## What Gets Deployed

### On Blockchain
```
Case Study Program
├─ 4 instructions (submit, validate, slash, grant_access)
├─ 3 account types (CaseStudy, ValidatorStake, AccessPermission)
├─ 4 events (submitted, validated, slashed, access_granted)
└─ All data encrypted before storage

EXPERIENCE Token Program
├─ 1M token supply (hard cap)
├─ 6 instructions (init, reward_submit, reward_validate, burn, freeze, etc)
├─ 2 account types (ExperienceConfig, FrozenStake)
└─ 3 events (awarded, burned, frozen)
```

### On Frontend
- Existing UI works as-is
- Just needs config update + wiring for live blockchain

## Pre-Deployment Checklist

### Code Quality
- [x] Smart contracts compile
- [x] All validation logic implemented
- [x] All error codes defined
- [x] All events emit correctly
- [x] Comments and documentation added
- [x] No placeholder addresses remain

### Integration
- [x] BlockchainService complete
- [x] BlockchainIntegration complete
- [x] ValidationDashboard component ready
- [x] Config validation system in place
- [x] Error messages helpful

### Security
- [x] Encryption happens locally
- [x] Wallet-derived keys used
- [x] 10 EXPERIENCE minimum stake
- [x] 50% slashing for fraud
- [x] 3-validator consensus required
- [x] Access control on-chain

## System Info

Your system is ready:
```
✅ Cargo:  1.94.0-nightly
✅ Solana: 1.18.20
✅ Anchor: 0.30.0
```

## Success Indicators

After deployment, you should see:
- ✅ Program IDs in deployment output
- ✅ No config errors when running `npm run dev`
- ✅ `/experiences` page loads
- ✅ Form can be filled out
- ✅ "Submit" button is ready (wiring added in phase 3)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Build failed" in solpgf | Check syntax, reload page |
| "Program ID not found" | Scroll down in solpgf output |
| "Blockchain config incomplete" | Update all IDs in src/config/solana.ts |
| "Transaction failed" | Check wallet has devnet SOL, request airdrop |
| "Can't connect wallet" | Use Phantom, set to devnet |

## Next Steps

1. **Deploy to devnet** (Jan 29)
2. **Wire frontend to blockchain** (Jan 31)
3. **Test end-to-end flow** (Feb 1)
4. **Submit Privacy Hackathon entry** (Feb 1)
