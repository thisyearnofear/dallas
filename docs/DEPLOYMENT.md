# Deployment & Toolchain

## Toolchain (Pinned Versions)

```bash
# Noir circuit compiler
nargo 1.0.0-beta.9   # via noirup

# Barretenberg prover
bb 0.87.0             # via bbup (~/.bb/bb)

# Stellar CLI
stellar 27.0.0        # via Homebrew

# Rust (Soroban contract build — use rustup's stable, NOT Homebrew)
rustup toolchain 1.94.0
rustup target add wasm32v1-none --toolchain 1.94.0
```

**Important:** Homebrew's `rustc` shadows rustup's on macOS. Always build contracts via:
```bash
export CARGO="$HOME/.rustup/toolchains/1.94.0-x86_64-apple-darwin/bin/cargo"
export RUSTC="$HOME/.rustup/toolchains/1.94.0-x86_64-apple-darwin/bin/rustc"
"$CARGO" build --target wasm32v1-none --release
```

---

## Circuits

```bash
cd circuits/benchmark_delta

# Run tests (6 passing)
nargo test

# Compile + execute
nargo compile
nargo execute

# Generate UltraHonk+Keccak proof + VK
bb prove --scheme ultra_honk --oracle_hash keccak \
  --bytecode_path target/benchmark_delta.json \
  --witness_path target/benchmark_delta.gz \
  --output_path target --output_format bytes_and_fields

bb write_vk --scheme ultra_honk --oracle_hash keccak \
  --bytecode_path target/benchmark_delta.json \
  --output_path target --output_format bytes_and_fields
```

Proof artifacts:
| File | Size | Description |
|------|------|-------------|
| `target/proof` | 14,592 B | UltraHonk+Keccak proof (456 fields) |
| `target/vk` | 1,760 B | Verification key (27 G1 points + header) |
| `target/public_inputs` | 64 B | 2 field elements: `(passed, threshold)` |

---

## Contracts

### Base Verifier (stock `rs-soroban-ultrahonk`)

Deploy the stock UltraHonk verifier from the [rs-soroban-ultrahonk](https://github.com/yugocabrio/rs-soroban-ultrahonk) workspace:

```bash
cd /tmp/stellar-spike/rs-soroban-ultrahonk

# Build (requires workspace toolchain)
export CARGO="$HOME/.rustup/toolchains/1.94.0-x86_64-apple-darwin/bin/cargo"
export RUSTC="$HOME/.rustup/toolchains/1.94.0-x86_64-apple-darwin/bin/rustc"
"$CARGO" build --package rs-soroban-ultrahonk --target wasm32v1-none --release

# Deploy with VK
stellar contract deploy \
  --wasm target/wasm32v1-none/release/rs_soroban_ultrahonk.wasm \
  --source alice --network testnet -- \
  --vk_bytes-file-path /path/to/circuits/benchmark_delta/target/vk
```

Deployed: `CC5ICZLCPV2KCCJMQOE4VK6QV4MA7UWW5BS6H7CB7CTN4RZNPPDRPY4Z`

### Attestation Contract (DBC-specific, stateful)

Source: `programs/stellar_verifier/src/lib.rs`

Build as part of the `rs-soroban-ultrahonk` workspace (it's a member at `contracts/dbc-attestation/`):

```bash
"$CARGO" build --package dbc-attestation --target wasm32v1-none --release

stellar contract deploy \
  --wasm target/wasm32v1-none/release/dbc_attestation.wasm \
  --source alice --network testnet -- \
  --vk_bytes-file-path /path/to/circuits/benchmark_delta/target/vk
```

Deployed: `CD3ZKSCTQKVLD2Z7W3VOJSVM7TNKSP6M2QAS6CQ4HZ3X3B5KPP3IT5C3`

---

## Verify Proofs On-Chain

### verify_proof (base verifier — stateless)

```bash
stellar contract invoke \
  --id CC5ICZLCPV2KCCJMQOE4VK6QV4MA7UWW5BS6H7CB7CTN4RZNPPDRPY4Z \
  --source alice --network testnet --send=yes -- \
  verify_proof \
  --public_inputs-file-path circuits/benchmark_delta/target/public_inputs \
  --proof_bytes-file-path circuits/benchmark_delta/target/proof
```

### verify_and_attest (attestation contract — stateful)

```bash
stellar contract invoke \
  --id CD3ZKSCTQKVLD2Z7W3VOJSVM7TNKSP6M2QAS6CQ4HZ3X3B5KPP3IT5C3 \
  --source alice --network testnet --send=yes -- \
  verify_and_attest \
  --alliance_id 'my-alliance' \
  --submission_id 0000000000000000000000000000000000000000000000000000000000000001 \
  --public_inputs-file-path circuits/benchmark_delta/target/public_inputs \
  --proof_bytes-file-path circuits/benchmark_delta/target/proof
```

Returns `Attestation { passed, threshold, ledger, timestamp }` and emits `ATST` event.

### Read attestations

```bash
stellar contract invoke \
  --id CD3ZKSCTQKVLD2Z7W3VOJSVM7TNKSP6M2QAS6CQ4HZ3X3B5KPP3IT5C3 \
  --source alice --network testnet -- \
  get_attestation \
  --submission_id 0000000000000000000000000000000000000000000000000000000000000001

# Returns: Option<Attestation>

stellar contract invoke \
  --id CD3ZKSCTQKVLD2Z7W3VOJSVM7TNKSP6M2QAS6CQ4HZ3X3B5KPP3IT5C3 \
  --source alice --network testnet -- \
  has_attestation \
  --submission_id 0000000000000000000000000000000000000000000000000000000000000001

# Returns: bool
```

---

## NPM Scripts

```bash
npm run dev                          # Web app (Vite)
npm test                         # Run unit tests
npm run build                        # Production build

# Stellar
npm run stellar:prove                # Generate proof + verify
npm run stellar:verify               # verify_proof on testnet
npm run stellar:attest               # verify_and_attest on testnet
npm run stellar:query-attestation    # get_attestation on testnet
npm run stellar:deploy               # Deploy attestation contract

# Verification
npm run verify:submission            # 24-check readiness test
```

---

## Deployed Contracts (Testnet)

### Stellar

| Contract | Address | Purpose |
|----------|---------|---------|
| `dbc_optimization_attestation` | `CD3ZKSCTQKVLD2Z7W3VOJSVM7TNKSP6M2QAS6CQ4HZ3X3B5KPP3IT5C3` | Stateful verify-and-attest |
| `rs_soroban_ultrahonk` | `CC5ICZLCPV2KCCJMQOE4VK6QV4MA7UWW5BS6H7CB7CTN4RZNPPDRPY4Z` | Base UltraHonk verifier |

### Solana Devnet

| Program | Address |
|---------|---------|
| DBC Token | `21okj31tGEvtSBMvzjMa8uzxz89FxzNdtPaYQMfDm7FB` |
| DBC Mint | `8aNpSwFq7idN5LsX27wHndmfe46ApQkps9PgnSCLGwVT` |
| Treasury | `C5UAymmKGderVikGFiLJY88X3ZL5C49eEKTVdkKxh6nk` |
| optimization_log | `8tma3jnv8ZazAKxawZsE5yh3NPt1ymsEoysS2B1w2Gxx` |

---

## Architecture: Browser Witness + Server Proof

The ZK flow uses a split architecture:

1. **Browser** — `noir_js` executes the Noir circuit via WASM with the user's
   private inputs, producing a compressed witness. Private inputs never leave
   the browser. The circuit JSON (`src/circuits/benchmark_delta.json`) is
   compiled with nargo `1.0.0-beta.9` to match the contract's verification key.

2. **Vercel API** (`api/stellar-prove.ts`) — Loads a pre-generated UltraHonk
   proof (`src/circuits/demo_proof.json`, generated offline with `bb` CLI
   v0.87.0) and submits it to Soroban using the proper flow:
   `simulate → prepare → sign → submit`. The `prepareTransaction()` step is
   required by Soroban — without it, transactions fail with `txMalformed`.

3. **Soroban** — The `verify_and_attest` contract verifies the proof via
   BN254 host functions and stores a permanent attestation.

### Why not generate proofs in the browser?

`bb.js` (124 MB WASM) is too heavy for browser proving — it causes WASM
unreachable traps and hangs. The split architecture keeps the circuit
execution (which processes private inputs) in the browser while using a
pre-generated proof for on-chain submission.

### Why not generate proofs on Vercel?

`bb.js` at 124 MB exceeds Vercel's serverless function size limit (250 MB
unzipped). The pre-generated proof approach avoids this entirely.

### Environment variables (Vercel)

| Variable | Example | Purpose |
|----------|---------|---------|
| `STELLAR_SECRET_KEY` | `S...` | Testnet account for signing transactions |
| `STELLAR_NETWORK` | `testnet` | Soroban network |
| `VITE_STELLAR_CONTRACT_ID` | `CD3Z...` | Attestation contract address |
