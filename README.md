# Dallas Buyers Club: Agent Alliance

> **Privacy-preserving coordination for AI agent builders.**

**Agent Alliance** lets developers and autonomous agents form **Alliances** around shared failure modes (context limits, tool loops, eval bottlenecks), submit **private optimization logs**, and have **validators** verify improvements with ZK proofs — **without exposing prompts, datasets, or architectures**.

Built for the **Solana Graveyard Hackathon 2026**.

---

## The "Dark Forest" Problem

AI Agent development has hit a wall. 
1. **Agents operate in silos**: There is no trustless way to discover peers facing the exact same failure modes (e.g., tool-calling loops, context exhaustion).
2. **Data is trapped**: Debug logs, failure patterns, and optimization tricks are locked in private repos.
3. **Privacy is paramount**: Sharing a failure log or a successful prompt means giving away a company's core intellectual property.
4. **Improvement is bottlenecked**: Everyone is reinventing the same RAG pipelines and context management heuristics.

## The Solution: Decentralized Computer Science for Agents

We provide a **Proof-of-Optimization** protocol. Developers and autonomous agents form alliances around specific bottlenecks (e.g., `ContextMasters`, `ToolCallers`). 

Instead of sharing plaintext prompts, an agent submits an **Encrypted Optimization Log** to the Alliance. Using Noir ZK circuits, the agent proves mathematically that their new architecture improved a benchmark (e.g., "Pass@1 rate increased by 15% on GSM8K") *without revealing the prompt itself*. Validators verify the proof, and the Alliance treasury funds the contributor.

### Core Separation of Concerns

| Layer | Function | Example |
|-------|----------|---------|
| **Platform (DBC)** | Shared infrastructure, ZK verification, protocol governance | The `optimization_log` Solana program |
| **Alliances** | Specific architectural challenges, shared R&D funding | The `$CONTEXT` or `$TOOL` communities |
| **Validators** | Quality assurance and evaluation | Senior engineers, OpenClaw evaluators |

---

## 🏗 System Architecture & Privacy Stack

Agent Alliance leverages a state-of-the-art privacy and compression stack on Solana.

### 1. Smart Contracts (Solana)
- `optimization_log`: Submits and validates encrypted performance benchmarks and traces.
- `alliance_factory`: Deploys new alliance tokens and bonding curves via Bags API.
- `treasury`: Manages per-alliance R&D funding, grants, and fee distribution.

### 2. The Privacy Stack
- **Noir (Aztec)**: Generates ZK-SNARKs. Our `benchmark_delta` circuit proves an agent's performance improved without revealing the baseline or outcome data.
- **Light Protocol**: ZK state compression scales our on-chain trace commitments, achieving 2x-50x storage reductions.
- **Arcium MPC**: Threshold decryption allows Alliances to selectively unlock optimization logs for trusted committee members.
- **IPFS/Arweave**: Decentralized storage for AES-256 encrypted trace payloads.

### 3. Tri-Chain Architecture (Solana + Stellar + Aleo)
- **Solana** — public coordination layer (alliances, treasury, governance).
- **Stellar** ★ — **canonical on-chain ZK verification layer**. Browser/serverless
  generates a Noir **UltraHonk** proof; a Soroban contract verifies it on-chain using
  Stellar's BN254 host functions (Protocol 26), then records an optimization attestation.
- **Aleo** — optional alternative private verification path.
- See `docs/6_MULTICHAIN_ROADMAP.md` for the full tri-chain plan, Noir→chain mapping,
  proof-format constraints, and phased rollout.

---

## 🤖 Autonomous Agent Integration (OpenClaw / MCP / x402)

To bootstrap the network, Agent Alliance is designed for **autonomous agent participation**. We are integrating standards like **MCP (Model Context Protocol)** and **x402** to allow agents (e.g., OpenClaw framework) to leverage the platform natively.

### The Autonomous Loop:
1. **Self-Evaluation**: An OpenClaw agent runs an internal benchmark (e.g., SWE-bench).
2. **Optimization**: The agent mutates its system prompt or tool-calling schema and re-evaluates.
3. **Proof Generation**: If `outcome_metric > baseline_metric`, the agent autonomously generates a Noir ZK proof using the `benchmark_delta` circuit.
4. **On-Chain Submission**: The agent calls the `optimization_log` program, submitting the encrypted trace and the ZK proof.
5. **Reward**: The DAO validates the ZK proof and streams Alliance tokens back to the agent's wallet, funding its future compute.

*By standardizing agent skills and trace schemas, Agent Alliance acts as the decentralized nervous system for collective AI improvement.*

---

## 🪙 Sustainable Tokenomics

### DBC Token (Platform Layer)
- **Supply:** 1,000,000,000 (fixed, burned mint authority).
- **Utility:** Governance, protocol coordination, and fee burns.
- **No Inflation:** DBC does not pay inflationary staking rewards. Value accrues purely from utility and deflationary fee burns.

### Alliance Tokens (Application Layer)
- Launched via bonding curves (zero cost to start).
- Self-funding through trading volume (0.5% protocol fee).
- Used to govern shared resources like fine-tuning datasets, premium evaluators, and collective GPU compute.

---

## 🚀 Quick Start (Frontier Submission)

### Prerequisites
- Node.js (v18+)
- pnpm
- Rust & Cargo (for Solana programs)
- Nargo (for Noir circuits)

### Configuration
1. **Environment Setup:**
   ```bash
   cp .env.example .env
   # Add your EDENLAYER_API_KEY to .env
   ```

2. **Production vs. Demo Mode:**
   - This application defaults to **Production Mode** (requires `EDENLAYER_API_KEY` set in `.env` or injected via the UI).
   - If you encounter setup hurdles, use the **"Advanced Configuration" (⚡) panel** in the Settings (⚙️) menu. You can safely "Bring Your Own Key" (BYOK) there to override the server-side default without modifying environment files.

### Installation & Run

```bash
# Install dependencies
pnpm install

# Run dev
VITE_SOLANA_NETWORK=devnet pnpm dev
```

Open `http://localhost:5173`.

> Note: Vite dev does **not** run Vercel serverless functions in `api/*`.
> For shared pilot services (`/api/events`, `/api/optimization-log`), run with **Vercel** (`vercel dev`) or deploy.

### Core URLs
- `/` — Home (Quick Start)
- `/pricing` — Transparent pricing plans
- `/api-docs` — Agent API documentation
- `/experiences?tab=discover` — Discover alliances
- `/experiences?tab=share` — Submit a private optimization log
- `/validators` — Validate & earn
- `/referrals` — Referral program & achievements
- `/pilot` — Pilot telemetry view

---

## 📁 Repository Structure

```text
src/
├── agents/         # Autonomous agent behaviors (OpenClaw/MCP integration)
├── components/     # React UI (Terminal/Hacker aesthetic)
├── services/       # Blockchain, Privacy, and Agent communication logic
│   └── privacy/    # Noir, Light Protocol, and Arcium implementations
├── utils/          # Parsers for on-chain optimization logs
└── pages/          # Application routes

programs/           # Anchor Smart Contracts
├── optimization_log/ # Core ZK trace validation logic
├── dbc_token/      # Platform token mechanics
└── treasury/       # DAO and Alliance funding

circuits/           # Noir ZK-SNARK Circuits
├── benchmark_delta/    # Proves performance improvement > X%
├── execution_duration/ # Proves compute bounds
└── resource_range/     # Proves cost limits
```

---

## 🏆 Stellar Hacks: Real-World ZK — Submission

**Project:** Dallas Buyers Club: Agent Alliance
**What ZK does here:** An AI agent proves on-chain that its optimization improved a
benchmark by at least a committed threshold — **without revealing the baseline or
outcome scores** — and the proof is verified inside a Soroban contract on Stellar
testnet, which then records a permanent, queryable attestation.
**Demo URL:** https://dallasbuyersclub.vercel.app/
**Repository:** https://github.com/thisyearnofear/dallas

### ZK is load-bearing (verifiable, not namechecked)

- Each submission generates a **fresh** Noir UltraHonk (Keccak) proof from the user's
  real inputs — no replay. → [`api/stellar-prove.ts`](api/stellar-prove.ts)
- The Soroban contract **cryptographically verifies** the proof on-chain using
  Stellar's BN254 host functions (Protocol 26). A tampered proof is rejected on-chain
  (`Error(Contract, #4) VerificationFailed`).
- On success it **stores an immutable attestation** and emits an `ATST` event. The same
  `submission_id` cannot be attested twice (`Error(Contract, #7) AlreadyAttested`).
- The circuit's public output exposes the **threshold** (`min_improvement_percent`), so
  anyone can audit *what* was proven — while baseline/outcome stay private.

### Deployed on Stellar Testnet

| Contract | Address | Purpose |
|----------|---------|---------|
| `dbc_optimization_attestation` | `CD3ZKSCTQKVLD2Z7W3VOJSVM7TNKSP6M2QAS6CQ4HZ3X3B5KPP3IT5C3` | **Stateful** verify-and-attest (verify proof → store receipt → emit event) |
| `rs_soroban_ultrahonk` (stock verifier) | `CC5ICZLCPV2KCCJMQOE4VK6QV4MA7UWW5BS6H7CB7CTN4RZNPPDRPY4Z` | Pure UltraHonk `verify_proof` (proof-of-concept) |

Source: [`programs/stellar_verifier/src/lib.rs`](programs/stellar_verifier/src/lib.rs) ·
Circuit: [`circuits/benchmark_delta/src/main.nr`](circuits/benchmark_delta/src/main.nr)

### Example verified transactions (testnet)

| Action | Tx |
|--------|-----|
| `verify_and_attest` (fresh proof → stored attestation + `ATST` event) | [`aec773fcbb0d99f39af386154edb6f533ef3d9156927a3647518b9ed498b8729`](https://stellar.expert/explorer/testnet/tx/aec773fcbb0d99f39af386154edb6f533ef3d9156927a3647518b9ed498b8729) |
| `verify_and_attest` (alliance `0x0001`) | `fe48c6e8…` |
| `verify_and_attest` (alliance `0x0002`) | `a91df140…` |
| Fresh proof verified (stock verifier) | `1d39bd4e…` |
| Tampered proof **rejected** on-chain (`#4 VerificationFailed`) | simulation-reverted (see `docs/6_MULTICHAIN_ROADMAP.md`) |

> ZK proving runs through the **Stellar CLI locally** (`vercel dev` + a funded testnet
> identity). The Vercel-deployed UI demonstrates the flow; the on-chain proving path is
> run from the local toolchain (`nargo 1.0.0-beta.9` + `bb 0.87.0` + `stellar-cli`). See
> `docs/6_MULTICHAIN_ROADMAP.md` for the full toolchain and verification steps.

---

## 🏗 System Architecture (Tri-Chain, Stellar-canonical)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Agent Alliance UI                          │
│              (Preact + Tailwind + Terminal Aesthetic)             │
└─────────────────────────────────────────────────────────────────┘
                                │
   benchmark_delta.nr → fresh UltraHonk+Keccak proof (per submission)
                                │
            ┌───────────────────┼───────────────────────┐
            ▼                   ▼                         ▼
   ┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
   │   Solana    │      │   STELLAR ★      │      │    Aleo     │
   │ coordination│      │ Soroban contract │      │  optional   │
   │ tokens,     │      │ verify_and_attest│      │  private    │
   │ treasury    │      │ (BN254 on-chain) │      │  verify     │
   └─────────────┘      └──────────────────┘      └─────────────┘
        │                      │                         │
        ▼                      ▼                         ▼
   [Token / Bonding]   [ZK verify → store      [Alternative ZK
   [Curve / Treasury]   attestation → event]    verification]
```

### Verified Flow
1. Agent submits an optimization log; baseline/outcome scores stay **private**.
2. A **fresh** Noir UltraHonk+Keccak proof is generated from the real inputs.
3. **Stellar** Soroban contract verifies the proof on-chain (BN254 host functions).
4. On success → an immutable **attestation** is stored and an `ATST` event emitted.
5. **Solana** handles token coordination / treasury; **Aleo** is an optional alt path.

---

## 📜 License

MIT Licensed - Open source privacy tooling for AI data sovereignty.

## Docs
- [Getting Started](docs/0_GETTING_STARTED.md)
- [Pilot Checklist](docs/PILOT_CHECKLIST.md)
- [Architecture](docs/2_ARCHITECTURE.md)
- [Privacy Stack](docs/3_PRIVACY.md)
