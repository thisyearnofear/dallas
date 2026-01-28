# Dallas Buyers Club Platform Architecture

## Vision

**DBC is the coordination layer that enables anyone to form communities around health causes, wellness initiatives, and ailments.**

We provide the infrastructure—privacy-preserving validation, tokenized incentives, and community tooling—while communities provide the passion, expertise, and engagement.

> "Don't build a token project. Build a platform where thousands of tokens can thrive."

---

## Core Principles

### 1. **Community-First, Not Token-First**
- Users form communities around causes they care about
- DBC enables coordination, doesn't fund operations
- Each community has its own token (via Bags API bonding curves)
- Communities are self-funding through trading volume and fees

### 2. **Privacy by Design**
- Zero-knowledge proofs for validation (Noir)
- Encrypted data storage (IPFS/Arweave)
- Selective disclosure via threshold cryptography (Arcium MPC)
- Validators prove data quality without seeing sensitive information

### 3. **Sustainable Economics**
- No inflation-based rewards from DBC treasury
- Fee-based model: users pay for services, validators earn from work
- DBC captures value through governance and platform fees
- Communities bootstrap via bonding curves, not handouts

### 4. **Composable Infrastructure**
- One validation system works across all communities
- Shared privacy stack (Light Protocol, Noir, Arcium)
- Reusable treasury and case study programs
- Communities focus on mission, not infrastructure

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DALLAS BUYERS CLUB PLATFORM                           │
│                         (DBC-Powered)                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    DBC TOKEN (Coordination Layer)                │    │
│  │                                                                  │    │
│  │  • Governance: Vote on protocol upgrades, fee structures         │    │
│  │  • Coordination: Shared infrastructure across communities        │    │
│  │  • Value Accrual: Platform fees buy/burn DBC (deflationary)      │    │
│  │  • Fixed Supply: 1B tokens, no inflation, market-priced          │    │
│  │                                                                  │    │
│  │  Ownership: Team holds 1.74% (17.4M DBC) for development         │    │
│  │  Rest: Liquid market (community-owned)                           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                              ▲                                           │
│                              │                                           │
│  ┌───────────────────────────┼────────────────────────────────────────┐ │
│  │                           ▼                                         │ │
│  │           COMMUNITY TOKENS (Cause-Specific)                         │ │
│  │                                                                     │ │
│  │  Each community launches via Bags API with:                         │ │
│  │  • Bonding curve for fair price discovery                           │ │
│  │  • Custom treasury for rewards and grants                           │ │
│  │  • Shared validation infrastructure (ZK proofs)                     │ │
│  │  • Access to DBC validator network                                  │ │
│  │                                                                     │ │
│  │  Examples:                                                          │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐  │ │
│  │  │ LupusDAO     │ │ Longevity    │ │ MentalHealth │ │ RareDisease│  │ │
│  │  │ Token        │ │ Research     │ │ Support      │ │ Advocacy   │  │ │
│  │  │ ($LUPUS)     │ │ Coin ($LONG) │ │ Net ($MIND)  │ │ Token      │  │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘  │ │
│  │                                                                     │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  💰 Economics:                                                           │
│  • Community tokens trade → Generate fees                               │
│  • Fees split: Creator (1%) + Platform (0.5%) + DBC Value (0.5%)        │
│  • DBC stakers/governance capture platform value                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## User Journeys

### Path 1: Patient Seeking Community

```
Discover → Connect → Participate → Benefit → Grow

1. DISCOVER
   - Browse communities by condition (Lupus, Long COVID, etc.)
   - See community tokens, validation stats, active members
   - No wallet required to explore

2. CONNECT
   - Connect Phantom wallet
   - Optional: Buy community token (bonding curve)
   - Optional: Buy DBC for governance participation

3. PARTICIPATE
   - Submit encrypted case study (ZK proof of data quality)
   - Pay small fee (SOL) for validation
   - Join discussions, access token-gated resources

4. BENEFIT
   - Earn community tokens for contributions
   - Access treatments via community-funded research
   - Connect with others sharing same condition

5. GROW
   - Become validator (stake DBC, earn fees)
   - Propose community initiatives
   - Earn reputation across platform
```

### Path 2: Community Creator

```
Design → Launch → Grow → Sustain

1. DESIGN
   - Define community purpose (rare disease, wellness protocol, etc.)
   - Set validation rules (what counts as quality contribution)
   - Configure treasury parameters

2. LAUNCH
   - Use platform to create community token
   - Bags API handles bonding curve launch
   - Pay platform fee (0.5 SOL)
   - Community token immediately tradeable

3. GROW
   - Recruit members (patients, researchers, advocates)
   - Fund research via community treasury
   - Validate case studies (use DBC validator network)

4. SUSTAIN
   - Trading volume generates ongoing fees
   - Treasury funds operations and rewards
   - Creator earns 1% of trading volume forever
```

### Path 3: Validator (Expert/Researcher)

```
Stake DBC → Validate → Earn Reputation → Advance

1. STAKE DBC
   - Minimum 1,000 DBC to validate (skin in game)
   - DBC remains yours, just locked
   - Unstake anytime (no lock period)

2. VALIDATE
   - Review case studies across communities
   - Use ZK proofs (no sensitive data exposure)
   - Submit validation with accuracy score

3. EARN
   - Earn SOL fees from case study submissions
   - Earn community tokens from validated communities
   - Build on-chain reputation

4. ADVANCE
   - Higher accuracy = access to premium validations
   - Reputation unlocks governance rights
   - Top validators recognized across platform
```

---

## Technical Components

### Smart Contracts

| Program | Purpose | Deployment |
|---------|---------|------------|
| `case_study` | Submit and validate encrypted case studies | One instance (shared) |
| `community_factory` | Create new community tokens + treasuries | One instance (shared) |
| `community_treasury` | Per-community rewards and grants | One per community |
| `dbc_governance` | DBC staking, voting, fee distribution | One instance (shared) |

### Privacy Stack

| Technology | Purpose | Integration |
|------------|---------|-------------|
| **Noir** | ZK-SNARK proofs for validation | Validate without seeing data |
| **Light Protocol** | ZK compression for scalable storage | Reduce on-chain costs |
| **Arcium MPC** | Threshold decryption | Selective data access |
| **IPFS/Arweave** | Encrypted off-chain storage | Permanent, decentralized |

### External Integrations

| Service | Purpose | Value |
|---------|---------|-------|
| **Bags API** | Token creation, bonding curves | Easy community launches |
| **Helius** | RPC, webhooks, indexing | Reliable infrastructure |
| **Phantom** | Wallet connection | Mainstream adoption |

---

## Token Economics

### DBC Token (Platform)

**Supply:** 1,000,000,000 (fixed, burned mint authority)
**Distribution:**
- Team/Development: 1.74% (17.4M DBC)
- Market/Liquidity: 98.26% (community-owned)

**Utility:**
1. **Governance** - Vote on protocol upgrades, fee structures
2. **Coordination** - Stake to validate across communities
3. **Value Accrual** - Platform fees used to buy/burn DBC

**No Staking Rewards:** DBC doesn't pay inflationary rewards. Value comes from:
- Governance rights (control protocol)
- Platform fee burns (deflationary pressure)
- Scarcity (fixed supply, increasing demand)

### Community Tokens (Per Community)

**Launch:** Via Bags API bonding curve
**Supply:** Dynamic (determined by market demand)

**Use Cases:**
- Access to community resources (token-gated)
- Governance of community treasury
- Rewards for contributions (case studies, validation)
- Trading/speculation (price discovery)

**Fee Distribution (per trade):**
```
1.0% → Community Creator (ongoing revenue)
0.5% → Platform (DBC buy/burn or treasury)
0.5% → DEX Liquidity Providers
```

---

## Revenue Model

### Platform Revenue (Sustainable)

| Source | Fee | Volume Estimate |
|--------|-----|-----------------|
| Community token launch | 0.5 SOL | 10-100 launches/month |
| Case study submission | 0.1 SOL | 100-1000 submissions/month |
| Trading fees | 0.5% of volume | $1M-10M monthly volume |

**Example (Conservative):**
```
10 community launches × 0.5 SOL = 5 SOL
100 case studies × 0.1 SOL = 10 SOL
$1M volume × 0.5% = $5,000

Monthly Revenue: ~$5,500-6,000 (at $100/SOL)
```

**Fee Usage:**
- 50%: Buy and burn DBC (deflationary)
- 25%: Development fund
- 25%: Community grants

### Community Creator Revenue

Creators earn **1% of trading volume forever**:

| Community Size | Monthly Volume | Creator Earnings |
|----------------|----------------|------------------|
| Small (100 members) | $10,000 | $100/month |
| Medium (1,000 members) | $100,000 | $1,000/month |
| Large (10,000 members) | $1,000,000 | $10,000/month |

---

## Governance

### DBC Governance (Protocol Level)

**Who Can Vote:** DBC holders (1 token = 1 vote)
**What Can Be Changed:**
- Platform fees
- Validation requirements
- Treasury allocation
- Contract upgrades

**Process:**
1. Proposal submitted (requires 10,000 DBC)
2. 7-day discussion period
3. 7-day voting period
4. Execution (if majority + quorum met)

### Community Governance (Per Community)

**Who Can Vote:** Community token holders
**What Can Be Changed:**
- Community rules
- Treasury spending
- Validation criteria
- Research priorities

---

## Roadmap

### Phase 1: Foundation (Months 1-3)
- [ ] Deploy case study validation contracts
- [ ] Launch first community (DBC community itself)
- [ ] Integrate Bags API for token creation
- [ ] Recruit 10-20 validators
- [ ] 100+ case studies validated

### Phase 2: Platform (Months 4-6)
- [ ] Open community creation to public
- [ ] Launch 5-10 external communities
- [ ] Implement DBC governance
- [ ] Fee sharing goes live
- [ ] 500+ case studies, $100K+ volume

### Phase 3: Ecosystem (Months 7-12)
- [ ] 50+ active communities
- [ ] Research institution partnerships
- [ ] Cross-community validation
- [ ] Mobile app launch
- [ ] $1M+ monthly platform volume

---

## Success Metrics

### Platform Health
- **Communities:** 10 → 50 → 100+
- **Case Studies:** 100 → 500 → 2,000+
- **Validators:** 20 → 100 → 500+
- **Monthly Volume:** $100K → $500K → $2M+

### Economic Sustainability
- **Platform Revenue:** $5K → $25K → $100K+/month
- **DBC Burn Rate:** Deflationary (more burned than circulating)
- **Creator Earnings:** $1K → $10K → $50K+/month total

### User Impact
- **Patients Helped:** 100 → 1,000 → 10,000+
- **Treatments Discovered:** 10 → 50 → 200+
- **Research Papers:** 1 → 10 → 50+

---

## Why This Works

### For Patients
- Find others with same condition (not alone)
- Privacy-preserving data sharing (control)
- Access to cutting-edge treatments (hope)
- Earn for contributing (incentive)

### For Validators
- Monetize expertise (earn)
- Build reputation (career)
- Help patients (purpose)
- No infrastructure (easy)

### For Community Creators
- Launch in minutes (simple)
- Earn ongoing revenue (sustainable)
- Focus on mission (not tech)
- Built-in privacy (trust)

### For the World
- Accelerate health discovery (impact)
- Democratize research access (equity)
- Privacy-preserving by default (ethics)
- Community-owned infrastructure (fair)

---

## The Bottom Line

**DBC is not a reward token. It's a coordination token.**

We don't give away DBC to incentivize usage. We build a platform so valuable that:
- Communities pay fees to use it
- Validators stake DBC to participate
- Users buy DBC to govern the protocol
- Fees burn DBC, making it scarce

**The value comes from utility, not inflation.**

This is how you build a sustainable platform for health sovereignty at scale.
