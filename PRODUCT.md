# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

1. **Students, campus groups, neighbours, diaspora families, colleagues, and small traders in Morocco and the Maghreb** who already run informal *Daret* (rotating savings circles) based on social trust.
2. **Hackathon judges and partners** evaluating the **Hedera Cross Campus Challenge 2026** (Dar Blockchain × Hedera · 4Hacks) submission, including technical feasibility, Hedera service integration, and financial inclusion impact.

## Product Purpose

**Daret on Hedera** digitizes the traditional rotating savings circle (ROSCA / Daret) so the smart contract becomes the organizer: money and rules are enforced by code on Hedera rather than blind social trust, preventing pot theft, late/missed payments after early payouts, and undocumented payment disputes while building verifiable on-chain savings reputation.

## Positioning

**"The code becomes the organizer."** Daret on Hedera combines arithmetic seat-based collateral (`(N - k) × C`) with Hedera's built-in EVM smart contracts, HTS tokens/Soulbound badges, HCS immutable audit topics, free Mirror Node reputation queries, Native PRNG fair seat draws, and fixed ultra-low fees (`~$0.0001`, `3–5s` finality) so micro-contributions (`20–2,000 MAD`) remain viable and defaults are unprofitable by design.

## Operating Context

- **Hackathon context:** Hedera Cross Campus Challenge 2026 (Dar Blockchain × Hedera · 4Hacks), Testnet PoC scope, ~5-minute English/French pitch + live product demonstration.
- **Two complementary web surfaces + pitch deck:**
  1. **Showcase & Interactive Simulator Website** (currently at workspace root `src/`) — introduces the concept, toggles Social Trust Risks vs. Hedera Solution, runs an interactive circle simulator (circle size `3–12`, contribution `20–2000 MAD`, PRNG tirage, official `4 × 250 MAD` slash demo, collateral curve, 6-service Hedera stack explorer, unit economics `1–3,000` circles, and 4Hacks team card generator).
  2. **Functional Daret PoC App** (currently in `daret-app/`) — interactive operational console supporting `createCircle()`, seat assignment from directory or custom profiles, "+ Add 1 Random" / "Fill with Randoms", `Defaulter` rejection (`join()` revert), Hedera PRNG tirage, collateral locking, round contribution payouts (`Pay`), missed-payment collateral slashing & future pot liens (`Skip / Miss` + `closeRound()`), auto-run cycle, live `HCS Log`, free `Mirror Node` reputation inspector, `Contract Ledger`, and `"I Paid!"` HCS dispute verifier.
  3. **Pitch Presentation** — 7-slide deck summarizing Idea & Problem, Solution & Collateral Math, Live Functional PoC, Hedera Stack Integration, Economics & Revenue, Roadmap & Compliance.

## Capabilities and Constraints

- **Preserve all content & functionality:** Both websites must retain every interactive feature, calculation (`requiredCollateral = (N - k) × C × tierMultiplier`), dataset, Hedera component breakdown, and PoC workflow during visual rework.
- **Confirmed reputation tiers:** `Gold` (25% collateral, score ≥ 840), `Silver` (50%, ≥ 680), `Bronze` (75%, ≥ 520), `New` (100% cold-start default, prevents fake-wallet resets), and `Defaulter` (100%, blocked by `minTier` gates).
- **Regulatory boundary:** Present strictly as a transparent testnet escrow and ledger PoC (not a licensed bank/lender). Production custody, regulated MAD e-money/stablecoins, float yield, and collateral lending require licensed financial partners.

## Brand Commitments

- **Product name:** `Daret on Hedera` (PoC App & Showcase Website).
- **Tone:** Credible, culturally rooted in Moroccan/Maghreb community savings (*Daret*, *Tirage*, MAD), mathematically transparent, and free of crypto hype clichés.

## Evidence on Hand

- `Daret_on_Hedera_Project_Overview (1).pdf` — Core problem/solution overview, `(N - k) × C` formula, 6 Hedera services, unit economics example (`10 × 500 MAD = 50,000 MAD/cycle`, `1%` fee = `500 MAD`), 3-phase rollout, and PoC script.
- `hedera_cross_campus_challenge_submission_guidelines.pdf` — Official judging weights (`25%` Meaningful Hedera Integration, `20%` Technical execution, `15%` Problem clarity, `15%` Innovation, `15%` Impact, `10%` Pitch/Demo) and 7-slide pitch structure.
- Existing working Vite + React + TypeScript implementations in root `src/` and `daret-app/src/`.

## Product Principles

1. **Arithmetic over blind trust:** Make default unprofitable and make recipients whole even when someone misses a round.
2. **Every franc is provable:** Every join, contribution, slash, and payout maps cleanly to an immutable HCS event and accounting balance.
3. **Cold-start fair, reset-proof:** Newcomers participate safely as late savers or at 100% collateral; restarting with a new wallet confers zero discount.
4. **Micro-payment clarity:** Surface numbers in `tabular-nums` (`MAD`, `USD`, `%`, ratios) with zero confusion between wallet funds, pot escrow, and locked collateral.
5. **Visual craft matches trust:** Clean, tactile, human-crafted interfaces rather than generic noisy crypto templates.
