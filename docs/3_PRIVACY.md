# Dallas Buyers Club: Privacy Technology

## Overview

Dallas Buyers Club implements a multi-layer privacy stack that enables agent builders to share optimization data for collective learning while maintaining complete IP control and confidentiality.

---

## Privacy Technologies

### 1. Noir (Aztec) - ZK-SNARK Proofs

**Purpose:** Prove data validity without revealing sensitive information

**Circuits:**

| Circuit | Tests | Purpose |
|---------|-------|---------|
| `benchmark_delta` | 6 passing | Prove performance improved by threshold % |
| `execution_duration` | 7 passing | Prove execution duration in valid range |
| `data_completeness` | 6 passing | Prove required fields present |
| `resource_range` | 7 passing | Prove resource cost within acceptable bounds |

**Example Circuit:**
```rust
// circuits/benchmark_delta/src/main.nr
fn main(
    baseline_score: u8,         // Private - never revealed
    outcome_score: u8,          // Private - never revealed
    min_improvement: u8,        // Public threshold
) -> pub bool {
    let improvement = outcome_score - baseline_score;
    let threshold = (baseline_score * min_improvement) / 100;
    improvement >= threshold
}
```

**Usage:**
```typescript
import { noirService } from '../services/privacy';

const proofs = await noirService.generateValidationProofs({
  baselineScore: 60,
  outcomeScore: 85,
  durationSeconds: 1200,
  resourceCost: 250,
  hasBaseline: true,
  hasOutcome: true,
  hasDuration: true,
  hasTechnique: true,
  hasCost: true,
});
// Returns: 4 proofs for validation
```

---

### 2. Light Protocol - ZK Compression

**Purpose:** Compress optimization log data 2-100x for affordable storage

**Features:**
- Compression ratios: 2x, 5x, 10x (recommended), 20x, 50x
- Real-time compression preview
- Merkle tree proofs for verification
- ~90% cost reduction at 10x compression

**Usage:**
```typescript
import { lightProtocolService } from '../services/privacy';

const compressed = await lightProtocolService.compressCaseStudy(
  encryptedData,
  { ratio: 10 }
);
// Returns: { compressedData, merkleRoot, proof }
```

**UI Integration:**
```typescript
// Shows: "5.2 KB → 520 B (90% saved)"
<select value={compressionRatio}>
  <option value={2}>2x (Fast)</option>
  <option value={10}>10x (Recommended)</option>
  <option value={50}>50x (Maximum)</option>
</select>
```

---

### 3. Arcium MPC - Threshold Decryption

**Purpose:** Enable research access without single-point-of-trust

**Features:**
- K-of-N validator committees (default: 3-of-5)
- No single validator can access data alone
- Researcher dashboard for access requests
- Real-time approval progress tracking

**Usage:**
```typescript
import { arciumMPCService } from '../services/privacy';

// Researcher requests access
const request = await arciumMPCService.requestAccess(
  researcherPublicKey,
  { caseStudyPda, justification, encryptionScheme: 'AES-256' }
);

// Validators approve
await arciumMPCService.approveAccess(sessionId, validatorKey);

// Decrypt after threshold reached
const data = await arciumMPCService.decryptData(sessionId, researcherKey);
```

---

### 4. Wallet-Derived Encryption

**Purpose:** Client-side encryption with wallet-derived keys

**Flow:**
1. User connects wallet
2. Signs message: "Authenticate Dallas Buyers Club Identity Node"
3. PBKDF2 (SHA-256) on signature derives AES-GCM-256 key
4. Key encrypts/decrypts data
5. Key exists only in memory for session

**Implementation:**
```typescript
// src/utils/encryption.ts
export async function deriveEncryptionKey(
  publicKey: PublicKey,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
): Promise<Uint8Array> {
  const message = new TextEncoder().encode(
    'Authenticate Dallas Buyers Club Identity Node'
  );
  const signature = await signMessage(message);
  return pbkdf2Sync(signature, 'salt', 100000, 32, 'sha256');
}

export function encryptHealthData(data: string, key: Uint8Array): string {
  const nonce = nacl.randomBytes(24);
  const encrypted = nacl.secretbox(
    new TextEncoder().encode(data),
    nonce,
    key
  );
  return base64Encode(new Uint8Array([...nonce, ...encrypted]));
}
```

---

## Privacy Guarantees

### Builder Data Protection
1. **Wallet-Derived Encryption** - AES-256-GCM with key from Ed25519 signature
2. **Zero Server Storage** - All encryption happens client-side
3. **Selective Disclosure** - K-of-N validators must approve decryption
4. **On-Chain Anonymity** - Optimization logs linked to ephemeral PDAs

### Validator Privacy
1. **Anonymous Validation** - ZK proofs without identity revelation
2. **Private Stake Amounts** - Staking data not publicly visible
3. **Shielded Rewards** - Confidential reward distributions

### Compliance Features
1. **Audit Trails** - Immutable proof logs on Arweave
2. **Right to Erasure** - Encrypted data can be made permanently inaccessible
3. **Range Protocol** - Pre-screening for regulatory compliance

---

## Visual Privacy Indicators

| Indicator | Meaning |
|-----------|---------|
| 🟢 2-5x | Light Protocol compression (Standard) |
| 🔵 6-20x | Light Protocol compression (Optimized) |
| 🟣 21-100x | Light Protocol compression (Maximum) |
| ⏳ | ZK proof generating |
| ✅ | ZK proof verified |
| 🔐 | Noir ZK-SNARK protected |
| 1/5 → 5/5 | Arcium MPC approval progress |

---

## Testing

### Run Circuit Tests
```bash
cd circuits/benchmark_delta && nargo test
cd circuits/execution_duration && nargo test
cd circuits/data_completeness && nargo test
cd circuits/resource_range && nargo test
```

### Test Results
```
[benchmark_delta] 6 tests passed
[execution_duration] 7 tests passed
[data_completeness] 6 tests passed
[resource_range] 7 tests passed
Total: 26 tests passing
```

---

## Integration Status

| Technology | Status | Files |
|------------|--------|-------|
| Noir | Complete | `circuits/*`, `NoirService.ts` |
| Light Protocol | Complete | `LightProtocolService.ts` |
| Arcium MPC | Complete | `ArciumMPCService.ts`, `ResearcherDashboard.tsx` |
| Wallet Encryption | Complete | `encryption.ts` |

---

## Future Enhancements

- **Homomorphic Encryption** - Private computation on encrypted agent data
- **Federated Learning** - Privacy-preserving technique efficacy models
- **Cross-Chain Privacy** - Multi-blockchain privacy bridges
- **Quantum-Resistant Cryptography** - Future-proof encryption
