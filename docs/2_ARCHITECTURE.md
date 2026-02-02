# Dallas Buyers Club: Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                       │
│  [Wallet Connection] → [Case Study Submission] → [Discovery] │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   PRIVACY MIDDLEWARE                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Light Proto │  │ Noir Circuits│  │ Arcium MPC   │       │
│  │ Compression │  │ ZK Validation│  │ Threshold Dec│       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  SMART CONTRACT LAYER                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ case_study.rs                                       │    │
│  │ • submit_encrypted_case_study()                     │    │
│  │ • validator_prove_integrity()  [ZK proof required]  │    │
│  │ • grant_selective_access()     [Threshold decrypt]  │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ dbc_token.rs                                        │    │
│  │ • stake_for_validation()                            │    │
│  │ • reward_validator()                                │    │
│  │ • slash_on_dispute()                                │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    STORAGE LAYER                             │
│  [IPFS] → Encrypted case study payloads                     │
│  [Arweave] → Immutable proof logs                           │
│  [Light Protocol] → ZK-compressed state trees               │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Stack

### Privacy Technologies
- **Noir (Aztec)** - ZK-SNARK proofs for validation
- **Light Protocol** - ZK compression for storage
- **Arcium MPC** - Threshold decryption
- **IPFS/Arweave** - Encrypted off-chain storage

### Blockchain Infrastructure
- **Solana Devnet** - Fast finality, low fees
- **Anchor Framework** - Type-safe smart contracts
- **Bags API** - Token creation, bonding curves

### Application Layer
- **Preact + TypeScript** - Lightweight UI
- **Helius** - RPC, webhooks, indexing
- **Phantom** - Wallet connection

---

## Smart Contracts

### Case Study Program
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

### NoirService - ZK Proofs
```typescript
export class NoirService {
  async proveSymptomImprovement(inputs): Promise<ProofResult>
  async proveDurationVerification(inputs): Promise<ProofResult>
  async proveDataCompleteness(inputs): Promise<ProofResult>
  async proveCostRange(inputs): Promise<ProofResult>
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

## Data Flows

### Case Study Submission
```
1. Patient connects wallet
2. Derives encryption key from wallet signature
3. Fills case study form
4. Selects Light Protocol compression ratio (2x-50x)
5. Data encrypted client-side
6. Compressed and submitted to blockchain
7. IPFS CID stored on-chain
```

### Validation Flow
```
1. Validator stakes 1,000+ DBC
2. Reviews encrypted case study
3. Generates Noir ZK proofs (4 circuits)
4. Submits validation with proof
5. Reputation score updated
6. Earns fees on approval
```

### Research Access Flow
```
1. Researcher requests access with justification
2. System forms committee of 5 validators
3. Validators review and approve (3-of-5 threshold)
4. Arcium MPC decrypts data
5. Researcher views aggregated insights
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

### Devnet
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
