# Dallas Buyers Club: Strategy & Tokenomics

## Executive Summary
Dallas Buyers Club is building a **decentralized health research platform** with a **dual-token economy** where:
1. **Users share health experiences privately** (encrypted with wallet keys)
2. **Agents match experiences without exposing PII** (privacy tooling on Solana)
3. **Community validates with aligned incentives** (EXPERIENCE tokens reward accuracy, penalize fraud)
4. **Market discovers valuable treatments** (Attention Tokens via Bags API enable price discovery)
5. **Submitters earn ongoing revenue** (trading fees from Attention Tokens)
6. **Platform generates sustainable revenue** (protocol fees, attention token launches, API access)

**Why now?** Solana Privacy Hackathon provides perfect funding/timeline. DeSci (decentralized science) is ready. Health sovereignty is trending. Bags API enables treatment-specific markets. Dual tokenomics align incentives better than traditional platforms.

## The Three Phases

### Phase 1: HACKATHON MVP (Jan 12 - Feb 1, 2026)
**Goal:** Win Privacy Hack + Prove Core Mechanics

**What we build:**
- Encrypted case study storage (Solana Anchor)
- Privacy agent matching (Arcium/Privacy Cash)
- Community validation framework
- Governance voting UI

**Why it wins:**
- Privacy is core, not bolted on
- Real utility (matches people to experiences privately)
- Solana-native (agents, wallet integration, on-chain governance)
- Open-source (forkable for other domains)

**Success = $15k-20k prize + credibility**

### Phase 2: TOKEN LAUNCH (Feb - May, 2026)
**Goal:** Build Sustainable Incentive Structure

**Dual-token system:**

#### 1. EXPERIENCE (Protocol Integrity + Governance)
- Native platform token for staking and validation
- Validators stake to review claims; lose tokens for fraud
- Vote on protocol parameters (thresholds, fee splits, etc.)
- Protocol fee distribution to stakers
- Max supply: 1,000,000,000

**Earning:**
- Submit a case study → Earn from validation rewards
- Validate another's case study → Staking rewards in EXPERIENCE
- Find fraud → Slashing penalties distributed to whistleblowers
- Early airdrop → Initial community distribution

**Slashing mechanism:**
```
If you validate a fraudulent case study:
├─ Lose 50% of staked EXPERIENCE → burned
├─ DAO treasury gets 30% → used for bounties
├─ Whistleblower gets 20% → fraud detection incentive
└─ Reputation score → permanently damaged
```

#### 2. ATTENTION TOKENS (Treatment-Specific Markets)
- Created via Bags API when case study reaches quality threshold (75+ reputation, 5+ validators)
- Tradeable immediately on bonding curve
- Generates revenue from trading fees (2% per trade)
- Enables market-driven treatment discovery

**Creation Flow:**
```
Case Study Validated → Reputation >= 75 → Submitter Creates Token
├─ 50% allocated to submitter (vested 12 months)
├─ 30% on bonding curve (public market)
├─ 10% to validators (proportional to contribution)
└─ 10% to platform treasury (EXPERIENCE holders)
```

**Revenue Split (Trading Fees):**
```
Every trade generates 2% fee:
├─ 50% (1.0%) → Case study submitter
├─ 10% (0.2%) → Validators who approved
├─ 10% (0.2%) → EXPERIENCE token stakers
└─ 30% (0.6%) → Liquidity pool
```

**Graduation Mechanism:**
```
When Attention Token reaches threshold:
├─ Market cap > $100k
├─ Volume > $10k/day for 7 consecutive days
└─ Graduates to full DEX listing (Raydium/Orca)
    ├─ Bonus rewards to early holders
    └─ Submitter receives additional allocation
```

**Example Attention Tokens:**
- $PEPTIDE-XYZ → Cancer treatment protocol
- $KETO-PROTOCOL → Metabolic health solution  
- $SUPPLEMENT-ABC → Specific compound/stack
- $THERAPY-METHOD → Alternative therapy approach

**Why Attention Tokens Work:**
- Community signals which treatments deserve attention (market vs. bureaucracy)
- Submitters earn ongoing revenue (not just one-time)
- Validators incentivized to approve quality submissions
- EXPERIENCE holders benefit from all attention token activity
- Price discovery happens organically through trading

**Bags API Integration:**
- Bonding curves handle token pricing automatically
- Fee distribution configured at creation
- Analytics track token performance
- Automatic graduation to DEX at thresholds

#### 3. Future: OUTCOME Markets (Prediction Markets + Accountability - Phase 3)
- On-demand tokens for health outcome predictions
- Users stake on outcomes; markets settle when validators verify
- Creates accountability layer for treatment efficacy

**Safety guardrails:**
- Market size cap: 100 SOL initially
- 3 independent validators required for settlement
- 7-day dispute period
- Insurance fund for edge cases

**Success = 500 case studies, 50+ protocols, $5k-10k/month revenue**

### Phase 3: DESCI INTEGRATION (Apr - Aug, 2026)
**Goal:** Become Part of DeSci Ecosystem

**Key moves:**

1. **BIO.xyz Launchpad Integration**
   - Submit as "Health Sovereignty DAO"
   - Access to 50k+ DeSci audience
   - Establishes legitimacy in research community

2. **Revenue Flywheel**
   - Pharma companies license anonymized health outcomes
   - Prediction markets generate trading volume (5% cut)
   - API access for researchers
   - Total: $20k+/month by August

3. **Researcher Partnerships**
   - VitaDAO co-funding protocols
   - Direct protocol funding (milestone-based)
   - IP ownership clarity

**Success = $20k/month revenue, researcher partnerships, DAO governance**

## Tokenomics Summary

| Token | Supply | Purpose | Tradeable? | Risk |
|-------|--------|---------|-----------|------|
| **EXPERIENCE** | 1M | Governance + Validation | No (initially) | Slashing for false validation |
| **PROTOCOL-X** | Variable | IP rights + revenue share | Yes (after utility proven) | Dilution if protocol quality drops |
| **OUTCOME** | Dynamic | Prediction markets | Yes (burn on loss) | Speculative; must be gated |

## Why Tokens Drive the Right Behavior

### Without Tokens
- Users share vague claims
- No incentive for accuracy
- Bad data mixed with good data
- No funding for validation or research
- Platform becomes unvetted forum

### With Tokens
- Validators have skin in the game
- Researchers get compensated
- Community funds what matters
- Data quality improves
- Platform becomes sustainable

### Token Safeguards
| Risk | Mitigation |
|------|-----------|
| Users lie for tokens | Validators lose tokens for approving false claims |
| Validators collude | Requires 3 independent validators |
| Pump-and-dump | PROTOCOL tokens created after validation |
| Outcome fraud | Results verified by 3 validators |
| Governance bought | EXPERIENCE non-tradeable |

## 6-Month Timeline

```
WEEK 1: Privacy infrastructure (Anchor, encryption)
WEEK 2: Agent matching (Arcium/Privacy Cash integration)
WEEK 3: Validation + governance (voting UI, validator slashing)
WEEK 4: Polish + submit Privacy Hack

[HACKATHON ENDS - Feb 1]

MONTH 2: Launch EXPERIENCE token, gather 100 case studies
MONTH 3: Apply to BIO.xyz, first PROTOCOL tokens mint, partnerships
MONTH 4: Revenue streams activate (data licensing, API)
MONTH 5: PROTOCOL tokens tradeable, 50+ protocols validated
MONTH 6: Full DAO governance, $20k/month revenue, sustainable
```

## Success Metrics

### Hackathon (Feb 1)
- Live Privacy Hack submission
- 10-20 example case studies on-chain
- Agent matching working (privacy preserved)
- Validation UI functional
- Open-source code + full documentation

### Post-Hackathon (May 31)
- 500 case studies
- 50+ protocols with PROTOCOL tokens
- 200+ active validators holding EXPERIENCE
- BIO.xyz integration complete
- Researcher partnerships signed
- $5-10k/month revenue

### Long-term (Aug 31)
- 1000+ case studies
- 100+ protocols
- $20k+/month revenue
- Sustainable DAO governance
- Full token liquidity (Jupiter listing)
- Multiple revenue streams active

## Competitive Landscape

### vs. Centralized Health Platforms (MyFitnessPal, Apple Health)
- **We win on:** Privacy (user owns keys), decentralization (user-governed)

### vs. Research Platforms (ResearchHub, Gitcoin)
- **We win on:** Health focus, outcome verification, tokenized incentives

### vs. Other DeSci (VitaDAO, Cure DAO)
- **We win on:** User-generated data (N=1 trials), privacy-first, health outcomes

### vs. Traditional Trials
- **We win on:** Speed (days vs. months), cost (10x cheaper), access (global)

## The Vision
This is not just a health platform. This is infrastructure for **health autonomy at scale.**

In 2026, the barriers to health information are no longer legal—they're informational. We're building the network where people can **legally access, verify, and fund the health information they need** without asking permission from centralized institutions.

The product is verified health outcome data.  
The platform is decentralized.  
The incentives are tokenized (accuracy rewarded, fraud penalized).  
The governance is democratic.  
The future is community-owned.

That's Dallas Buyers Club 2.0.

## Dual-Token Economic Model

### Why Two Token Types?

**EXPERIENCE Token (Protocol Layer):**
- Purpose: Honesty, governance, protocol integrity
- Holders: Validators, long-term community members
- Value Driver: Protocol usage, fee revenue
- Liquidity: Lower (staked for validation)

**Attention Tokens (Market Layer):**
- Purpose: Treatment discovery, speculation, utility
- Holders: Community, traders, treatment seekers
- Value Driver: Treatment efficacy, community belief
- Liquidity: Higher (active trading)

### Economic Flows

```
User Journey:
1. Pay EXPERIENCE → Submit case study
2. Validators stake EXPERIENCE → Validate
3. High reputation (75+) → Create Attention Token
4. Community trades → Fees distributed
5. Submitter earns passive income
6. Validators earn from allocations
7. EXPERIENCE holders earn protocol fees
```

### Revenue Streams

**For Platform (EXPERIENCE Holders):**
- Case study submission fees: 1-5 EXPERIENCE per submission
- Validation fees: 0.1 EXPERIENCE per validation
- Attention token creation fees: 0.5 SOL per token launch
- Trading fees: 10% of all attention token trading fees
- API access: Researchers pay EXPERIENCE for data access
- **Total Addressable**: $10k-50k/month at scale

**For Case Study Submitters:**
- Validation rewards: EXPERIENCE tokens
- Attention token allocation: 50% of supply (vested)
- Trading fee share: 50% of all trading activity
- Graduation bonus: Extra allocation when token graduates
- **Total Addressable**: $100-10k/month per quality submission

**For Validators:**
- Staking rewards: EXPERIENCE token emissions
- Attention token allocation: 10% split proportionally
- Trading fee share: 10% of trading activity
- Reputation bonuses: Extra rewards for accuracy
- **Total Addressable**: $50-500/month per active validator

### Comparative Advantage

**Traditional Healthcare Data:**
- Value captured by: Pharmaceutical companies, insurance
- Patient earns: $0
- Timeline: 5-10 years to market
- Privacy: Minimal

**Dallas Buyers Club:**
- Value captured by: Submitters, validators, community
- Patient earns: Ongoing trading fees + attention token allocation
- Timeline: Immediate market feedback
- Privacy: End-to-end encryption, zero-knowledge proofs

### Market Size

**Target Addressable Market:**
- Alternative health market: $80B annually
- DeSci funding: $500M+ (growing rapidly)
- Health data licensing: $50B industry
- Prediction markets: $10B+ TAM

**Our Niche:**
- Crypto-native health sovereignty: ~$100M TAM (2026)
- Growing 3-5x annually
- First mover advantage in privacy-first health data

### Token Value Drivers

**EXPERIENCE Token:**
- Staking demand (validators need to stake)
- Governance rights (parameter voting)
- Fee distribution (protocol revenue)
- Scarcity (fixed/capped supply)
- Network effects (more case studies = more value)

**Attention Tokens:**
- Treatment efficacy (real-world results)
- Community size (more believers = higher price)
- Utility access (token-gated services)
- Speculation (early adopter gains)
- Graduation potential (DEX listing bonus)

### Risk Mitigation

**EXPERIENCE Token Risks:**
- Low initial demand → Mitigated by staking requirements
- Validator attacks → Mitigated by slashing + reputation
- Governance capture → Mitigated by time-locks + quadratic voting

**Attention Token Risks:**
- Pump and dump → Mitigated by vesting + bonding curves
- Low quality submissions → Mitigated by reputation thresholds
- Market manipulation → Mitigated by Bags API safeguards
- Regulatory concerns → Mitigated by privacy layer + no medical claims

### Success Metrics

**Phase 1 (Hackathon - Feb 2026):**
- 100+ case studies submitted
- 20+ validators active
- Win $15k-20k prize money
- 1,000+ wallet connections

**Phase 2 (Token Launch - May 2026):**
- 500+ case studies
- 50+ validators
- 10+ attention tokens created
- $50k+ monthly trading volume
- $5k-10k/month platform revenue

**Phase 3 (DeSci Integration - Aug 2026):**
- 2,000+ case studies
- 200+ validators
- 50+ attention tokens
- $500k+ monthly trading volume
- $25k-50k/month platform revenue
- Partnership with 1+ major DeSci protocol

