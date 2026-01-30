# Privacy Integration Roadmap: Dallas Buyers Club

## Executive Summary

This document provides a technical analysis and implementation status for integrating Light Protocol, Noir, Arcium MPC, and Privacy Cash into Dallas Buyers Club.

**Last Updated:** January 30, 2026  
**Status:** 3 of 4 core integrations COMPLETE  
**Build Status:** ✅ Passing

### Implementation Status

| Integration | Status | Files | Tests |
|-------------|--------|-------|-------|
| **Noir** | ✅ COMPLETE | 4 circuits, NoirService.ts | 26 passing |
| **Light Protocol** | ✅ COMPLETE | LightProtocolService.ts | Compression UI |
| **Arcium MPC** | ✅ COMPLETE | ArciumMPCService.ts, ResearcherDashboard.tsx | Committee flow |
| **Privacy Cash** | 🔄 OPTIONAL | Planned | - |

---

## 1. Light Protocol (ZK Compression) ✅ COMPLETE

### Status: IMPLEMENTED

**Deliverables:**
- ✅ `LightProtocolService.ts` - Single source of truth for compression
- ✅ `EncryptedCaseStudyForm.tsx` - Compression UI with ratio selector
- ✅ Compression ratio options: 2x, 5x, 10x (recommended), 20x, 50x
- ✅ Real-time compression preview and savings calculation

**Implementation:**
```typescript
// src/services/privacy/LightProtocolService.ts
export class LightProtocolService {
  async compressCaseStudy(data, options): Promise<CompressedCaseStudy> {
    // Compresses health data with configurable ratios
    // Returns compressed account, Merkle root, proof
  }
  
  calculateCompression(dataSize, options): CompressionEstimate {
    // Preview compression before submitting
  }
}
```

**UI Integration:**
```typescript
// Compression selector in EncryptedCaseStudyForm
<select value={compressionRatio}>
  <option value={2}>2x (Fast)</option>
  <option value={10}>10x (Recommended)</option>
  <option value={50}>50x (Maximum)</option>
</select>
// Shows: "5.2 KB → 520 B (90% saved)"
```

**Why It Fits:**
- **Problem:** Health case studies contain large amounts of data
- **Solution:** Light Protocol compresses state by 2-100x
- **User Benefit:** Patients submit detailed histories affordably

**Cost Savings:** ~90% reduction in storage costs at 10x compression

---

## 2. Noir (ZK-SNARK Proofs) ✅ COMPLETE

### Status: IMPLEMENTED

**Deliverables:**
- ✅ 4 Noir circuits in `circuits/*/src/main.nr`
- ✅ 26 circuit tests, all passing
- ✅ `NoirService.ts` - Single source of truth for ZK proofs
- ✅ `ValidationDashboard.tsx` - Expert mode with proof generation

**Circuits:**

| Circuit | Tests | Purpose |
|---------|-------|---------|
| `symptom_improvement` | 6 passing | Prove health improved without revealing scores |
| `duration_verification` | 7 passing | Prove treatment duration in valid range |
| `data_completeness` | 6 passing | Prove required fields present |
| `cost_range` | 7 passing | Prove cost within acceptable bounds |

**Circuit Example:**
```rust
// circuits/symptom_improvement/src/main.nr
fn main(
    baseline_severity: u8,      // Private
    outcome_severity: u8,       // Private
    min_improvement: u8,        // Public (e.g., 20%)
) -> pub bool {
    let improvement = baseline_severity - outcome_severity;
    let threshold = (baseline_severity * min_improvement) / 100;
    improvement >= threshold
}
```

**Service Integration:**
```typescript
// src/services/privacy/NoirService.ts
export class NoirService {
  async proveSymptomImprovement(inputs, publicInputs): Promise<ProofResult> {
    // Generates ZK proof without revealing private inputs
  }
  
  async generateValidationProofs(data): Promise<ProofResult[]> {
    // Batch generate all 4 proofs for case study
  }
}
```

**UI Integration:**
```typescript
// ValidationDashboard Expert Mode
const proofs = await noirService.generateValidationProofs(caseStudyData);
// Shows: "4 ZK proofs (4 verified)"
```

**Test Results:**
```bash
$ cd circuits/symptom_improvement && nargo test
[symptom_improvement] 6 tests passed

$ cd circuits/duration_verification && nargo test  
[duration_verification] 7 tests passed

$ cd circuits/data_completeness && nargo test
[data_completeness] 6 tests passed

$ cd circuits/cost_range && nargo test
[cost_range] 7 tests passed
```
// Submit proof to blockchain - validators verify without seeing scores
```

---

## 3. Arcium MPC (Threshold Decryption) ✅ COMPLETE

### Status: IMPLEMENTED

**Deliverables:**
- ✅ `ArciumMPCService.ts` - MPC operations service
- ✅ `ResearcherDashboard.tsx` - Researcher access request UI
- ✅ K-of-N threshold decryption with validator committees
- ✅ Committee approval progress tracking

**Implementation:**
```typescript
// src/services/privacy/ArciumMPCService.ts
export class ArciumMPCService {
  async requestAccess(requester, input): Promise<MPCAccessRequest> {
    // Creates MPC session with validator committee
    // Returns request with committee members
  }
  
  async approveAccess(sessionId, validator, shareCommitment): Promise<MPCAccessRequest> {
    // Committee member contributes decryption share
    // Tracks approval progress
  }
  
  async decryptData(sessionId, requester): Promise<DecryptionResult> {
    // Threshold decryption after K-of-N approvals
    // Returns decrypted data
  }
}
```

**Use Case for DBC:**
```
Researcher wants: Access to case study for aggregate analysis
With Arcium MPC:
  1. Researcher submits access request with justification
  2. System forms committee of 5 validators
  3. Validators review and approve (3-of-5 threshold)
  4. After threshold reached, data is decrypted
  5. No single validator can access data alone
```

**UI Components:**
```typescript
// ResearcherDashboard
- Access request form with justification
- Encryption scheme selection (AES-256, ChaCha20, Custom)
- Committee threshold configuration (2-5 validators)
- Real-time approval progress bar
- Decryption button for approved requests
```

**Why It Fits:**
- **Problem:** Researchers need data, patients don't trust single entities
- **Solution:** K-of-N validators must approve for decryption
- **User Benefit:** Research access without single-point-of-trust

---

## 4. Privacy Cash (Confidential Transfers)

### Does It Make Sense? ⚠️ MODERATE - Nice to Have

**Why It Might Fit:**
- **Problem:** Validator staking amounts and reward flows are public on Solana
- **Solution:** Privacy Cash uses confidential transfers to hide amounts
- **User Benefit:** Validators can't be targeted based on stake size

**Technical Reality Check:**
Privacy Cash is built on **SPL Token 2022's confidential transfer extension**. It requires:
- Token-2022 mint with confidential transfer enabled
- Range proofs for amount validity
- Additional compute units per transfer

**Considerations:**

| Pros | Cons |
|------|------|
| Hide validator stake amounts | Adds ~200k compute units per transfer |
| Hide reward amounts | Requires Token-2022 (not all wallets support) |
| Regulatory compliance | More complex UX (need to prove balance) |

**Alternative:** Since DBC is about **health sovereignty** not financial privacy, this might be overkill. Consider:
- Is hiding stake amounts critical to the mission?
- Would validators actually use this feature?

**Recommendation:** Implement last, or skip if time-constrained.

---

## Implementation Summary

### ✅ Phase 1: Noir ZK Proofs - COMPLETE
**Deliverables:**
- ✅ 4 Noir circuits with 26 passing tests
- ✅ `NoirService.ts` for proof generation
- ✅ `ValidationDashboard.tsx` with Expert Mode
- ✅ Circuit compilation to ACIR bytecode

**Files:**
- `circuits/*/src/main.nr` (4 circuits)
- `circuits/*/target/*.json` (compiled ACIR)
- `src/services/privacy/NoirService.ts`
- `src/components/ValidationDashboard.tsx` (enhanced)

---

### ✅ Phase 2: Light Protocol - COMPLETE
**Deliverables:**
- ✅ `LightProtocolService.ts` for compression
- ✅ `EncryptedCaseStudyForm.tsx` with compression UI
- ✅ Compression ratio selector (2x-50x)
- ✅ Real-time savings preview

**Files:**
- `src/services/privacy/LightProtocolService.ts`
- `src/components/EncryptedCaseStudyForm.tsx` (enhanced)

---

### ✅ Phase 3: Arcium MPC - COMPLETE
**Deliverables:**
- ✅ `ArciumMPCService.ts` for threshold decryption
- ✅ `ResearcherDashboard.tsx` for access requests
- ✅ Committee formation and approval tracking
- ✅ K-of-N decryption workflow

**Files:**
- `src/services/privacy/ArciumMPCService.ts`
- `src/components/ResearcherDashboard.tsx` (new)

---

### 🔄 Phase 4: Privacy Cash (Optional)
**Status:** Planned but not implemented
**Reason:** Financial privacy is secondary to health privacy mission
**Can be added:** Later without architectural changes

---

## Technical Dependencies

### NPM Packages to Add

```json
{
  "dependencies": {
    "@noir-lang/noir_js": "^1.0.0-beta.15",
    "@aztec/bb.js": "^3.0.0",
    "@lightprotocol/stateless.js": "^0.7.0",
    "@arcium-hq/client": "^0.3.0"
  }
}
```

### Development Tools

```bash
# Noir
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
noirup -v 1.0.0-beta.15

# Arcium
npm install -g @arcium-hq/cli

# Light Protocol
npm install @lightprotocol/stateless.js
```

---

## Risk Assessment

| Integration | Risk Level | Mitigation |
|-------------|------------|------------|
| Noir | Medium | Start with simple circuits, test in browser early |
| Light Protocol | Low-Medium | Well-documented SDK, active Discord support |
| Arcium | High | Newer technology, may need to ask for help |
| Privacy Cash | Low | Standard SPL Token 2022 feature |

---

## Success Criteria

**For Hackathon Submission:**

1. **Noir:** Validators can generate ZK proofs in browser proving data quality without seeing health data
2. **Light Protocol:** At least one case study submitted with ZK compression, verifiable on devnet
3. **Arcium:** Basic encrypted computation working (even if just addition)
4. **Demo Video:** Shows all three working together

**Post-Hackathon:**

1. Full test coverage for all privacy features
2. Security audit of circuits
3. Mainnet deployment
4. Privacy Cash integration (if user demand exists)

---

## Conclusion

**All four integrations make sense, but in different ways:**

- **Noir:** Critical - enables privacy-preserving validation (core mission)
- **Light Protocol:** High value - makes health data storage economically viable
- **Arcium:** High value for research use case - enables aggregate analysis without exposure
- **Privacy Cash:** Nice to have - financial privacy is secondary to health privacy

**Recommended approach:**
1. Focus on Noir + Light Protocol for hackathon (core privacy story)
2. Add Arcium if time permits (research angle)
3. Skip Privacy Cash for now (can add later)

This gives you a **complete privacy stack** that addresses the core problem: patients sharing health data without losing privacy.
