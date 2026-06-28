# Dallas Buyers Club: Agent Alliance

Privacy-preserving coordination for AI agent builders. Submit private optimization logs, have improvements verified via ZK proofs on Stellar (UltraHonk + Soroban), and build reputation across alliances — **without exposing prompts, datasets, or architectures.**

---

## Stellar Hacks: Real-World ZK — Submission

**What ZK does here:** An AI agent proves on-chain that its optimization improved a benchmark by at least a committed threshold — without revealing the baseline or outcome scores — verified inside a Soroban contract that records a permanent, queryable attestation.

**ZK is load-bearing (verified, not namechecked):**
- Each submission generates a **fresh** Noir UltraHonk+Keccak proof from the user's real inputs — no replay.
- The Soroban contract cryptographically verifies the proof on-chain (BN254 host functions) and **stores an immutable attestation** with `(passed, threshold, ledger, timestamp)`.
- The same `submission_id` cannot be attested twice (`Error #7 AlreadyAttested`).
- Circuit's public output exposes the threshold — anyone audits *what* was proven while baseline/outcome stay private.

### Deployed Contracts (Stellar Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| `dbc_optimization_attestation` | `CD3ZKSCTQKVLD2Z7W3VOJSVM7TNKSP6M2QAS6CQ4HZ3X3B5KPP3IT5C3` | Stateful verify-and-attest (verify proof → store receipt → emit event) |
| `rs_soroban_ultrahonk` (stock verifier) | `CC5ICZLCPV2KCCJMQOE4VK6QV4MA7UWW5BS6H7CB7CTN4RZNPPDRPY4Z` | Pure UltraHonk `verify_proof` |

### Example Verified Transactions

| Action | Tx Hash |
|--------|---------|
| `verify_and_attest` (fresh proof → stored attestation + `ATST` event) | [`aec773fc...`](https://stellar.expert/explorer/testnet/tx/aec773fcbb0d99f39af386154edb6f533ef3d9156927a3647518b9ed498b8729) |
| `verify_and_attest` (alliance `0x0001`) | `fe48c6e8...` |
| Fresh proof verified (stock verifier) | `1d39bd4e...` |
| Tampered proof **rejected** on-chain (`#4 VerificationFailed`) | simulation-reverted |

See **[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)** for the full architecture.
See **[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)** for toolchain setup, contract source, and verification commands.

---

## Quick Start

```bash
pnpm install
VITE_SOLANA_NETWORK=devnet pnpm dev
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
- [`api/stellar-prove.ts`](api/stellar-prove.ts) — Fresh proof generation + attestation API
- [`scripts/verify-submission.sh`](scripts/verify-submission.sh) — 24-check submission readiness test

---

## License

MIT — Open source privacy tooling for AI data sovereignty.
