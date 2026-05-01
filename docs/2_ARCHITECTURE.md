# Dallas Buyers Club: Architecture

## System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                      USER INTERFACE LAYER                          │
│  [Phantom + Shield Wallet] → [Optimization Log] → [Discovery]      │
└──────────────────────┬───────────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────────┐
│                     PRIVACY MIDDLEWARE                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Light Proto │  │ Noir Circuits│  │ Arcium MPC   │             │
│  │ Compression │  │ ZK Validation│  │ Threshold Dec│             │
│  └─────────────┘  └──────────────┘  └──────────────┘             │
└──────────────────────┬───────────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────────┐
│                    DUAL-CHAIN SMART CONTRACT LAYER                 │
│                                                                    │
│  ┌─────────────────────────┐     ┌──────────────────────────┐    │
│  │      ALEO L1             │     │      SOLANA                 │    │
│  │  ┌───────────────────┐  │ ←→  │  ┌─────────────────────┐   │    │
│  │  │ dbc_verifier.aleo │  │     │  │ optimization_log    │   │    │
│  │  │ • verify_benchmark│  │     │  │ alliance_factory    │   │    │
│  │  │ • ZK private exec │  │     │  │ dbc_token / treasury│   │    │
│  │  └───────────────────┘  │     │  └─────────────────────┘   │    │
│  │  [Shield Wallet]        │     │  [Phantom] [Bags API]      │    │
│  │  [Relayer]  ────────────┼─────┤                            │    │
│  └─────────────────────────┘     └──────────────────────────┘    │
└──────────────────────┬───────────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────────┐
│                          STORAGE LAYER                             │
│  [IPFS] encrypted payloads · [Arweave] proof logs                  │
│  [Light Protocol] ZK-compressed state trees                        │
└──────────────────────────────────────────────────────────────────┘
```

---

## Technical Stack

### Privacy Stack (Shared)
- **Noir (Aztec)** - ZK-SNARK proofs for validation
- **Light Protocol** - ZK compression for storage
- **Arcium MPC** - Threshold decryption
- **IPFS/Arweave** - Encrypted off-chain storage

### Blockchain Infrastructure (Dual-Chain)

#### Aleo L1 (Primary Chain)
- **Aleo Testnet** - Privacy-first execution layer
- **Leo** - Domain-specific language for ZK circuits
- **Shield Wallet** - Browser extension for Aleo private keys
- **Relayer** - Bridges Aleo → Solana for token swaps

#### Solana (Secondary Chain)
- **Solana Devnet** - Fast finality, low fees
- **Anchor Framework** - Type-safe smart contracts
- **Bags API** - Token creation, bonding curves

### Application Layer
- **Preact + TypeScript** - Lightweight UI
- **Helius** - RPC, webhooks, indexing
- **Phantom** - Solana wallet connection

---

## Smart Contracts

### Aleo Verifier Program (dbc_verifier.aleo)
**Network:** Testnet
**Program ID:** `dbc_verifier.aleo`

Key functions (private inputs preserve IP; only the proof of improvement is public):
```leo
// Verify performance improvement without revealing scores
function verify_benchmark_delta(
    private before_score: u32,
    private after_score: u32,
    public  min_delta: u32,
    public  alliance_id: field,
) -> (u32, bool)

// Verify improvement subject to a max gas-cost constraint
function verify_benchmark_with_cost(
    private before_score: u32,
    private after_score: u32,
    public  min_delta: u32,
    public  max_gas_cost: u32,
    public  alliance_id: field,
) -> (u32, bool)
```

**Usage flow:**
1. Agent submits encrypted optimization log via Shield Wallet
2. Relayer verifies ZK proof on Aleo (dbc_verifier.aleo)
3. On proof success, attestation is bridged to Solana via relayer
4. Solana programs handle bonding curve + treasury

---

### Optimization Log Program (Solana)
```rust
// See: programs/optimization_log/src/lib.rs
// Core: submit log + validate/score log on-chain.
```

### DBC Token Program
```rust
// See: programs/dbc_token/src/lib.rs
// Core: staking + validator eligibility gating.
```

---

## Privacy Services

### ShieldWalletService - Aleo Private Keys
```typescript
export class ShieldWalletService {
  async connect(): Promise<WalletAddress>
  async signMessage(message): Promise<Signature>
  async encryptData(data, publicKey): Promise<EncryptedData>
  async decryptData(encrypted, privateKey): Promise<DecryptedData>
}
```

### RelayerService - Cross-Chain Bridge
```typescript
export class RelayerService {
  async submitVerification(proof, metadata): Promise<TransactionId>
  async bridgeToSolana(aleoAmount, recipient): Promise<TransactionId>
  async getBridgeStatus(txId): Promise<BridgeStatus>
}
```

### NoirService - ZK Proofs
```typescript
export class NoirService {
  async proveBenchmarkDelta(inputs): Promise<ProofResult>
  async proveExecutionDuration(inputs): Promise<ProofResult>
  async proveDataCompleteness(inputs): Promise<ProofResult>
  async proveResourceRange(inputs): Promise<ProofResult>
  async generateValidationProofs(data): Promise<ProofResult[]>
}
```

### LightProtocolService - Compression
```typescript
export class LightProtocolService {
  async compressCaseStudy(data, options): Promise<CompressedCaseStudy>
  calculateCompression(dataSize, options): CompressionEstimate
}
```

### ArciumMPCService - Threshold Decryption
```typescript
export class ArciumMPCService {
  async requestAccess(requester, input): Promise<MPCAccessRequest>
  async approveAccess(sessionId, validator): Promise<MPCAccessRequest>
  async decryptData(sessionId, requester): Promise<DecryptionResult>
}
```

---

## Data Flows (Dual-Chain)

### Full Dual-Chain Flow
```
1. Agent Builder connects with Shield Wallet (Aleo)
2. Submits encrypted optimization log to Aleo
3. dbc_verifier.aleo validates ZK proof (private scores)
4. On success: Relayer bridges tokens to Solana
5. Solana: Alliance token created via Bags API bonding curve
6. Treasury manages R&D funding per alliance
```

### Aleo Submission Flow
```
1. Connect Shield Wallet
2. Generate benchmark_delta ZK proof (private scores)
3. Call verify_benchmark_delta on Aleo
4. Receive verification_result
5. IPFS stores encrypted log for audit trail
```

### Bridge Flow (Aleo → Solana via Relayer)
```
1. Aleo verification confirmed
2. Relayer picks up event via webhook (Helius)
3. Burns Aleo credits, mints equivalent on Solana
4. Alliance token bonding curve activated
5. DUSDC/USDC follows standard SPL token
```

---

### Single-Chain (Solana) Flow
```
1. Builder connects wallet
2. Derives encryption key from wallet signature
3. Fills optimization log form
4. Selects Light Protocol compression ratio (2x-50x)
5. Data encrypted client-side
6. Compressed and submitted to blockchain
7. IPFS CID stored on-chain
```

### Validation Flow
```
1. Validator stakes 1,000+ DBC
2. Reviews encrypted optimization log
3. Generates Noir ZK proofs (4 circuits)
4. Submits validation with proof
5. Reputation score updated
6. Earns fees on approval
```

### Architect Access Flow
```
1. Architect requests access with justification
2. System forms committee of 5 validators
3. Validators review and approve (3-of-5 threshold)
4. Arcium MPC decrypts data
5. Architect views aggregated insights
```

---

## Code Organization

```
src/
├── services/
│   ├── privacy/
│   │   ├── NoirService.ts           # ZK proof generation
│   │   ├── LightProtocolService.ts  # ZK compression
│   │   ├── ArciumMPCService.ts      # Threshold decryption
│   │   └── index.ts                 # Unified exports
│   ├── AttentionTokenService.ts     # Bags API integration
│   ├── BlockchainService.ts         # Low-level blockchain
│   └── DbcTokenService.ts           # Token operations
├── components/
│   ├── EncryptedCaseStudyForm.tsx   # Case study submission
│   ├── ValidationDashboard.tsx      # Validator UI
│   ├── ResearcherDashboard.tsx      # Research access
│   └── AttentionTokenMarket.tsx     # Token trading
├── hooks/
│   ├── useValidatorStaking.ts       # Staking state
│   └── useDbcToken.ts               # Token state
└── config/
    └── solana.ts                    # Network config
```

---

## Key Design Principles

1. **Privacy by Design** - All data encrypted before leaving client
2. **ZK-First** - Prefer ZK proofs over plaintext validation
3. **Composable** - Services work independently or together
4. **Fallback Ready** - Graceful degradation when services unavailable
5. **Type-Safe** - Full TypeScript coverage

---

## Deployment Addresses

### Aleo Testnet
| Program | Program ID | Transaction ID |
|---------|-----------|---------------|
| dbc_verifier.aleo | `dbc_verifier.aleo` | `at1njg2utaxa3sx3c4w36jl8w6q7shl2y02epdawlhnvkvu6eer5qfqhvygqx` |

### Devnet (Solana)
| Program | Address |
|---------|---------|
| DBC Token | `21okj31tGEvtSBMvzjMa8uzxz89FxzNdtPaYQMfDm7FB` |
| DBC Mint | `8aNpSwFq7idN5LsX27wHndmfe46ApQkps9PgnSCLGwVT` |
| Treasury | `C5UAymmKGderVikGFiLJY88X3ZL5C49eEKTVdkKxh6nk` |
| Membership | `CB6yknfo1cBWhVH2ifkMAS2tKaDa9c9mgRiZpCzHwjzu` |
| Case Study | `8tma3jnv8ZazAKxawZsE5yh3NPt1ymsEoysS2B1w2Gxx` |

### Mainnet
| Program | Address |
|---------|---------|
| DBC Token | `J4q4vfHwe57x7hRjcQMJfV3YoE5ToqJhGeg3aaxGpump` |
