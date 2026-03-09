# Dallas Buyers Club: Agent Alliance
### Pitch Deck — MONOLITH Solana Mobile Hackathon

---

## Slide 1 — The Hook

> **"Every AI team is solving the same problems alone. We built the coordination layer so they don't have to."**

- AI agent development is a **Dark Forest** — share what you learn, lose your competitive edge
- Teams re-solve context window failures, tool-calling loops, and hallucinations in isolation
- **$100B+ in AI R&D is being duplicated** because there's no safe way to share

---

## Slide 2 — The Problem

| Pain Point | Reality |
|---|---|
| Agents fail in the same ways | Every team hits context limits, tool loops, hallucinations |
| No safe way to share fixes | Publishing a prompt = exposing your moat |
| R&D is duplicated | Same fine-tuning experiments run 1,000x across the industry |
| No coordination primitive | No on-chain layer for agent developers to collaborate |

---

## Slide 3 — The Solution: Agent Alliances

**Alliances are communities of AI developers who face the same failure modes.**

1. **Form** — Developers group around a shared challenge (e.g., context window limits → `$CONTEXT`)
2. **Fund** — Alliance launches its own token via Bags API bonding curve (self-funding, no handouts)
3. **Contribute** — Members submit encrypted optimization logs (pay 0.10 USDC fee)
4. **Validate** — Validators verify ZK proofs of improvement *without seeing the proprietary prompt*
5. **Earn** — Validated contributors earn alliance tokens + on-chain reputation

---

## Slide 4 — The X-Factor: Proof of Optimization

> **"We can prove your agent got 15% better without ever seeing your system prompt."**

```
Developer submits:  encrypted(baseline_pass_rate, improved_pass_rate, architecture_tag)
ZK circuit proves:  improved > baseline  (Noir benchmark_delta circuit)
On-chain record:    proof hash + delta only — zero IP exposure
Validator sees:     "Pass@1 improved by 18.7%" — nothing else
```

**This is the Agentic Dark Forest problem, solved.**

- Built on **Noir ZK-SNARKs** (Aztec) — 4 circuits, 26 tests passing
- **Light Protocol** ZK compression — 2x–50x on-chain storage reduction
- **Arcium MPC** threshold decryption — selective disclosure without a trusted third party

---

## Slide 5 — Mobile App (What You're Judging)

**Built for Seeker — the Solana Mobile community of builders and power users.**

| Screen | Feature |
|---|---|
| **Alliances** | Browse by challenge type, live activity feed, HOT badges, tap-to-detail modal |
| **Submit** | 4-step wizard → ZK proof overlay animation → real on-chain tx → Explorer link |
| **Profile** | XP / rank system (INITIATE→LEGEND), streak counter, daily challenge, validator scorecard |

**Tech stack:**
- Expo SDK 52 + React Native
- `@solana-mobile/mobile-wallet-adapter-protocol-web3js` (MWA)
- `@solana/web3.js` + `@coral-xyz/anchor`
- Haptic feedback throughout (`expo-haptics`)
- Real devnet transactions with Solana Explorer deep-links

---

## Slide 6 — Token Economics

### DBC (Platform Token)
- **Supply:** 1,000,000,000 (fixed, burned mint authority)
- **Team:** 1.74% — we can't inflate our way to success
- **Value:** Governance + fee burns (deflationary) + coordination staking

### Alliance Tokens (Per Challenge)
- Launch via **Bags API bonding curves** — fair price discovery
- Creator earns **1% of trading volume forever**
- Alliance treasury funds collective GPU/fine-tuning pools

### Fee Model (No Inflation)
| Fee | Amount | Split |
|---|---|---|
| Alliance launch | 0.5 SOL | 50% burn DBC / 25% dev / 25% grants |
| Log submission | 0.10 USDC | 50% burn DBC / 25% dev / 25% grants |
| Trading volume | 0.5% | Same split |

---

## Slide 7 — Stickiness & PMF

**Why Seeker users come back daily:**

- 🔥 **Streak system** — submit logs 7 days in a row, earn bonus XP
- 🏆 **Rank progression** — INITIATE → CONTRIBUTOR → VALIDATOR → ARCHITECT → LEGEND
- 📅 **Daily challenges** — rotating tasks (Submit / Join / Validate) with XP rewards
- 💰 **Financial incentive** — alliance token holdings appreciate with alliance activity
- 🔔 **Validation notifications** — get notified when your ZK proof is verified

**Target user:** Any developer building on Solana who uses AI agents in their stack — a rapidly growing segment of the Seeker community.

---

## Slide 8 — Traction & Technical Proof

| Milestone | Status |
|---|---|
| Anchor programs deployed (devnet) | ✅ `optimization_log`, `alliance_factory`, `treasury`, `dbc_governance` |
| Noir ZK circuits | ✅ 4 circuits, 26 tests passing |
| Light Protocol compression | ✅ Integrated |
| Arcium MPC | ✅ Integrated |
| Mobile app (Expo + MWA) | ✅ APK built via EAS |
| Real devnet transactions | ✅ Submit flow → tx hash → Explorer link |
| DBC token live | ✅ 98.26% community-owned |

---

## Slide 9 — The Ask

**We're not asking for funding. We're asking for distribution.**

- The Seeker community *is* our target user
- Every Solana developer building AI agents needs this
- We want to be the default coordination layer for agent alliances on Solana

**Next milestones post-hackathon:**
1. Mainnet deployment of `optimization_log` program
2. First 3 alliance launches ($CONTEXT, $TOOL, $EVAL)
3. Validator onboarding (1,000 DBC stake minimum)
4. Integration with Helius webhooks for real-time activity feed

---

## Slide 10 — Team

**Built by developers who hit these exact agent problems.**

- Deep Solana experience (Anchor, ZK compression, MPC)
- Privacy-first architecture from day one
- Open source — [github.com/thisyearnofear/dallas](https://github.com/thisyearnofear/dallas)

---

> *"The agents that learn together, win together. DBC is how they do it without losing their edge."*
