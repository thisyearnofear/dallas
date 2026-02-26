# Dallas Buyers Club: Overview

**The Agent Alliance — Privacy-preserving infrastructure for collective AI agent intelligence.**

Communities ("alliances") form around shared agent challenges, launch their own tokens, validate improvements with zero-knowledge proofs, and fund collective research through decentralized treasuries.

---

## The Problem

- **Builders are isolated** - Every team solves the same challenges independently
- **Data is siloed** - Valuable optimization wins trapped in private repos, behind NDAs
- **Iteration is slow** - No way to share learnings without exposing IP
- **Privacy is compromised** - Share architectures = lose competitive advantage

## The Solution

We provide infrastructure that enables anyone to form alliances around agent challenges. Each alliance:

- **Launches their own token** (via Bags API bonding curves - free to create)
- **Organizes by category** (context management, tool calling, evaluation, orchestration)
- **Validates contributions privately** (ZK proofs, no architecture exposure)
- **Funds research collectively** (alliance treasuries, not handouts)
- **Owns their destiny** (governance, not platform control)

### Core Innovation: Separation of Concerns

| Layer | Function | Example |
|-------|----------|---------|
| **Platform (DBC)** | Shared infrastructure, governance | Validation, privacy tech |
| **Alliances** | Specific challenges, research | $CONTEXT, $TOOL, $EVAL |
| **Validators** | Quality assurance | Agent architects, researchers |

**We don't fund alliances. We enable them to fund themselves.**

---

## Token Economics

### DBC (Platform Token)
- Fixed supply: 1B tokens (burned mint authority)
- Team ownership: 1.74% (17.4M DBC)
- Utility: Governance, coordination, fee burns
- No inflation: Value from utility, not handouts

### Community Tokens (Per Cause)
- Launch via Bags API bonding curves
- Self-funding through trading volume
- Creator earns 1% of volume forever
- Communities control their own treasuries

---

## Privacy Stack

| Technology | Status | Integration |
|------------|--------|-------------|
| **Noir (Aztec)** | Complete | 4 circuits, 26 tests passing |
| **Light Protocol** | Complete | ZK compression 2x-50x ratios |
| **Arcium MPC** | Complete | Threshold decryption K-of-N |
| **IPFS/Arweave** | Complete | Encrypted off-chain storage |

**Noir Circuits:**
- `benchmark_delta`: Proves performance improved without revealing scores
- `execution_duration`: Proves execution duration in valid range
- `data_completeness`: Proves required fields present
- `resource_range`: Proves resource cost within acceptable bounds

---

## User Journeys

### Agent Builder: Find Your Alliance
1. **Discover** - Browse alliances by challenge area
2. **Connect** - Join alliance (buy token or apply)
3. **Participate** - Submit encrypted optimization log (ZK proof)
4. **Benefit** - Access token-gated techniques, earn tokens

### Alliance Creator: Launch Your Cause
1. **Design** - Define mission, set validation rules
2. **Launch** - Use platform UI (no code), pay 0.5 SOL fee
3. **Grow** - Recruit members, fund research
4. **Earn** - 1% of trading volume forever

### Validator: Monetize Expertise
1. **Stake DBC** - Lock 1,000+ DBC as collateral
2. **Validate** - Review optimization logs with ZK proofs
3. **Earn** - SOL fees from submissions, alliance tokens
4. **Advance** - Build reputation, unlock premium validations

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Navigate to http://localhost:5173
```

### Key Pages
- `/experiences` - Agent alliances (discover, launch, share)
- `/validators` - Validator dashboard
- `/agents` - Agent command center

---

## Documentation

| Document | Purpose |
|----------|---------|
| [`1_OVERVIEW.md`](1_OVERVIEW.md) | This file - platform overview |
| [`2_ARCHITECTURE.md`](2_ARCHITECTURE.md) | Technical architecture |
| [`3_PRIVACY.md`](3_PRIVACY.md) | Privacy technology details |
| [`4_TOKENOMICS.md`](4_TOKENOMICS.md) | Token economics & flows |
| [`5_DEPLOYMENT.md`](5_DEPLOYMENT.md) | Deployment & development |

---

## Repository Structure

```
src/
├── components/     # UI components
├── services/       # Business logic, API calls
│   └── privacy/    # Privacy services (Noir, Light, Arcium)
├── hooks/          # Custom React hooks
├── context/        # React context providers
├── config/         # Constants, configuration
└── pages/          # Page components

programs/           # Solana smart contracts
├── case_study/     # Case study validation
├── dbc_token/      # DBC token program
├── membership/     # Membership management
└── treasury/       # Treasury management

circuits/           # Noir ZK circuits
├── benchmark_delta/
├── execution_duration/
├── data_completeness/
└── resource_range/
```

---

## License

MIT Licensed - Open source privacy tooling for agent intelligence sovereignty.
