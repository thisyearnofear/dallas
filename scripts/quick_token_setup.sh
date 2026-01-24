#!/bin/bash

# Dallas Buyers Club - Quick EXPERIENCE Token Setup
# Simplified script for fast deployment

echo "🚀 Quick EXPERIENCE Token Setup"
echo "================================"
echo ""

# Ensure we're on devnet
echo "🌐 Setting network to devnet..."
solana config set --url https://api.devnet.solana.com

# Get some devnet SOL if needed
echo "💰 Checking SOL balance..."
BALANCE=$(solana balance | grep -o '[0-9.]* SOL')
if [[ $(echo "$BALANCE" | grep -o '[0-9.]*') < 0.1 ]]; then
    echo "⚠️  Low balance, requesting airdrop..."
    solana airdrop 1
fi

echo ""
echo "🎯 Creating EXPERIENCE Token Mint..."
echo "This will create the token with 6 decimals"
echo ""

# Create the token mint
MINT_OUTPUT=$(spl-token create-token --decimals 6 2>&1)

# Extract mint address
EXPERIENCE_MINT=$(echo "$MINT_OUTPUT" | grep -o '[A-Za-z0-9]\{44\}' | head -1)

if [[ -z "$EXPERIENCE_MINT" ]]; then
    echo "❌ Failed to create token mint"
    echo "$MINT_OUTPUT"
    exit 1
fi

echo "✅ Token Mint Created!"
echo "📋 Mint Address: $EXPERIENCE_MINT"
echo ""

# Create associated token accounts
echo "🏦 Creating token accounts..."

# Treasury account
TREASURY="BpHqwwKRqhNRzyZHT5U4un9vfyivcbvcgrmFRfboGJsK"
echo "Creating treasury token account..."
spl-token create-account $EXPERIENCE_MINT --owner $TREASURY

# Your wallet
YOUR_WALLET=$(solana address)
echo "Creating your wallet token account..."
spl-token create-account $EXPERIENCE_MINT --owner $YOUR_WALLET

echo ""
echo "📝 Update src/config/solana.ts with:"
echo "experienceMintAddress: '$EXPERIENCE_MINT'"
echo ""

echo "✅ Setup Complete!"
echo ""
echo "🎉 Next Steps:"
echo "1. Update the config file"
echo "2. Initialize token configuration on-chain"
echo "3. Test the complete flow"
echo ""
echo "Your mint address: $EXPERIENCE_MINT"
