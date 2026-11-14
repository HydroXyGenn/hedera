import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle2, UserCheck, UserPlus } from 'lucide-react';
import { REPUTATION_TIERS, ReputationTier } from '../data/daretData';

const RULES = [
  'Early winners lock a refundable security deposit; the last seat locks 0 MAD.',
  'Everyone pays their monthly contribution into the automatic escrow.',
  'If someone misses a payment, their security deposit covers it so the winner gets paid 100% on time.',
  'When the circle finishes, unused security deposits return automatically.',
];

export const MathAndReputationSection: React.FC = () => {
  const [circleSize, setCircleSize] = useState<number>(6);
  const [contribution, setContribution] = useState<number>(250);
  const [compareSeat, setCompareSeat] = useState<number>(1);
  const [activeTier, setActiveTier] = useState<ReputationTier>('Gold');

  const safeSeat = Math.min(compareSeat, circleSize);
  const baseCollateral = (circleSize - safeSeat) * contribution;
  const newCollateral = baseCollateral * REPUTATION_TIERS.New.collateralMultiplier;
  const selectedCollateral = baseCollateral * REPUTATION_TIERS[activeTier].collateralMultiplier;
  const savings = Math.max(0, newCollateral - selectedCollateral);

  return (
    <section id="math" className="relative mx-auto max-w-7xl px-4 sm:px-6 py-10 lg:py-14">
      <div className="glass-bay rounded-3xl p-6 sm:p-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 min-w-0 space-y-5">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0F172A] leading-tight text-balance">
              How Security Deposits Protect the Circle
            </h2>
            <p className="text-[#334155] text-sm sm:text-base leading-relaxed text-pretty">
              Early winners lock enough security deposit to cover their remaining payments, while
              the last seat locks 0 MAD.
            </p>

            {/* Same Seat Applicant Comparison */}
            <div className="pt-4 border-t border-slate-900/8 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg font-extrabold text-[#0F172A]">
                    Good Savers Unlock Lower Deposits
                  </h3>
                  <p className="text-xs text-[#475569]">
                    Comparing Seat #{safeSeat} deposit by trust badge
                  </p>
                </div>
                <Award className="h-5 w-5 text-[#174EA6] shrink-0" />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(['Gold', 'Silver', 'Bronze', 'Defaulter'] as ReputationTier[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActiveTier(t)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      activeTier === t
                        ? 'bg-[#1A73E8] text-white'
                        : 'bg-slate-900/5 text-[#334155] hover:bg-slate-900/10'
                    }`}
                  >
                    {REPUTATION_TIERS[t].label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 divide-x divide-slate-900/8 pt-1">
                <div className="pr-4 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0F172A] flex items-center gap-1">
                      <UserPlus className="h-3.5 w-3.5 text-[#475569]" />
                      New Member
                    </span>
                    <span className="font-mono-tabular font-semibold text-[#475569]">100%</span>
                  </div>
                  <div className="font-display text-xl font-extrabold font-mono-tabular text-[#0F172A]">
                    {newCollateral.toLocaleString()} MAD
                  </div>
                  <p className="text-xs text-[#475569]">
                    Standard security deposit for first-time members.
                  </p>
                </div>

                <div className="pl-4 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0F172A] flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5 text-[#174EA6]" />
                      {REPUTATION_TIERS[activeTier].label}
                    </span>
                    <span className="font-mono-tabular font-bold text-[#0369A1]">
                      {Math.round(REPUTATION_TIERS[activeTier].collateralMultiplier * 100)}%
                    </span>
                  </div>
                  <div className="font-display text-xl font-extrabold font-mono-tabular text-[#174EA6]">
                    {selectedCollateral.toLocaleString()} MAD
                  </div>
                  <p className="text-xs text-[#475569]">
                    {REPUTATION_TIERS[activeTier].effectText}
                  </p>
                </div>
              </div>

              {savings > 0 && (
                <div className="rounded-full bg-[#DCFCE7] px-4 py-2 text-xs text-[#15803D] font-bold flex items-center justify-between">
                  <span>Deposit Discount for Paying on Time:</span>
                  <span className="font-mono-tabular">−{savings.toLocaleString()} MAD</span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 min-w-0 space-y-2">
            <img
              src="./assets/collateral_equilibrium_sculpture.png"
              alt="Decreasing security deposit weights across circle seats"
              className="w-full aspect-video object-cover rounded-2xl"
              loading="eager"
            />
            <p className="text-xs text-[#475569] px-1">
              Early seats lock more security deposit; the last seat locks 0 MAD.
            </p>
          </div>
        </div>

        {/* Interactive Security Deposit Curve + Simple Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-slate-900/8">
          <div className="lg:col-span-7 min-w-0 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-xl font-extrabold text-[#0F172A]">
                  Security Deposit Needed by Seat
                </h3>
                <p className="text-xs text-[#475569]">
                  Click any seat to see how much deposit is needed.
                </p>
              </div>

              <div className="flex items-center gap-2.5 text-xs font-mono-tabular">
                <label className="flex items-center gap-2 rounded-full bg-white border border-slate-900/12 px-3 py-1.5">
                  <span className="text-[#475569] font-semibold">Seats:</span>
                  <input
                    type="number"
                    min={4}
                    max={12}
                    value={circleSize}
                    onChange={(e) =>
                      setCircleSize(Math.max(4, Math.min(12, Number(e.target.value) || 4)))
                    }
                    aria-label="Number of seats"
                    className="w-10 bg-transparent text-[#0F172A] font-bold outline-none text-center"
                  />
                </label>
                <label className="flex items-center gap-2 rounded-full bg-white border border-slate-900/12 px-3 py-1.5">
                  <span className="text-[#475569] font-semibold">Monthly:</span>
                  <input
                    type="number"
                    min={20}
                    max={2000}
                    step={20}
                    value={contribution}
                    onChange={(e) =>
                      setContribution(Math.max(20, Math.min(2000, Number(e.target.value) || 100)))
                    }
                    aria-label="Monthly contribution in MAD"
                    className="w-14 bg-transparent text-[#0F172A] font-bold outline-none text-center"
                  />
                  <span className="text-[#174EA6] font-bold">MAD</span>
                </label>
              </div>
            </div>

            <div className="divide-y divide-slate-900/8">
              {Array.from({ length: circleSize }, (_, i) => i + 1).map((seat) => {
                const maxVal = (circleSize - 1) * contribution;
                const seatBase = (circleSize - seat) * contribution;
                const widthPct = maxVal > 0 ? (seatBase / maxVal) * 100 : 0;
                const isSelected = seat === safeSeat;
                const isLast = seat === circleSize;

                return (
                  <button
                    key={seat}
                    type="button"
                    onClick={() => setCompareSeat(seat)}
                    className={`w-full text-left py-2.5 px-3 rounded-xl transition-all cursor-pointer ${
                      isSelected ? 'bg-[#E0F2FE]/65' : 'hover:bg-slate-900/4'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono-tabular mb-1.5">
                      <span className="text-[#0F172A] font-bold">
                        Seat #{seat}{' '}
                        {seat === 1 && (
                          <span className="text-xs text-[#B45309] font-sans font-semibold ml-1">
                            (First Winner)
                          </span>
                        )}
                        {isLast && (
                          <span className="text-xs text-[#15803D] font-sans font-bold ml-1">
                            — Last Seat = 0 MAD Deposit (Best for new students saving up)
                          </span>
                        )}
                      </span>
                      <span className="text-[#0F172A] font-bold">
                        {seatBase.toLocaleString()} MAD
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-900/8 overflow-hidden">
                      <motion.div
                        initial={false}
                        animate={{ width: `${Math.max(isLast ? 3 : 6, widthPct)}%` }}
                        transition={{ duration: 0.3 }}
                        className={`h-full rounded-full ${
                          isLast
                            ? 'bg-[#10B981]'
                            : isSelected
                              ? 'bg-[#1A73E8]'
                              : 'bg-[#38BDF8]'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 min-w-0 lg:pl-8 lg:border-l lg:border-slate-900/8 space-y-5">
            <div className="space-y-3">
              <h3 className="font-display text-lg font-extrabold text-[#0F172A]">
                4 Simple Circle Rules
              </h3>
              <ol className="divide-y divide-slate-900/6">
                {RULES.map((rule, idx) => (
                  <li
                    key={idx}
                    className="py-3 flex items-start gap-3 text-xs sm:text-sm text-[#334155] leading-relaxed"
                  >
                    <span className="mt-0.5 h-5 w-5 rounded-full bg-[#1A73E8]/10 text-[#174EA6] flex items-center justify-center text-xs font-mono-tabular font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="pt-4 border-t border-slate-900/8 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-display text-base font-extrabold text-[#0F172A]">
                  Trust Badge Colors &amp; Deposit Rates
                </h4>
                <CheckCircle2 className="h-4 w-4 text-[#15803D]" />
              </div>
              <div className="divide-y divide-slate-900/6 text-xs">
                {(['Gold', 'Silver', 'Bronze', 'New', 'Defaulter'] as ReputationTier[]).map(
                  (tKey) => {
                    const tier = REPUTATION_TIERS[tKey];
                    return (
                      <div key={tKey} className="py-2 flex items-center justify-between gap-3">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${tier.pillBg}`}
                        >
                          {tier.label}
                        </span>
                        <span className="font-mono-tabular font-bold text-[#0F172A]">
                          {tKey === 'Defaulter'
                            ? 'Blocked / Last Seat'
                            : `${Math.round(tier.collateralMultiplier * 100)}% deposit`}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
