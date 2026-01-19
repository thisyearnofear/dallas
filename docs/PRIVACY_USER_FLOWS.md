# Dallas Buyers Club: Privacy-Enhanced User Flows

## Overview
This document describes the enhanced user flows incorporating privacy sponsor integrations (Light Protocol, Noir/Aztec, Arcium, Privacy Cash, ShadowWire).

## Patient User Flow: Submit Encrypted Case Study with Light Protocol Compression

```mermaid
sequenceDiagram
    participant Patient as Patient
    participant UI as User Interface
    participant Light as Light Protocol
    participant Solana as Solana Blockchain
    participant IPFS as IPFS Storage

    Patient->>UI: Connect Wallet
    UI->>Patient: Show EncryptedCaseStudyForm
    Patient->>UI: Click "Derive Encryption Key"
    UI->>Light: Request ZK compression parameters
    Light->>UI: Return compression options (2-100x)
    UI->>Patient: Show compression choices
    Patient->>UI: Select compression ratio (e.g., 10x)
    Patient->>UI: Fill treatment details
    Patient->>UI: Click "Submit Encrypted Case Study"
    UI->>Light: Compress data with Light Protocol
    Light->>UI: Return compressed payload + ZK proof
    UI->>Solana: Submit to case_study.rs with:
    Solana->>Solana: Store Light Protocol proof hash
    UI->>IPFS: Upload encrypted compressed payload
    IPFS->>UI: Return IPFS CID
    UI->>Solana: Complete submission with IPFS CID
    Solana->>Patient: Emit CaseStudySubmitted event
    UI->>Patient: Show success with compression stats
```

### Enhanced Form Elements
- **Compression Selector**: Dropdown to choose Light Protocol compression ratio (2x, 5x, 10x, 20x, 50x, 100x)
- **Privacy Sponsor Info**: Tooltips explaining each sponsor's role
- **Compression Preview**: Estimated storage savings display

## Validator User Flow: Validate with Noir/Aztec ZK Proofs

```mermaid
sequenceDiagram
    participant Validator as Validator
    participant UI as Validation Dashboard
    participant Noir as Noir/Aztec
    participant Solana as Solana Blockchain

    Validator->>UI: Connect Wallet
    UI->>Validator: Show pending case studies
    Validator->>UI: Select case study to validate
    UI->>Noir: Request appropriate circuit for validation type
    Noir->>UI: Return circuit ID and parameters
    UI->>Validator: Show circuit info and validation options
    Validator->>UI: Select validation type + stake amount
    Validator->>UI: Choose "Use Privacy Cash" for confidential staking
    UI->>Noir: Generate ZK proof of validation
    Noir->>UI: Return proof + public inputs
    UI->>Solana: Call validator_prove_integrity with:
    Solana->>Solana: Store Noir circuit ID + verification hash
    Solana->>Validator: Emit ValidationProofSubmitted event
    UI->>Validator: Show success with ZK proof details
```

### Enhanced Validation Features
- **Circuit Selection**: Automatic Noir circuit selection based on validation type
- **Privacy Cash Toggle**: Checkbox to enable confidential staking
- **ZK Proof Visualization**: Proof hash and circuit parameter display
- **Reputation Impact**: Real-time reputation score preview

## Researcher User Flow: Request Arcium MPC Decryption

```mermaid
sequenceDiagram
    participant Researcher as Researcher
    participant UI as Research Dashboard
    participant Arcium as Arcium MPC
    participant Solana as Solana Blockchain

    Researcher->>UI: Connect Wallet
    UI->>Researcher: Show available case studies
    Researcher->>UI: Select case study for research
    UI->>Arcium: Request MPC session initialization
    Arcium->>UI: Return session ID and parameters
    UI->>Researcher: Show threshold requirements (e.g., 3/5 validators)
    Researcher->>UI: Provide justification + select encryption scheme
    UI->>Solana: Call request_committee_access with Arcium params
    Solana->>Solana: Store Arcium params hash
    Solana->>Researcher: Emit AccessRequested event
    loop Wait for validator approvals
        Validator->>UI: Review access request
        Validator->>UI: Click "Approve with Arcium Share"
        UI->>Arcium: Generate MPC share proof
        Arcium->>UI: Return share commitment + proof
        UI->>Solana: Call approve_access_request with Arcium proof
        Solana->>Validator: Emit ShareDistributed event
    end
    Solana->>Researcher: Emit AccessGranted event
    UI->>Arcium: Request decryption with all shares
    Arcium->>UI: Return decrypted data
    UI->>Researcher: Display decrypted case study
```

### Enhanced Research Features
- **MPC Session Dashboard**: Real-time approval tracking (3/5 validators approved)
- **Encryption Scheme Selector**: AES-256, ChaCha20, or Custom options
- **Arcium Proof Explorer**: Visualization of MPC share commitments
- **Decryption Audit Log**: Complete history of access requests and approvals

## Reward Distribution Flow: Privacy Cash & ShadowWire

```mermaid
sequenceDiagram
    participant Patient as Patient
    participant UI as Rewards Interface
    participant PrivacyCash as Privacy Cash
    participant ShadowWire as ShadowWire
    participant Solana as Solana Blockchain

    Solana->>UI: Case study validation completed
    UI->>Patient: Show reward notification
    Patient->>UI: Click "Claim Reward"
    UI->>Patient: Show privacy options:
    alt Privacy Cash Selected
        Patient->>UI: Select "Privacy Cash (Confidential)"
        UI->>PrivacyCash: Request shielded transfer
        PrivacyCash->>UI: Return confidential transfer proof
        UI->>Solana: Call reward_case_study with use_privacy_cash=true
        Solana->>Solana: Emit PrivacyCashTransfer event
        UI->>Patient: Show confidential reward confirmation
    else ShadowWire Selected
        Patient->>UI: Select "ShadowWire (Private Payment)"
        UI->>ShadowWire: Request private payment flow
        ShadowWire->>UI: Return private transfer details
        UI->>Solana: Call reward_case_study with use_shadowwire=true
        Solana->>Solana: Emit ShadowWireTransfer event
        UI->>Patient: Show private payment confirmation
    else Standard Transfer
        Patient->>UI: Select "Standard Transfer"
        UI->>Solana: Call reward_case_study with default options
        Solana->>Solana: Emit RewardDistributed event
        UI->>Patient: Show standard reward confirmation
    end
```

### Enhanced Reward Features
- **Privacy Toggle**: Radio buttons for Privacy Cash vs ShadowWire vs Standard
- **Confidentiality Indicator**: Visual cues showing transfer privacy level
- **Reward Breakdown**: Detailed token allocation explanation
- **Historical Privacy**: Past reward privacy settings display

## Agent Coordination Flow: Privacy-Aware Autonomous Operations

```mermaid
sequenceDiagram
    participant RiskAgent as Risk Agent (PDA)
    participant SupplyAgent as Supply Agent (PDA)
    participant CommunityAgent as Community Agent (PDA)
    participant Solana as Solana Blockchain
    participant Helius as Helius RPC

    Helius->>RiskAgent: Webhook: New case study submitted
    RiskAgent->>Solana: Analyze case study metadata
    alt High Risk Detected
        RiskAgent->>Solana: Call agent_pause_validation
        Solana->>Solana: Pause validation
        Solana->>RiskAgent: Emit ValidationPaused event
        RiskAgent->>CommunityAgent: Notify community of risk
    else Normal Risk
        RiskAgent->>SupplyAgent: Approve for validation
        SupplyAgent->>Solana: Monitor treatment availability
        SupplyAgent->>CommunityAgent: Update pricing data
        CommunityAgent->>Solana: Adjust validator reputation weights
    end
    CommunityAgent->>Solana: Distribute rewards via agent_distribute_reward
    Solana->>Solana: Use Privacy Cash for confidential distributions
    Solana->>CommunityAgent: Emit AgentRewardDistributed event
```

### Enhanced Agent Features
- **Privacy-Aware Risk Analysis**: ZK proof validation without decryption
- **Confidential Rewards**: Privacy Cash integration for agent distributions
- **Real-time Monitoring**: Helius webhook-driven agent coordination
- **Transparent Governance**: On-chain agent action logging

## Technical Implementation Details

### Light Protocol Integration Points
- **UI**: Compression ratio selector in EncryptedCaseStudyForm
- **Smart Contract**: `light_protocol_proof` parameter in `submit_encrypted_case_study`
- **Storage**: Compression ratio and proof hash stored in CaseStudy account
- **Events**: `CaseStudySubmitted` includes Light Protocol details

### Noir/Aztec Integration Points
- **UI**: Circuit selection and ZK proof generation in ValidationDashboard
- **Smart Contract**: `noir_circuit_id` and `circuit_params_hash` in `validator_prove_integrity`
- **Storage**: Circuit verification hash stored in ValidatorStake account
- **Events**: `ValidationProofSubmitted` includes Noir verification details

### Arcium Integration Points
- **UI**: MPC session dashboard and share approval tracking
- **Smart Contract**: `arcium_mpc_params` in `request_committee_access`
- **Storage**: Arcium params hash and encryption scheme in AccessRequest account
- **Events**: `ArciumSessionInitialized` and `ArciumDecryptionComplete` events

### Privacy Cash Integration Points
- **UI**: Privacy toggle in reward claiming interface
- **Smart Contract**: `use_privacy_cash` parameter in `reward_case_study` and `stake_for_validation`
- **Storage**: Shielded status in StakeAccount
- **Events**: `PrivacyCashTransfer` and `PrivacyCashShield` events

### ShadowWire Integration Points
- **UI**: Private payment option in reward interface
- **Smart Contract**: `use_shadowwire` parameter in `reward_case_study`
- **Events**: `ShadowWireTransfer` event

## User Experience Enhancements

### Visual Privacy Indicators
- **Compression Badges**: "10x Light Protocol Compression" badges on case studies
- **ZK Proof Icons**: 🔐 icons indicating ZK-SNARK validation
- **MPC Status**: "3/5 Approvals" progress bars for decryption requests
- **Privacy Shields**: 🛡️ icons for confidential transfers

### Educational Tooltips
- **Light Protocol**: "Your data is compressed 10x using Light Protocol ZK compression"
- **Noir/Aztec**: "Validators prove data integrity without seeing your private information"
- **Arcium MPC**: "Your data requires 3 independent validators to approve decryption"
- **Privacy Cash**: "Your rewards are transferred confidentially to protect your privacy"

### Privacy Dashboard
- **Compression Stats**: Total storage saved via Light Protocol
- **ZK Proof Count**: Number of Noir proofs generated
- **MPC Sessions**: Active Arcium decryption sessions
- **Confidential Transfers**: Privacy Cash and ShadowWire transaction history

## Error Handling and User Guidance

### Common Privacy Errors and Solutions

| Error | Cause | User Solution |
|-------|-------|--------------|
| `InvalidCompressionRatio` | Compression ratio outside 2-100x range | Select valid compression ratio |
| `MissingLightProtocolProof` | Light Protocol proof not provided | Retry submission with compression |
| `InvalidCircuitId` | Invalid Noir circuit selected | Use default circuit or contact support |
| `MissingArciumParams` | Arcium MPC parameters missing | Provide valid MPC parameters |
| `MissingArciumShareProof` | Arcium share proof not provided | Regenerate MPC share proof |

### Privacy Fallback Mechanisms
- **Compression Failure**: Fallback to uncompressed submission with warning
- **ZK Proof Failure**: Fallback to standard validation with reputation penalty
- **MPC Failure**: Fallback to standard access control with logging
- **Privacy Cash Failure**: Fallback to standard transfers with notification

## Performance Considerations

### Optimization Strategies
- **Adaptive Compression**: Automatically select optimal Light Protocol compression ratio
- **Circuit Caching**: Cache frequently used Noir circuits for faster validation
- **Batch MPC**: Batch Arcium MPC operations for efficiency
- **Lazy Privacy**: Defer Privacy Cash operations until necessary

### Resource Management
- **Compression Limits**: Maximum 100x compression to prevent excessive computation
- **ZK Proof Size**: Limit proof sizes to maintain blockchain efficiency
- **MPC Timeout**: 24-hour timeout for Arcium decryption sessions
- **Privacy Throttling**: Rate limiting for confidential transfers

## Future Enhancements

### Roadmap Items
- **Cross-Sponsor Analytics**: Dashboard showing combined privacy benefits
- **Automated Circuit Selection**: AI-driven Noir circuit recommendations
- **MPC Performance Monitoring**: Real-time Arcium session performance tracking
- **Privacy Health Score**: Composite privacy metric for users
- **Sponsor Integration Wizard**: Guided setup for new privacy sponsors

### Research Directions
- **Homomorphic Encryption**: Private computation on encrypted data
- **Federated Learning**: Privacy-preserving treatment efficacy models
- **Cross-Chain Privacy**: Multi-blockchain privacy bridges
- **Quantum-Resistant Cryptography**: Future-proof encryption schemes