# DBC Agent Alliance — Mobile App

Android app for the [MONOLITH Solana Mobile Hackathon](https://solanamobile.com/hackathon).  
Built with **Expo + React Native** and **Solana Mobile Wallet Adapter (MWA)**.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 52 + expo-router |
| Wallet | `@solana-mobile/mobile-wallet-adapter-protocol-web3js` |
| Solana | `@solana/web3.js` + `@coral-xyz/anchor` |
| Styling | NativeWind (Tailwind for RN) |
| Navigation | Expo Router (file-based tabs) |

---

## Screens

| Tab | Purpose |
|---|---|
| **Alliances** | Browse AI agent alliances by challenge (context limits, tool loops, evals) |
| **Submit Log** | Submit encrypted optimization benchmark on-chain (0.10 USDC fee, ZK proof) |
| **Profile** | MWA wallet connect, SOL/DBC balance, validator status |

---

## Local Development

### Prerequisites
- Node 18+
- Android device or emulator with a MWA-compatible wallet installed (Phantom / Solflare Android)
- [EAS CLI](https://docs.expo.dev/eas/) for APK builds: `npm install -g eas-cli`

### Install & Run

```bash
cd mobile
npm install
npx expo start --android
```

### Build APK (for hackathon submission)

```bash
# Preview APK (sideloadable)
npx eas build --platform android --profile preview

# Development APK
npx eas build --platform android --profile development
```

---

## Architecture

```
mobile/
├── app/
│   ├── _layout.tsx          # Root layout (SafeAreaProvider, Stack)
│   └── (tabs)/
│       ├── _layout.tsx      # Tab bar (Alliances / Submit / Profile)
│       ├── alliances.tsx    # Alliance browser
│       ├── submit.tsx       # Optimization log submission form
│       └── profile.tsx      # Wallet + validator profile
├── hooks/
│   └── useWallet.ts         # MWA wallet hook (connect, sign, send)
├── services/
│   └── OptimizationLogService.ts  # On-chain submission builder
├── config/
│   └── solana.ts            # Program IDs, RPC endpoints, APP_IDENTITY
├── app.json                 # Expo config (package name, scheme, icons)
└── eas.json                 # EAS build profiles
```

### Key Design Decisions
- **MWA replaces web wallet adapter** — `transact()` from `@solana-mobile/mobile-wallet-adapter-protocol-web3js` handles all signing; no browser extension required.
- **Config mirrors web** — `mobile/config/solana.ts` uses the same program IDs as `src/config/solana.ts`; keep in sync when deploying new programs.
- **Services are framework-agnostic** — `OptimizationLogService` uses only `@solana/web3.js`, making it reusable across web and mobile.
- **ZK proof hook** — `submit.tsx` has a clearly marked placeholder (`// Encrypt metrics client-side`) where the Noir `benchmark_delta` circuit output should be wired in.

---

## Hackathon Submission Checklist

- [x] Android APK (via `eas build --profile preview`)
- [x] Solana Mobile Wallet Adapter integration
- [x] Meaningful Solana network interaction (on-chain optimization log submission)
- [ ] Demo video (record wallet connect → browse alliances → submit log)
- [ ] Pitch deck (use `docs/` content as source)
- [ ] GitHub repo link
