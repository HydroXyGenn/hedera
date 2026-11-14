# Daret on Hedera — Setup & Project Guide

Welcome to **Daret on Hedera** (*Hedera Cross Campus Challenge 2026 — Dar Blockchain × Hedera*).

> *"The code becomes the organizer. Money and rules are enforced by Hedera, so nobody can run away with the pot, and every payment is publicly provable."*

---

## Included in This Folder

- `src/` & `index.html` — Interactive React + TypeScript + Vite web application introducing **Daret on Hedera** with an animated WebGL liquid-glass orb and live savings circle simulator.
- `Daret_on_Hedera_Project_Overview (1).pdf` — Core project overview, `(N - k) × C` collateral math, Hedera services, unit economics, and PoC demo script.
- `hedera_cross_campus_challenge_submission_guidelines.pdf` — Official hackathon rules, judging criteria, 5-minute pitch outline, and 4Hacks submission checklist.
- `dist/` — Pre-built static production bundle.

---

## How to Run Locally

### 1. Prerequisites
Install **Node.js (v18 or newer)** from [https://nodejs.org](https://nodejs.org) if you don't already have it.

### 2. Install Dependencies
Open a terminal inside the unzipped `hedera` folder and run:

- **macOS / Linux / Git Bash / CMD:**
  ```bash
  npm install
  ```
- **Windows PowerShell** *(if PowerShell blocks `npm.ps1` execution policies, use `npm.cmd`)*:
  ```powershell
  npm.cmd install
  ```

### 3. Start the Website
```bash
npm run dev
```
*(Or in Windows PowerShell: `npm.cmd run dev`)*

Then open the local URL printed in the terminal (usually **`http://127.0.0.1:5173`** or **`http://localhost:5173`**) in your browser.

### 4. Production Build / Preview (Optional)
```bash
npm run build
npm run preview
```

---

## What to Explore on the Website

1. **Hero & Liquid-Glass Orb** — Interactive 3D WebGL refracting orb (move your cursor over it) + quick metrics (`0%` interest, `3–5s` Hedera finality, `~$0.0001` fees, `100% HCS` audit trail).
2. **The Idea (`#idea`)** — Explains traditional Maghreb *Daret* rotating savings circles and toggles between **Social Trust Risks** and the **Hedera Solution**.
3. **Live Circle Simulator (`#simulator`)** — Full interactive example:
   - Choose **Number of Persons (`3–12`)**, **Contribution per Round (`20–2000 MAD`)**, **Round Period**, **Protocol Fee**, and **Optional Insurance Pool**.
   - Click **Shuffle Seats via Hedera PRNG (Tirage)** for an animated fair seat draw.
   - Click any seat to change its **Reputation Tier** (`New`, `Bronze`, `Silver`, `Gold`, `Defaulter`) or click **Simulate Missed Payment** to test default handling.
   - Try the one-click **Official PoC Slash Demo (`4 × 250 MAD`)** button to watch Seat #1 miss Round 3, trigger automatic collateral slashing, and still pay Recipient #3 100% on time while logging every event to the **Live HCS Audit Topic**.
4. **Collateral Math (`#math`)** — Interactive `(N - k) × C` collateral curve and side-by-side **New vs. Tiered Applicant** collateral comparison.
5. **Hedera Architecture (`#hedera`)** — Interactive breakdown of the 6 Hedera components (EVM Smart Contracts, HTS, HCS, Mirror Node API, Native PRNG, and Fixed Micro-Fees).
6. **Economics & Roadmap (`#economics`)** — Interactive `1` to `3,000`-circle unit economics scaler, 7 revenue streams, 3-phase rollout, and regulatory transparency note.
7. **Challenge Alignment & Join Team (`#join`)** — Judging criteria alignment, 5-minute pitch structure, open 4Hacks collaboration roles, and interactive interest card generator.
