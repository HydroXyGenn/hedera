# Daret on Hedera

> *"The code becomes the organizer. Money and rules are enforced by Hedera, so nobody can run away with the pot, and every payment is publicly provable."*

Built for the **Hedera Cross Campus Challenge 2026** (*Dar Blockchain × Hedera · 4Hacks*).  
**Daret on Hedera** digitizes traditional Moroccan & Maghreb rotating savings circles (*Daret* / ROSCA) with arithmetic seat-based collateral `(N − k) × C`, Solidity EVM escrow, Hedera Token Service (HTS) tokens & Soulbound tier badges, Hedera Consensus Service (HCS) immutable audit logs, free Mirror Node reputation queries, and Native PRNG fair *tirage* draws.

---

## Workspace Structure

```text
hedera/
├── DESIGN.md                          # Unified Porcelain Light Glass × Escrow Six-Pack design system
├── PRODUCT.md                         # Product scope, invariants, reputation tiers & regulatory boundaries
├── README.md                          # Workspace index (this file)
├── docs/                              # Official challenge & project reference PDFs
│   ├── Daret_on_Hedera_Project_Overview (1).pdf
│   └── hedera_cross_campus_challenge_submission_guidelines.pdf
├── v2/                                # Active v2 unified Porcelain Light Glass × Escrow Six-Pack deliverables
│   ├── showcase-website/              # Unified Showcase + PoC Console app (compiled & integrated)
│   ├── poc-app/                       # Standalone Functional Daret PoC Console source
│   ├── daret-unified-app/             # Clean mirrored unified app + quick-launch scripts (no node_modules)
│   ├── presentation/                  # V2 Pitch Deck scripts & exports
│   └── assets/                        # Shared light-mode visual assets & slide renders
├── daret-on-hedera-v2.zip             # Self-contained shareable group package (unified app + dist + docs)
├── archive/                           # Superseded v1 artifacts preserved for reference
│   ├── websites/
│   │   ├── showcase-v1/               # Original dark-theme Showcase website & build
│   │   └── poc-app-v1/                # Original daret-app PoC console & build
│   ├── decks/                         # Earlier Pitch, Website Theme & Light Glass PPTX/PDF exports
│   └── packages/                      # Earlier packaged release zip (`daret-on-hedera.zip`)
├── .impeccable/                       # Design direction contract & visual mock explorations
└── .agents/                           # Agent tooling & cached Markdown extractions
```

---

## Running the Unified V2 Web Application Locally

Both V2 web surfaces (**1. How It Works** showcase/simulator and **2. Try Live Demo** PoC console) are now compiled into a single unified Vite + React + TypeScript application inside `v2/showcase-website/` (and mirrored cleanly without `node_modules` in `v2/daret-unified-app/` and packaged in `daret-on-hedera-v2.zip`).

### Quick Launch (Pre-compiled `dist/`)
Inside `v2/daret-unified-app/` (or after unzipping `daret-on-hedera-v2.zip`):
- **Windows:** Double-click `start-app.bat`
- **macOS / Linux:** Run `./start-app.sh`

### From Source (`v2/showcase-website/` or `v2/daret-unified-app/`)
```powershell
cd v2/showcase-website
npm.cmd install        # only if node_modules is missing
npm.cmd run dev        # local dev server (includes both Showcase + Live Demo views)
npm.cmd run build      # TypeScript check + production build into dist/
```

### Standalone PoC Console Source (`v2/poc-app/`, kept for reference)
```powershell
cd v2/poc-app
npm.cmd install
npm.cmd run dev
```

---

## Key Reference Documents

- [`PRODUCT.md`](PRODUCT.md) — Core product principles, confirmed reputation tiers (`Gold` 25%, `Silver` 50%, `Bronze` 75%, `New` 100%, `Defaulter` 100%/blocked), and testnet PoC scope.
- [`docs/Daret_on_Hedera_Project_Overview (1).pdf`](docs/Daret_on_Hedera_Project_Overview%20%281%29.pdf) — Collateral math `(N - k) × C`, 6-service Hedera stack, revenue streams, unit economics (`10 × 500 MAD = 50,000 MAD/cycle`), and `4 × 250 MAD` slash demo script.
- [`docs/hedera_cross_campus_challenge_submission_guidelines.pdf`](docs/hedera_cross_campus_challenge_submission_guidelines.pdf) — Judging weights (`25%` Meaningful Hedera Integration, `20%` Technical Execution, `15%` Problem, `15%` Innovation, `15%` Impact, `10%` Pitch/Demo), 7-slide pitch structure, and 4Hacks submission checklist.
