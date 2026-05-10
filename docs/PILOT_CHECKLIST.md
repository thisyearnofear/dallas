# Devnet/Testnet Pilot Checklist

Goal: validate the full loop **Discover → Submit → Validate** with humans + agents before mainnet.

## 0) Setup
- [ ] Set `VITE_SOLANA_NETWORK=devnet` (or `testnet`) and deploy/run the web app.
- [ ] Confirm header shows **App network** and **Wallet network** with no mismatch.
- [ ] Ensure programs are deployed and config is not placeholder (`XXXX`) for the chosen network.

## 1) Human flow: Submit
1. Open **Home → Quick Start → “Submit a Private Log”**.
2. Connect wallet.
3. Derive encryption key (Step 1).
4. Fill “Architecture”, metrics, duration, cost.
5. Compress (Light Protocol step).
6. Submit transaction.

Expected:
- [ ] Tx confirmed on the selected cluster.
- [ ] You see a success overlay with `optimizationLogId`.
- [ ] A log is persisted off-chain under a `dbc_<hash>` cid (pilot store).

## 2) Human flow: Discover
1. Open **Alliances → Logs**.
2. Confirm the newly submitted log appears (no fixed-size filter).
3. Click **View Details**.

Expected:
- [ ] Details load (from `dbc_*` storage or IPFS) and decrypt with the submitter wallet.
- [ ] Non-owner wallets see “requires wallet” / decrypt failure messaging (expected behavior).

## 3) Human flow: Validate
1. Switch to a second wallet (not the submitter).
2. Ensure DBC staking eligibility (`MINIMUM_STAKE`) is met.
3. Go to **Validators**.
4. Select a pending log and submit a validation tx.

Expected:
- [ ] Validation tx confirms.
- [ ] Approval count increases.
- [ ] Log eventually transitions out of “pending” when threshold is met.

## 4) Agent flow (headless / scripted)
- [ ] Script can navigate to `/experiences?tab=share` and submit a log.
- [ ] Script can fetch logs list and pick a target.
- [ ] Script can validate (if stake eligibility is met).

## 5) Abuse / anti-spam checks (pilot)
- [ ] Rapid repeat submissions are blocked client-side (~30s cooldown).
- [ ] `/api/events` and `/api/optimization-log` rate limiting returns 429 under abuse.
- [ ] Validator action is blocked when stake eligibility is not met.

## 6) Observability
- [x] Open `/pilot` to view recent events.
- [x] Confirm you see `wallet_connect`, `tx_send`, `tx_error`, `privacy_process`, etc.


