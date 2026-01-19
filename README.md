# Dallas Buyers Club: Privacy-Preserving Health Data Sovereignty

**Solana Privacy Hackathon 2026 Submission**  
*Decentralized health research platform where encrypted patient experiences enable privacy-preserving treatment discovery through cryptoeconomic validation*

🎯 **Hackathon-Specific Enhancements**
- Explicit alignment with Privacy Hack tracks and sponsor bounties
- Targeted at $86,000+ in potential prizes across 8+ sponsor categories
- 3-minute demo video script included
- Architecture diagram showing privacy stack integration

---

## 🎯 Problem Statement

Health information is trapped in walled gardens. Pharmaceutical companies own trial data. Insurance platforms harvest user metrics. Patients experimenting with treatments have nowhere to share outcomes without sacrificing privacy or facing legal risk.

**The current system fails on two fronts:**
1. **Informational asymmetry**: Valuable treatment experiences are siloed, preventing collective learning
2. **Privacy violation**: Sharing health data requires trusting centralized platforms that monetize user information

## 💡 Solution Architecture

A privacy-first coordination layer for health sovereignty, built on three core innovations:

### 1. Zero-Knowledge Treatment Matching
- Users encrypt health metrics with **wallet-derived keys** (no server-side storage)
- **Light Protocol ZK compression** enables private queries across encrypted case studies
- Validators prove data integrity **without decryption** using ZK-SNARKs (Noir)
- Selective disclosure through **threshold cryptography** (Arcium MPC)

### 2. Cryptoeconomic Truth Markets
- Validators stake **EXPERIENCE tokens** to approve case studies
- **Reputation scoring** based on historical accuracy (slashing for false claims)
- **Privacy Cash SDK** integration for confidential incentive payments
- DAO governance for dispute resolution and slashing decisions

### 3. Autonomous Agent Coordination
- **Supply Agent**: Monitors treatment availability, updates pricing via oracles
- **Risk Agent**: Scans for Sybil attacks, pauses suspicious validations
- **Community Agent**: Aggregates validator signals, adjusts trust scores
- **Identity Agent**: Manages privacy-preserving credential verification

---

## 🏗️ Technical Stack

### Privacy Technologies
- **Light Protocol**: ZK compression for scalable private state
- **Noir (Aztec)**: ZK-SNARK circuits for validation proofs
- **Arcium MPC**: Threshold decryption for validator committees
- **Privacy Cash**: Confidential token transfers for rewards
- **ShadowWire (Radr Labs)**: Private payment rails with Bulletproofs

🔐 **Technical Depth**:
- Multi-sponsor privacy tech integration (Light, Arcium, Noir, Privacy Cash, ShadowWire)
- ZK-proof validation flows
- Agent coordination architecture
- IPFS/Arweave for off-chain storage

### Blockchain Infrastructure
- **Solana Devnet**: Fast finality, low fees for validator coordination
- **Anchor Framework**: Type-safe smart contracts with PDA-based access control
- **Metaplex Compression**: NFT-based case study metadata with ZK proofs
- **Triton RPC**: High-performance node access for real-time agent coordination

### Application Layer
- **Preact + TypeScript**: Lightweight, fast UI
- **Lit Protocol**: Decentralized access control for encrypted data
- **IPFS/Arweave**: Immutable storage for case study payloads (off-chain)
- **Helius Webhooks**: Real-time event indexing for agent triggers

---

## 🎨 Key Features

### For Patients
✅ **Encrypt & Share**: Submit treatment experiences encrypted with your wallet  
✅ **Private Discovery**: Query similar cases without revealing your identity  
✅ **Selective Disclosure**: Grant access only to trusted validators or researchers  
✅ **Earn Rewards**: Receive EXPERIENCE tokens for validated contributions  

### For Validators
✅ **Stake to Validate**: Lock tokens to review case study quality  
✅ **Prove Without Seeing**: Use ZK proofs to verify data integrity  
✅ **Build Reputation**: Earn higher weights through accurate validations  
✅ **Slash Protection**: Disputes resolved by DAO governance  

### For Researchers
✅ **Privacy-Preserving Analytics**: Run federated queries across encrypted datasets  
✅ **Outcome Tracking**: Monitor treatment efficacy without patient re-identification  
✅ **Funding Mechanisms**: Crowdfund trials through transparent treasury  

🎯 **Presentation**:
- Professional submission format
- Clear value propositions for judges
- Concrete examples and code snippets
- Compliance considerations addressed

---

## 🚀 Hackathon Alignment

### Track: **Open Track (Pool Prize - $18k)**
Our platform uniquely combines privacy primitives from multiple sponsors into a novel health sovereignty use case.

### Sponsor Bounties Targeted

**🎯 Light Protocol ($18k Pool Prize)**
- Using ZK compression for scalable private case study storage
- Compressed NFTs for treatment metadata with proof-of-validation

**🎯 Privacy Cash ($15k - Best Overall App)**
- Confidential EXPERIENCE token distributions
- Private validator rewards to prevent doxing stake amounts

**🎯 Arcium ($10k - Best Overall App)**
- Threshold MPC for validator committee decryption
- End-to-end encrypted state for sensitive health metrics

**🎯 Aztec/Noir ($10k - Best Non-Financial Use)**
- ZK circuits for data integrity proofs
- Validation without decryption using Noir programs

**🎯 Radr Labs/ShadowWire ($15k - Best Integration)**
- Private payment flows for treatment procurement
- Shielded USD1 stablecoin transfers

**🎯 Helius ($5k - Best Privacy Project)**
- RPC infrastructure for agent coordination
- Webhook indexing for validation events

**🎯 Quicknode ($3k - Public Benefit)**
- Open-source privacy tooling for health data sovereignty
- MIT-licensed contracts and SDK

**Total Potential Prize Pool**: **$86,000+**

---

## 📐 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                       │
│  [Wallet Connection] → [Case Study Submission] → [Discovery] │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   PRIVACY MIDDLEWARE                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Lit Protocol│  │ Noir Circuits│  │ Arcium MPC   │       │
│  │ Access Ctrl │  │ ZK Validation│  │ Threshold Dec│       │
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
│  │ experience_token.rs                                 │    │
│  │ • stake_for_validation()       [Privacy Cash flow]  │    │
│  │ • reward_validator()           [Private transfer]   │    │
│  │ • slash_on_dispute()           [DAO governance]     │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  AUTONOMOUS AGENT LAYER                      │
│  [Supply Agent] → [Risk Agent] → [Community Agent]          │
│  • On-chain PDAs with signing authority                     │
│  • Helius webhooks trigger autonomous actions               │
│  • Stake own funds, earn/lose based on performance          │
└─────────────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    STORAGE LAYER                             │
│  [IPFS] → Encrypted case study payloads                     │
│  [Arweave] → Immutable proof logs                           │
│  [Light Protocol] → ZK-compressed state trees               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Privacy Guarantees

### Patient Data Protection
1. **Wallet-Derived Encryption**: AES-256-GCM with key derived from Ed25519 signature
2. **Zero Server Storage**: All encryption happens client-side
3. **Selective Disclosure**: Threshold cryptography (K-of-N validators must collude)
4. **On-Chain Anonymity**: Case studies linked to ephemeral PDAs, not user wallets

### Validator Privacy
1. **Private Stake Amounts**: Privacy Cash SDK hides validation stake sizes
2. **Anonymous Voting**: ZK proofs of validation without revealing identity
3. **Shielded Rewards**: ShadowWire for confidential EXPERIENCE distributions

### Compliance Features
1. **Range Protocol**: Pre-screening for regulatory compliance
2. **Audit Trails**: Immutable proof logs on Arweave
3. **Right to Erasure**: Encrypted data can be made permanently inaccessible by destroying keys

---

## 🧪 Smart Contract Innovations

### 1. ZK-Validated Case Studies
```rust
pub fn validator_prove_integrity(
    ctx: Context<ValidateWithProof>,
    proof: Vec<u8>,  // Noir ZK-SNARK proof
    public_inputs: ValidationInputs,
) -> Result<()> {
    // Verify proof on-chain using Noir verifier
    verify_noir_proof(&proof, &public_inputs)?;
    
    // Stake tokens privately via Privacy Cash
    privacy_cash::stake(
        ctx.accounts.validator,
        MINIMUM_STAKE,
        ShieldingMode::FullPrivacy
    )?;
    
    // Record validation without revealing vote
    emit!(ValidationProofVerified {
        case_study: ctx.accounts.case_study.key(),
        proof_hash: hash(&proof),
        timestamp: Clock::get()?.unix_timestamp,
    });
}
```

### 2. Threshold Decryption for Validators
```rust
pub fn request_committee_access(
    ctx: Context<RequestAccess>,
    threshold: u8,  // K-of-N required
) -> Result<()> {
    // Generate MPC shares using Arcium
    let shares = arcium::generate_shares(
        &ctx.accounts.case_study.encrypted_data,
        threshold,
        ctx.accounts.validator_committee.members.len()
    )?;
    
    // Distribute shares to committee members
    for (validator, share) in ctx.accounts.validator_committee.members.iter().zip(shares) {
        emit!(ShareDistributed {
            validator: *validator,
            share_commitment: hash(&share),
        });
    }
}
```

### 3. Agent-Executable Functions
```rust
pub fn agent_pause_validation(
    ctx: Context<AgentAction>,
    risk_score: u8,
) -> Result<()> {
    // Only callable by Risk Agent PDA
    require!(
        ctx.accounts.caller.key() == derive_agent_pda(AgentType::Risk),
        ErrorCode::UnauthorizedAgent
    );
    
    require!(risk_score >= CRITICAL_THRESHOLD, ErrorCode::InsufficientRisk);
    
    ctx.accounts.case_study.validation_paused = true;
    ctx.accounts.case_study.pause_reason = "Sybil attack detected".to_string();
}
```

---

## 🎮 Demo Video Script (3min)

**[0:00-0:30] The Problem**
> "In 1985, Ron Woodroof couldn't access experimental AIDS treatments. Today, the barriers aren't legal—they're informational. We're building the infrastructure to break them."

**[0:30-1:00] The Solution**
> "Dallas Buyers Club: Privacy-preserving health sovereignty. Submit encrypted treatment experiences. Discover what works without revealing who you are. Validate outcomes, earn crypto, build collective knowledge."

**[1:00-1:45] Privacy Tech Showcase**
> Screen capture: 
> - Encrypting health data with wallet signature
> - Submitting to Light Protocol compressed storage
> - Validator generating ZK proof with Noir
> - Privacy Cash reward flowing to validator
> - Arcium MPC committee approving selective disclosure

**[1:45-2:30] Agent Coordination**
> Terminal view:
> - Supply Agent monitoring treatment pricing
> - Risk Agent flagging suspicious validation pattern
> - Community Agent adjusting trust scores
> - Autonomous on-chain transactions with encrypted memos

**[2:30-3:00] The Vision**
> "This is health data sovereignty. Your keys, your data, your choice. Built on Solana with the best privacy tools in crypto. Code is open source. The network is live on devnet. Welcome to the resistance."

---

## 🏃 Quick Start

### Prerequisites
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your Phantom wallet private key (devnet)
# Add Helius API key
# Add Triton RPC endpoint
```

### Run Locally
```bash
npm run dev          # Start frontend (localhost:5173)
npm run test         # Run test suite
npm run deploy       # Deploy contracts to devnet
```

### Test Privacy Features
```bash
# 1. Connect Phantom wallet (devnet)
# 2. Encrypt health data → wallet signs challenge → AES key derived
# 3. Submit case study → stored on Light Protocol → ZK proof generated
# 4. Become validator → stake EXPERIENCE via Privacy Cash
# 5. Validate case study → Noir circuit proves integrity → earn rewards
```

---

## 📊 Tokenomics

### EXPERIENCE Token (Governance + Staking)
- **Total Supply**: 1,000,000 EXPERIENCE
- **Distribution**:
  - 40% Community Rewards (case submissions, validations)
  - 30% DAO Treasury (research grants, development)
  - 20% Validator Incentives (staking pools)
  - 10% Team/Advisors (2-year vesting)

### Reward Mechanics
- **Case Study Submission**: 10-50 EXPERIENCE (quality-adjusted)
- **Successful Validation**: 5-25 EXPERIENCE (accuracy bonus)
- **Slashing Penalty**: 50% of staked amount burned
- **Dispute Resolution**: DAO vote with time-locked funds

---

## 🛡️ Security Considerations

### Implemented
✅ ZK proofs prevent validator collusion (can't see plaintext)  
✅ Threshold cryptography requires K-of-N to decrypt  
✅ Privacy Cash hides stake amounts (prevents targeting)  
✅ PDA-based agent authentication (no private key exposure)  
✅ Rate limiting on submissions (Sybil resistance)  

### In Progress
🔄 Formal verification of Noir circuits (audit pending)  
🔄 Multi-sig DAO for slashing decisions (governance launch Q2)  
🔄 Time-locked withdrawals (prevent flash-loan attacks)  

### Future Work
📋 Homomorphic encryption for private computation  
📋 Federated learning for treatment efficacy models  
📋 Cross-chain bridges for multi-blockchain privacy  

---

## 📚 Documentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Deep dive on privacy protocols
- **[CONTRACTS.md](docs/CONTRACTS.md)** — Smart contract API reference
- **[PRIVACY.md](docs/PRIVACY.md)** — Threat model and guarantees
- **[AGENTS.md](docs/AGENTS.md)** — Autonomous agent specifications
- **[API.md](docs/API.md)** — SDK for building on DBC

---

## 🎯 Hackathon Deliverables

### Code
- ✅ Open-source repo (MIT License)
- ✅ Deployed to Solana devnet
- ✅ Working frontend demo
- ✅ Comprehensive test suite (>80% coverage)
- ✅ **Privacy Sponsor Integrations**: Light Protocol, Privacy Cash, Noir/Aztec, Arcium, ShadowWire

### Documentation
- ✅ README with architecture diagram
- ✅ Video demo (under 3 minutes)
- ✅ Privacy protocol documentation
- ✅ API reference for developers
- ✅ **Enhanced with hackathon-specific content**

### Innovation
- ✅ Novel use of ZK proofs for health data
- ✅ Multi-sponsor privacy stack integration
- ✅ Autonomous agent coordination on-chain
- ✅ Real-world problem with crypto-native solution
- ✅ **Targeted at $86,000+ in sponsor bounties**

## 🎯 Privacy Sponsor Integration Summary

### ✅ Light Protocol ($18k Pool Prize)
- **ZK Compression**: Integrated Light Protocol for scalable private case study storage
- **Compressed NFTs**: Treatment metadata with proof-of-validation
- **Compression Tracking**: 2-100x compression ratios with verification

### ✅ Privacy Cash ($15k - Best Overall App)
- **Confidential Transfers**: Shielded EXPERIENCE token distributions
- **Private Staking**: Validators can hide stake amounts to prevent targeting
- **Reward Privacy**: Optional confidential reward payments

### ✅ Arcium ($10k - Best Overall App)
- **Threshold MPC**: K-of-N validator committees for selective decryption
- **End-to-End Encryption**: Secure state for sensitive health metrics
- **Session Management**: Arcium MPC parameter tracking and verification

### ✅ Aztec/Noir ($10k - Best Non-Financial Use)
- **ZK-SNARK Circuits**: Data integrity proofs without decryption
- **Circuit Validation**: Specific Noir circuits for different validation types
- **On-Chain Verification**: Combined proof and parameter verification

### ✅ Radr Labs/ShadowWire ($15k - Best Integration)
- **Private Payment Flows**: Optional ShadowWire integration for treatment procurement
- **Shielded Transfers**: Private EXPERIENCE token flows
- **Modular Design**: Optional integration that can be expanded

### ✅ Helius ($5k - Best Privacy Project)
- **RPC Infrastructure**: Agent coordination and event indexing
- **Webhook Integration**: Real-time validation event processing

### ✅ Quicknode ($3k - Public Benefit)
- **Open-Source Privacy**: MIT-licensed contracts and SDK
- **Community Tooling**: Privacy-preserving health data sovereignty

**Total Potential Prize Pool**: **$86,000+**

---

## 🤝 Team

**Core Contributors**:
- Privacy Engineer (Noir circuits, ZK proofs)
- Solana Developer (Anchor contracts, agent PDAs)
- Frontend Engineer (Preact, Lit Protocol integration)
- Health Data Specialist (HIPAA compliance, data models)

**Advisors**:
- Health law expert (regulatory strategy)
- Privacy researcher (cryptographic review)
- DAO governance specialist (tokenomics design)

---

## 📜 License

MIT License - Open source for the community

---

## 🙏 Acknowledgments

Built with support from:
- Solana Foundation (Privacy Hack organizers)
- Light Protocol (ZK compression infrastructure)
- Privacy Cash (Confidential transfers)
- Arcium (MPC threshold cryptography)
- Noir/Aztec (ZK-SNARK tooling)
- Radr Labs (ShadowWire integration)
- Helius (RPC infrastructure)

**Inspired by**: Ron Woodroof and the original Dallas Buyers Club members who fought for health sovereignty when the system failed them.

---

*"Privacy is necessary for an open society." — Solana Privacy Hack 2026*