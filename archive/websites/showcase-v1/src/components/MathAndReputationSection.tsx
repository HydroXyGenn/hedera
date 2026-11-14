import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  CheckCircle2,
  EyeOff,
  Lock,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { REPUTATION_TIERS, ReputationTier } from '../data/daretData';

const RULES = [
  'Pick a payout position k and lock matching collateral—early slots lock more, the final slot locks 0 MAD as a pure saver.',
  'Everyone contributes C each round into the smart contract escrow.',
  'If someone misses payment past the short grace period, the contract automatically slashes C from their collateral—so the recipient is still paid 100% on time.',
  'At cycle end, unused collateral is returned in full to every compliant member.',
  'An optional 1–2% insurance pool covers rare edge shortfalls when tier discounts apply.',
  'Verified Mirror Node reputation progressively reduces required collateral over time.',
];

export const MathAndReputationSection: React.FC = () => {
  const [circleSize, setCircleSize] = useState<number>(10);
  const [contribution, setContribution] = useState<number>(500);
  const [compareSeat, setCompareSeat] = useState<number>(2);
  const [activeTier, setActiveTier] = useState<ReputationTier>('Gold');

  const safeSeat = Math.min(compareSeat, circleSize);
  const baseCollateral = (circleSize - safeSeat) * contribution;
  const newCollateral = baseCollateral * REPUTATION_TIERS.New.collateralMultiplier;
  const selectedCollateral = baseCollateral * REPUTATION_TIERS[activeTier].collateralMultiplier;
  const savings = Math.max(0, newCollateral - selectedCollateral);

  return (
    <section id="math" className="relative mx-auto max-w-7xl px-4 sm:px-6 py-14 lg:py-20">
      <div className="space-y-8">
        {/* Section Heading */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full glass-pill px-3 py-1 text-xs font-semibold text-cyan-100">
            <Lock className="h-3.5 w-3.5 text-cyan-200" />
            <span>3 · ARITHMETIC, NOT BLIND TRUST</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
            Why Running Away Is Mathematically Unprofitable
          </h2>
          <p className="text-sky-100/90 text-sm sm:text-base leading-relaxed">
            A member in position <code className="font-mono-tabular text-cyan-200">k</code> takes the pot in
            round <code className="font-mono-tabular text-cyan-200">k</code> having paid only{' '}
            <code className="font-mono-tabular text-cyan-200">k × C</code>. If they quit, they still owe{' '}
            <code className="font-mono-tabular text-white font-semibold">(N − k) × C</code>. Locking that exact
            remainder upfront turns social risk into solved arithmetic.
          </p>
        </div>

        {/* Two-Column Interactive Math & Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Dynamic Collateral Curve Chart */}
          <div className="lg:col-span-7 glass-panel rounded-3xl p-5 sm:p-7 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-xl font-bold text-white">
                  Required Collateral by Seat Position
                </h3>
                <p className="text-xs text-sky-100/80">
                  Formula: <span className="font-mono-tabular text-cyan-200">(N − k) × C</span> · Drag to inspect any circle size
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono-tabular">
                <label className="flex items-center gap-2 glass-pill rounded-xl px-3 py-1.5">
                  <span className="text-sky-200">N:</span>
                  <input
                    type="number"
                    min={4}
                    max={12}
                    value={circleSize}
                    onChange={(e) => setCircleSize(Math.max(4, Math.min(12, Number(e.target.value) || 4)))}
                    className="w-10 bg-transparent text-white font-bold outline-none text-center"
                  />
                </label>
                <label className="flex items-center gap-2 glass-pill rounded-xl px-3 py-1.5">
                  <span className="text-sky-200">C:</span>
                  <input
                    type="number"
                    min={20}
                    max={2000}
                    step={20}
                    value={contribution}
                    onChange={(e) => setContribution(Math.max(20, Math.min(2000, Number(e.target.value) || 100)))}
                    className="w-14 bg-transparent text-white font-bold outline-none text-center"
                  />
                  <span className="text-cyan-200">MAD</span>
                </label>
              </div>
            </div>

            {/* Bars */}
            <div className="space-y-2.5">
              {Array.from({ length: circleSize }, (_, i) => i + 1).map((seat) => {
                const maxVal = (circleSize - 1) * contribution;
                const seatBase = (circleSize - seat) * contribution;
                const widthPct = maxVal > 0 ? (seatBase / maxVal) * 100 : 0;
                const isSelected = seat === safeSeat;

                return (
                  <button
                    key={seat}
                    type="button"
                    onClick={() => setCompareSeat(seat)}
                    className={`w-full group text-left rounded-xl p-2 transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-white/15 border-cyan-200/60'
                        : 'bg-white/5 border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono-tabular mb-1">
                      <span className="text-white font-semibold">
                        Seat #{seat}{' '}
                        {seat === 1 && (
                          <span className="text-[10px] text-amber-200 font-sans ml-1">(Earliest Payout)</span>
                        )}
                        {seat === circleSize && (
                          <span className="text-[10px] text-emerald-200 font-sans ml-1">(Pure Saver · 0 MAD Risk)</span>
                        )}
                      </span>
                      <span className="text-cyan-100 font-bold">
                        {seatBase.toLocaleString()} MAD
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        initial={false}
                        animate={{ width: `${Math.max(seat === circleSize ? 2 : 6, widthPct)}%` }}
                        transition={{ duration: 0.35 }}
                        className={`h-full rounded-full ${
                          seat === circleSize
                            ? 'bg-emerald-300'
                            : isSelected
                              ? 'bg-gradient-to-r from-cyan-300 to-white'
                              : 'bg-gradient-to-r from-sky-400/80 to-cyan-200/85'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Contract Rules + New vs Gold Comparison */}
          <div className="lg:col-span-5 space-y-6">
            {/* Applicant Comparison Card (Demo Script Feature) */}
            <div className="glass-panel-luminous rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-cyan-100">
                    Same Seat #{safeSeat} · Two Applicants
                  </div>
                  <h3 className="font-display text-lg font-bold text-white">
                    How Reputation Lowers Collateral
                  </h3>
                </div>
                <Award className="h-6 w-6 text-amber-200 shrink-0" />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(['Bronze', 'Silver', 'Gold', 'Defaulter'] as ReputationTier[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActiveTier(t)}
                    className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                      activeTier === t
                        ? 'bg-white text-[#06297a]'
                        : 'bg-white/12 text-sky-100 hover:bg-white/22'
                    }`}
                  >
                    Compare: {t}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 border border-white/25 p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <UserPlus className="h-3.5 w-3.5 text-sky-200" />
                      New
                    </span>
                    <span className="text-[10px] font-mono-tabular text-sky-200">100%</span>
                  </div>
                  <div className="font-display text-xl font-extrabold font-mono-tabular text-white">
                    {newCollateral.toLocaleString()} MAD
                  </div>
                  <p className="text-[11px] text-sky-100/80 leading-snug">
                    No prior HCS record. Full collateral required + cap on circle size.
                  </p>
                </div>

                <div className="rounded-2xl bg-cyan-400/20 border border-cyan-200/45 p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5 text-amber-200" />
                      {activeTier}
                    </span>
                    <span className="text-[10px] font-mono-tabular text-cyan-100">
                      {Math.round(REPUTATION_TIERS[activeTier].collateralMultiplier * 100)}%
                    </span>
                  </div>
                  <div className="font-display text-xl font-extrabold font-mono-tabular text-cyan-100">
                    {selectedCollateral.toLocaleString()} MAD
                  </div>
                  <p className="text-[11px] text-cyan-50/90 leading-snug">
                    {REPUTATION_TIERS[activeTier].effectText}
                  </p>
                </div>
              </div>

              {savings > 0 && (
                <div className="rounded-xl bg-emerald-400/20 border border-emerald-300/45 px-3 py-2 text-xs text-emerald-50 font-medium flex items-center justify-between">
                  <span>Trust Discount Earned via Mirror Node History:</span>
                  <strong className="font-mono-tabular">−{savings.toLocaleString()} MAD</strong>
                </div>
              )}
            </div>

            {/* 6 Rules Enforced by Contract */}
            <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-3">
              <h3 className="font-display text-base font-bold text-white">
                Rules Enforced by the Smart Contract
              </h3>
              <ul className="space-y-2">
                {RULES.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-sky-100/90 leading-relaxed">
                    <span className="mt-0.5 h-5 w-5 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center text-[10px] font-mono-tabular font-bold text-cyan-100 shrink-0">
                      {idx + 1}
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Reputation Anti-Sybil & Privacy Safeguards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              icon: Award,
              title: 'Non-Transferable HTS Badge',
              desc: 'Tiers live on a soulbound HTS NFT/badge—reputation can never be bought, transferred, or sold.',
            },
            {
              icon: ShieldCheck,
              title: 'Safe Cold Start',
              desc: 'Newcomers start safely with small circles or late saver slots while building a verified HCS track record.',
            },
            {
              icon: ShieldAlert,
              title: 'Sybil & Fake-Account Proof',
              desc: 'A defaulter who creates a fresh wallet resets to New and pays 100% collateral—resetting gains nothing.',
            },
            {
              icon: EyeOff,
              title: 'Privacy-First Design',
              desc: 'Circle UI surfaces tier badges instead of exposing raw balances; optional zero-knowledge proofs are planned next.',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="glass-panel rounded-2xl p-5 space-y-2">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 border border-white/25 text-cyan-100">
                  <Icon className="h-4 w-4" />
                </div>
                <h4 className="font-display text-sm font-bold text-white">{card.title}</h4>
                <p className="text-xs text-sky-100/85 leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom 4-Tier Reference Table */}
        <div className="glass-panel-deep rounded-2xl p-5 overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-display text-sm font-bold text-white">
              Mirror Node Score → Tier Effect on <code className="font-mono-tabular text-cyan-200">join()</code>
            </h4>
            <span className="text-[11px] text-sky-200/80 inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-cyan-200" />
              Contract rejects under-qualified applicants automatically
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(['New', 'Bronze', 'Gold', 'Defaulter'] as ReputationTier[]).map((tKey) => {
              const tier = REPUTATION_TIERS[tKey];
              return (
                <div key={tKey} className="rounded-xl bg-white/8 border border-white/15 p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tier.pillBg}`}>
                      {tKey === 'Bronze' ? 'Bronze / Silver' : tier.label}
                    </span>
                    <span className="text-[11px] font-mono-tabular text-cyan-100">
                      {tKey === 'Bronze' ? '50–75%' : `${Math.round(tier.collateralMultiplier * 100)}%`}
                    </span>
                  </div>
                  <p className="text-xs text-sky-100/85 pt-1 leading-relaxed">{tier.effectText}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
