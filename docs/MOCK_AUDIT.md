# Mock Data & Placeholder Audit

**Date:** 2026-02-02  
**Purpose:** Identify all mock, placeholder, simulated, and TODO items in the codebase

---

## Summary by Category

### 1. Privacy Services (Simulated/Fallback Mode)

These services gracefully degrade to simulated mode when real infrastructure isn't available:

| Service | Status | Real Implementation | Notes |
|---------|--------|---------------------|-------|
| `NoirService` | ⚠️ Simulated proofs | noir_js integration | Creates mock ZK proofs when circuits unavailable |
| `LightProtocolService` | ⚠️ Simulated compression | Light Protocol SDK | Falls back to simulated compression |
| `ArciumMPCService` | ⚠️ Simulated MPC | Arcium network | Simulated threshold decryption |

**Impact:** Medium - Privacy features work in demo mode but don't provide actual cryptographic guarantees

**Priority:** High - Core value proposition depends on real privacy tech

---

### 2. Token Services (Devnet/Mainnet Split)

| Service | Devnet Behavior | Mainnet Behavior | Notes |
|---------|-----------------|------------------|-------|
| `AttentionTokenService` | Mock tokens | Real Bags API | Creates mock tokens on devnet |
| `AttentionTokenTradingService` | Mock trading | Real DEX integration | Simulated trades on devnet |

**Impact:** Low - Expected behavior for devnet testing

**Priority:** Low - Works as designed (devnet = mock, mainnet = real)

---

### 3. Validator & Staking (Partial Implementation)

| Component | Status | Missing | Notes |
|-----------|--------|---------|-------|
| `ValidatorReputationSystem` | ⚠️ TODOs | On-chain history accounts | Uses mock data for charts |
| `useValidatorStaking` | ⚠️ Simulated | Claim rewards transaction | Returns simulated signature |
| `ValidationDashboard` | ⚠️ Mock tasks | Real validation queue | Hardcoded mock tasks |

**Impact:** Medium - Validator UX incomplete without real data

**Priority:** High - Critical for validator adoption

---

### 4. Researcher Tools (Mock Data)

| Component | Status | Missing | Notes |
|-----------|--------|---------|-------|
| `ResearcherDashboard` | ⚠️ Mock requests | Real MPC access requests | Hardcoded mock requests |
| `ResearcherTools` | ⚠️ Partial | Aggregate data from chain | Uses limited real data |

**Impact:** Medium - Researchers can't do real analysis yet

**Priority:** Medium - Important for research use case

---

### 5. UI Placeholders (Cosmetic)

| Component | Placeholder | Real Data Source | Notes |
|-----------|-------------|------------------|-------|
| `AttentionTokenMarket` | `via.placeholder.com` | Token metadata | Image placeholders |
| `AttentionTokenCreation` | `via.placeholder.com` | User uploaded image | Image placeholders |

**Impact:** Low - Visual only

**Priority:** Low - Can use default images

---

### 6. Core Services (Mixed)

| Service | Mock/Real | Notes |
|---------|-----------|-------|
| `BlockchainService` | ⚠️ Partial | Some methods return mock data |
| `DbcTokenService` | ⚠️ Partial | Balance checks real, some features mocked |
| `FarcasterService` | ⚠️ Mock | Returns mock Farcaster account |
| `CaseStudyDetailsService` | ✅ Real | Fetches real IPFS data |

---

## Critical Path Analysis

### What's Working (Real)

✅ **Case Study Submission**
- Encryption in browser (tweetnacl)
- IPFS upload
- On-chain submission with metadata

✅ **Case Study Retrieval**
- Fetch from IPFS
- Decrypt with wallet-derived key
- Display decrypted details

✅ **Wallet Connection**
- Phantom integration
- Transaction signing
- Balance checking

✅ **Basic Token Operations**
- DBC token transfers
- Balance queries
- Token account creation

### What's Partially Working

⚠️ **Privacy Features**
- ZK proofs: Simulated (need noir_js)
- Compression: Simulated (need Light Protocol)
- MPC: Simulated (need Arcium)

⚠️ **Validator System**
- Staking: Real
- Rewards: Simulated claims
- History: Mock data

⚠️ **Researcher Access**
- Request creation: Real
- MPC decryption: Simulated
- Aggregate analysis: Mock data

### What's Mock/Simulated

❌ **Attention Tokens (Devnet)**
- Token creation: Mock
- Trading: Mock
- Analytics: Mock

❌ **Validator Reputation**
- Historical accuracy: Mock
- Leaderboard: Mock
- Disputes: Mock

---

## TODO List by Priority

### P0 - Critical (Blocks Mainnet)

1. **Noir ZK Proofs**
   - File: `src/services/privacy/NoirService.ts`
   - Issue: Simulated proofs provide no privacy
   - Action: Integrate noir_js for real proof generation

2. **Light Protocol Compression**
   - File: `src/services/privacy/LightProtocolService.ts`
   - Issue: Simulated compression
   - Action: Integrate Light Protocol SDK

3. **Arcium MPC**
   - File: `src/services/privacy/ArciumMPCService.ts`
   - Issue: Simulated threshold decryption
   - Action: Integrate Arcium client SDK

### P1 - High (Important for UX)

4. **Validator Reward Claims**
   - File: `src/hooks/useValidatorStaking.ts`
   - Issue: Simulated claim signature
   - Action: Implement real claim transaction

5. **Validator History On-Chain**
   - File: `src/components/ValidatorReputationSystem.tsx`
   - Issue: Multiple TODOs for on-chain data
   - Action: Deploy validator history program

6. **Real Validation Queue**
   - File: `src/components/ValidationDashboard.tsx`
   - Issue: Mock tasks
   - Action: Fetch pending validations from chain

### P2 - Medium (Nice to Have)

7. **Researcher Aggregate Data**
   - File: `src/components/ResearcherTools.tsx`
   - Issue: Limited real aggregate data
   - Action: Build indexing service for analytics

8. **Real MPC Access Requests**
   - File: `src/components/ResearcherDashboard.tsx`
   - Issue: Mock requests
   - Action: Fetch from on-chain request accounts

9. **Token Images**
   - Files: `AttentionTokenMarket.tsx`, `AttentionTokenCreation.tsx`
   - Issue: Placeholder images
   - Action: IPFS image upload for tokens

### P3 - Low (Polish)

10. **Farcaster Integration**
    - File: `src/services/FarcasterService.ts`
    - Issue: Mock account
    - Action: Real Farcaster auth

---

## Recommendations

### Short Term (This Week)

1. **Deploy remaining programs to devnet:**
   - Validator history program
   - Researcher access program

2. **Fix validator reward claims:**
   - Replace simulated signature with real transaction

3. **Real validation queue:**
   - Fetch pending case studies from chain

### Medium Term (This Month)

1. **Integrate privacy SDKs:**
   - noir_js for ZK proofs
   - Light Protocol SDK for compression
   - Arcium client for MPC

2. **Build indexing layer:**
   - Aggregate case study data for researchers
   - Validator performance metrics

### Long Term (Before Mainnet)

1. **Full mainnet integration:**
   - Bags API for attention tokens
   - Real DEX for trading
   - Production RPC endpoints

2. **Security audit:**
   - All privacy circuits
   - Smart contracts
   - Encryption implementation

---

## Files Requiring Attention

### High Priority
```
src/services/privacy/NoirService.ts
src/services/privacy/LightProtocolService.ts
src/services/privacy/ArciumMPCService.ts
src/hooks/useValidatorStaking.ts
src/components/ValidatorReputationSystem.tsx
src/components/ValidationDashboard.tsx
```

### Medium Priority
```
src/components/ResearcherDashboard.tsx
src/components/ResearcherTools.tsx
src/services/BlockchainService.ts
src/services/DbcTokenService.ts
```

### Low Priority
```
src/components/AttentionTokenMarket.tsx
src/components/AttentionTokenCreation.tsx
src/services/FarcasterService.ts
```

---

## Notes

- **Devnet vs Mainnet:** Many "mocks" are intentional for devnet testing (e.g., attention tokens). These are feature flags, not bugs.
- **Graceful Degradation:** The simulated services are designed to fail gracefully - they log warnings and continue working in demo mode.
- **Privacy First:** Even simulated privacy services don't compromise actual user data - they just don't provide cryptographic guarantees yet.
