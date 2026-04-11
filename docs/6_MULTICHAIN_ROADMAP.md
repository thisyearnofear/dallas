# Multi-Chain Roadmap (Solana + Aleo)

## Goal

Run Dallas as a split architecture:

- **Solana:** public coordination (alliance tokens, treasury, governance)
- **Aleo:** private verification (ZK validation and encrypted optimization attestations)

This preserves current momentum while adding Aleo-native privacy execution.

---

## Current Foundation

Implemented in this repo:

- `src/config/chains.ts`
  - Single source of truth for chain roles and Aleo toggles.
- `src/services/aleo/AleoVerificationService.ts`
  - Isolated Aleo adapter for verification submission.
- `src/services/DualChainSubmissionService.ts`
  - Orchestrates Solana submission first, then optional Aleo verification.

This is additive and non-breaking: existing Solana submission flow remains intact.

---

## Noir → Leo Mapping

| Existing Noir Circuit | Aleo Leo Program Function | Private/Public Intent |
|---|---|---|
| `benchmark_delta` | `verify_benchmark_delta` | Keep exact scores private; reveal threshold pass/fail |
| `execution_duration` | `verify_duration_bounds` | Hide exact runtime; prove bounded runtime |
| `data_completeness` | `verify_required_fields` | Hide payload content; prove required fields exist |
| `resource_range` | `verify_cost_range` | Hide exact spend; prove cost is in accepted range |

---

## Minimal Execution Plan

1. Deploy non-trivial Leo verification program to Aleo testnet.
2. Wire Shield Wallet in frontend for Aleo signing.
3. Connect `AleoVerificationService` to relayer/API endpoint.
4. Submit dual-chain flow from one UI action:
   - Solana tx for coordination/reward rails.
   - Aleo tx for private verification record.
5. Add status panel showing both chain transaction states.

---

## Environment Variables

- `VITE_ENABLE_ALEO=true`
- `VITE_ALEO_NETWORK=testnet`
- `VITE_ALEO_PROGRAM_ID=<aleo_program_id>`
- `VITE_ALEO_RELAYER_URL=<optional_relayer_endpoint>`

If Aleo is disabled or unconfigured, the app falls back to Solana-only behavior.

