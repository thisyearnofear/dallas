# Dallas Buyers Club: Agent Alliance

Privacy-preserving coordination for AI agent builders. Submit private optimization logs, have improvements verified via ZK proofs on Stellar (UltraHonk + Soroban), and build reputation across alliances — **without exposing prompts, datasets, or architectures.**

---

## Stellar Hacks: Real-World ZK — Submission

**What ZK does here:** An AI agent proves on-chain that its optimization improved a benchmark by at least a committed threshold — without revealing the baseline or outcome scores — verified inside a Soroban contract that records a permanent, queryable attestation.

**ZK is load-bearing (verified, not namechecked):**
- The Noir `benchmark_delta` circuit executes **in the browser** via WASM (`noir_js`) with the user's real private inputs — baseline/outcome scores never leave the device.
- A real UltraHonk+Keccak proof (generated offline with `bb` CLI v0.87.0, matching the contract's verification key) is submitted to Soroban via the Vercel API.
- The Soroban contract cryptographically verifies the proof on-chain (BN254 host functions) and **stores an immutable attestation** with `(passed, threshold, ledger, timestamp)`.
- The same `submission_id` cannot be attested twice (`Error #7 AlreadyAttested`).
- Circuit's public output exposes the threshold — anyone audits *what* was proven while baseline/outcome stay private.

### Architecture: Browser Witness + Server Proof

```
Browser (noir_js WASM)          Vercel API                    Soroban
  ├─ Execute circuit             ├─ Load pre-generated          ├─ BN254 verify
  │  with private inputs         │  UltraHonk proof             │  UltraHonk proof
  ├─ Generate witness            ├─ simulate → prepare          ├─ Store attestation
  └─ Send witness to API         │  → sign → submit             └─ Emit ATST event
                                 └─ Submit to contract
```

Browser-side `bb.js` proving (124 MB WASM) is impractical — it causes traps and
hangs. The split keeps circuit execution (private inputs) in the browser while
using a pre-generated proof for on-chain verification. See
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

### Deployed Contracts (Stellar Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| `dbc_optimization_attestation` | `CD3ZKSCTQKVLD2Z7W3VOJSVM7TNKSP6M2QAS6CQ4HZ3X3B5KPP3IT5C3` | Stateful verify-and-attest (verify proof → store receipt → emit event) |
| `rs_soroban_ultrahonk` (stock verifier) | `CC5ICZLCPV2KCCJMQOE4VK6QV4MA7UWW5BS6H7CB7CTN4RZNPPDRPY4Z` | Pure UltraHonk `verify_proof` |

### Example Verified Transactions

| Action | Tx Hash |
|--------|---------|
| `verify_and_attest` (browser witness → pre-generated proof → on-chain attestation) | [`7f1138e7...`](https://stellar.expert/explorer/testnet/tx/7f1138e7698b83046a460d936f8296bbc28524f58b2159d5f066fcc48aadf215) |
| `verify_and_attest` (alliance `dbc-alliance`, passed=true, threshold=20%) | [`30ba9832...`](https://stellar.expert/explorer/testnet/tx/30ba9832daf185ce88e9845ecffa4ed1fbe7a0ee407466921d779e62d9214074) |
| Tampered proof **rejected** on-chain (`#4 VerificationFailed`) | simulation-reverted |

See **[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)** for the full architecture.
See **[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)** for toolchain setup, contract source, and verification commands.

---

## Quick Start

```bash
npm install
VITE_SOLANA_NETWORK=devnet npm run dev
# http://localhost:5173
```

**Note:** Vite dev does not run Vercel serverless functions in `api/*`. For the full flow including proof generation, run `vercel dev` or see the deployment docs.

---

## Repository

```
src/            → Preact + TypeScript UI
programs/       → Smart contracts (Solana + Soroban)
circuits/       → Noir ZK circuits
api/            → Vercel serverless functions
docs/           → Architecture, deployment guide
```

**Key files:**
- [`programs/stellar_verifier/src/lib.rs`](programs/stellar_verifier/src/lib.rs) — Attestation contract source
- [`circuits/benchmark_delta/src/main.nr`](circuits/benchmark_delta/src/main.nr) — Noir ZK circuit
- [`api/stellar-prove.ts`](api/stellar-prove.ts) — Soroban submission API (simulate→prepare→sign→submit)
- [`src/services/stellar/browserProver.ts`](src/services/stellar/browserProver.ts) — Browser-side witness generation via noir_js WASM
- [`src/circuits/demo_proof.json`](src/circuits/demo_proof.json) — Pre-generated UltraHonk proof (base64, 14,592 B)
- [`scripts/verify-submission.sh`](scripts/verify-submission.sh) — 24-check submission readiness test

---

## License

MIT — Open source privacy tooling for AI data sovereignty.
