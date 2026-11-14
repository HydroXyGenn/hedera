# Daret on Hedera — Unified V2 Web Application

This single React + TypeScript + Vite application combines both V2 web surfaces into one app with an instant top switcher:

1. **How It Works** (`#top`) — Project showcase, `(N − k) × C` security deposit math, interactive circle simulator, Hedera 6-service architecture, unit economics, and 4Hacks submission alignment.
2. **Try Live Demo** (`#poc-app`) — Interactive Operational PoC Console for creating circles, running Hedera PRNG seat draws (*tirage*), locking collateral, simulating missed payments / automatic slashing, and inspecting Mirror Node + HCS receipts.

---

## Quick Start (Pre-Compiled Build — No `npm install` Needed)

- **Windows:** Double-click `start-app.bat` (uses Python or Node.js to serve `dist/` at `http://127.0.0.1:4173` and opens your browser automatically).
- **macOS / Linux:** Run `./start-app.sh` (or `bash start-app.sh`).

---

## Running or Building from Source

Requires **Node.js v18+**.

```bash
npm install
npm run dev      # starts local dev server
npm run build    # runs TypeScript check + production build into dist/
npm run preview  # previews the compiled dist/ bundle
```

*(On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.)*

---

## Included Project Documents (`docs/`)

- `Daret_on_Hedera_Project_Overview (1).pdf` — Core project overview and collateral math
- `hedera_cross_campus_challenge_submission_guidelines.pdf` — Hackathon judging criteria & submission guidelines
- `Daret_on_Hedera_V2.pdf` & `Daret_on_Hedera_V2.pptx` — V2 pitch presentation
- `PRODUCT.md` & `DESIGN.md` — Product specifications and unified Porcelain Light Glass design system
