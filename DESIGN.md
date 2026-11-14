---
name: "Daret on Hedera"
description: "Daylight Porcelain Liquid Glass and calibrated Escrow Six-Pack telemetry system for trustless Moroccan rotating savings on Hedera."
colors:
  cobalt-action: "#1A73E8"
  cobalt-action-hover: "#1557B0"
  cobalt-deep: "#174EA6"
  emerald-nominal: "#10B981"
  emerald-deep: "#047857"
  porcelain-canvas: "#F8FAFC"
  porcelain-tint: "#F1F5F9"
  sky-wash: "#E0F2FE"
  mint-wash: "#ECFDF5"
  indigo-wash: "#EEF2FF"
  glass-bay: "rgba(255, 255, 255, 0.78)"
  glass-surface: "rgba(255, 255, 255, 0.86)"
  pure-white: "#FFFFFF"
  ink-slate: "#0F172A"
  body-slate: "#334155"
  muted-slate: "#475569"
  hairline-border: "rgba(15, 23, 42, 0.07)"
  nominal-pill-bg: "#DCFCE7"
  nominal-pill-ink: "#15803D"
  info-pill-ink: "#0369A1"
  warning-pill-bg: "#FEF3C7"
  warning-pill-ink: "#B45309"
  warning-signal: "#F59E0B"
  fault-red: "#EF4444"
  fault-red-ink: "#B91C1C"
  fault-pill-bg: "#FEE2E2"
typography:
  display:
    fontFamily: "Manrope, system-ui, -apple-system, sans-serif"
    fontSize: "3.375rem"
    fontWeight: 800
    lineHeight: 1.03
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Manrope, system-ui, -apple-system, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Manrope, system-ui, -apple-system, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Manrope, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0em"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.02em"
    fontFeature: '"tnum" 1'
rounded:
  md: "12px"
  lg: "16px"
  xl: "24px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.cobalt-action}"
    textColor: "{colors.pure-white}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.cobalt-action-hover}"
  button-ghost:
    backgroundColor: "{colors.glass-surface}"
    textColor: "{colors.ink-slate}"
    rounded: "{rounded.pill}"
    padding: "14px 20px"
  button-ghost-hover:
    backgroundColor: "{colors.pure-white}"
  bay-glass:
    backgroundColor: "{colors.glass-bay}"
    textColor: "{colors.ink-slate}"
    rounded: "{rounded.xl}"
    padding: "20px"
  card-glass:
    backgroundColor: "{colors.glass-surface}"
    textColor: "{colors.ink-slate}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  input-surface:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.ink-slate}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  chip-status-nominal:
    backgroundColor: "{colors.nominal-pill-bg}"
    textColor: "{colors.nominal-pill-ink}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
  chip-status-fault:
    backgroundColor: "{colors.fault-pill-bg}"
    textColor: "{colors.fault-red-ink}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
  dial-gauge:
    backgroundColor: "{colors.porcelain-canvas}"
    textColor: "{colors.ink-slate}"
    width: "104px"
    height: "86px"
---

# Design System: Daret on Hedera

## Overview

**Creative North Star: "The Daylight Precision Escrow Instrument"**

Daret on Hedera translates informal Moroccan and Maghreb rotating savings circles (Daret) into a bright, legible, daylight financial instrument where smart-contract arithmetic replaces blind social trust. Across all three shipped V2 surfaces—the Showcase & Interactive Simulator (`v2/showcase-website/`), the Functional PoC Console (`v2/poc-app/`), and the 7-slide pitch deck (`v2/presentation/Daret_on_Hedera_V2.pptx`)—the system behaves like calibrated aerospace instrumentation resting on frosted porcelain glass rather than a murky crypto dashboard.

A cool Porcelain canvas (`#F8FAFC`) is washed lightly with diffused sky (`#E0F2FE`), mint (`#ECFDF5`), and faint corner indigo (`#EEF2FF`) ambient blooms. Translucent frosted glass bays (`rgba(255, 255, 255, 0.78)` to `0.86`, `20px` backdrop blur, `1px` specular white inner top highlight, and `6%–9%` slate hairlines) house calibrated circular Six-Pack escrow gauges directly alongside a hairline-divided Seat Rotation Ledger.

Consolidated from `seed:e99ed52fcfe9aabc`—fusing "Porcelain Glass Escrow Six-Pack" with "Pure Light Glass Seat Ledger"—this system deliberately rejects dark Web3 themes, neon gradients, boxed sub-cards inside instrument bays, decorative pill kickers above headings, fake scroll chevrons, and gray or taupe framing boxes around bespoke studio media.

**Key Characteristics:**
- Daylight Porcelain Light Glass atmosphere combining `#F8FAFC` ground with diffused sky (`#E0F2FE`), mint (`#ECFDF5`), and indigo (`#EEF2FF`) corner light.
- Calibrated circular Six-Pack flight gauges (`25` radial ticks across a `240deg` sweep, `0`/`MAX` labels, tapered counterweight polygon pointer, dual-ring center hub) integrated seamlessly beside hairline-divided Seat Rotation Ledgers.
- Strictly gated semantic palette: Action Cobalt (`#1A73E8`) for primary actions, Nominal Emerald (`#10B981`) for healthy escrow telemetry, high-contrast Slate inks (`#0F172A`, `#334155`, `#475569` at `>= 4.5:1`), and Fault Red (`#EF4444` / `#B91C1C`) reserved strictly for simulated slash, default, or Defaulter states.
- Dual-font typographic discipline pairing geometric `Manrope` (`-0.03em` / `-0.02em` headings) with strictly tabular `JetBrains Mono` (`tabular-nums`) across web applications and `Daret_on_Hedera_V2.pptx`.
- Unboxed, hairline-separated surface construction with zero nested dial cards, zero pill eyebrows above section titles, and flush aspect-ratio-preserved bespoke imagery.

## Colors

The palette pairs cool daylight porcelain neutrals and translucent white glass against Action Cobalt interactive controls, Nominal Emerald instrument arcs, pastel status pills, and tightly gated Fault Red alert signals.

### Primary
- **Action Cobalt** (`#1A73E8`): Primary CTA pill fills, active tabs and circle switcher pills, precision slider thumbs, focal collateral/rotation dial arcs, and inline equation emphasis (`(N − k) × C`).
- **Action Cobalt Hover** (`#1557B0`): Interactive hover state on primary pill CTAs and slider thumbs across Showcase and PoC surfaces.
- **Deep Cobalt Ink** (`#174EA6`): High-contrast cobalt used for unboxed slide metadata headers, instrument bay sub-captions, and mathematical equation callouts in `Daret_on_Hedera_V2.pptx`.

### Secondary
- **Nominal Emerald** (`#10B981`): Healthy escrow pot and collateral dial arcs, live `6/6 NOMINAL` indicator dots, and active circle status indicators.
- **Deep Emerald Ink** (`#047857`): High-contrast emerald text on light frosted surfaces for Six-Pack instrument lamp readouts (`TARGET`, `SEQ`, `LOCK RATE`) and slide gauge captions.

### Tertiary
- **Nominal Pill Fill & Ink** (`#DCFCE7` / `#15803D`): Pastel green pill tokens used for `Paid Out`, `Pure Saver`, `6/6 NOMINAL`, `Eligible`, and Showcase `Gold` reputation tier badges.
- **Info Pill Fill & Ink** (`#E0F2FE` / `#0369A1`): Pastel sky pill tokens used for `Collecting`, `Next Pot R1`, `Gate`, `Silver` tier badges, and standard HCS audit event tags.
- **Warning Pill Fill, Ink & Signal** (`#FEF3C7` / `#B45309` / `#F59E0B`): Amber pill and signal tokens used for `Skip Armed`, `Recruiting` badges, underfunded wallet notices, PoC `Gold` tier badges, and armed slash gauges.
- **Fault Red, Fault Ink & Fault Pill** (`#EF4444` / `#B91C1C` / `#FEE2E2`): Strictly gated fault state colors used solely for active collateral slashing gauges, `SLASH EXECUTED` alerts, `JOIN_REJECTED` / `GRACE_MISSED` HCS events, and `Defaulter` reputation badges.

### Neutral
- **Porcelain Canvas** (`#F8FAFC`): Root page ground across Showcase and PoC, recessed circular dial faces, and top gradient anchor of `2560 × 1440` presentation backdrops.
- **Porcelain Tint** (`#F1F5F9`): Neutral pill backgrounds (`Queued`, `New` tier, wallet selector capsule), segmented control tracks, and secondary backdrop gradient stop.
- **Ambient Sky, Mint & Indigo Washes** (`#E0F2FE`, `#ECFDF5`, `#EEF2FF`): Soft fixed radial blooms layered behind frosted glass surfaces (plus `#EEF2FF` refund-phase badge fill).
- **Frosted Glass Bay & Surface** (`rgba(255, 255, 255, 0.78)` / `rgba(255, 255, 255, 0.86)`): Translucent white enclosures (`0.78` Showcase primary bays, `0.80` PoC console panels, `0.86` elevated inner cards, `0.94` PoC modal overlays) backed by `Pure White` (`#FFFFFF`) inner dial rings and button ink.
- **Ink Slate, Body Slate & Muted Slate** (`#0F172A`, `#334155`, `#475569`): Hierarchical text inks maintaining WCAG AA (`>= 4.5:1`) legibility on Porcelain and frosted glass—`#0F172A` for headings, seat names, and numeric readouts; `#334155` for prose; `#475569` for captions, `0`/`MAX` dial ticks, and metadata.
- **Hairline Border** (`rgba(15, 23, 42, 0.07)`): Subtle outer enclosure rings (`0.06`–`0.09` opacity) and `1px` instrument matrix dividers separating dials and ledger rows.

### Named Rules
**The Fault-Gate Rule.** Fault Red (`#EF4444` and `#B91C1C` on `#FEE2E2`) is strictly gated to simulated slash events, missed-round defaults, `join()` reverts, and `Defaulter` reputation states; it must never appear as decorative accent or ambient trim.

**The Contrast Floor Rule.** All readable body copy, telemetry captions, dial ticks, and `0`/`MAX` labels must hold at least `4.5:1` WCAG AA contrast on Porcelain (`#F8FAFC`) and frosted glass surfaces, anchoring body ink to `#334155` and muted telemetry labels to `#475569`.

## Typography

**Display Font:** Manrope (with `system-ui, -apple-system, sans-serif` fallback)
**Body Font:** Manrope (with `system-ui, -apple-system, sans-serif` fallback)
**Label/Mono Font:** JetBrains Mono (with `ui-monospace, SFMono-Regular, monospace` fallback)

**Character:** Geometric `Manrope` gives headings editorial clarity and crisp authority without crypto theatrics, while `JetBrains Mono` locks every Dirham amount, Hedera ID, and gauge readout onto fixed-width tabular columns across web apps and `Daret_on_Hedera_V2.pptx`.

### Hierarchy
- **Display** (`800` ExtraBold, `3.375rem` / `54px` on Showcase desktop hero, `1.03` line-height, `-0.03em` tracking; `41pt` bold on Deck Cover): Anchors the opening claim (`The Code Becomes the Organizer.`) and primary product title.
- **Headline** (`800` ExtraBold, `2.25rem`–`3rem` / `36px`–`48px` Showcase sections, `1.15`–`1.25` line-height, `-0.03em` tracking; `24px`–`26px` PoC circle heading at `-0.025em`; `23.5pt` Deck slide titles): Establishes unmistakable primary-to-section scale contrast without eyebrow pills.
- **Title** (`600`–`700` SemiBold/Bold, `1.0625rem`–`1.5rem` / `17px`–`24px`, `1.3` line-height, `-0.02em` tracking): Heads Six-Pack bays, PoC workbench panels (`17px`), modals (`19px`), and Seat Rotation Ledger sub-sections.
- **Body** (`400` Regular / `500` Medium, `1rem` / `16px` Showcase prose, `0.875rem` / `14px` dense PoC controls, `1.55` line-height; `12pt`–`13pt` Deck prose): Readable multi-line explanations kept comfortably within `60ch–70ch` columns.
- **Label** (`600`–`700`, `JetBrains Mono`, `0.625rem`–`0.75rem` / `10px`–`12px` metadata & pills, `14px`–`16px` gauge readouts, tabular figures, `0.02em` tracking; `9.2pt`–`14pt` Deck mono): Formats `MAD` balances, `0.0.x` Hedera accounts/topics, HCS sequence numbers, and `(N − k) × C` telemetry.

### Named Rules
**The Tabular Ledger Rule.** Every currency amount (`MAD`, `USD`), Hedera account/topic ID (`0.0.x`), HCS sequence number, round counter, and dial readout must use `JetBrains Mono` with tabular numerals (`tnum`) so numbers align vertically and never jitter during live simulation steps.

**The Clean Header Rule.** Never place rounded pill kickers or uppercase eyebrow badges above section titles or hero headlines; establish section context directly through clear `54px` → `36px–48px` scale contrast (`26px` → `17px–19px` in the PoC console) or unboxed monospace metadata separated by a horizontal hairline on slides.

## Layout

All three surfaces share a breathable, asymmetric spatial grammar anchored on centered containers and unified glass bays rather than scattered card grids.

- **Showcase (`v2/showcase-website`)**: Centered `1280px` container with `16px` mobile to `24px` tablet/desktop horizontal gutters and `48px`–`64px` vertical section spacing. At desktop width (`1024px+`), the first viewport splits `12` columns (`32px`–`40px` gap): `5` columns left for the editorial claim and dual pill CTAs, `7` columns right for the unified Six-Pack + Seat Rotation Ledger bay. Content bays use `24px`–`48px` internal padding.
- **PoC Console (`v2/poc-app`)**: Centered `1440px` operational frame with `20px`–`32px` horizontal gutters, sticky full-width top workspace bar, full-span 6-instrument Six-Pack Dock (`2` columns mobile, `3` columns tablet, `6` columns wide desktop at `1280px+`), and `12`-column operational split pairing the left recruitment/execution stage with a sticky (`80px` top offset) right-hand audit/ledger drawer.
- **Pitch Deck (`Daret_on_Hedera_V2.pptx`)**: Widescreen `13.3333 × 7.5 in` canvas with `0.72 in` horizontal margins (`11.8933 in` live content width), unboxed top metadata strip (`0.28 in`) above a full-width `0.01 in` hairline (`0.56 in`), and hairline-divided telemetry/ledger slabs.

### Named Rules
**The Unified Bay Rule.** Pair the Six-Pack dial matrix and Seat Rotation Ledger inside a single frosted glass bay separated by hairline dividers (`1px` at `6%–8%` ink opacity) rather than stacking separate nested cards inside outer frames.

## Elevation & Depth

Depth is conveyed through translucent material layering over ambient radial light rather than opaque drop shadows. Glass enclosures float above diffused sky (`#E0F2FE`), mint (`#ECFDF5`), and indigo (`#EEF2FF`) light pools on `#F8FAFC`, achieving crisp edge definition through backdrop blur (`16px`–`24px`), a `1px` specular white inner top bevel, and low-opacity slate hairlines.

### Shadow Vocabulary
- **Bay Elevated** (`box-shadow: 0 20px 50px -14px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(15, 23, 42, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 1)`): Primary frosted glass bays and integrated Six-Pack + Ledger containers on the Showcase.
- **Surface Rest** (`box-shadow: 0 10px 30px -12px rgba(15, 23, 42, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.95)`): Elevated inner glass surfaces on Showcase and PoC console panels (`0 8px 24px -12px rgba(15, 23, 42, 0.08)` with `inset 0 1px 0 rgba(255, 255, 255, 0.92)`).
- **Modal Deep** (`box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95), 0 24px 56px -18px rgba(15, 23, 42, 0.16)`): PoC circle creation modal overlaid on a `25%` slate backdrop scrim with subtle blur.
- **Floating Navbar** (`box-shadow: 0 12px 32px -12px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.95)`): Sticky top pill navigation bar in Showcase.
- **Primary CTA Glow** (`box-shadow: 0 8px 20px -4px rgba(26, 115, 232, 0.28)`; hover `0 12px 24px -6px rgba(26, 115, 232, 0.34)`): Tactile lift on Showcase primary blue pills (`0 2px 8px -2px rgba(26, 115, 232, 0.28)` in PoC).
- **Deck Glass Slab** (`4%` alpha `#0F172A` outer shadow, `152400 EMU` blur radius, `38100 EMU` offset): Whisper-soft separation for PowerPoint glass slabs (`0%` shadow on status pills and bespoke illustrations).

### Named Rules
**The Specular Hairline Rule.** Frosted glass surfaces separate from the Porcelain canvas through a `1px` top specular highlight and a `6%–9%` slate hairline ring rather than heavy drop shadows or dark outer borders.

## Shapes

The geometry balances friendly full-pill interactive controls with disciplined architectural enclosure radii and precision instrument circles:

- **Full Pills (`9999px` radius)**: All primary and ghost buttons, Showcase floating navbar, circle switcher tabs, reputation badges, status chips, and precision slider tracks.
- **Bay & Panel Radii (`24px` outer bays, `16px` panels & media)**: Outer Showcase bays take `24px` corners; inner instrument matrices (`1px` grid seams over `rgba(15, 23, 42, 0.07)`), PoC console cards, modals, and bespoke `16:9` raster images take `16px` corners (`28px` mask radius at `1376px` in deck assets, rendering ~`20px` flush on canvas).
- **Interactive Rows & Fields (`12px` radius)**: Inputs, selects, and clickable Seat Rotation Ledger rows sit neatly nested inside `16px`–`24px` containers.
- **Calibrated Dial Geometry**: Concentric circular instruments featuring an outer aluminum/slate hairline bezel (`rgba(15, 23, 42, 0.11)`–`0.14` on web / `#CBD5E1` in deck), recessed `#F8FAFC` dial face, `25` radial tick marks across `-120deg` to `+120deg` (`240deg` sweep), `0` and `MAX` perimeter labels, `3.2px`–`4.2px` active telemetry arc, tapered triangular counterweight polygon needle, and dual-ring center cap (`#0F172A` outer ring + `#FFFFFF` / accent inner pin).

### Named Rules
**The Unboxed Instrument Rule.** Individual Six-Pack dial gauges live as bare hairline-divided cells inside the unified instrument grid—never wrap each circular dial in its own shadowed or rounded sub-card.

## Components

Every component feels tactile, calibrated, and unencumbered—interactive controls respond crisply in `120ms`–`160ms`, while instrument needles glide smoothly over `460ms`–`520ms`.

### Buttons
- **Shape:** Full pill (`9999px` radius) across all CTA tiers.
- **Primary:** Action Cobalt (`#1A73E8`) fill with `#FFFFFF` bold text, `14px 24px` padding on Showcase hero CTAs and `8px 20px` in PoC execution controls, paired with `rgba(26, 115, 232, 0.28)` ambient lift.
- **Hover / Focus:** Transitions over `160ms ease` (`150ms` in PoC) to `#1557B0` with `-1px` vertical lift; keyboard focus renders a `2px solid #1A73E8` outline with `2px` offset.
- **Secondary / Ghost:** Frosted porcelain fill (`rgba(255, 255, 255, 0.85)` or `#F1F5F9` neutral capsule), `#0F172A` semibold ink, `1px solid rgba(15, 23, 42, 0.1)`, `14px 20px` padding; hovers to `#FFFFFF` / `#E2E8F0`.

### Chips & Status Pills
- **Style:** Full pill (`9999px` radius), compact `10px`–`12px` semibold/bold labels (`2px 10px` to `4px 12px` padding), `JetBrains Mono` for operational ledger states (`Paid Out R1`, `Collecting R2`, `Slashed −250 MAD`, `6/6 NOMINAL`).
- **State:** Strictly semantic fills—Nominal (`#DCFCE7`/`#15803D`), Info (`#E0F2FE`/`#0369A1`), Warning (`#FEF3C7`/`#B45309`), Neutral (`#F1F5F9`/`#475569`), and Fault (`#FEE2E2`/`#B91C1C` with inline warning triangle SVG). Note observed cross-surface tier variance: Showcase (`daretData.ts`) assigns `Gold` to green (`#DCFCE7`/`#15803D`) and `Bronze` to amber (`#FEF3C7`/`#B45309`), whereas PoC (`presets.ts`) assigns `Gold` to amber (`#FEF3C7`/`#B45309`) and `Bronze` to neutral slate (`#F1F5F9`/`#0F172A`); both keep `Silver` (`#E0F2FE`/`#0369A1`), `New` (`#F1F5F9`), and `Defaulter` (`#FEE2E2`/`#B91C1C`) aligned.

### Cards / Containers
- **Corner Style:** `24px` radius for primary Showcase glass bays; `16px` radius for PoC console panels and modal enclosures.
- **Background:** `rgba(255, 255, 255, 0.78)`–`0.94` with `20px`–`24px` backdrop blur.
- **Shadow Strategy:** Ambient shadow + `1px` specular white inset top highlight per Elevation & Depth.
- **Border:** `1px solid rgba(255, 255, 255, 0.96)` + outer `rgba(15, 23, 42, 0.05)` ring (Showcase) or `1px solid rgba(15, 23, 42, 0.06)`–`0.07` (PoC).
- **Internal Padding:** `16px–20px` on live Six-Pack bay, `24px` on PoC workbench panels, `24px–48px` on Showcase narrative bays.

### Inputs / Fields
- **Style:** `12px` radius porcelain field (`rgba(255, 255, 255, 0.92)`), `1px solid rgba(15, 23, 42, 0.09)` stroke, `#0F172A` text, `10px 14px` padding, `#1A73E8` caret. Precision sliders use `6px`–`7px` rounded pill tracks with `18px`–`19px` Action Cobalt thumbs bordered in `2.5px` white.
- **Focus:** Shifts background to `#FFFFFF`, stroke to `#1A73E8`, and adds a `0 0 0 3px rgba(26, 115, 232, 0.14)` cobalt halo.
- **Error / Disabled:** Validation rejections surface inline banners (`#FEE2E2` / `#B91C1C` on `Defaulter` `join()` revert; `#FEF3C7` / `#B45309` on underfunded wallet warning); disabled buttons drop to `0.45` opacity.

### Navigation
- **Showcase Navbar:** Sticky floating pill (`12px` top offset, `9999px` radius, `92%` white translucent fill with `24px` backdrop blur), brand orbital SVG mark + `Daret on Hedera` wordmark, live `6/6 NOMINAL` / `SLASH EXECUTED` status pill, 6 anchor links (`12px` semibold `#475569`), `Run PoC Demo` ghost pill, and `Join Team` primary pill; collapses cleanly below `1024px` into an expandable frosted glass drawer.
- **PoC Header:** Sticky full-width frosted bar (`80%` white with backdrop blur), brand mark + `PoC Console · Testnet` subline, interactive circle switcher pills (active cobalt pills vs frosted porcelain pills), `+ New Circle` pill, `EVM · HTS · HCS · Mirror · PRNG · $0.0001` service indicator strip (at `1536px+`), wallet persona switcher with `+1k` HTS faucet pill, and `Reset` pill.

### Escrow Six-Pack & Seat Rotation Ledger
The signature component integrates six calibrated circular flight gauges (`01 Pot Flow`, `02 Collateral`, `03 HCS Sync`, `04 Rotation`, `05 Trust Tier`, `06 Slash Guard`) inside a `1px` hairline-divided `rgba(15, 23, 42, 0.07)` matrix (`2×3` on Showcase Hero; `6`-column horizontal dock on PoC at `1280px+`; `6`-gauge horizontal strip or `2`-gauge comparison panel on Slides 1, 3, 5, and 6). Directly beneath/beside the dials in the same glass bay, a hairline-divided (`rgba(15, 23, 42, 0.06)`) Seat Rotation Ledger lists `Seat #01..#N`, reputation tier pill, `JetBrains Mono` locked collateral `(N − k) × C`, and live payout/slash status pills; clicking any seat updates gauges `02` and `05` with a `520ms cubic-bezier(0.22, 1, 0.36, 1)` needle sweep.

## Do's and Don'ts

### Do:
- **Do** build every surface on the daylight Porcelain canvas (`#F8FAFC`) washed gently with sky (`#E0F2FE`), mint (`#ECFDF5`), and faint indigo (`#EEF2FF`) ambient blooms.
- **Do** enforce the Unified Bay Rule by housing the hairline-divided Six-Pack gauges and Seat Rotation Ledger inside a single frosted glass bay enclosure.
- **Do** render every gauge with `25` calibrated ticks across `-120deg` to `+120deg`, `0` and `MAX` perimeter labels, a tapered counterweight polygon pointer, and a dual-ring center hub cap.
- **Do** format all Dirham balances, Hedera `0.0.x` IDs, `(N − k) × C` formulas, sequence counts, and dial values in `JetBrains Mono` with tabular numerals (`tnum`).
- **Do** reserve Fault Red (`#EF4444` / `#B91C1C` / `#FEE2E2`) exclusively for simulated collateral slashes, missed-round defaults, reverted `join()` checks, and `Defaulter` tiers.
- **Do** keep bespoke `16:9` studio visuals completely flush on canvas (`16px` web radius / `28px` corner mask at `1376px` on deck) preserving exact native pixel aspect ratios with zero stretching.

### Don't:
- **Don't** add pill kickers or uppercase eyebrow tags above hero titles or section headings; let scale hierarchy or unboxed slide metadata hairlines lead.
- **Don't** wrap individual Six-Pack dial gauges in separate shadowed or rounded sub-cards inside an instrument bay.
- **Don't** frame bespoke studio renders or architectural visuals in taupe, beige, or gray rectangular drop-shadow boxes.
- **Don't** add fake floating scroll chevrons, decorative bounce arrows, or murky dark-mode / neon Web3 gradients.
- **Don't** drop text, metadata, or instrument tick label contrast below WCAG AA (`4.5:1`), keeping muted ink at `#475569` or darker.
- **Don't** hardcode or fabricate arbitrary hex colors outside the Porcelain, Action Cobalt, Nominal Emerald, Pastel Status Pill, and gated Fault Red system tokens.
