# 🚀 Direct EXPERIENCE Token Setup Guide

## 🎯 Step-by-Step Instructions

### Step 1: Create the Token Mint

Run this command in your terminal:

```bash
./scripts/quick_token_setup.sh
```

**What this does:**
- Sets network to devnet
- Creates EXPERIENCE token mint with 6 decimals
- Creates token accounts for treasury and your wallet
- Shows you the mint address to use

### Step 2: Update Configuration

After running the script, you'll see output like:

```
📝 Update src/config/solana.ts with:
experienceMintAddress: '3x9J...'
```

**Edit the file:**

```bash
# Open the config file
code src/config/solana.ts

# Find this line and replace the placeholder:
experienceMintAddress: 'EXPERIENCE_MINT_ADDRESS_NEEDED'

# Change it to:
experienceMintAddress: '3x9J...'  # Your actual mint address
```

### Step 3: Initialize Token Configuration

Run this command to initialize the token on-chain:

```bash
# First, get your wallet address
WALLET=$(solana address)

# Initialize token configuration
# (This sets up governance, treasury, and reward allocations)
solana program invoke \
  E6Cc4TX3H2ikxmmztsvRTB8rrYaiTZdaNFd1PBPWCjE4 \
  --data "initialize_token:6" \
  --accounts "token_config:CONFIG_PDA,mint:YOUR_MINT_ADDRESS,treasury:BpHqwwKRqhNRzyZHT5U4un9vfyivcbvcgrmFRfboGJsK,governance:$WALLET,payer:$WALLET"
```

### Step 4: Test the Complete Flow

Run the integration tests:

```bash
npx ts-node scripts/test_token_integration.ts
```

## 💡 Quick Reference

### Token Distribution

```
Total Supply: 1,000,000 EXPERIENCE
├─ 40% Reward Pool (400,000) - For patient submissions
├─ 30% Treasury (300,000) - Goes to BpHqwwKRqhNRzyZHT5U4un9vfyivcbvcgrmFRfboGJsK
├─ 20% Validators (200,000) - For validation rewards
└─ 10% Team (100,000) - For team allocation
```

### Who Gets Tokens

1. **Patients**: Earn 10-50 EXPERIENCE for submitting case studies
2. **Validators**: Earn 5 EXPERIENCE per validation + accuracy bonuses
3. **Treasury**: Receives 30% of total supply for ecosystem development
4. **Team**: Receives 10% for development and maintenance

### Your Control

As the deployer, you control:
- **Governance Authority**: Can update token parameters
- **Mint Authority**: Can create new tokens (through the program)
- **Treasury Allocation**: 300,000 EXPERIENCE for ecosystem development

## 🚨 Important Notes

### Token Ownership
- **You are NOT the mint authority** - The Experience Token program controls minting
- **You ARE the governance authority** - You can manage token configuration
- **Treasury gets 30%** - This goes to the configured treasury address

### Security
- **Never share your private key**
- **Backup your wallet**
- **Test with small amounts first**

### Next Steps

After completing these steps:
1. ✅ Token mint created
2. ✅ Configuration updated  
3. ✅ Token initialized
4. ✅ Tests passing

**Your platform is ready for users!** 🎉

## 🤝 Need Help?

If you get stuck at any step:

1. **Check the output** - Look for error messages
2. **Review the logs** - Use `solana logs` to debug
3. **Consult the docs** - See `TOKEN_INTEGRATION.md` for details
4. **Ask for help** - I'm here to assist!

**Let's get your EXPERIENCE token live!** 🚀