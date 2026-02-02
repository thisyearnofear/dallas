# Dallas Buyers Club: Overview

**A platform for forming communities around health causes, wellness initiatives, and ailments.**

Privacy-preserving infrastructure for decentralized health research. Communities launch their own tokens, validate contributions with zero-knowledge proofs, and fund research through decentralized treasuries.

---

## The Problem

- **Patients are isolated** - No easy way to find others with same condition
- **Data is siloed** - Valuable treatment experiences trapped in forums, lost
- **Research is slow** - 10-15 years from discovery to treatment
- **Privacy is compromised** - Share data = lose control

## The Solution

We provide infrastructure that enables anyone to form communities around wellness remedies. Each community:

- **Launches their own token** (via Bags API bonding curves - free to create)
- **Organizes by category** (supplement, lifestyle, device, protocol)
- **Validates contributions privately** (ZK proofs, no data exposure)
- **Funds research collectively** (community treasuries, not handouts)
- **Owns their destiny** (governance, not platform control)

### Core Innovation: Separation of Concerns

| Layer | Function | Example |
|-------|----------|---------|
| **Platform (DBC)** | Shared infrastructure, governance | Validation, privacy tech |
| **Communities** | Specific causes, research | LupusDAO, LongevityCoin |
| **Validators** | Quality assurance | Medical experts, researchers |

**We don't fund communities. We enable them to fund themselves.**

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
- `symptom_improvement`: Proves health improved without revealing scores
- `duration_verification`: Proves treatment duration in valid range
- `data_completeness`: Proves required fields present
- `cost_range`: Proves cost within acceptable bounds

---

## User Journeys

### Patient: Find Your Community
1. **Discover** - Browse communities by condition
2. **Connect** - Join community (buy token or apply)
3. **Participate** - Submit encrypted case study (ZK proof)
4. **Benefit** - Access token-gated resources, earn tokens

### Community Creator: Launch Your Cause
1. **Design** - Define mission, set validation rules
2. **Launch** - Use platform UI (no code), pay 0.5 SOL fee
3. **Grow** - Recruit members, fund research
4. **Earn** - 1% of trading volume forever

### Validator: Monetize Expertise
1. **Stake DBC** - Lock 1,000+ DBC as collateral
2. **Validate** - Review case studies with ZK proofs
3. **Earn** - SOL fees from submissions, community tokens
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
- `/experiences` - Wellness communities (discover, launch, share)
- `/validators` - Validator dashboard
- `/research` - Researcher access requests

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
├── symptom_improvement/
├── duration_verification/
├── data_completeness/
└── cost_range/
```

---

## License

MIT Licensed - Open source privacy tooling for health data sovereignty.
