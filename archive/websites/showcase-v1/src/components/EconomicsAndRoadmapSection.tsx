import React, { useState } from 'react';
import {
  Building,
  CheckCircle2,
  Rocket,
  Scale,
  TrendingUp,
} from 'lucide-react';
import { REVENUE_STREAMS } from '../data/daretData';

const GROWTH_PHASES = [
  {
    phase: 'Phase 1 · Hackathon & Testnet',
    title: 'Testnet PoC & Campus Circles',
    desc: 'Deploy EVM escrow, HTS test token, Soulbound badges, HCS circle topics & Mirror Node dashboard with student groups.',
  },
  {
    phase: 'Phase 2 · Regulated Pilot',
    title: 'University / Association Pilot',
    desc: 'Partner with a university or local association, a licensed financial partner, and a regulated stablecoin or e-money token.',
  },
  {
    phase: 'Phase 3 · Scale Ecosystem',
    title: 'B2B, Reputation API & Financing',
    desc: 'Launch cooperative/payroll white-label packages, consent-based MFI credit scoring API, and early-slot collateral financing.',
  },
];

export const EconomicsAndRoadmapSection: React.FC = () => {
  const [activeCircles, setActiveCircles] = useState<number>(1000);

  // Illustrative unit economics from Overview PDF Page 3:
  // 1 circle = 10 members x 500 MAD x 10 months = 50,000 MAD volume
  // Protocol fee @ 1% = 500 MAD/circle/cycle; Hedera cost = few cents (~0.50 MAD illustrative)
  const volumePerCircle = 50000;
  const feePerCircle = 500;
  const totalVolume = activeCircles * volumePerCircle;
  const totalRevenue = activeCircles * feePerCircle;
  const hederaCostUsd = activeCircles * 0.05; // ~5 cents total for all transactions in a 10-round circle

  return (
    <section id="economics" className="relative mx-auto max-w-7xl px-4 sm:px-6 py-14 lg:py-20">
      <div className="space-y-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full glass-pill px-3 py-1 text-xs font-semibold text-cyan-100">
            <TrendingUp className="h-3.5 w-3.5 text-cyan-200" />
            <span>4 · SUSTAINABLE BUSINESS MODEL & ROADMAP</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
            Cents to Run. Thousands of Dirhams Protected.
          </h2>
          <p className="text-sky-100/90 text-sm sm:text-base leading-relaxed">
            Hedera’s tiny, fixed fees make the cost of securing an entire 10-month Daret only a few
            cents while unlocking 0.5–1% protocol economics, B2B campus subscriptions, and
            consent-based credit reputation.
          </p>
        </div>

        {/* Illustrative Unit Economics Interactive Scale Bar */}
        <div className="glass-panel-luminous rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-cyan-100">
                Illustrative Unit Economics (Explanation Model, Not Forecast)
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white mt-0.5">
                Scale from 1 Campus Circle to {activeCircles.toLocaleString()} Active Circles
              </h3>
              <p className="text-xs text-sky-100/80 mt-0.5">
                Benchmark: 10 members × 500 MAD/month × 10 months = 50,000 MAD circulating per circle
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[1, 50, 250, 1000, 2500].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setActiveCircles(val)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-mono-tabular font-bold transition-all cursor-pointer ${
                    activeCircles === val
                      ? 'bg-white text-[#06297a]'
                      : 'bg-white/12 text-white hover:bg-white/22'
                  }`}
                >
                  {val.toLocaleString()} {val === 1 ? 'circle' : 'circles'}
                </button>
              ))}
            </div>
          </div>

          <input
            type="range"
            min={1}
            max={3000}
            step={1}
            value={activeCircles}
            onChange={(e) => setActiveCircles(Number(e.target.value))}
            aria-label="Number of active circles"
            className="glass-slider w-full"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white/12 border border-white/25 p-4">
              <div className="text-xs text-sky-100/80">Total Cycle Volume</div>
              <div className="font-display text-2xl font-extrabold font-mono-tabular text-white mt-1">
                {totalVolume.toLocaleString()} MAD
              </div>
              <div className="text-[11px] text-cyan-100/80 mt-0.5">
                50,000 MAD × {activeCircles.toLocaleString()}
              </div>
            </div>
            <div className="rounded-2xl bg-cyan-400/20 border border-cyan-200/45 p-4">
              <div className="text-xs text-cyan-50">Protocol Revenue (@ 1%)</div>
              <div className="font-display text-2xl font-extrabold font-mono-tabular text-cyan-100 mt-1">
                {totalRevenue.toLocaleString()} MAD
              </div>
              <div className="text-[11px] text-cyan-100/85 mt-0.5">
                500 MAD per circle / cycle
              </div>
            </div>
            <div className="rounded-2xl bg-white/12 border border-white/25 p-4">
              <div className="text-xs text-sky-100/80">Hedera Network Cost</div>
              <div className="font-display text-2xl font-extrabold font-mono-tabular text-emerald-200 mt-1">
                ~${hederaCostUsd.toFixed(2)} USD
              </div>
              <div className="text-[11px] text-sky-100/80 mt-0.5">
                Negligible cents per full circle
              </div>
            </div>
            <div className="rounded-2xl bg-white/12 border border-white/25 p-4">
              <div className="text-xs text-sky-100/80">Gross Margin vs Gas</div>
              <div className="font-display text-2xl font-extrabold font-mono-tabular text-white mt-1">
                &gt;99.8%
              </div>
              <div className="text-[11px] text-sky-100/80 mt-0.5">
                Before partner & ops costs
              </div>
            </div>
          </div>
        </div>

        {/* 7 Revenue Streams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {REVENUE_STREAMS.map((stream) => (
            <div key={stream.title} className="glass-panel rounded-2xl p-5 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-white/12 border border-white/20 px-2.5 py-0.5 text-[10px] font-mono-tabular text-cyan-100">
                    {stream.phase}
                  </span>
                  <Building className="h-4 w-4 text-cyan-200/75" />
                </div>
                <h4 className="font-display text-base font-bold text-white">{stream.title}</h4>
                <p className="text-xs text-sky-50/90 leading-relaxed">{stream.mechanism}</p>
              </div>
              <p className="text-[11px] text-cyan-100/75 pt-2 border-t border-white/15 leading-relaxed">
                {stream.notes}
              </p>
            </div>
          ))}

          {/* 8th slot: 3-Phase Summary Card */}
          <div className="glass-panel-deep rounded-2xl p-5 flex flex-col justify-between space-y-3 border border-cyan-200/35">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-100">
                <Rocket className="h-4 w-4" />
                <span>3-Phase Rollout</span>
              </div>
              {GROWTH_PHASES.map((gp) => (
                <div key={gp.phase} className="text-xs space-y-0.5 border-l-2 border-cyan-300/50 pl-2.5">
                  <div className="font-bold text-white">{gp.phase}</div>
                  <div className="text-[11px] text-sky-100/80 leading-snug">{gp.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transparent Regulatory Note */}
        <div className="glass-panel-deep rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-sky-200/25">
          <div className="h-10 w-10 rounded-xl bg-sky-300/20 border border-sky-200/35 flex items-center justify-center text-cyan-100 shrink-0">
            <Scale className="h-5 w-5" />
          </div>
          <div className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
            <strong className="text-white">Regulatory Transparency Note:</strong> Crypto and savings
            regulation in Morocco is actively evolving. For the 2026 Cross Campus Challenge, Daret on
            Hedera is designed and demonstrated strictly as a <strong className="text-cyan-100">transparent
            testnet escrow and audit ledger</strong>, not a replacement for licensed banks. Production
            deployment with real MAD stablecoins, yield, or collateral financing will be built with
            legal counsel and licensed financial partners.
          </div>
          <CheckCircle2 className="hidden lg:block h-5 w-5 text-emerald-300 shrink-0" />
        </div>
      </div>
    </section>
  );
};
