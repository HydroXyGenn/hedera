import React, { useState } from 'react';
import { CheckCircle2, Rocket, Scale } from 'lucide-react';
import { REVENUE_STREAMS } from '../data/daretData';

const GROWTH_PHASES = [
  {
    phase: 'Step 1 · Campus Demo',
    title: 'Student Savings Circles',
    desc: 'Test automatic escrow, payment receipts, and trust badges with campus student groups.',
  },
  {
    phase: 'Step 2 · Regulated Pilot',
    title: 'University & Licensed Partner Pilot',
    desc: 'Launch real Dirham circles with a university association and licensed payment partner.',
  },
  {
    phase: 'Step 3 · Nationwide Scale',
    title: 'Co-ops, Workplaces & Deposit Loans',
    desc: 'Offer workplace Darets and micro-loans to help new savers cover early-seat deposits.',
  },
];

export const EconomicsAndRoadmapSection: React.FC = () => {
  const [activeCircles, setActiveCircles] = useState<number>(1000);

  const volumePerCircle = 50000;
  const feePerCircle = 500;
  const totalVolume = activeCircles * volumePerCircle;
  const totalRevenue = activeCircles * feePerCircle;
  const hederaCostUsd = activeCircles * 0.05;

  return (
    <section id="economics" className="relative mx-auto max-w-7xl px-4 sm:px-6 py-10 lg:py-14">
      <div className="space-y-6">
        <div className="max-w-2xl space-y-2">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0F172A] leading-tight text-balance">
            Pennies to Run. Millions Protected.
          </h2>
          <p className="text-[#334155] text-sm sm:text-base leading-relaxed text-pretty">
            Running a full 10-month circle on Hedera costs about 5 cents while protecting 50,000
            MAD in community savings.
          </p>
        </div>

        <div className="glass-bay rounded-3xl p-6 sm:p-10 space-y-8">
          <div className="space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-[#0F172A]">
                  Impact of {activeCircles.toLocaleString()} Active Circles
                </h3>
                <p className="text-xs text-[#475569] mt-1">
                  Based on 10 friends × 500 MAD/month = 50,000 MAD saved per circle.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[1, 50, 250, 1000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setActiveCircles(val)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-mono-tabular font-bold transition-all cursor-pointer ${
                      activeCircles === val
                        ? 'bg-[#1A73E8] text-white'
                        : 'bg-slate-900/5 text-[#334155] hover:bg-slate-900/10'
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
              className="porcelain-slider w-full"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-900/8 pt-2">
              <div className="py-3 sm:pr-5">
                <div className="text-xs font-semibold text-[#475569]">Total Savings Protected</div>
                <div className="font-display text-2xl font-extrabold font-mono-tabular text-[#0F172A] mt-1">
                  {totalVolume.toLocaleString()} MAD
                </div>
                <div className="text-xs text-[#475569] mt-0.5">
                  50,000 MAD × {activeCircles.toLocaleString()}
                </div>
              </div>

              <div className="py-3 sm:px-5">
                <div className="text-xs font-semibold text-[#0369A1]">Service Fee (1%)</div>
                <div className="font-display text-2xl font-extrabold font-mono-tabular text-[#174EA6] mt-1">
                  {totalRevenue.toLocaleString()} MAD
                </div>
                <div className="text-xs text-[#475569] mt-0.5">
                  500 MAD per full circle
                </div>
              </div>

              <div className="py-3 sm:px-5">
                <div className="text-xs font-semibold text-[#047857]">Hedera Receipt Cost</div>
                <div className="font-display text-2xl font-extrabold font-mono-tabular text-[#15803D] mt-1">
                  ~${hederaCostUsd.toFixed(2)} USD
                </div>
                <div className="text-xs text-[#475569] mt-0.5">
                  ~$0.05 per 10-month circle
                </div>
              </div>

              <div className="py-3 sm:pl-5">
                <div className="text-xs font-semibold text-[#475569]">Savings Kept by Members</div>
                <div className="font-display text-2xl font-extrabold font-mono-tabular text-[#0F172A] mt-1">
                  99%+
                </div>
                <div className="text-xs text-[#475569] mt-0.5">Zero bank interest</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-slate-900/8">
            <div className="lg:col-span-7 min-w-0 space-y-4">
              <h3 className="font-display text-xl font-extrabold text-[#0F172A]">
                How the Platform Sustains Itself
              </h3>

              <div className="divide-y divide-slate-900/8">
                {REVENUE_STREAMS.map((stream) => (
                  <div
                    key={stream.title}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-display text-sm sm:text-base font-bold text-[#0F172A]">
                          {stream.title}
                        </h4>
                        <span className="rounded-full bg-[#E0F2FE] px-2.5 py-0.5 text-xs font-bold text-[#0369A1]">
                          {stream.phase}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                        {stream.mechanism}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 min-w-0 lg:pl-8 lg:border-l lg:border-slate-900/8 space-y-4">
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-[#174EA6]" />
                <h3 className="font-display text-xl font-extrabold text-[#0F172A]">
                  3-Step Rollout Plan
                </h3>
              </div>

              <div className="divide-y divide-slate-900/8">
                {GROWTH_PHASES.map((gp, idx) => (
                  <div key={gp.phase} className="py-3.5 flex items-start gap-3.5">
                    <span className="mt-0.5 h-7 w-7 rounded-full bg-[#1A73E8]/10 text-[#174EA6] flex items-center justify-center font-mono-tabular text-xs font-bold shrink-0">
                      0{idx + 1}
                    </span>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-[#0369A1]">{gp.phase}</div>
                      <div className="font-display text-base font-bold text-[#0F172A]">
                        {gp.title}
                      </div>
                      <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">{gp.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900/8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center shrink-0">
              <Scale className="h-5 w-5" />
            </div>
            <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
              <strong className="text-[#0F172A] font-bold">Compliance Note:</strong> This hackathon
              demo runs on Hedera Testnet as a transparent escrow and receipt tracker; real-money
              circles will launch with licensed financial partners.
            </p>
            <CheckCircle2 className="hidden lg:block h-5 w-5 text-[#10B981] shrink-0" />
          </div>
        </div>
      </div>
    </section>
  );
};
