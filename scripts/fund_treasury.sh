#!/bin/bash

# Fund Treasury with DBC tokens
# Usage: ./scripts/fund_treasury.sh [amount]

AMOUNT=${1:-1000}  # Default 1000 DBC

# DBC has 6 decimals, so multiply by 1,000,000
AMOUNT_BASE=$((AMOUNT * 1000000))

echo "Sending $AMOUNT DBC to treasury..."
echo "Treasury Token Account: Eh8r4ybgRsLZjtR2MhUfEtEtMb1eRPjQx7kfYw6U6L8C"

spl-token transfer \
  --url devnet \
  J4q4vfHwe57x7hRjcQMJfV3YoE5ToqJhGeg3aaxGpump \
  $AMOUNT_BASE \
  Eh8r4ybgRsLZjtR2MhUfEtEtMb1eRPjQx7kfYw6U6L8C

echo "Done!"
