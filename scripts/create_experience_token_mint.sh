#!/bin/bash

# Dallas Buyers Club - EXPERIENCE Token Mint Creation Script
# This script guides you through creating the EXPERIENCE token mint
# and initializing the token configuration on-chain

echo "🚀 Dallas Buyers Club - EXPERIENCE Token Mint Creation"
echo "===================================================="
echo ""

# Step 1: Check Solana CLI installation
echo "🔍 Checking Solana CLI installation..."
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Please install it first:"
    echo "   https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
fi

if ! command -v spl-token &> /dev/null; then
    echo "❌ SPL Token CLI not found. Installing..."
    cargo install spl-token-cli
fi

echo "✅ Solana CLI tools are installed"
echo ""

# Step 2: Check network configuration
echo "🌐 Checking network configuration..."
CURRENT_NETWORK=$(solana config get | grep "RPC URL:" | cut -d ":" -f 2- | xargs)
echo "Current network: $CURRENT_NETWORK"

if [[ "$CURRENT_NETWORK" != *"devnet"* ]]; then
    echo "⚠️  Warning: Not on devnet. Switching to devnet..."
    solana config set --url https://api.devnet.solana.com
    echo "✅ Switched to devnet"
fi

echo ""

# Step 3: Create the EXPERIENCE token mint
echo "💰 Creating EXPERIENCE Token Mint..."
echo "This will create a new SPL token with 6 decimals"
echo ""

read -p "Are you ready to create the token mint? (y/n) " -n 1 -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🏃 Aborted. You can run this script again when ready."
    exit 0
fi

echo ""
echo "🔧 Creating token mint..."
MINT_OUTPUT=$(spl-token create-token --decimals 6 2>&1)

if [[ $? -ne 0 ]]; then
    echo "❌ Failed to create token mint:"
    echo "$MINT_OUTPUT"
    exit 1
fi

# Extract the mint address from the output
EXPERIENCE_MINT=$(echo "$MINT_OUTPUT" | grep -o 'Creating token [A-Za-z0-9]\{44\}' | sed 's/Creating token //')

if [[ -z "$EXPERIENCE_MINT" ]]; then
    echo "❌ Could not extract mint address from output:"
    echo "$MINT_OUTPUT"
    exit 1
fi

echo "✅ EXPERIENCE Token Mint created successfully!"
echo "📋 Mint Address: $EXPERIENCE_MINT"
echo ""

# Step 4: Create associated token accounts
echo "🏦 Creating associated token accounts..."

# Treasury account (from config)
TREASURY_ADDRESS="BpHqwwKRqhNRzyZHT5U4un9vfyivcbvcgrmFRfboGJsK"
echo "Creating treasury token account..."
spl-token create-account $EXPERIENCE_MINT --owner $TREASURY_ADDRESS

# Your wallet account (you'll need to replace this with your actual wallet)
WALLET_ADDRESS=$(solana address)
echo "Creating your wallet token account..."
spl-token create-account $EXPERIENCE_MINT --owner $WALLET_ADDRESS

echo "✅ Associated token accounts created"
echo ""

# Step 5: Update configuration file
echo "📝 Updating configuration..."
CONFIG_FILE="src/config/solana.ts"

# Check if the placeholder exists
if grep -q "EXPERIENCE_MINT_ADDRESS_NEEDED" "$CONFIG_FILE"; then
    echo "Found placeholder in config file"
    
    # Create backup
    cp "$CONFIG_FILE" "${CONFIG_FILE}.backup"
    
    # Replace the placeholder
    sed -i "" "s/EXPERIENCE_MINT_ADDRESS_NEEDED/'$EXPERIENCE_MINT'/" "$CONFIG_FILE"
    
    echo "✅ Configuration updated with mint address: $EXPERIENCE_MINT"
else
    echo "⚠️  Could not find placeholder in config file"
    echo "Please manually update src/config/solana.ts with:"
    echo "experienceMintAddress: '$EXPERIENCE_MINT'"
fi

echo ""

# Step 6: Initialize token configuration on-chain
echo "🎛️  Initializing token configuration on-chain..."
echo "This will set up governance, treasury, and reward allocations"
echo ""

# You would normally call the initialize_token instruction here
# For now, we'll show what needs to be done

echo "📋 Token Configuration Parameters:"
echo "   - Mint Address: $EXPERIENCE_MINT"
echo "   - Decimals: 6"
echo "   - Max Supply: 1,000,000 EXPERIENCE"
echo "   - Reward Pool: 400,000 EXPERIENCE (40%)"
echo "   - Treasury Allocation: 300,000 EXPERIENCE (30%)"
echo "   - Validator Allocation: 200,000 EXPERIENCE (20%)"
echo "   - Team Allocation: 100,000 EXPERIENCE (10%)"
echo ""

echo "✅ Token mint creation complete!"
echo ""
echo "🎉 Next Steps:"
echo "1. Update src/config/solana.ts with the mint address (if not automatic)"
echo "2. Call the initialize_token instruction on the Experience Token program"
echo "3. Test the complete token flow"
echo "4. Verify privacy features work correctly"
echo ""
echo "💡 Tip: Save this mint address for future reference:"
echo "   $EXPERIENCE_MINT"
echo ""

echo "🚀 Your EXPERIENCE token is ready to power the Dallas Buyers Club ecosystem!"
