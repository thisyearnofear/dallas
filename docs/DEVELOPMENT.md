# Dallas Buyers Club: Development Guide

## Quick Start

### Running the App

```bash
# Install dependencies (if not already done)
npm install

# Start dev server
npm run dev

# Navigate to http://localhost:5173
```

### Exploring Features

#### Health Sovereignty Page
Navigate to: `http://localhost:5173/experiences`

**Two Tabs:**
- **Discover Protocols:** Search health protocols by interests
- **Share Your Experience:** Submit encrypted case studies

#### Test the Encryption Flow

**Discover Tab:**
```
1. Select interest tags (immune-support, energy-boost, etc.)
2. Click "Search Protocols"
3. View matched protocols with validation stats
4. Click protocol card for details
5. Click "Request Access to Case Studies"
```

**Share Tab:**
```
1. Click "Derive Encryption Key from Wallet"
   - This prompts wallet signature (Phantom in testnet)
   - Key is derived deterministically from signature
2. Fill out case study form:
   - Treatment protocol
   - Baseline metrics (1-10 scales)
   - Outcome metrics
   - Side effects
   - Cost & context
3. Click "Submit Encrypted Case Study"
   - Data is encrypted locally with your wallet key
   - Check browser console to see encrypted output
   - Form resets on success
```

## File Structure

### Smart Contracts (Anchor)

```
programs/
├── case_study/
│   ├── Cargo.toml
│   └── src/lib.rs                 # Encrypted case study storage + validation
├── experience_token/
│   ├── Cargo.toml
│   └── src/lib.rs                 # EXPERIENCE token (1M supply, minting, slashing)
└── Anchor.toml                    # Configuration & deployments
```

### New Components

```
src/components/
├── EncryptedCaseStudyForm.tsx    # Case study submission (ready for blockchain)
├── ProtocolDiscovery.tsx          # Protocol search & discovery
├── ValidationDashboard.tsx        # Validator approval UI
└── (all used by /experiences page)

src/agents/
├── PrivacyCoordinationAgent.ts    # Matches users privately

src/utils/
├── encryption.ts                  # Encryption utilities
└── (deriveEncryptionKey, encryptHealthData, decryptHealthData)

src/services/
├── BlockchainService.ts           # Low-level blockchain interactions
├── BlockchainIntegration.ts       # High-level flows (submit, validate, etc)
└── (Wired up; awaiting devnet deployment)

src/pages/
├── experiences.tsx                # Health Sovereignty landing page
```

### Modified Files

```
src/
├── index.tsx                      # Added /experiences route
├── components/Navbar.tsx          # Added Health Journeys nav item
├── pages/home.tsx                 # Added Health Sovereignty section
└── package.json                   # Added @coral-xyz/anchor dependency
```

## Key Code Examples

### Deriving Encryption Key

```typescript
import { deriveEncryptionKey } from '../utils/encryption';

const key = await deriveEncryptionKey(publicKey, signMessage);
// Returns: Uint8Array (32 bytes)
// Deterministic: same wallet always derives same key
```

### Encrypting Data

```typescript
import { encryptHealthData } from '../utils/encryption';

const metrics = {
  symptomSeverity: 8,
  energyLevel: 3,
  notes: "Fatigued, severe symptoms"
};

const encrypted = encryptHealthData(
  JSON.stringify(metrics),
  encryptionKey
);
// Returns: Base64 string
// Format: nonce (24 bytes) + ciphertext
```

### Decrypting Data

```typescript
import { decryptHealthData } from '../utils/encryption';

const metrics = JSON.parse(
  decryptHealthData(encryptedString, encryptionKey)
);
```

### Privacy Agent Usage

```typescript
import { PrivacyCoordinationAgent } from '../agents/PrivacyCoordinationAgent';

const agent = new PrivacyCoordinationAgent();

const result = await agent.matchUserToProtocols({
  treatmentInterests: ['immune-support', 'natural'],
  difficulty: 'easy'
});

// Returns: AgentDecision with matched protocols
```

## Component Props & Structure

### EncryptedCaseStudyForm

No props required. Uses WalletContext for:
- `publicKey: PublicKey`
- `signMessage: (message: Uint8Array) => Promise<Uint8Array>`

**State Managed:**
- Encryption key derivation
- Form data (treatment, metrics, side effects)
- Submission status

### ProtocolDiscovery

No props required.

**Internal State:**
- Selected interests (tags)
- Selected difficulty level
- Matched protocols list
- Selected protocol for detail view

**Output:**
- Logs to console when "Request Access" is clicked
