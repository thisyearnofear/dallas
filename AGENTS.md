# Dallas Buyers Club: Agent Alliance Context

## CORE ENGINEERING PRINCIPLES
*   **ENHANCEMENT FIRST**: Always prioritize enhancing existing components over creating new ones.
*   **AGGRESSIVE CONSOLIDATION**: Delete unnecessary code rather than deprecating.
*   **PREVENT BLOAT**: Systematically audit and consolidate before adding new features.
*   **DRY / CLEAN / MODULAR**: Single source of truth for all shared logic; clear separation of concerns.
*   **PERFORMANT / ORGANIZED**: Adaptive loading, caching, and resource optimization; Predictable file structure with domain-driven design.

## ZERO-SECRET POLICY
*   **NEVER COMMIT SECRETS**: Files matching `.env*`, `*.key`, `*.pem`, `*.secret`, `credentials.json`, or plaintext API keys.
*   **VERCEL TOKEN PROTECTION**: Never commit or push a **Vercel Token** (pattern: `ARV_...`). Use it only for local CLI tasks.
*   **NO BUILD ARTIFACTS**: Never commit `node_modules`, `dist`, `build`, `.next`, `out`, `target`, `venv`, or `.env`.
*   **GIT HYGIENE**: Always check `.gitignore` before `git add`.

## Project Overview

**Dallas Buyers Club: Agent Alliance is a privacy-preserving infrastructure layer for AI agent developers.**

We provide the platform where AI agents form communities (Alliances) around shared challenges (e.g., context window limits, tool-calling loops, hallucinations). Alliances launch their own tokens, validate optimization contributions with zero-knowledge proofs, and fund collective R&D (like shared fine-tuning datasets and evals) without ever exposing their proprietary architectures or prompts.

**Key Principle:** DBC is the coordination layer, not the reward token. We don't give away DBC to incentivize usage. We build a platform so valuable that agent alliances pay fees to use it, validators stake DBC to participate, and the token captures value from ecosystem growth.

---

## Domain Mapping (The Pivot)

For historical context, the codebase is transitioning from a "Health/Patient" metaphor to the "Agent/Developer" reality. 

| Legacy Concept | Current Agent Alliance Concept |
|----------------|--------------------------------|
| Health DBC | Agent DBC |
| Patients with conditions | Agents with same failure modes |
| Treatment protocols | Prompt templates, tool chains, architectures |
| Symptom improvement | Performance metrics (success rate, latency, etc.) |
| Medical validators | Senior engineers, researchers, other agents |
| Case studies | Debug sessions, optimization logs, traces |
| Health privacy | IP protection (prompts, system designs, customer data) |
| Research funding | Fine-tuning datasets, eval infra, compute credits |

---

## Architecture Philosophy

### Alliance-First, Not Token-First
- Developers form alliances around AI challenges they face (e.g., $CONTEXT, $TOOL, $EVAL).
- Each alliance has its own token (via Bags API bonding curves).
- Alliances are self-funding through trading volume and fees.
- DBC enables coordination and trust, but doesn't fund individual alliance operations.

### Privacy by Design (IP Protection)
- Zero-knowledge proofs for validation (Noir). 
- Encrypted data storage (IPFS/Arweave).
- Selective disclosure via threshold cryptography (Arcium MPC).
- Validators prove optimization metrics (e.g., "Pass@1 rate increased by 15%") *without* seeing the proprietary prompt or model weights.

### Sustainable Economics
- No inflation-based rewards from the DBC treasury.
- Fee-based model: alliances pay for services, validators earn from work.
- DBC captures value through governance and platform fees.
- Alliances bootstrap via bonding curves, not handouts.

### Composable Infrastructure
- One validation system works across all alliances.
- Shared privacy stack (Light Protocol, Noir, Arcium).
- Reusable treasury and optimization log programs.
- Developers focus on agent performance, not decentralized infrastructure.

---

## Token Economics (Critical Context)

### DBC Token (Platform)
- **Supply:** 1,000,000,000 (fixed, burned mint authority)
- **Team Ownership:** 1.74% (17.4M DBC)
- **Market:** 98.26% liquid (community-owned)

**No Staking Rewards:** DBC doesn't pay inflationary rewards.

**Value Accrual:**
1. Governance rights (control the protocol)
2. Platform fee burns (deflationary pressure)
3. Scarcity (fixed supply, increasing demand)
4. Coordination (stake to validate optimization logs across alliances)

**Fee Model:**
- Alliance token launch: 0.5 SOL
- Optimization log submission: 0.10 USDC
- Trading volume: 0.5% of all alliance token trades

Fee usage:
- 50%: Buy and burn DBC
- 25%: Development fund
- 25%: Alliance grants (Collective GPU/Fine-tuning pools)

### Alliance Tokens (Per Challenge)
- Launch via Bags API bonding curves
- Self-funding through trading volume
- Creator earns 1% of trading volume forever
- Alliances control their own treasuries for collective R&D

---

## User Journeys

### Agent Developer / Researcher
1. Discover alliances by failure mode / architectural challenge.
2. Connect wallet (Phantom).
3. Join alliance (buy token or prove capabilities).
4. Submit encrypted optimization log (pay 0.10 USDC fee).
5. Access token-gated resources (premium prompt libraries, fine-tuned weights).
6. Earn alliance tokens for validated benchmarking contributions.

### Alliance Creator
1. Design alliance (purpose, validation rules, treasury goals).
2. Launch via platform UI (0.5 SOL fee).
3. Token launches via Bags API bonding curve.
4. Recruit members (other developers, researchers).
5. Fund collective compute/R&D via alliance treasury.
6. Earn 1% of trading volume forever.

### Validator (Senior Engineer / Evaluation Agent)
1. Stake 1,000+ DBC (skin in the game).
2. Review encrypted optimization logs across alliances.
3. Verify ZK proofs of performance improvement (no IP exposure).
4. Earn SOL fees from submissions.
5. Build an on-chain reputation for rigorous evaluation.

---

## Technical Stack

### Smart Contracts (Solana)
| Program | Purpose |
|---------|---------|
| `optimization_log` | Submit and validate encrypted performance benchmarks (formerly `case_study`) |
| `alliance_factory` | Create new alliance tokens + treasuries (formerly `community_factory`) |
| `treasury` | Per-alliance R&D funding and grants |
| `dbc_governance` | DBC staking, voting, fee distribution |

### Privacy Stack
| Technology | Purpose |
|------------|---------|
| **Noir** | ZK-SNARK proofs for performance validation (`benchmark_delta` circuits) |
| **Light Protocol** | ZK compression for scalable on-chain storage |
| **Arcium MPC** | Threshold decryption for selective log disclosure |
| **IPFS/Arweave** | Encrypted off-chain trace storage |

### External Integrations
| Service | Purpose |
|---------|---------|
| **Bags API** | Token creation, bonding curves |
| **Helius** | RPC, webhooks, indexing |
| **Phantom** | Wallet connection |

---

## Code Style & Principles

### File Organization (Target Architecture)
```
src/
├── components/     # UI components (Clean UI/UX for developers)
├── hooks/          # Custom React hooks
├── services/       # Business logic, API calls
├── context/        # React context providers
├── config/         # Constants, configuration
├── agents/         # Agent intelligence layer (e.g., AllianceBroker)
├── pages/          # Page components
└── styles/         # CSS, Tailwind config

programs/
├── common/             # Shared constants (dbc_common)
├── treasury/           # DBC treasury program
├── optimization_log/   # Performance trace validation
└── alliance_factory/   # Alliance creation

circuits/               # Noir ZK circuits
├── benchmark_delta/    # Prove pass rate increase without revealing prompt
└── ...

docs/
├── 1_OVERVIEW.md       # High-level vision
├── 2_ARCHITECTURE.md   # Technical architecture
├── 3_PRIVACY.md        # ZK/Privacy stack
├── 4_TOKENOMICS.md     # Sustainable economics
└── 5_DEPLOYMENT.md     # Local dev & deployment
```

---

## Key Decisions

### Why No Staking Rewards?
We don't pay inflationary rewards because:
1. We only own 1.74% of DBC (can't fund large rewards).
2. Sustainable value comes from utility, not inflation.
3. Fee-based model aligns incentives better.
4. DBC becomes deflationary (fees buy/burn).

### Why Do Alliances Have Their Own Tokens?
1. Each architectural challenge has different economics and R&D costs.
2. Bonding curves enable fair price discovery.
3. Alliances self-fund their evals and fine-tuning (not dependent on us).
4. Creator earns ongoing revenue (incentive to build top-tier infra).

### Why ZK Proofs for Agents?
1. Prompts, fine-tuned weights, and customer data logs are proprietary moats.
2. Validators need to verify an agent improved without stealing the IP.
3. Creates a trustless "Proof of Optimization".
4. Massive competitive moat (solving the Agentic "Dark Forest" problem).

---

## Development Guidelines

### When Adding Features
1. Does it help agent developers form alliances around shared bottlenecks?
2. Does it maintain IP privacy by design?
3. Does it use fee-based (not inflation) economics?
4. Does it strictly reuse existing components and follow our consolidation rule?

### When Modifying Tokenomics
1. Check `dbc_common` for shared constants.
2. Update both Solana programs and frontend clients.
3. Consider the impact on the strict 1.74% DBC ownership constraint.
4. Always prefer fees over inflation.

### When Adding Privacy Tech / Circuits
1. Document the threat model (e.g., "Developer wants to prove 95% tool-call success without exposing the system prompt").
2. Show the ZK proof flow.
3. Ensure Noir circuit keys/verifiers are optimally loaded on the client side.

---

**Remember:** We're building the intelligence layer where thousands of AI agents can coordinate and break through current technical walls. DBC coordinates. Alliances execute. Developers benefit.