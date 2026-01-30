# Privacy Integration Roadmap: Dallas Buyers Club

## Executive Summary

This document provides a technical analysis and implementation roadmap for integrating Light Protocol, Noir, Arcium MPC, and Privacy Cash into Dallas Buyers Club. Each integration is evaluated for fit with our health data sovereignty use case.

**Last Updated:** January 30, 2026  
**Estimated Implementation Time:** 2-3 weeks  
**Priority Order:** Based on user value and technical feasibility

---

## 1. Light Protocol (ZK Compression)

### Does It Make Sense? ✅ YES - High Value

**Why It Fits:**
- **Problem:** Health case studies contain large amounts of data (symptom logs, biomarkers, notes)
- **Solution:** Light Protocol compresses state by 2-100x, making storage economically viable
- **User Benefit:** Patients can submit detailed health histories without worrying about storage costs

**Technical Reality Check:**
```
Current: Case study stored on-chain ~500 bytes
With Light: Compressed to ~50 bytes (10x compression)
Cost Savings: ~90% reduction in rent exemption
```

**Implementation Complexity:** MEDIUM
- Light Protocol uses ZK compression for state trees
- Requires `@lightprotocol/stateless.js` SDK
- Need to modify case study accounts to use compressed accounts

**Integration Points:**
1. Replace standard Solana accounts with compressed accounts
2. Use Light's Merkle tree for case study storage
3. Submit proofs when reading/writing case studies

**Code Changes Required:**
```typescript
// Current approach
const caseStudyAccount = await connection.getAccountInfo(pda);

// With Light Protocol
import { LightSystemProgram } from '@lightprotocol/stateless.js';
const compressedAccount = await rpc.getCompressedAccount(nullifier);
```

---

## 2. Noir (ZK-SNARK Proofs)

### Does It Make Sense? ✅ YES - Critical for Privacy

**Why It Fits:**
- **Problem:** Validators need to verify data quality WITHOUT seeing sensitive health information
- **Solution:** Noir circuits prove properties of encrypted data (e.g., "symptom severity improved by >20%")
- **User Benefit:** Patients maintain complete privacy while validators ensure data quality

**Use Cases for DBC:**

| Circuit Name | Purpose | Private Inputs | Public Outputs |
|--------------|---------|----------------|----------------|
| `symptom_improvement` | Prove health improved | Baseline/outcome scores | Boolean: improved |
| `duration_verification` | Prove treatment lasted N days | Start/end timestamps | Duration in days |
| `cost_range` | Prove cost is within range | Actual cost USD | In range boolean |
| `data_completeness` | Prove all required fields present | Full encrypted payload | Completeness score |

**Implementation Complexity:** HIGH
- Need to write Noir circuits (.nr files)
- Compile circuits to ACIR bytecode
- Generate proofs in browser using `noir_js` + `bb.js`
- Verify proofs on-chain (requires verifier contract)

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

**Frontend Integration:**
```typescript
import { Noir } from '@noir-lang/noir_js';
import { UltraHonkBackend } from '@aztec/bb.js';

// Generate proof without revealing actual health data
const { witness } = await noir.execute({
  baseline_severity: 8,    // Private - not revealed on-chain
  outcome_severity: 4,     // Private - not revealed on-chain
  min_improvement: 20,     // Public parameter
});
const proof = await backend.generateProof(witness);
// Submit proof to blockchain - validators verify without seeing scores
```

---

## 3. Arcium MPC (Threshold Decryption)

### Does It Make Sense? ✅ YES - For Research Access

**Why It Fits:**
- **Problem:** Researchers need access to aggregate health data, but patients don't trust single entities
- **Solution:** Arcium's MPC allows computations on encrypted data without any single party decrypting it
- **User Benefit:** Patients can opt-in to research without revealing data to any single organization

**Technical Reality Check:**
Arcium is a **decentralized confidential computing network** - not just threshold decryption. It allows:
- Running computations on encrypted data
- Multiple MPC nodes compute together without seeing plaintext
- Results are decrypted only to authorized recipients

**Use Case for DBC:**
```
Researcher wants: Average improvement rate for "Protocol X"
Current: Must decrypt all case studies (privacy risk)
With Arcium: 
  1. Patient encrypts outcome data with Arcium
  2. Researcher submits computation: "average(improvement)"
  3. MPC nodes compute on encrypted data
  4. Result decrypted only to researcher
  5. No individual data ever exposed
```

**Implementation Complexity:** HIGH
- Requires Arcium MXE (Multi-Party Execution) environment
- Need to write Rust programs that run in Arcium's confidential VM
- Client-side encryption with x25519 key exchange

**Integration Points:**
```typescript
import { ArciumClient, x25519 } from '@arcium-hq/client';

// Encrypt health data for Arcium computation
const clientKeypair = x25519.generateKeyPair();
const mxePublicKey = await arcium.getMXEPublicKey(programId);
const sharedSecret = x25519.deriveSharedSecret(clientKeypair.private, mxePublicKey);
const cipher = new ArciumCipher(sharedSecret);

const encryptedData = cipher.encrypt([symptomScore, duration, cost]);
// Submit to Arcium for computation
```

**Important Note:** Arcium is for **computation on encrypted data**, not just threshold decryption. For simple "K-of-N validator approval to decrypt," we might be over-engineering. However, for aggregate research queries, it's perfect.

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

## Implementation Priority

### Phase 1: Noir ZK Proofs (Week 1)
**Why First:**
- Core to the privacy value proposition
- Can be done without external dependencies (just npm packages)
- Judges will want to see actual ZK proof generation

**Tasks:**
1. Install Noir toolchain (`noirup`)
2. Write 4 circuits for validation
3. Compile circuits to ACIR
4. Integrate `noir_js` + `bb.js` into frontend
5. Update smart contract to verify proofs

**Deliverable:** Validators generate ZK proofs in browser, submit to blockchain

---

### Phase 2: Light Protocol (Week 2)
**Why Second:**
- Requires devnet/mainnet deployment
- Changes account structure significantly
- Provides clear cost savings demonstration

**Tasks:**
1. Install `@lightprotocol/stateless.js`
2. Modify case study program to use compressed accounts
3. Update frontend to use Light RPC
4. Deploy to devnet
5. Measure compression ratios

**Deliverable:** Case studies stored with 10x+ compression, verifiable on devnet

---

### Phase 3: Arcium MPC (Week 2-3)
**Why Third:**
- Most complex integration
- Requires understanding of MPC computation model
- Highest value for research use case

**Tasks:**
1. Set up Arcium CLI and local MXE
2. Write Rust computation programs
3. Integrate `@arcium-hq/client` SDK
4. Create "Research Query" flow
5. Test end-to-end encrypted computation

**Deliverable:** Researcher can query aggregate statistics without decrypting individual data

---

### Phase 4: Privacy Cash (Optional)
**Why Last:**
- Nice-to-have feature
- Not core to health sovereignty mission
- Can be added later without architectural changes

**Tasks:**
1. Create Token-2022 mint with confidential transfers
2. Update DbcTokenService to use confidential transfers
3. Add toggle for confidential vs standard transfers

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
