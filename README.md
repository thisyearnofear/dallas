# Dallas Buyers Club: Agent Alliance

Privacy-preserving coordination for AI agent builders. Prove your agent improved — without revealing your prompts, weights, or benchmarks — using zero-knowledge proofs verified on **Stellar (Soroban)**.

**The problem:** AI agent developers have proprietary moats (prompts, fine-tuned weights, tool chains, customer data). They want to prove their agent got better and build reputation, but sharing benchmarks means exposing IP. It's the Agentic Dark Forest — nobody wants to reveal their edge.

**The solution:** A Noir ZK circuit generates a proof that a benchmark improved by at least a threshold, without revealing the actual scores. The proof is verified **on-chain in a Soroban smart contract**, which stores a permanent, queryable attestation. Private inputs never leave the browser.

---

## Stellar Hacks: Real-World ZK — Submission

### What ZK does here

An AI agent proves on-chain that its optimization improved a benchmark by at least a committed threshold — **without revealing the baseline or outcome scores** — verified inside a Soroban contract that records a permanent, queryable attestation.

### ZK is load-bearing (verified, not namechecked)

1. **Browser executes the Noir circuit** via WASM (`noir_js`) with the user's real private inputs — baseline/outcome scores never leave the device.
2. **Browser generates a real UltraHonk proof** from the witness using `bb.js` (Barretenberg WASM). The proof is cryptographically tied to the actual inputs — no cached or pre-generated proofs.
3. **Soroban contract verifies the proof on-chain** using the `ultrahonk_soroban_verifier` crate (BN254 operations, Keccak transcript). If verification passes, it stores an immutable attestation with `(passed, threshold, ledger, timestamp)`.
4. **Replay protection:** The same `submission_id` cannot be attested twice (`Error #7 AlreadyAttested`).
5. **Public auditability:** The circuit's public output exposes the threshold — anyone can audit *what* was proven on stellar.expert while baseline/outcome stay private.

### Architecture: Browser Proof + On-Chain Verification

```
Browser (noir_js + bb.js WASM)       Vercel API                    Soroban Contract
  ├─ Execute Noir circuit              ├─ Receive proof +            ├─ Load verification key
  │  with private inputs               │  public inputs              ├─ BN254 UltraHonk verify
  ├─ Generate compressed witness       ├─ Build Soroban transaction  │  (on-chain, in contract)
  ├─ Generate UltraHonk proof          ├─ simulate → prepare         ├─ Store immutable attestation
  │  via bb.js WASM                    │  → sign → submit            ├─ Emit ATST event
  └─ Send proof + public inputs        └─ Return tx hash             └─ Reject replays
     (private inputs stay in browser)
```

**Key design decision:** Proof generation happens entirely in the browser. The server never sees private inputs, never generates proofs, and never caches them. The server's only role is to submit the browser-generated proof to Soroban — it's a thin relay, not a trusted party.

### The Noir Circuit

**File:** [`circuits/benchmark_delta/src/main.nr`](circuits/benchmark_delta/src/main.nr)

The circuit proves: *"I know two scores (baseline, outcome) in the valid range 1-10 such that the improvement from baseline to outcome meets or exceeds a minimum threshold percentage, and I commit to that threshold publicly."*

- **Private inputs:** `baseline_metric`, `outcome_metric` (the actual benchmark scores — never revealed)
- **Public output:** `(passed: bool, min_improvement_percent: u8)` — visible on-chain so anyone can audit what was claimed
- **Constraints:** Range checks (1-10), improvement calculation, threshold comparison

### The Soroban Verifier Contract

**File:** [`programs/stellar_verifier/src/lib.rs`](programs/stellar_verifier/src/lib.rs)

The contract is a stateful verify-and-attest system:
- `__constructor(vk_bytes)` — initialized once with the circuit's verification key (immutable, no admin)
- `verify_and_attest(alliance_id, submission_id, public_inputs, proof_bytes)` — verifies the UltraHonk proof on-chain, stores an `Attestation` struct, emits an `ATST` event
- `get_attestation(submission_id)` — public read for any attestation
- `vk_bytes()` — public read of the verification key for off-chain auditability

**Verifier dependency:** [`vendor/ultrahonk-soroban-verifier/`](vendor/ultrahonk-soroban-verifier/) — vendored from [yugocabrio/rs-soroban-ultrahonk](https://github.com/yugocabrio/rs-soroban-ultrahonk). The contract builds with `cargo check` from the repo root — no external paths or temp directories.

### Deployed Contracts (Stellar Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| `dbc_optimization_attestation` | `CD3ZKSCTQKVLD2Z7W3VOJSVM7TNKSP6M2QAS6CQ4HZ3X3B5KPP3IT5C3` | Stateful verify-and-attest (verify proof → store receipt → emit event) |

### Example Verified Transactions

| Action | Tx Hash |
|--------|---------|
| `verify_and_attest` (alliance `dbc-alliance`, passed=true, threshold=20%) | [`30ba9832...`](https://stellar.expert/explorer/testnet/tx/30ba9832daf185ce88e9845ecffa4ed1fbe7a0ee407466921d779e62d9214074) |
| `verify_and_attest` (browser witness → on-chain attestation) | [`7f1138e7...`](https://stellar.expert/explorer/testnet/tx/7f1138e7698b83046a460d936f8296bbc28524f58b2159d5f066fcc48aadf215) |
| Tampered proof **rejected** on-chain (`#4 VerificationFailed`) | simulation-reverted |

### Live Demo

The app is deployed at [dallasbuyersclub.vercel.app](https://dallasbuyersclub.vercel.app). You can:
1. Pick a metric (latency, pass@1, tool-call accuracy, etc.)
2. Enter baseline and outcome scores (1-10 scale)
3. Set a minimum improvement threshold
4. Click "Generate Proof" — the browser executes the Noir circuit and generates a real UltraHonk proof via bb.js WASM
5. The proof is submitted to Soroban testnet and verified on-chain
6. View the permanent attestation on stellar.expert

---

## TestSprite S3: Build the Loop — Submission

### What the loop does here

An AI coding agent (Claude Opus 4.7) drove three write-verify-fix iterations on this codebase using the [TestSprite CLI](https://docs.testsprite.com/), catching real bugs on the live URL, committing fixes, and re-running the same tests to prove each fix. Every catch and fix is committed with the specific TestSprite run ID that verified it, so `git log` traces the loop end-to-end.

### The loop is load-bearing (bugs caught, not manufactured)

Full trace in [LOOP.md](LOOP.md). Highlights:

- **Iteration 1** — Stellar happy path smoke pass. Caught a **modal that traps first-visit users** on `/submit` (blocked run → fix `a724649` → re-run passed 11/11).
- **Iteration 2** — Form interaction + honesty checks. TestSprite runs all green. Code review caught **`ValidatorReputationSystem` fabricating a leaderboard and injecting the current user at rank 3** (fix `07bb5e6`); also caught **three API endpoints seeding fake KV records on cold start** (fix `ab63b01`, 140 lines deleted).
- **Iteration 3** — Periphery pages sweep. **3 of 5 TestSprite runs caught real bugs**: `/referrals` fabricated "420+ Nodes Referred" metrics, `/achievements` shows fake unlocked badges to unconnected users, `/products` misleading URL/catalog. All three fixed in `b1820f0`, all three re-verified green.

Total: **8 real bugs caught, 8 fixes committed, all 4 TestSprite-caught bugs re-verified green live**. Credit efficiency: **46 / 150** credits.

### CI/CD Integration (+5 innovation)

TestSprite runs on every PR against the live URL. Upgraded the existing CI to Node 20 + npm to match TestSprite's runtime. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml). The job gracefully skips when `TESTSPRITE_API_KEY` / `TESTSPRITE_PROJECT_ID` aren't configured, so it won't red-flag PRs before those secrets land.

### Test plan suite

Nine JSON plans in [`testsprite-plans/`](testsprite-plans/), each asserting **concrete observable outcomes** (no narrative "verify it works" assertions — the TestSprite onboarding skill's discipline). Every plan tied to a specific user flow or honesty check.

---

## What's Real vs. What's Demo Data

Being honest about the state of the project (per hackathon guidelines):

| Component | Status |
|-----------|--------|
| Noir ZK circuit (`benchmark_delta`) | **Real** — compiles with nargo 1.0.0-beta.9, generates real proofs |
| Browser proof generation (noir_js + bb.js) | **Real** — witness + UltraHonk proof generated in browser via WASM |
| Soroban on-chain verification | **Real** — contract deployed on testnet, verifies proofs, stores attestations |
| Attestation feed (home page) | **Real** — queries actual Soroban events via `/api/stellar-attestations` |
| Proof history (localStorage) | **Real** — stores actual tx hashes from verified proofs |
| SDK wrapper (`src/sdk/index.ts`) | **Real** — wraps the prove + anchor flow, works locally (not yet on npm) |
| Alliance cards (home page) | **Demo data** — member/proof counts are illustrative, labeled with "DEMO DATA" badge |
| Alliance ticker (bottom bar) | **Simulated** — labeled "Demo Ticker", not real activity |
| Solana programs (optimization_log, etc.) | **Deployed but sparse** — program ID fixed, but devnet has limited data. Coordination-layer-v0.1; full staking/reward loop deferred (see [LOOP.md](LOOP.md) for scope note) |
| Attention token market | **Empty on devnet** — bonding curves launch on Solana mainnet |
| Referrals / achievements / products pages | **Preview data — labeled** as of `b1820f0`. Illustrative numbers surfaced by iteration 3 of the TestSprite loop, now clearly badged as preview |
| Validator reputation / API mock records | **Removed** as of `07bb5e6` and `ab63b01`. Fabricated leaderboard, fake `pending_001` / `task_001` KV records deleted; components use honest empty states |

---

## Quick Start

```bash
npm install
npm run dev
# http://localhost:5173
```

**Note:** Vite dev doesn't run Vercel serverless functions in `api/*`. For the full ZK proof flow (browser → API → Soroban), use `vercel dev` or deploy to Vercel.

### Building the Soroban Contract

```bash
cd programs/stellar_verifier
cargo check     # Uses vendored verifier — no external paths needed
```

### Compiling the Noir Circuit

```bash
# Install nargo 1.0.0-beta.9
noirup -v 1.0.0-beta.9

cd circuits/benchmark_delta
nargo check
nargo compile
```

---

## Repository

```
src/                    → Preact + TypeScript UI
  services/stellar/     → Browser prover (noir_js + bb.js), Stellar verification service
  sdk/                  → Minimal SDK wrapper (prove + anchor)
programs/stellar_verifier/  → Soroban attestation contract (Rust)
vendor/ultrahonk-soroban-verifier/  → Vendored UltraHonk verifier crate
circuits/benchmark_delta/   → Noir ZK circuit (benchmark improvement proof)
api/                    → Vercel serverless functions (stellar-prove, stellar-attestations)
docs/                   → Architecture, deployment guide
```

**Key files:**
- [`programs/stellar_verifier/src/lib.rs`](programs/stellar_verifier/src/lib.rs) — Soroban attestation contract
- [`circuits/benchmark_delta/src/main.nr`](circuits/benchmark_delta/src/main.nr) — Noir ZK circuit
- [`src/services/stellar/browserProver.ts`](src/services/stellar/browserProver.ts) — Browser-side proof generation (noir_js + bb.js)
- [`api/stellar-prove.ts`](api/stellar-prove.ts) — Soroban submission API (receive proof → submit on-chain)
- [`src/sdk/index.ts`](src/sdk/index.ts) — SDK wrapper for programmatic prove + anchor

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| ZK Circuit | Noir 1.0.0-beta.9 (`benchmark_delta`) |
| Proof System | UltraHonk + Keccak (via bb.js browser WASM) |
| On-chain Verification | Soroban (Stellar testnet) + `ultrahonk_soroban_verifier` |
| Frontend | Preact + TypeScript + Vite |
| API | Vercel serverless functions |
| Crypto Primitives | BN254 elliptic curve operations (in Soroban host) |

---

## License

MIT — Open source privacy tooling for AI data sovereignty.
