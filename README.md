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

## 🏆 Aleo Buildathon 2026 Submission

**Project:** Dallas Buyers Club: Agent Alliance  
**Track:** Privacy & Infrastructure  
**Demo URL:** https://dallasbuyersclub.vercel.app/  
**Repository:** https://github.com/thisyearnofear/dallas

### Progress Changelog

| Date | Milestone |
|------|-----------|
| Apr 14 | Dual-chain architecture (Solana + Aleo) working |
| Apr 15 | ZK proof generation via Noir circuits |
| Apr 16 | Success overlay with dual-status panel |
| Apr 16 | Aleo explorer links with real tx hash (`at1njg2utaxa3sx3c4w36jl8w6q7shl2y02epdawlhnvkvu6eer5qfqhvygqx`) |

---

## 🏗 System Architecture (Dual-Chain)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Agent Alliance UI                        │
│              (Preact + Tailwind + Terminal Aesthetic)          │
└─────────────────────────────────────────────────────────────────┘
                                │
            ┌───────────────────┼───────────────────┐
            ▼                   ▼                   ▼
   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
   │   Solana    │      │    Aleo     │      │   IPFS/     │
   │   Program   │      │   Verifier  │      │  Arweave    │
   │             │      │             │      │             │
   │ optimization│      │ dbc_verifier│      │  Encrypted  │
   │ _log        │      │  .aleo      │      │  Logs       │
   └─────────────┘      └─────────────┘      └─────────────┘
        │                      │                      │
        ▼                      ▼                      ▼
   [Token / Bonding]    [ZK Verification]    [Off-chain Storage]
   [Curve / Treasury]   [Privacy Preserving]  [AES-256]
```

### Dual-Chain Flow
1. User submits encrypted optimization log (AES-256)
2. **Solana**: Public token coordination, bonding curves, governance
3. **Aleo**: Private ZK verification via `dbc_verifier.aleo` program
4. Validators verify proof without seeing proprietary data
5. Alliance treasury rewards contributor

### Key Contracts
| Program | Address | Network |
|---------|---------|---------|
| `dbc_verifier.aleo` | `at1njg2utaxa3sx3c4w36jl8w6q7shl2y02epdawlhnvkvu6eer5qfqhvygqx` | Aleo Testnet |
| `optimization_log` | (Solana devnet) | Solana devnet |

---

## 📜 License

MIT Licensed - Open source privacy tooling for AI data sovereignty.

## Docs
- [Getting Started](docs/0_GETTING_STARTED.md)
- [Pilot Checklist](docs/PILOT_CHECKLIST.md)
- [Architecture](docs/2_ARCHITECTURE.md)
- [Privacy Stack](docs/3_PRIVACY.md)
