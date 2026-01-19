# Dallas Buyers Club: Testing Guide

## Testing Checklist

### UI/UX
- [ ] Navigate to `/experiences` loads successfully
- [ ] Tab switching works (Discover ↔ Share)
- [ ] Form fields accept input
- [ ] Sliders update values in real-time
- [ ] Add/remove side effects works
- [ ] Responsive design on mobile

### Privacy
- [ ] Derive key button requires wallet
- [ ] Key derivation doesn't error
- [ ] Form submit encrypts data
- [ ] Console shows encrypted output (base64)
- [ ] Different users have different encrypted outputs

### Agent
- [ ] Search with no interests shows alert
- [ ] Search with interests returns protocols
- [ ] Protocol cards show correct stats
- [ ] Click protocol opens modal
- [ ] Request access shows confirmation

## Debugging Tips

### Issue: Wallet Not Connected
**Solution:** Make sure you have Phantom wallet installed and connected to devnet/localhost

### Issue: Encryption Failing
**Solution:** Check that:
1. `encryptionKey` is 32 bytes (check: `key.length === 32`)
2. Message is valid string
3. Check browser console for specific error

### Issue: Protocol Search Returns Nothing
**Solution:** The protocols are hardcoded in `PrivacyCoordinationAgent`. Check:
- Interest tags must match protocol tags
- Protocol tags: `immune-support`, `natural`, `low-cost`, etc.
- Try "immune-support" tag which matches most protocols

### Issue: Form Not Submitting
**Solution:**
1. Check browser console for errors
2. Verify encryption key was derived
3. Check that `treatmentProtocol` field is not empty
4. Verify `encryptionKey` state is set

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Phantom wallet (browser extension)
- Git

### Local Development

```bash
# Clone repository
git clone <repo-url>
cd dallas

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will start at `http://localhost:5173`.

### Solana Wallet Setup

1. **Install Phantom:** Go to https://phantom.app/
2. **Create/import a Solana wallet**
3. **Connect to devnet:**
   ```bash
   # Using Solana CLI
   solana airdrop 2 <your-wallet-address> --url devnet
   ```

### Solana Configuration

Edit `src/config/solana.ts`:
```typescript
export const SOLANA_CONFIG = {
  network: 'devnet' as const,  // Options: 'devnet', 'testnet', 'mainnet-beta'
  treasuryAddress: 'YOUR_SOLANA_WALLET_ADDRESS_HERE',
  defaults: {
    donationAmount: 0.5,
    membershipBronze: 0.1,
    membershipSilver: 0.5,
    membershipGold: 2.0,
  }
}
```

## Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Testing

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch   # Watch mode for development
```

### Test Coverage
- **Agent Network Tests**: Verify agent instantiation, decision-making, and coordination
- **Solana Configuration Tests**: Validate blockchain setup and transaction defaults
- **Edenlayer Integration Tests**: Test MCP protocol registration and agent capabilities

## Current Implementation Status

**Last Updated:** Jan 17, 2026 | **Phase:** 1 (Hackathon MVP)

### What's Done
- ✅ Privacy infrastructure complete (encryption, agents, UI components)
- ✅ Smart contracts complete (case studies, validators, tokens)
- ✅ Integration layer complete (BlockchainService, BlockchainIntegration)
- ✅ UI components ready (EncryptedCaseStudyForm, ProtocolDiscovery, ValidationDashboard)

### What's Next
- 🔄 Deployment pending (Jan 29 devnet launch)
- 🔄 Frontend wiring pending (form → blockchain integration)
- 🔄 Privacy tooling integration (Arcium/Privacy Cash - Feb 5)

### Files Created/Modified
**New Files (13):**
- `src/utils/encryption.ts`
- `src/agents/PrivacyCoordinationAgent.ts`
- `src/components/EncryptedCaseStudyForm.tsx`
- `src/components/ProtocolDiscovery.tsx`
- `src/components/ValidationDashboard.tsx`
- `src/pages/experiences.tsx`
- `programs/case_study/Cargo.toml`
- `programs/case_study/src/lib.rs`
- `programs/experience_token/Cargo.toml`
- `programs/experience_token/src/lib.rs`
- `src/services/BlockchainService.ts`
- `src/services/BlockchainIntegration.ts`
- `Anchor.toml`

**Modified Files (4):**
- `src/index.tsx` (added route)
- `src/components/Navbar.tsx` (added nav item)
- `src/pages/home.tsx` (added health sovereignty section)
- `package.json` (added Anchor dependency)

## Build Status

```
dist/index.html                   1.68 kB
dist/assets/index-CVTRu4jk.css   67.17 kB
dist/assets/index-VZYgvWh1.js   503.11 kB

Build time: 1.72s
All modules compiled successfully
```
