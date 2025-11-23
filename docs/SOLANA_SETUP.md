# Solana Integration Setup Guide

Your Dallas Buyers Club site is now wired up with Solana wallet connectivity for SOL transactions.

## Quick Start

### 1. Update Your Wallet Address

Edit `src/config/solana.ts` and replace the treasury address with your own:

```typescript
treasuryAddress: 'YOUR_SOLANA_WALLET_ADDRESS_HERE',
```

### 2. Choose Your Network

In `src/config/solana.ts`, change the network:

```typescript
network: 'devnet' as const,  // Options: 'devnet', 'testnet', 'mainnet-beta'
```

- **devnet**: For testing (free SOL via faucet)
- **testnet**: Stable testing network
- **mainnet-beta**: Production (real SOL)

### 3. Customize Membership Prices

In `src/config/solana.ts`, update the default amounts:

```typescript
defaults: {
  donationAmount: 0.5,
  membershipBronze: 0.1,
  membershipSilver: 0.5,
  membershipGold: 2.0,
}
```

## Features Enabled

### ✓ Wallet Connection
- Phantom wallet integration (appears in header)
- Auto-detection of existing connections
- Connect/Disconnect buttons

### ✓ Donations
- `/donate` page has Solana payment integration
- Users can donate any custom amount
- Confirms transactions before sending

### ✓ Membership Purchases
- `/membership` page shows 3 tiers (Bronze, Silver, Gold)
- Each tier has configurable price in SOL
- Direct on-chain payments

### ✓ Transaction Handling
- Signs transactions with user's wallet
- Waits for blockchain confirmation
- Shows transaction hash on success
- Error handling for failed transactions

## Components

### WalletButton (`src/components/WalletButton.tsx`)
Displays wallet connection status in header. Shows shortened address when connected.

### SolanaTransfer (`src/components/SolanaTransfer.tsx`)
Reusable component for any SOL transfer. Props:
- `amount`: SOL amount (default from config)
- `label`: Button label
- `recipientAddress`: Destination address (default from config)

### MembershipPurchase (`src/components/MembershipPurchase.tsx`)
Membership tier selection with integrated payment flow.

## Context

### WalletContext (`src/context/WalletContext.tsx`)
Global wallet state using Preact context:
- `publicKey`: User's Solana public key
- `connected`: Connection status
- `connect()`: Trigger wallet connection
- `disconnect()`: Disconnect wallet
- `sendTransaction()`: Send SOL transfer

## Testing

### On Devnet:
1. Install Phantom (browser extension)
2. Create/import account
3. Get free SOL: https://faucet.solana.com/
4. Site will work with test transactions

### On Mainnet:
1. Update network to `mainnet-beta` in config
2. Update treasury address to your real wallet
3. Deploy site
4. Users send real SOL

## Customization

### Add Token Transfers (SPL Tokens)
Update `src/config/solana.ts`:
```typescript
tokenMint: 'YOUR_TOKEN_MINT_ADDRESS',
```

Then update `sendTransaction()` in `WalletContext` to use Token Program instead of System Program.

### Add More Payment Points
Create new pages/components and import `SolanaTransfer`:

```tsx
import { SolanaTransfer } from '../components/SolanaTransfer';

export function MyPage() {
  return (
    <SolanaTransfer 
      amount={0.25}
      label="Buy Product"
    />
  );
}
```

### Customize Error Messages
Edit error handling in:
- `SolanaTransfer.tsx` - form validation/feedback
- `WalletContext.tsx` - transaction errors

## Network Info

- **Devnet RPC**: https://api.devnet.solana.com
- **Testnet RPC**: https://api.testnet.solana.com
- **Mainnet RPC**: https://api.mainnet-beta.solana.com

For production, consider using a private RPC endpoint:
- Helius (https://helius.xyz/)
- Magic Eden (https://magiceden.io/)
- Alchemy (https://www.alchemy.com/)

## Troubleshooting

### Phantom Not Detected
- User needs Phantom installed: https://phantom.app/
- Reload page after installing
- Check browser console for errors

### Transaction Fails
- Check user has enough SOL for transaction + fees
- Verify recipient address is valid
- Check RPC endpoint status
- Try testnet/devnet first

### Wrong Network
- Phantom may be on different network than site
- Site shows error if address validation fails
- User needs to switch networks in Phantom

## Production Checklist

- [ ] Update `treasuryAddress` to your wallet
- [ ] Set `network` to `mainnet-beta`
- [ ] Update membership prices
- [ ] Test transactions on devnet first
- [ ] Deploy to production
- [ ] Monitor transactions
- [ ] Set up proper RPC endpoint

## Architecture

```
src/
├── components/
│   ├── WalletButton.tsx          # Header wallet UI
│   ├── SolanaTransfer.tsx        # Reusable transfer form
│   └── MembershipPurchase.tsx    # Membership tier selection
├── context/
│   └── WalletContext.tsx         # Global wallet state
├── config/
│   └── solana.ts                 # Addresses, networks, amounts
└── pages/
    ├── donate.tsx                # Donation page
    └── membership.tsx            # Membership with purchases
```

The context uses Phantom's browser injection API directly (no complex wallet adapters), keeping the bundle small and the code simple.
