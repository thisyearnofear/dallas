# Dallas Buyers Club: Agent Context

## Project Overview

**Dallas Buyers Club is a platform for health community tokenization.**

We provide privacy-preserving infrastructure that enables anyone to form communities around health causes, wellness initiatives, and ailments. Communities launch their own tokens, validate contributions with zero-knowledge proofs, and fund research through decentralized treasuries.

**Key Principle:** DBC is the coordination layer, not the reward token. We don't give away DBC to incentivize usage. We build a platform so valuable that communities pay fees to use it, validators stake DBC to participate, and the token captures value from ecosystem growth.

---

## Architecture Philosophy

### Community-First, Not Token-First
- Users form communities around causes they care about
- Each community has its own token (via Bags API bonding curves)
- Communities are self-funding through trading volume and fees
- DBC enables coordination, doesn't fund operations

### Privacy by Design
- Zero-knowledge proofs for validation (Noir)
- Encrypted data storage (IPFS/Arweave)
- Selective disclosure via threshold cryptography (Arcium MPC)
- Validators prove data quality without seeing sensitive information

### Sustainable Economics
- No inflation-based rewards from DBC treasury
- Fee-based model: users pay for services, validators earn from work
- DBC captures value through governance and platform fees
- Communities bootstrap via bonding curves, not handouts

### Composable Infrastructure
- One validation system works across all communities
- Shared privacy stack (Light Protocol, Noir, Arcium)
- Reusable treasury and case study programs
- Communities focus on mission, not infrastructure

---

## Token Economics (Critical Context)

### DBC Token (Platform)
- **Supply:** 1,000,000,000 (fixed, burned mint authority)
- **Team Ownership:** 1.74% (17.4M DBC)
- **Market:** 98.26% liquid (community-owned)

**No Staking Rewards:** DBC doesn't pay inflationary rewards.

**Value Accrual:**
1. Governance rights (control protocol)
2. Platform fee burns (deflationary pressure)
3. Scarcity (fixed supply, increasing demand)
4. Coordination (stake to validate across communities)

**Fee Model:**
- Community token launch: 0.5 SOL
- Case study submission: 0.1 SOL
- Trading volume: 0.5% of all community token trades

Fee usage:
- 50%: Buy and burn DBC
- 25%: Development fund
- 25%: Community grants

### Community Tokens (Per Initiative)
- Launch via Bags API bonding curves
- Self-funding through trading volume
- Creator earns 1% of trading volume forever
- Communities control their own treasuries

---

## User Journeys

### Patient
1. Discover communities by condition
2. Connect wallet (Phantom)
3. Join community (buy token or apply)
4. Submit encrypted case study (pay 0.1 SOL fee)
5. Access token-gated resources
6. Earn community tokens for contributions

### Community Creator
1. Design community (purpose, rules, treasury)
2. Launch via platform UI (0.5 SOL fee)
3. Token launches via Bags API bonding curve
4. Recruit members (patients, researchers)
5. Fund research via community treasury
6. Earn 1% of trading volume forever

### Validator
1. Stake 1,000+ DBC (skin in game)
2. Review case studies across communities
3. Use ZK proofs (no data exposure)
4. Earn SOL fees from submissions
5. Earn community tokens
6. Build on-chain reputation

---

## Technical Stack

### Smart Contracts
| Program | Purpose |
|---------|---------|
| `case_study` | Submit and validate encrypted case studies |
| `community_factory` | Create new community tokens + treasuries |
| `community_treasury` | Per-community rewards and grants |
| `dbc_governance` | DBC staking, voting, fee distribution |

### Privacy Stack
| Technology | Purpose |
|------------|---------|
| **Noir** | ZK-SNARK proofs for validation |
| **Light Protocol** | ZK compression for scalable storage |
| **Arcium MPC** | Threshold decryption |
| **IPFS/Arweave** | Encrypted off-chain storage |

### External Integrations
| Service | Purpose |
|---------|---------|
| **Bags API** | Token creation, bonding curves |
| **Helius** | RPC, webhooks, indexing |
| **Phantom** | Wallet connection |

---

## Code Style & Principles

### Core Principles (from project)
- **ENHANCEMENT FIRST** - Improve existing components vs creating new ones
- **AGGRESSIVE CONSOLIDATION** - Remove hardcoded values, merge animations
- **DRY** - Single source of truth in config
- **CLEAN** - Clear separation: styling in config, logic in components
- **MODULAR** - Reusable components with single responsibilities
- **PERFORMANT** - CSS animations, no JS overhead

### File Organization
```
src/
├── components/     # UI components
├── hooks/          # Custom React hooks
├── services/       # Business logic, API calls
├── context/        # React context providers
├── config/         # Constants, configuration
├── pages/          # Page components
└── styles/         # CSS, Tailwind config

programs/
├── common/         # Shared constants (dbc_common)
├── treasury/       # DBC treasury program
├── case_study/     # Case study validation
└── community_factory/ # Community creation (planned)

docs/
├── PLATFORM_ARCHITECTURE.md  # High-level vision
├── STRATEGY.md               # Business strategy
├── ARCHITECTURE.md           # Technical details
└── ...
```

---

## Key Decisions

### Why No Staking Rewards?
We don't pay inflationary rewards because:
1. We only own 1.74% of DBC (can't fund large rewards)
2. Sustainable value comes from utility, not inflation
3. Fee-based model aligns incentives better
4. DBC becomes deflationary (fees buy/burn)

### Why Communities Have Their Own Tokens?
1. Each cause has different economics
2. Bonding curves enable fair price discovery
3. Communities self-fund (not dependent on us)
4. Creator earns ongoing revenue (incentive to build)

### Why ZK Proofs?
1. Medical data is sensitive
2. Validators need to verify without seeing data
3. Regulatory compliance (privacy by design)
4. Competitive moat (technical differentiation)

---

## Documentation

- `docs/PLATFORM_ARCHITECTURE.md` - High-level platform vision
- `docs/STRATEGY.md` - Business strategy and tokenomics
- `docs/ARCHITECTURE.md` - Technical architecture details
- `docs/BLOCKCHAIN_INTEGRATION.md` - Solana integration guide
- `docs/PRIVACY_USER_FLOWS.md` - Privacy-focused user journeys

---

## Development Guidelines

### When Adding Features
1. Does it help communities form around causes?
2. Does it maintain privacy by design?
3. Does it use fee-based (not inflation) economics?
4. Does it reuse existing components (DRY)?

### When Modifying Tokenomics
1. Check `dbc_common` for shared constants
2. Update both programs and frontend
3. Consider impact on 1.74% DBC ownership constraint
4. Prefer fees over inflation

### When Adding Privacy Tech
1. Document the threat model
2. Explain what data is protected
3. Show the ZK proof flow
4. Test with real encrypted data

---

## Contact & Resources

- **Docs:** See `/docs` directory
- **Programs:** See `/programs` directory
- **Config:** `src/config/solana.ts`
- **Token Service:** `src/services/DbcTokenService.ts`

**Remember:** We're building a platform where thousands of health communities can thrive. DBC coordinates. Communities execute. Patients benefit.
