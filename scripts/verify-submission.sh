#!/usr/bin/env bash
set -euo pipefail

echo "══════════════════════════════════════════════════════"
echo "  DBC — STELLAR HACKS: REAL-WORLD ZK"
echo "  Submission Verification"
echo "══════════════════════════════════════════════════════"
echo ""

FAIL=0

check() {
  local desc="$1"; shift
  if "$@"; then
    echo "  ✅  $desc"
  else
    echo "  ❌  $desc"
    FAIL=1
  fi
}

echo "── Toolchain ──"
check "nargo 1.0.0-beta.9"  bash -c 'nargo --version 2>&1 | grep -q "1.0.0-beta.9"'
check "bb 0.87.0 (pinned)"  bash -c '$HOME/.bb/bb --version 2>&1 | grep -q "0.87.0"'
check "stellar-cli 27.x"    bash -c 'stellar --version 2>&1 | grep -q "27\."'

echo ""
echo "── Noir Circuit ──"
check "circuit exists"       test -f circuits/benchmark_delta/target/benchmark_delta.json
check "proof generated"      test -f circuits/benchmark_delta/target/proof
check "proof = 14592 bytes"  bash -c 'test "$(stat -f%z circuits/benchmark_delta/target/proof)" = "14592"'
check "VK generated"         test -f circuits/benchmark_delta/target/vk
check "VK = 1760 bytes"      bash -c 'test "$(stat -f%z circuits/benchmark_delta/target/vk)" = "1760"'
check "public inputs"        test -f circuits/benchmark_delta/target/public_inputs
check "public inputs = 64b (2 field elements)"  bash -c 'test "$(stat -f%z circuits/benchmark_delta/target/public_inputs)" = "64"'

echo ""
echo "── Stellar Testnet ──"
check "verifier deployed"    bash -c 'stellar contract info interface --id CC5ICZLCPV2KCCJMQOE4VK6QV4MA7UWW5BS6H7CB7CTN4RZNPPDRPY4Z --network testnet 2>&1 | grep -q "verify_proof"'
check "attestation deployed" bash -c 'stellar contract info interface --id CD3ZKSCTQKVLD2Z7W3VOJSVM7TNKSP6M2QAS6CQ4HZ3X3B5KPP3IT5C3 --network testnet 2>&1 | grep -q "verify_and_attest"'

echo ""
echo "── API Artifacts ──"
check "api/stellar/proof.bin"   test -f api/stellar/proof.bin
check "api/stellar/vk.bin"      test -f api/stellar/vk.bin
check "api/stellar/public_inputs.bin" test -f api/stellar/public_inputs.bin
check "api/stellar-prove.ts"    test -f api/stellar-prove.ts

echo ""
echo "── Source Code ──"
check "chains.ts has stellar"       grep -q "stellar" src/config/chains.ts
check "VerificationAdapter.ts"      test -f src/services/VerificationAdapter.ts
check "StellarVerificationService"  test -f src/services/stellar/StellarVerificationService.ts
check "Aleo implements adapter"     grep -q "VerificationAdapter" src/services/aleo/AleoVerificationService.ts
check "barrel exports stellar"      grep -q "stellarVerificationService" src/services/index.ts

echo ""
echo "── Environment Config ──"
check "VITE_STELLAR_ENABLED"    grep -q "VITE_STELLAR_ENABLED" .env.development
check "VITE_STELLAR_CONTRACT_ID" grep -q "VITE_STELLAR_CONTRACT_ID" .env.development

echo ""
echo "── Documentation ──"
check "roadmap doc"             test -f docs/6_MULTICHAIN_ROADMAP.md
check "README has Stellar"      grep -qi "stellar" README.md
check ".env.example has stellar" grep -q "STELLAR" .env.example

echo ""
echo "══════════════════════════════════════════════════════"
if [ "$FAIL" = "0" ]; then
  echo "  ALL CHECKS PASSED — ready for submission! 🚀"
else
  echo "  SOME CHECKS FAILED — review above."
fi
echo "══════════════════════════════════════════════════════"
