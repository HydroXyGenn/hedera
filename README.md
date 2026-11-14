# Daret on Hedera

**Live App:** [https://daret-on-hedera.vercel.app/](https://daret-on-hedera.vercel.app/)

> *"The code becomes the organizer. Money and rules are enforced by Hedera, so nobody can run away with the pot, and every payment is publicly provable."*

Built for the **Hedera Cross Campus Challenge 2026** (*Dar Blockchain × Hedera · 4Hacks*).

**Daret on Hedera** digitizes traditional Moroccan & Maghreb rotating savings circles (*Daret* / ROSCA) on Hedera. Instead of relying on blind social trust, a smart contract holds seat-based collateral, draws payout order fairly, logs every contribution and payout on-chain, and builds portable savings reputation.

---

## How It Works (In Plain English)

In a traditional **Daret**, `N` people each contribute `C` MAD every round, and one person takes the full pot (`N × C`) each round until everyone has received it once.

The classic problem: **someone who gets the pot in Round 1 can stop paying in Rounds 2..N.**

Daret on Hedera solves this with **arithmetic seat-based collateral**:

```text
requiredCollateral = (N - k) × C × tierMultiplier
```

- `N` = total members in the circle
- `k` = your payout round (`1` = first to receive the pot, `N` = last to receive the pot)
- `C` = contribution per round (e.g. `250 MAD`)
- `tierMultiplier` = discount earned from on-chain savings history

**Why this works:**
- If you take the pot **early** (`k = 1`), you still owe `(N - 1) × C`, so your locked collateral covers what you owe. Defaulting is never profitable.
- If you take the pot **last** (`k = N`), `(N - N) = 0`, so you need **zero collateral** — making it accessible even for first-time savers.
- If a member misses a payment, the contract **slashes their locked collateral** to keep the round's recipient whole and records the default on-chain.

### Reputation Tiers

| Tier | Score | Collateral Multiplier | Notes |
| --- | --- | --- | --- |
| **Gold** | `≥ 840` | `25%` | Proven reliable savers |
| **Silver** | `≥ 680` | `50%` | Consistent circle history |
| **Bronze** | `≥ 520` | `75%` | Building track record |
| **New** | Cold start | `100%` | Prevents fake-wallet resets; can still join late seats at low/zero collateral |
| **Defaulter** | Flagged | `100%` (Blocked) | Rejected by `minTier` circle gates |

---

## Hedera Services Used

| Service | Role in Daret on Hedera |
| --- | --- |
| **Hedera Smart Contracts (EVM)** | Enforces circle rules, holds pot & collateral escrow, executes payouts and slashing |
| **Hedera Token Service (HTS)** | Handles tokenized MAD contributions and Soulbound reputation tier badges |
| **Hedera Consensus Service (HCS)** | Writes an immutable, timestamped audit log of every join, payment, slash, and payout |
| **Hedera Mirror Node** | Provides free, fast reputation & ledger history queries without extra gas |
| **Native PRNG** | Fair, verifiable random *tirage* (seat draw) so nobody can rig the payout order |
| **Fixed Low Fees & Fast Finality** | `~$0.0001` fees and `3–5s` finality keep micro-savings (`20–2,000 MAD`) viable |

---

## Repository Structure

```text
hedera/
├── app/                   # Unified Web App (Showcase, Simulator & Live PoC Console)
│   ├── src/               # Showcase sections, Live Daret Simulator & PoC Console (src/poc/)
│   ├── public/assets/     # Visual assets
│   ├── start-app.bat      # Windows quick-launch script
│   └── start-app.sh       # macOS / Linux quick-launch script
├── presentation/          # Pitch deck (PDF & PPTX)
├── docs/                  # Challenge guidelines & project overview PDFs
├── PRODUCT.md             # Product scope, invariants, reputation tiers & regulatory notes
├── DESIGN.md              # UI design system & visual tokens
└── README.md              # Project overview & setup guide (this file)
```

---

## Quick Start (Run the Web App Locally)

The `app/` directory contains both the **Showcase & Interactive Simulator** and the **Live Functional PoC Console** in a single Vite + React + TypeScript application.

```powershell
cd app
npm install
npm run dev
```

Then open the local URL printed in your terminal (default `http://127.0.0.1:5173`).

To create a production build:

```powershell
cd app
npm run build
```

> **Note:** On Windows, if `dist/` is already built, you can also double-click `app/start-app.bat` (or run `./app/start-app.sh` on macOS/Linux).

---

## Reference Documents

- [`PRODUCT.md`](PRODUCT.md) — Product principles, confirmed tier thresholds, and testnet PoC / regulatory boundaries.
- [`DESIGN.md`](DESIGN.md) — Porcelain Light Glass × Escrow Six-Pack design tokens and component specs.
- [`presentation/Daret_on_Hedera_V2.pdf`](presentation/Daret_on_Hedera_V2.pdf) — 7-slide pitch deck.
- [`docs/Daret_on_Hedera_Project_Overview (1).pdf`](docs/Daret_on_Hedera_Project_Overview%20%281%29.pdf) — Detailed math, unit economics, and `4 × 250 MAD` slash demo script.
- [`docs/hedera_cross_campus_challenge_submission_guidelines.pdf`](docs/hedera_cross_campus_challenge_submission_guidelines.pdf) — Official 4Hacks judging criteria and submission checklist.
