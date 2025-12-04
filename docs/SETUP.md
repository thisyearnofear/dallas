# Setup & Configuration Guide

## Installation

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

The application will start at `http://localhost:5173` (or next available port).

## Solana Wallet Setup

### 1. Install Phantom

1. Go to https://phantom.app/
2. Install browser extension
3. Create or import a Solana wallet
4. Keep browser open during development

### 2. Connect to Network

The app will display wallet connection in the header:
- Click wallet button to connect
- Phantom will prompt for approval
- Connected address displays when linked

### 3. Get Test SOL (Devnet)

For testing without real funds:

```bash
# Using Solana CLI
solana airdrop 2 <your-wallet-address> --url devnet

# Or visit faucet
https://faucet.solana.com/
```

## Solana Configuration

Edit `src/config/solana.ts`:

### Network Selection

```typescript
export const SOLANA_CONFIG = {
  network: 'devnet' as const,  // Options: 'devnet', 'testnet', 'mainnet-beta'
}
```

**Network Options**:
- `devnet` - Testing (free SOL via faucet)
- `testnet` - Stable testing network
- `mainnet-beta` - Production (real SOL)

### Treasury Address

```typescript
treasuryAddress: 'YOUR_SOLANA_WALLET_ADDRESS_HERE',
```

Replace with your Solana wallet address to receive payments.

### Membership Prices

```typescript
defaults: {
  donationAmount: 0.5,
  membershipBronze: 0.1,
  membershipSilver: 0.5,
  membershipGold: 2.0,
}
```

Adjust amounts in SOL for different transaction types.

## Component Reference

### WalletButton

Displays wallet connection status in header:

```tsx
import { WalletButton } from '../components/WalletButton';

<WalletButton />
```

Shows:
- "Connect Wallet" button when disconnected
- Shortened address (e.g., "Abc...XYZ") when connected
- Disconnect option

### SolanaTransfer

Reusable component for SOL transfers:

```tsx
import { SolanaTransfer } from '../components/SolanaTransfer';

<SolanaTransfer 
  amount={0.5}
  label="Send Payment"
  recipientAddress="optional-custom-address"
/>
```

Props:
- `amount`: SOL amount to transfer
- `label`: Button label text
- `recipientAddress`: Destination (optional, uses config default)

### MembershipPurchase

Membership tier selection with integrated payment:

```tsx
import { MembershipPurchase } from '../components/MembershipPurchase';

<MembershipPurchase />
```

Displays 3 tiers (Bronze, Silver, Gold) with prices from config.

## Context API

### WalletContext

Global wallet state management:

```tsx
import { useWallet } from '../context/WalletContext';

function MyComponent() {
  const { publicKey, connected, connect, disconnect, sendTransaction } = useWallet();
  
  return (
    <div>
      {connected ? `Connected: ${publicKey}` : 'Not connected'}
    </div>
  );
}
```

Available methods:
- `publicKey`: User's Solana public key (or null)
- `connected`: Boolean connection status
- `connect()`: Trigger wallet connection dialog
- `disconnect()`: Disconnect current wallet
- `sendTransaction(to, amount)`: Send SOL transfer

## Testing Transactions

### On Devnet

1. Network set to `devnet` in config
2. Have test SOL (get from faucet)
3. Transactions confirm in ~10-20 seconds
4. No real fees charged

### On Mainnet

1. Update config: `network: 'mainnet-beta'`
2. Update treasury address to real wallet
3. Ensure adequate SOL for fees
4. Transactions use real SOL

## Build & Deployment

### Development Build

```bash
npm run dev
```

Hot reload enabled for development.

### Production Build

```bash
npm run build
```

Optimized bundle in `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

Serves optimized build locally.

## Environment Variables

Create `.env` file if needed:

```env
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
```

## Troubleshooting

### Phantom Not Detected

- Install Phantom: https://phantom.app/
- Reload page after installing
- Check browser console for errors

### Transaction Fails

- Verify user has enough SOL (amount + fees)
- Confirm recipient address is valid
- Check RPC endpoint status
- Try on devnet/testnet first

### Wrong Network in Phantom

- Phantom may be on different network than app
- App shows network mismatch error
- User must switch networks in Phantom to match config

### Connection Timeout

- Check internet connection
- Verify RPC endpoint is responding
- Try different RPC endpoint in config

## RPC Endpoints

### Public Endpoints

- **Devnet**: https://api.devnet.solana.com
- **Testnet**: https://api.testnet.solana.com
- **Mainnet**: https://api.mainnet-beta.solana.com

### Private RPC Services (Production)

For better reliability and rate limits:
- **Helius**: https://helius.xyz/
- **Magic Eden**: https://magiceden.io/
- **Alchemy**: https://www.alchemy.com/

## Production Checklist

- [ ] Update treasury address in config
- [ ] Set network to `mainnet-beta`
- [ ] Update membership prices
- [ ] Test on devnet first
- [ ] Verify RPC endpoint performance
- [ ] Set up private RPC endpoint
- [ ] Deploy to production
- [ ] Monitor transactions

## Next Steps

- Run `npm run dev` to start local development
- Visit http://localhost:5173 in browser
- Connect Phantom wallet
- Test transactions on devnet
