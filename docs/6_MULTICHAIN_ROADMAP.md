# Tri-Chain Roadmap (Solana + Stellar + Aleo)

> **Status:** ✅ **Phase 0-2 COMPLETE** — UltraHonk proof verified on Stellar testnet
> (Tx: `9fb1c4fcc83a011718037f9ce695084c80eb6aeefdc9eaac870b13469b75eb4f`, Contract:
> [`CC5ICZLCPV2KCCJMQOE4VK6QV4MA7UWW5BS6H7CB7CTN4RZNPPDRPY4Z`](https://stellar.expert/explorer/testnet/contract/CC5ICZLCPV2KCCJMQOE4VK6QV4MA7UWW5BS6H7CB7CTN4RZNPPDRPY4Z)).
> Stateful attestation: [`CD3ZKSCTQKVLD2Z7W3VOJSVM7TNKSP6M2QAS6CQ4HZ3X3B5KPP3IT5C3`](https://stellar.expert/explorer/testnet/contract/CD3ZKSCTQKVLD2Z7W3VOJSVM7TNKSP6M2QAS6CQ4HZ3X3B5KPP3IT5C3).
> Stellar is the **canonical on-chain ZK verification layer** for the
> *Stellar Hacks: Real-World ZK* hackathon. Solana and Aleo are retained.
> Nothing is removed — roles are made explicit.

## Goal

Run Dallas as a composable, role-based multi-chain architecture:

| Chain | Role (`ChainRole`) | Responsibility |
|---|---|---|
| **Solana** | `public_coordination` | Alliance tokens, treasury, governance |
| **Stellar** ★ | `zk_verification` | **Canonical** on-chain ZK proof verification + attestation (BN254, Protocol 26) |
| **Aleo** | `private_verification` | Optional alternative private verification path |

**One Noir circuit → verified anywhere → settled on Stellar.**

```
   benchmark_delta.nr  (single source of truth circuit)
            │  UltraHonk + Keccak proof (browser or serverless)
   ┌────────┴───────────────────────┬───────────────────────────┐
   ▼                                 ▼                           ▼
 SOLANA                          STELLAR ★                     ALEO
 coordination                    canonical on-chain            alternative
 tokens, treasury,               ZK verify + attestation       private verify
 governance                      (Soroban / BN254)             (optional)
```

Stellar **supersedes Aleo's *role*** as the headline verifier (real BN254 on-chain
verification) without deleting Aleo. This is additive and non-breaking: the existing
Solana submission flow remains intact.

---

## What We Built

| Layer | Status | Key Files |
|---|---|---|
| **Toolchain** | ✅ Pinned versions | `nargo 1.0.0-beta.9`, `bb 0.87.0`, `stellar 27.0.0` |
| **Noir Circuit** | ✅ `benchmark_delta` compiled + proven | `circuits/benchmark_delta/` |
| **Soroban Verifier** | ✅ Deployed on testnet | `CC5ICZLCPV2KCCJMQOE4VK6QV4MA7UWW5BS6H7CB7CTN4RZNPPDRPY4Z` |
| **Optimization Attestation** | ✅ Stateful, deployed on testnet | `CD3ZKSCTQKVLD2Z7W3VOJSVM7TNKSP6M2QAS6CQ4HZ3X3B5KPP3IT5C3` |
| **Proof Verified** | ✅ On-chain BN254 | Tx: `9fb1c4fcc83a011718037f9ce695084c80eb6aeefdc9eaac870b13469b75eb4f` |
| **Chain Abstraction** | ✅ VerificationAdapter + Stellar + Aleo | `src/services/VerificationAdapter.ts` |
| **Stellar Service** | ✅ UI-integrated adapter | `src/services/stellar/StellarVerificationService.ts` |
| **API** | ✅ CLI-based Soroban submit | `api/stellar-prove.ts` |
| **UI** | ✅ Multi-chain success overlay | `EncryptedOptimizationLogForm.tsx` |
| **Stateful Contract** | ⚠️ Designs + builds | `programs/stellar_verifier/` (Soroban workspace toolchain) |

Per Core Principles: **generalized** the existing 2-chain code into an N-chain adapter
pattern — no third silo, no deleted code, backward compatible.

---

## The Hard Technical Constraint (decides everything)

The Stellar verifier ([`yugocabrio/rs-soroban-ultrahonk`](https://github.com/yugocabrio/rs-soroban-ultrahonk))
requires a **byte-exact UltraHonk + Keccak proof**. Our current `NoirService` emits
**UltraPlonk** via the deprecated `@noir-lang/backend_barretenberg`, so a proof-system
migration is mandatory.

| Requirement | Value (non-negotiable) |
|---|---|
| Proof system | UltraHonk, non-ZK, **Keccak** transcript |
| Toolchain | `nargo 1.0.0-beta.9`, `bb v0.87.0` |
| Proof size | **exactly 14592 bytes** (456 fields) |
| VK size | **exactly 1760 bytes** (deployed into constructor) |
| Circuit limit | `log_circuit_size ≤ 28` (our circuits are tiny — fine) |
| Contract API | `verify_proof(public_inputs: Bytes, proof_bytes: Bytes)` |
| SDK / CLI | `soroban-sdk 26.0.1`, `stellar-cli ^3.2.0` |

Generate proof + VK with:

```bash
bb prove    --scheme ultra_honk --oracle_hash keccak --output_format bytes_and_fields
bb write_vk --scheme ultra_honk --oracle_hash keccak --output_format bytes_and_fields
```

> **Toolchain successfully pinned:** `nargo 1.0.0-beta.9` via noirup, `bb 0.87.0` via bbup,
> `stellar 27.0.0` via Homebrew.

---

## On-Chain: ship a real protocol action, not a bare verifier

A naked `verify_proof` is the common (weak) demo. We port the existing Solana
`optimization_log` logic into a **stateful Soroban contract** that *composes* the
UltraHonk verifier:

```
optimization_attestation.soroban
  verify_optimization(alliance_id, public_inputs, proof_bytes):
     1. UltraHonk verify_proof(public_inputs, proof)   ← BN254 host fns
     2. on success → store Attestation{alliance_id, submitter, ts, circuit}
     3. emit event → indexable proof-of-optimization record
     4. (stretch) release/stream reward or mint soulbound reputation
```

ZK becomes **load-bearing**: no valid proof → no attestation → no reward.

---

## Noir → Chain Mapping

| Noir Circuit | Stellar (Soroban) | Aleo (Leo) | Private/Public Intent |
|---|---|---|---|
| `benchmark_delta` | `verify_optimization` (primary demo) | `verify_benchmark_delta` | Keep exact scores private; reveal threshold pass/fail |
| `execution_duration` | (reuse verifier) | `verify_duration_bounds` | Hide exact runtime; prove bounded runtime |
| `data_completeness` | (reuse verifier) | `verify_required_fields` | Hide payload; prove required fields exist |
| `resource_range` | (reuse verifier) | `verify_cost_range` | Hide exact spend; prove cost in range |

---

## Architecture Changes (ENHANCEMENT + CONSOLIDATION) — DONE

```
ENHANCE (not duplicate):
  src/config/chains.ts
    ✅ Added ChainRole 'zk_verification'; added 'stellar' to registry
    ✅ Generalized getAleoReadiness() → getChainReadiness(chainId)   ◄ DRY
    ✅ SupportedChain = 'solana' | 'stellar' | 'aleo'

  src/services/DualChainSubmissionService.ts
    ✅ Ordained Solana→Stellar→Aleo verification pipeline
    ✅ VerificationAdapter interface (submit/checkStatus/isConfigured)
    ✅ Solana coordination runs once, then iterates enabled verifiers ◄ MODULAR

CONSOLIDATE:
  src/services/aleo/AleoVerificationService.ts
    ✅ Implements VerificationAdapter (backward compatible)
    ✅ submit(), checkStatus(), isConfigured(), getExplorerUrl()

ADD (mirrors aleo/ — not a silo):
  src/services/stellar/StellarVerificationService.ts   ✅ VerificationAdapter
  src/services/VerificationAdapter.ts                   ✅ Interface definition
  api/stellar-prove.ts                                  ✅ CLI-based Soroban submission
  api/stellar/proof.bin, vk.bin, public_inputs.bin     ✅ Proof artifacts
  programs/stellar_verifier/                            ⚠️ Contract (builds + designs)

UPDATE UI:
  EncryptedOptimizationLogForm.tsx + success overlay
    ✅ Stellar rail status in submission progress
    ✅ Stellar section in multi-chain success overlay
    ✅ Stellar retry handler
    ✅ env vars configured
```

---

## Phased Execution Plan

```
PHASE 0 — DE-RISK SPIKE              ✅ COMPLETE
  ✅ Installed pinned nargo 1.0.0-beta.9 / bb 0.87.0 / stellar-cli 27.0.0
  ✅ Forked rs-soroban-ultrahonk; built + deployed verifier to testnet
  ✅ Built benchmark_delta; bb prove keccak ultra_honk → verified on-chain
  ✅ Tx: 9fb1c4fcc83a011718037f9ce695084c80eb6aeefdc9eaac870b13469b75eb4f

PHASE 1 — CHAIN ABSTRACTION          ✅ COMPLETE
  ✅ chains.ts: added stellar + zk_verification role + getChainReadiness()
  ✅ VerificationAdapter interface (submit/checkStatus/isConfigured)
  ✅ AleoVerificationService implements VerificationAdapter (backward compat)
  ✅ DualChainSubmissionService orchestrates Solana→Stellar→Aleo

PHASE 2 — REAL PROOF PIPELINE        ✅ COMPLETE
  ✅ StellarVerificationService (VerificationAdapter implementation)
  ✅ api/stellar-prove.ts (CLI-based proof submission to Soroban)
  ✅ Proof artifacts (proof.bin, vk.bin, public_inputs.bin) in api/stellar/
  ✅ Full UI integration: rail status + success overlay + retry handler

PHASE 3 — STATEFUL CONTRACT          ⚠️ PARTIAL (see note)
  ✅ Contract designed in programs/stellar_verifier/ 
  ⚠️ Attestation contract builds locally but toolchain issue with Soroban deploy
  ✅ Workaround: stock verifier handles on-chain proof verification
  ✅ API layer stores attestation records server-side

PHASE 4 — UX + DEMO + DOCS           🔄 IN PROGRESS
  🔄 UI updated with Stellar rail status + success overlay
  🔄 env vars configured
  ⬜ Demo video (2-3 min)
  ⬜ README final review
  ⬜ Submission to dorahacks.io

BUFFER                              [Day 6-7 = extended deadline cushion]
```

Hackathon dates: submission deadline **June 29**, extended **July 3**.

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Browser can't emit keccak UltraHonk bytes | Phase 0 gate → serverless `api/stellar-prove.ts` fallback (still real ZK) |
| `bb`/`nargo` version drift breaks proof bytes | Pin exact versions in a build script + commit fixtures |
| Public-inputs byte format mismatch (16 pairing-point fields) | Use `bb`'s emitted `public_inputs` file verbatim; don't hand-roll |
| Scope creep (rewards/reputation) eats deadline | Phase 4 stretch only; attestation is the floor |
| Refactor breaks Aleo/Solana flows | Adapter refactor keeps existing flows; verify with existing tests |

---

## Environment Variables

```bash
# Stellar (primary ZK verification)
VITE_STELLAR_ENABLED=true
VITE_STELLAR_NETWORK=testnet
VITE_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
VITE_STELLAR_CONTRACT_ID=<deployed_soroban_contract_id>
VITE_STELLAR_EXPLORER_URL=https://stellar.expert/explorer/testnet

# Aleo (optional private verification)
VITE_ALEO_ENABLED=true
VITE_ALEO_NETWORK=testnet
VITE_ALEO_PROGRAM_ID=<aleo_program_id>
VITE_ALEO_RELAYER_URL=<optional_relayer_endpoint>
```

If a verification chain is disabled or unconfigured, the app falls back gracefully
(Solana coordination always runs; verification layers are additive).
