# Dallas Buyers Club: Architecture

## System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                      USER INTERFACE LAYER                        │
│  [Shield Wallet] → [Aleo Verification] → [Solana Bonding Curve]    │
└──────────────────────┬──────────────────────────────────────────┘
                        │
┌──────────────────────▼──────────────────────────────────────────┐
│                      DUAL-CHAIN ARCHITECTURE                      │
│                                                               │
│  ┌─────────────────────────┐     ┌──────────────────────────┐ │
│  │      ALEO L1             │     │      SOLANA                │ │
│  │  ┌───────────────────┐  │     │  ┌─────────────────────┐  │ │
│  │  │ dbc_verifier.aleo  │  │ ←→ │  │ alliance_factory   │  │ │
│  │  │ • verify_benchmark │  │     │  │ • create_bonding   │  │ │
│  │  │ • ZK private      │  │     │  │ • manage_treasury │  │ │
│  │  └───────────────────┘  │     │  └─────────────────────┘  │ │
│  │                         │     │                            │ │
│  │  [Shield Wallet]        │     │  [Phantom]                  │ │
│  │  [Relayer]  ←───────→ │     │  [Bags API]                 │ │
│  └─────────────────────────┘     └──────────────────────────┘ │
│                                                               │
│  PRIVACY STACK: Light Protocol + Noir + Arcium MPC + IPFS/Arweave  │
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
**Deployed:** 2026-04-11 (Testnet)
**Program ID:** `dbc_verifier.aleo`
**Transaction ID:** `at1njg2utaxa3sx3c4w36jl8w6q7shl2y02epdawlhnvkvu6eer5qfqhvygqx`

Key functions:
```leo
// Verify performance improvement without revealing scores
function verify_benchmark_delta:
    inputs:
        old_score: u32.public
        new_score: u32.public  
        min_improvement: u32.public
        verification_hash: field.public
    outputs:
        u32  // verification_result

// Verify with gas cost constraint
function verify_benchmark_with_cost:
    inputs:
        old_score: u32.public
        new_score: u32.public
        min_improvement: u32.public
        max_gas_cost: u32.public
        verification_hash: field.public
    outputs:
        u32
```

**Usage Flow:**
1. Agent submits encrypted optimization log to Shield Wallet
2. Relayer verifies ZK proof on Aleo (dbc_verifier.aleo)
3. On proof success, tokens bridged to Solana via relayer
4. Solana programs handle bonding curve + treasury

---

### Case Study Program (Solana)
```rust
// Key instructions
pub fn submit_encrypted_case_study(
    ctx: Context<SubmitCaseStudy>,
    encrypted_data: Vec<u8>,
    light_proof: LightProof,
) -> Result<Pubkey>

pub fn validator_prove_integrity(
    ctx: Context<ValidateWithProof>,
    proof: Vec<u8>,  // Noir ZK-SNARK proof
    public_inputs: ValidationInputs,
) -> Result<()>

pub fn grant_selective_access(
    ctx: Context<GrantAccess>,
    arcium_params: ArciumParams,
) -> Result<()>
```

### DBC Token Program
```rust
// Key instructions
pub fn stake_for_validation(
    ctx: Context<StakeForValidation>,
    amount: u64,
) -> Result<()>

pub fn reward_case_study(
    ctx: Context<RewardCaseStudy>,
    case_study: Pubkey,
) -> Result<()>

pub fn slash_validator(
    ctx: Context<SlashValidator>,
    validator: Pubkey,
    percentage: u8,  // 50% for fraud
) -> Result<()>
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
