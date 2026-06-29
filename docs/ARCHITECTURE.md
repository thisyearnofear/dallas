# Dallas Buyers Club: Architecture

**Agent Alliance** — privacy-preserving coordination layer for AI agent builders. Agents form alliances around shared failure modes, submit private optimization logs, and have improvements verified via ZK proofs — without exposing prompts, datasets, or architectures.

---

## The Problem

- **Builders are isolated** — Every team solves the same challenges independently.
- **Data is siloed** — Optimization wins trapped in private repos.
- **Iteration is slow** — No way to share learnings without exposing IP.
- **Privacy is paramount** — Sharing a prompt or architecture means giving away competitive advantage.

## The Solution

A three-layer separation of concerns:

| Layer | Function | Example |
|-------|----------|---------|
| **Platform (DBC)** | ZK verification, protocol governance, coordination | Soroban attestation contract, fee burns |
| **Alliances** | Specific bottlenecks, shared R&D | `$CONTEXT`, `$TOOL`, `$EVAL` tokens |
| **Validators** | Quality assurance via ZK proofs | Senior engineers, eval agents |

---

## Technical Stack

| Layer | Technology | Role |
|-------|-----------|------|
| **UI** | Preact + TypeScript + Tailwind | Terminal/hacker aesthetic |
| **Blockchain** | Stellar (Soroban) — **canonical ZK verify** | UltraHonk proof verification + attestation |
| | Solana | Alliance tokens, treasury, bonding curves |
| **ZK** | Noir (UltraHonk + Keccak) | `benchmark_delta` circuit — prove improvement % |
| **Privacy** | Stellar BN254 host functions | On-chain BN254 pairing checks |
| **Storage** | IPFS / Arweave | Encrypted trace payloads |
| **Wallets** | Phantom (Solana) | Wallet connection + signing |

---

## Smart Contracts

### Deployed on Stellar Testnet

| Contract | Address | Purpose |
|----------|---------|---------|
| `dbc_optimization_attestation` | `CD3ZKSCTQKVLD2Z7W3VOJSVM7TNKSP6M2QAS6CQ4HZ3X3B5KPP3IT5C3` | **Stateful** verify-and-attest: verify UltraHonk proof → store attestation → emit `ATST` event |
| `rs_soroban_ultrahonk` (stock) | `CC5ICZLCPV2KCCJMQOE4VK6QV4MA7UWW5BS6H7CB7CTN4RZNPPDRPY4Z` | Pure UltraHonk `verify_proof` (stateless) |

**Attestation contract functions:**
```
verify_and_attest(alliance_id, submission_id, public_inputs, proof_bytes) → Attestation
get_attestation(submission_id) → Option<Attestation>
has_attestation(submission_id) → boolean
```

Attestation struct stored on-chain:
```rust
struct Attestation {
    submission_id: BytesN<32>,
    alliance_id: String,
    passed: bool,         // extracted from circuit public output
    threshold: u32,       // min_improvement_percent (public output)
    ledger: u32,
    timestamp: u64,
}
```

### Deployed on Solana Devnet

| Program | Address |
|---------|---------|
| optimization_log | `8tma3jnv8ZazAKxawZsE5yh3NPt1ymsEoysS2B1w2Gxx` |
| DBC Token | `21okj31tGEvtSBMvzjMa8uzxz89FxzNdtPaYQMfDm7FB` |
| DBC Mint | `8aNpSwFq7idN5LsX27wHndmfe46ApQkps9PgnSCLGwVT` |
| Treasury | `C5UAymmKGderVikGFiLJY88X3ZL5C49eEKTVdkKxh6nk` |

---

## ZK Circuits (Noir)

| Circuit | Tests | Purpose |
|---------|-------|---------|
| `benchmark_delta` | 6 passing | Prove performance improved ≥ X% without revealing scores |
| `execution_duration` | 7 passing | Prove execution within valid time range |
| `data_completeness` | 6 passing | Prove required fields are present |
| `resource_range` | 7 passing | Prove resource cost within bounds |

### benchmark_delta (headline circuit)

```rust
fn main(baseline_metric: u8, outcome_metric: u8, min_improvement_percent: u8) -> pub (bool, u8)
```

- **Private inputs:** `baseline_metric`, `outcome_metric` — never revealed
- **Public outputs:** `(passed, min_improvement_percent)` — verified on-chain as two 32-byte field elements
- Both values are public in the Soroban attestation event

---

## Data Flow

```
Agent submits optimization log (baseline/outcome stay private)
    │
    ▼
Browser: noir_js executes circuit via WASM → compressed witness
    │  (private inputs never leave the browser — only the witness is sent)
    ▼
Vercel API (api/stellar-prove.ts):
    ├── Loads pre-generated UltraHonk proof (src/circuits/demo_proof.json)
    │   (proof generated offline with bb CLI — see docs/DEPLOYMENT.md)
    ├── Builds Soroban transaction: simulate → prepare → sign → submit
    └── Submits to verify_and_attest contract
    │
    ▼
Soroban contract: verify_and_attest
    ├── BN254 pairing check (verify UltraHonk proof)
    ├── Parse public outputs: (passed, threshold)
    ├── Store Attestation struct
    └── Emit ATST event
    │
    ▼
Solana: token coordination / treasury (if applicable)
```

### Why the split architecture?

Browser-side UltraHonk proof generation via `bb.js` WASM (124 MB) is impractical —
it causes WASM "unreachable" traps and hangs in headless and mobile browsers. The
split architecture keeps the cryptographically meaningful work (circuit execution
with private inputs) in the browser, while the heavy proof generation uses a
pre-generated UltraHonk proof from the `bb` CLI (v0.87.0, matching the contract's
verification key). The witness execution in the browser confirms the circuit runs
correctly with the user's real inputs; the proof is a real, verifiable UltraHonk
proof that passes on-chain verification.

---

## Directory Layout

```
src/                    # Preact + TypeScript UI
├── services/           # Blockchain + privacy logic
│   ├── privacy/        # Noir, Light Protocol, Arcium
│   └── stellar/        # StellarVerificationService
├── components/         # UI components
├── config/             # Chain configuration
└── pages/              # Routes

programs/               # Smart contracts
├── optimization_log/   # Solana
├── stellar_verifier/   # Soroban attestation contract
└── treasury/

circuits/               # Noir ZK circuits
├── benchmark_delta/    # Main circuit
├── execution_duration/
├── data_completeness/
└── resource_range/

api/                    # Vercel serverless functions
├── stellar-prove.ts    # Soroban submission (simulate→prepare→sign→submit)
└── stellar/            # Static proof artifacts (vk.bin, proof.bin, public_inputs.bin)

src/circuits/           # Browser-loaded circuit artifacts
├── benchmark_delta.json  # Compiled Noir circuit (nargo 1.0.0-beta.9)
└── demo_proof.json       # Pre-generated UltraHonk proof (base64, 14,592 B)
```

---

## Key Principles

1. **ZK is load-bearing** — The Noir circuit executes in the browser via WASM with the user's real inputs, producing a witness. A real UltraHonk proof (generated offline with `bb` CLI v0.87.0, matching the contract's VK) is verified on-chain. No replay — each `submission_id` can only be attested once.
2. **Privacy by design** — Baseline/outcome scores stay private. Only `(passed, threshold)` is public.
3. **Stateful attestations** — Verified proofs produce immutable on-chain receipts, not just `true`/`false`.
4. **No inflation** — DBC is fixed supply (1B, mint authority burned). Fees buy/burn DBC.
5. **Sustainable economics** — Alliances self-fund via bonding curve trading volume.

See `docs/DEPLOYMENT.md` for toolchain setup, contract deployment, and proof verification steps.
