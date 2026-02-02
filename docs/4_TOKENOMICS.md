# Dallas Buyers Club: Tokenomics

## Overview

DBC uses a dual-token economy:
- **DBC Token** - Platform coordination token (fixed supply, governance)
- **Community Tokens** - Per-cause tokens via Bags API bonding curves

---

## DBC Token (Platform)

### Supply
- **Total:** 1,000,000,000 (1B) tokens
- **Fixed:** Mint authority burned
- **Team:** 1.74% (17.4M DBC)
- **Market:** 98.26% (982.6M DBC) - community-owned

### Utility
1. **Governance** - Vote on protocol upgrades, fee structures
2. **Coordination** - Stake to validate across communities
3. **Value Accrual** - Platform fees buy/burn DBC (deflationary)

### No Staking Rewards
DBC doesn't pay inflationary rewards. Value comes from:
- Governance rights (control protocol)
- Platform fee burns (deflationary pressure)
- Scarcity (fixed supply, increasing demand)

### Fee Model

**Platform Revenue Sources:**
| Source | Fee |
|--------|-----|
| Community token launch | 0.5 SOL |
| Case study submission | 0.1 SOL |
| Trading volume | 0.5% of community token trades |

**Fee Distribution:**
- 50%: Buy and burn DBC (deflationary)
- 25%: Development fund
- 25%: Community grants

---

## Community Tokens (Per Initiative)

### Launch
- Via Bags API bonding curves
- Free to create
- Immediately tradeable

### Categories
- **Supplement** - Vitamins, herbs, compounds
- **Lifestyle** - Diet, exercise, sleep protocols
- **Device** - Wearables, medical devices
- **Protocol** - Treatment regimens, therapies

### Economics

**Trading Fee Split (per trade):**
```
1.0% → Community Creator (ongoing revenue)
0.5% → Platform (DBC buy/burn)
0.5% → DEX Liquidity Providers
```

**Case Study Validation:**
```
Patient pays 0.1 SOL fee
├── 50% → Validators (immediate)
├── 30% → Community treasury
└── 20% → Platform
```

### Creator Revenue

| Community Size | Monthly Volume | Creator Earnings |
|----------------|----------------|------------------|
| Small (100) | $10,000 | $100/month |
| Medium (1,000) | $100,000 | $1,000/month |
| Large (10,000) | $1,000,000 | $10,000/month |

---

## Token Flows

### Case Study Submission Flow
```
Patient submits case study
    ↓
Pays 0.1 SOL fee
    ↓
Case study validated (ZK proofs)
    ↓
Patient receives community tokens
    ↓
If reputation >= 75: Eligible for Attention Token
```

### Validator Flow
```
Validator stakes 1,000+ DBC
    ↓
Reviews case studies
    ↓
Submits validation (ZK proof)
    ↓
Earns SOL fees + community tokens
    ↓
Builds reputation (accuracy tracked)
```

### Attention Token Creation
```
Case study reaches 75+ reputation
    ↓
Submitter opts to create Attention Token
    ↓
Bags API creates token with bonding curve
    ↓
Fee sharing configured:
    ├── 50% to submitter
    ├── 10% to validators
    ├── 10% to platform
    └── 30% to bonding curve
```

---

## Validator Economics

### Staking Requirements
- **Minimum:** 1,000 DBC
- **Lock Period:** 7 days
- **Slashing:** 50% for fraudulent validation

### Reward Structure
- **Base Reward:** 5 DBC per validation
- **Accuracy Bonus:** Up to 2x for high accuracy
- **Fee Share:** SOL from case study submissions
- **Community Tokens:** From validated projects

### Tier System
| Tier | Validations | Accuracy | Benefits |
|------|-------------|----------|----------|
| Bronze | 0+ | 0%+ | Basic access |
| Silver | 25+ | 60%+ | 1.2x rewards |
| Gold | 100+ | 70%+ | 1.5x rewards |
| Platinum | 500+ | 80%+ | 2x rewards |

---

## Revenue Projections

### Conservative (Year 1)
```
Communities: 10
Case Studies: 100/month
Trading Volume: $100K/month

Revenue:
• Launches: 10 × 0.5 SOL = 5 SOL
• Case Studies: 100 × 0.1 SOL = 10 SOL
• Trading: $100K × 0.5% = $500

Monthly: ~$1,500
Annual: ~$18,000
```

### Target (Year 2)
```
Communities: 50
Case Studies: 500/month
Trading Volume: $1M/month

Monthly: ~$8,500
Annual: ~$102,000
```

### Optimistic (Year 3)
```
Communities: 200
Case Studies: 2,000/month
Trading Volume: $10M/month

Monthly: ~$64,000
Annual: ~$768,000
```

---

## Governance

### DBC Governance (Protocol Level)
- **Who Can Vote:** DBC holders (1 token = 1 vote)
- **Proposal Threshold:** 10,000 DBC
- **Voting Period:** 7 days
- **Quorum:** Majority + minimum participation

**Governable Parameters:**
- Platform fees
- Validation requirements
- Treasury allocation
- Contract upgrades

### Community Governance (Per Community)
- **Who Can Vote:** Community token holders
- **What Can Be Changed:**
  - Community rules
  - Treasury spending
  - Validation criteria
  - Research priorities

---

## Key Principles

1. **No Inflation** - DBC has fixed supply, no staking rewards
2. **Fee-Based** - Revenue from usage, not token printing
3. **Self-Funding** - Communities fund themselves via trading
4. **Deflationary** - 50% of fees buy/burn DBC
5. **Sustainable** - Creator earns 1% forever, aligning incentives

---

## Deployment Addresses

### Devnet
| Component | Address |
|-----------|---------|
| DBC Token Program | `21okj31tGEvtSBMvzjMa8uzxz89FxzNdtPaYQMfDm7FB` |
| DBC Mint | `8aNpSwFq7idN5LsX27wHndmfe46ApQkps9PgnSCLGwVT` |
| Treasury | `C5UAymmKGderVikGFiLJY88X3ZL5C49eEKTVdkKxh6nk` |

### Mainnet
| Component | Address |
|-----------|---------|
| DBC Token | `J4q4vfHwe57x7hRjcQMJfV3YoE5ToqJhGeg3aaxGpump` |
