import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Dices,
  FastForward,
  Flame,
  Info,
  Lock,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  StepForward,
  Users,
} from 'lucide-react';
import { REPUTATION_TIERS, ReputationTier } from '../data/daretData';
import { PeriodOption, roundMad, SimPhase, useSimulation } from '../context/SimulationContext';

const CONTRIBUTION_PRESETS = [20, 100, 250, 500];

const PHASE_LABELS: Record<
  SimPhase,
  { title: string; subtitle: string; badgeClass: string }
> = {
  idle: {
    title: 'Ready to Start Circle',
    subtitle: 'Pick your circle size and monthly MAD amount, then press Play.',
    badgeClass: 'bg-[#F1F5F9] text-[#334155] border-slate-900/10',
  },
  locking: {
    title: 'Step 1 · Locking Security Deposits',
    subtitle: 'Early seats lock a refundable security deposit while the last seat locks 0 MAD.',
    badgeClass: 'bg-[#E0F2FE] text-[#0369A1] border-[#7DD3FC]/70',
  },
  contributing: {
    title: 'Step 2 · Collecting Monthly Payments',
    subtitle: 'Everyone sends their payment into the automatic escrow pot.',
    badgeClass: 'bg-[#E0F2FE] text-[#0369A1] border-[#7DD3FC]/70',
  },
  slashing: {
    title: 'Step 3 · Security Deposit Covers Missed Payment!',
    subtitle: 'Automatic escrow uses the missed member’s security deposit so the winner stays 100% paid.',
    badgeClass: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]',
  },
  paying: {
    title: 'Step 4 · Paying This Round’s Winner',
    subtitle: 'The full pot goes straight to this round’s winner in seconds.',
    badgeClass: 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]',
  },
  round_settled: {
    title: 'Round Paid & Receipt Saved',
    subtitle: 'Verified payment receipt saved permanently before moving to the next round.',
    badgeClass: 'bg-[#E0F2FE] text-[#0369A1] border-[#7DD3FC]/70',
  },
  refunding: {
    title: 'Final Step · Returning Security Deposits',
    subtitle: 'All rounds finished—automatic escrow returns unused security deposits to members.',
    badgeClass: 'bg-[#EEF2FF] text-[#3730A3] border-[#C7D2FE]',
  },
  completed: {
    title: 'Circle Complete · Everyone Paid 100%',
    subtitle: 'Every friend got their full pot on time and unused deposits were returned.',
    badgeClass: 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]',
  },
};

function getSeatCoords(index: number, total: number) {
  const cx = 350;
  const cy = 260;
  const rx = total >= 9 ? 255 : 238;
  const ry = total >= 9 ? 196 : 184;
  const angle = -Math.PI / 2 + (index / total) * Math.PI * 2;
  return {
    x: cx + Math.cos(angle) * rx,
    y: cy + Math.sin(angle) * ry,
  };
}

export const LiveDaretSimulator: React.FC = () => {
  const {
    memberCount,
    contribution,
    period,
    speed,
    members,
    selectedSeat,
    phase,
    currentRound,
    isPlaying,
    escrowPot,
    vaultCollateral,
    protocolTreasury,
    insurancePool,
    bannerAlert,
    isShuffling,
    logs,
    potTotal,
    cycleVolume,
    totalInitialCollateral,
    selectedMember,
    totalTxCount,
    hederaTotalUsd,
    hederaTotalMad,
    setPeriod,
    setSpeed,
    setSelectedSeat,
    setIsPlaying,
    handleMemberCountChange,
    handleContributionChange,
    handleMemberTierChange,
    handleToggleSkipNext,
    handlePrngTirage,
    stepForward,
    resetSimulation,
    loadPreset,
  } = useSimulation();

  const [activeTab, setActiveTab] = useState<'hcs' | 'math' | 'fees'>('hcs');
  const phaseMeta = PHASE_LABELS[phase];

  return (
    <section id="simulator" className="relative mx-auto max-w-7xl px-4 sm:px-6 py-10 lg:py-14">
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 min-w-0 space-y-4">
          <div className="space-y-2">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0F172A] leading-tight text-balance">
              Test a Circle in Seconds.
            </h2>
            <p className="text-[#334155] text-sm sm:text-base leading-relaxed text-pretty">
              Pick the circle size and monthly MAD amount, or test a missed payment to see how the
              security deposit protects the winner.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => loadPreset('poc-demo', true)}
              className="btn-primary-pill inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold cursor-pointer"
            >
              <Flame className="h-3.5 w-3.5" />
              <span>Missed-Payment Demo (4 × 250 MAD)</span>
            </button>
            <button
              type="button"
              onClick={() => loadPreset('micro', false)}
              className="btn-ghost-pill inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold cursor-pointer"
            >
              <span>20 MAD Student Circle (6)</span>
            </button>
            <button
              type="button"
              onClick={() => loadPreset('classic', false)}
              className="btn-ghost-pill inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold cursor-pointer"
            >
              <span>Classic Circle (10 × 500 MAD)</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 min-w-0 space-y-2">
          <img
            src="./assets/hero_glass_instrument.png"
            alt="Automatic escrow ring protecting community savings"
            className="w-full aspect-video object-cover rounded-2xl"
            loading="eager"
          />
          <p className="text-xs text-[#475569] px-1">
            Automatic Escrow · Real-time pot and security deposit protection.
          </p>
        </div>
      </div>

      {/* Main Porcelain Glass Cockpit */}
      <div className="glass-bay rounded-3xl p-5 sm:p-7 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT DECK: Simple Setup & Selected Person */}
          <div className="xl:col-span-4 min-w-0 space-y-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#174EA6]" />
                  <span>Circle Setup</span>
                </h3>
                <span className="text-xs font-semibold text-[#475569]">
                  {phase === 'idle' ? 'Editable' : 'Running'}
                </span>
              </div>

              {/* Number of Friends */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="sim-members-range" className="text-[#334155] font-semibold">
                    Number of Friends
                  </label>
                  <span className="font-mono-tabular font-bold text-[#0F172A] bg-slate-900/5 px-2.5 py-0.5 rounded-full">
                    {memberCount} people
                  </span>
                </div>
                <input
                  id="sim-members-range"
                  type="range"
                  min={3}
                  max={12}
                  step={1}
                  value={memberCount}
                  onChange={(e) => handleMemberCountChange(Number(e.target.value))}
                  className="porcelain-slider w-full"
                />
                <div className="flex justify-between text-xs font-mono-tabular text-[#475569]">
                  <span>3</span>
                  <span>6 (Campus)</span>
                  <span>10 (Classic)</span>
                  <span>12</span>
                </div>
              </div>

              {/* Monthly Payment */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="sim-contrib-range" className="text-[#334155] font-semibold">
                    Payment Each Round
                  </label>
                  <span className="font-mono-tabular font-bold text-[#0369A1] bg-[#E0F2FE] px-2.5 py-0.5 rounded-full">
                    {contribution.toLocaleString()} MAD
                  </span>
                </div>
                <input
                  id="sim-contrib-range"
                  type="range"
                  min={20}
                  max={2000}
                  step={10}
                  value={contribution}
                  onChange={(e) => handleContributionChange(Number(e.target.value))}
                  className="porcelain-slider w-full"
                />
                <div className="flex flex-wrap gap-1.5">
                  {CONTRIBUTION_PRESETS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleContributionChange(val)}
                      className={`rounded-full px-3 py-1 text-xs font-mono-tabular font-semibold transition-all cursor-pointer ${
                        contribution === val
                          ? 'bg-[#1A73E8] text-white'
                          : 'bg-slate-900/5 text-[#334155] hover:bg-slate-900/10'
                      }`}
                    >
                      {val} MAD
                    </button>
                  ))}
                </div>
              </div>

              {/* Round Speed / Schedule */}
              <div className="space-y-1.5">
                <label
                  htmlFor="sim-period-select"
                  className="text-xs text-[#475569] font-semibold block"
                >
                  Payout Schedule
                </label>
                <select
                  id="sim-period-select"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as PeriodOption)}
                  className="w-full rounded-xl bg-white border border-slate-900/12 px-3 py-2 text-xs font-medium text-[#0F172A] outline-none focus:border-[#1A73E8]"
                >
                  <option value="2 min (PoC)">2-Minute Demo</option>
                  <option value="Weekly">Every Week</option>
                  <option value="Monthly">Every Month</option>
                </select>
              </div>

              {/* Pot & Deposit Summary Strip */}
              <div className="grid grid-cols-3 divide-x divide-slate-900/8 pt-3 border-t border-slate-900/8 text-center">
                <div className="px-2">
                  <div className="text-xs font-semibold text-[#475569]">Round Pot</div>
                  <div className="text-sm font-bold font-mono-tabular text-[#0F172A] mt-0.5">
                    {potTotal.toLocaleString()} MAD
                  </div>
                </div>
                <div className="px-2">
                  <div className="text-xs font-semibold text-[#475569]">All Rounds</div>
                  <div className="text-sm font-bold font-mono-tabular text-[#174EA6] mt-0.5">
                    {cycleVolume.toLocaleString()} MAD
                  </div>
                </div>
                <div className="px-2">
                  <div className="text-xs font-semibold text-[#475569]">Total Deposit</div>
                  <div className="text-sm font-bold font-mono-tabular text-[#0F172A] mt-0.5">
                    {totalInitialCollateral.toLocaleString()} MAD
                  </div>
                </div>
              </div>

              {/* Fair Random Draw Button */}
              <button
                type="button"
                onClick={handlePrngTirage}
                disabled={isShuffling}
                className="w-full btn-ghost-pill inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold cursor-pointer disabled:opacity-60"
              >
                <Dices className={`h-4 w-4 text-[#174EA6] ${isShuffling ? 'animate-spin' : ''}`} />
                <span>
                  {isShuffling
                    ? 'Drawing Random Seats…'
                    : 'Fair Random Draw (Shuffle Seats)'}
                </span>
              </button>
            </div>

            {/* Selected Seat Inspector */}
            {selectedMember && (
              <div className="pt-5 border-t border-slate-900/8 space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display text-base font-extrabold text-[#0F172A]">
                      Seat #{selectedMember.position} · {selectedMember.name}
                    </div>
                    <div className="text-xs text-[#475569]">
                      {selectedMember.position === memberCount
                        ? 'Last Seat = 0 MAD Deposit (Best for new students saving up)'
                        : `Receives ${potTotal.toLocaleString()} MAD in Round ${selectedMember.position}`}
                    </div>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                      REPUTATION_TIERS[selectedMember.tier].pillBg
                    }`}
                  >
                    {REPUTATION_TIERS[selectedMember.tier].label}
                  </span>
                </div>

                <div className="text-xs text-[#334155] flex items-center justify-between pt-2 border-t border-slate-900/6">
                  <span>Security Deposit Needed</span>
                  <strong className="font-mono-tabular text-sm text-[#0F172A]">
                    {selectedMember.collateralRequired.toLocaleString()} MAD
                  </strong>
                </div>

                {/* Trust Badge Selector (Clean Dropdown to stay <=4 options) */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="sim-member-tier"
                    className="text-xs text-[#475569] font-semibold block"
                  >
                    Member Trust Badge (lowers deposit)
                  </label>
                  <select
                    id="sim-member-tier"
                    disabled={phase !== 'idle'}
                    value={selectedMember.tier}
                    onChange={(e) =>
                      handleMemberTierChange(
                        selectedMember.position,
                        e.target.value as ReputationTier
                      )
                    }
                    className="w-full rounded-xl bg-white border border-slate-900/12 px-3 py-2 text-xs font-semibold text-[#0F172A] disabled:opacity-50"
                  >
                    {(['Gold', 'Silver', 'Bronze', 'New', 'Defaulter'] as ReputationTier[]).map(
                      (tier) => (
                        <option key={tier} value={tier}>
                          {REPUTATION_TIERS[tier].label} (
                          {Math.round(REPUTATION_TIERS[tier].collateralMultiplier * 100)}% deposit)
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Force Missed Payment Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleSkipNext(selectedMember.position)}
                  disabled={phase === 'completed'}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-3.5 py-2.5 text-xs font-bold border transition-all cursor-pointer disabled:opacity-50 ${
                    selectedMember.skipRound
                      ? 'bg-[#FEE2E2] border-[#FCA5A5] text-[#B91C1C]'
                      : 'bg-[#FEF3C7]/75 border-[#FCD34D] text-[#B45309] hover:bg-[#FEF3C7]'
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>
                    {selectedMember.skipRound
                      ? `Will Miss Round ${selectedMember.skipRound} (Click to Cancel)`
                      : `Make ${selectedMember.shortName} Miss a Payment`}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* CENTER STAGE: Transport + Orbital Circle + Receipts */}
          <div className="xl:col-span-8 min-w-0 space-y-5 xl:pl-6 xl:border-l xl:border-slate-900/8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-900/8">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${phaseMeta.badgeClass}`}
                  >
                    {phase === 'idle'
                      ? 'Ready'
                      : phase === 'completed'
                        ? 'Finished'
                        : `Round ${currentRound} of ${memberCount}`}
                  </span>
                  <span className="text-xs font-mono-tabular text-[#475569]">
                    Pot: {potTotal.toLocaleString()} MAD
                  </span>
                </div>
                <div className="font-display text-lg font-extrabold text-[#0F172A]">
                  {phaseMeta.title}
                </div>
                <p className="text-xs text-[#475569]">{phaseMeta.subtitle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (phase === 'completed') {
                      resetSimulation(memberCount, contribution);
                      setTimeout(() => setIsPlaying(true), 80);
                    } else {
                      setIsPlaying((p) => !p);
                    }
                  }}
                  className="btn-primary-pill inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{phase === 'completed' ? 'Replay' : 'Play Circle'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    stepForward();
                  }}
                  disabled={phase === 'completed'}
                  className="btn-ghost-pill inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold cursor-pointer disabled:opacity-45"
                >
                  <StepForward className="h-3.5 w-3.5" />
                  <span>Step</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))}
                  className="btn-ghost-pill inline-flex items-center gap-1 px-3 py-2 text-xs font-mono-tabular font-bold cursor-pointer"
                  title="Toggle animation speed"
                >
                  <FastForward className="h-3.5 w-3.5 text-[#174EA6]" />
                  <span>{speed}×</span>
                </button>

                <button
                  type="button"
                  onClick={() => resetSimulation(memberCount, contribution)}
                  aria-label="Reset simulation"
                  className="btn-ghost-pill inline-flex items-center justify-center p-2 text-[#475569] hover:text-[#0F172A] cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Live Action Alert Banner */}
            {bannerAlert && (
              <motion.div
                key={bannerAlert}
                initial={{ opacity: 0.65, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16 }}
                className={`rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold border flex items-center gap-2.5 ${
                  phase === 'slashing' || bannerAlert.includes('missed')
                    ? 'bg-[#FEE2E2] border-[#FCA5A5] text-[#B91C1C]'
                    : phase === 'completed' || phase === 'paying'
                      ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]'
                      : 'bg-[#E0F2FE] border-[#7DD3FC] text-[#0369A1]'
                }`}
              >
                <Info className="h-4 w-4 shrink-0" />
                <span>{bannerAlert}</span>
              </motion.div>
            )}

            {/* PORCELAIN ORBITAL ESCROW STAGE (Hairline-separated, no nested box border) */}
            <div className="relative rounded-2xl bg-[#F8FAFC]/85 overflow-hidden">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at 50% 50%, rgba(224, 242, 254, 0.72) 0%, rgba(236, 253, 245, 0.32) 48%, transparent 75%)',
                }}
              />

              {/* Desktop / Tablet Orbital Stage */}
              <div className="hidden sm:block relative w-full aspect-[700/520] max-h-[520px] mx-auto">
                <svg
                  viewBox="0 0 700 520"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                >
                  <ellipse
                    cx="350"
                    cy="260"
                    rx={memberCount >= 9 ? 255 : 238}
                    ry={memberCount >= 9 ? 196 : 184}
                    fill="none"
                    stroke="rgba(15, 23, 42, 0.14)"
                    strokeWidth="1.5"
                    strokeDasharray="6 6"
                  />

                  {members.map((m, idx) => {
                    const { x, y } = getSeatCoords(idx, memberCount);
                    const isRecipient = m.position === currentRound && phase !== 'idle';
                    const isSlashed = m.slashedThisRound && phase === 'slashing';
                    const isContributing = m.paidThisRound && phase === 'contributing';
                    const isLocking = m.collateralRequired > 0 && phase === 'locking';
                    const isPaying = isRecipient && phase === 'paying';
                    const isRefunding = phase === 'refunding' && m.collateralRemaining > 0;

                    const midX = (x + 350) / 2 + (260 - y) * 0.14;
                    const midY = (y + 260) / 2 + (x - 350) * 0.14;

                    return (
                      <g key={m.id}>
                        <path
                          d={`M ${x} ${y} Q ${midX} ${midY} 350 260`}
                          fill="none"
                          stroke={
                            isSlashed
                              ? '#EF4444'
                              : isPaying
                                ? '#10B981'
                                : isRecipient
                                  ? '#1A73E8'
                                  : 'rgba(15, 23, 42, 0.11)'
                          }
                          strokeWidth={isPaying || isSlashed ? 2.5 : 1.25}
                        />

                        {isLocking && (
                          <motion.circle
                            key={`lock-${m.id}-${currentRound}`}
                            r={5}
                            fill="#1A73E8"
                            initial={{ cx: x, cy: y, opacity: 0 }}
                            animate={{
                              cx: [x, midX, 350],
                              cy: [y, midY, 260],
                              opacity: [0, 1, 1, 0],
                            }}
                            transition={{
                              duration: 0.9 / speed,
                              repeat: Infinity,
                              delay: idx * 0.06,
                              ease: 'easeInOut',
                            }}
                          />
                        )}

                        {isContributing && (
                          <motion.circle
                            key={`contrib-${m.id}-${currentRound}`}
                            r={5.5}
                            fill="#1A73E8"
                            initial={{ cx: x, cy: y, opacity: 0 }}
                            animate={{
                              cx: [x, midX, 350],
                              cy: [y, midY, 260],
                              opacity: [0, 1, 1, 0],
                            }}
                            transition={{
                              duration: 0.85 / speed,
                              repeat: Infinity,
                              delay: idx * 0.05,
                              ease: 'easeInOut',
                            }}
                          />
                        )}

                        {isSlashed && (
                          <motion.circle
                            key={`slash-${m.id}-${currentRound}`}
                            r={6.5}
                            fill="#EF4444"
                            initial={{ cx: x, cy: y, opacity: 0 }}
                            animate={{
                              cx: [x, midX, 350],
                              cy: [y, midY, 260],
                              opacity: [0, 1, 1, 0],
                            }}
                            transition={{
                              duration: 0.7 / speed,
                              repeat: Infinity,
                              ease: 'easeOut',
                            }}
                          />
                        )}

                        {isPaying && (
                          <motion.circle
                            key={`pay1-${m.id}-${currentRound}`}
                            r={8}
                            fill="#10B981"
                            initial={{ cx: 350, cy: 260, opacity: 0 }}
                            animate={{
                              cx: [350, midX, x],
                              cy: [260, midY, y],
                              opacity: [0, 1, 1, 0],
                            }}
                            transition={{
                              duration: 0.95 / speed,
                              repeat: Infinity,
                              ease: 'easeOut',
                            }}
                          />
                        )}

                        {isRefunding && (
                          <motion.circle
                            key={`refund-${m.id}`}
                            r={5}
                            fill="#10B981"
                            initial={{ cx: 350, cy: 260, opacity: 0 }}
                            animate={{
                              cx: [350, midX, x],
                              cy: [260, midY, y],
                              opacity: [0, 1, 1, 0],
                            }}
                            transition={{
                              duration: 0.9 / speed,
                              repeat: Infinity,
                              delay: idx * 0.05,
                            }}
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Central Automatic Escrow Core */}
                <div
                  style={{ left: '50%', top: '50%' }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-[184px] h-[184px] rounded-full bg-white/95 shadow-md flex flex-col items-center justify-center text-center p-3"
                >
                  <div className="text-xs font-bold text-[#0369A1]">
                    Automatic Escrow
                  </div>
                  <div className="font-display text-2xl font-extrabold font-mono-tabular text-[#0F172A] leading-tight mt-0.5">
                    {escrowPot.toLocaleString()}
                    <span className="text-xs font-bold text-[#174EA6] ml-1">MAD</span>
                  </div>
                  <div className="text-xs font-medium text-[#475569]">Current Pot</div>
                  <div className="mt-2 w-full border-t border-slate-900/8 pt-1.5 flex items-center justify-around text-xs font-mono-tabular">
                    <div>
                      <div className="text-[#475569]">Deposits</div>
                      <div className="font-bold text-[#0F172A]">
                        {vaultCollateral.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#475569]">Reserve</div>
                      <div className="font-bold text-[#047857]">
                        {roundMad(insurancePool + protocolTreasury).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Member Seat Nodes Around the Orbit */}
                {members.map((m, idx) => {
                  const { x, y } = getSeatCoords(idx, memberCount);
                  const leftPct = (x / 700) * 100;
                  const topPct = (y / 520) * 100;
                  const isRecipient =
                    m.position === currentRound && phase !== 'idle' && phase !== 'completed';
                  const isSelected = m.position === selectedSeat;
                  const isSlashedNow = m.slashedThisRound && phase === 'slashing';
                  const isMissedWait =
                    !m.paidThisRound && phase === 'contributing' && m.skipRound === currentRound;

                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedSeat(m.position)}
                      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-[124px] rounded-2xl p-2.5 text-left transition-all cursor-pointer border ${
                        isSlashedNow || isMissedWait
                          ? 'bg-[#FEE2E2] border-[#EF4444] scale-105 z-20'
                          : isRecipient && phase === 'paying'
                            ? 'bg-[#DCFCE7] border-[#10B981] scale-105 z-20'
                            : isSelected
                              ? 'bg-white border-[#1A73E8] shadow-md scale-105 z-20'
                              : 'bg-white/95 border-slate-900/10 hover:border-[#1A73E8]/50 z-10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono-tabular text-xs font-bold text-[#174EA6]">
                          #{m.position}
                        </span>
                        <span
                          className={`rounded-full border px-1.5 py-0.2 text-xs font-semibold ${
                            REPUTATION_TIERS[m.tier].pillBg
                          }`}
                        >
                          {m.tier === 'Defaulter' ? 'Missed' : m.tier}
                        </span>
                      </div>

                      <div className="mt-0.5 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0F172A] truncate">
                          {m.shortName}
                        </span>
                        {m.hasReceivedPot && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#15803D] shrink-0" />
                        )}
                      </div>

                      <div className="mt-1 flex items-center justify-between text-xs font-mono-tabular text-[#475569]">
                        <span className="inline-flex items-center gap-0.5">
                          <Lock className="h-3 w-3 text-[#174EA6]" />
                          {m.collateralRemaining}
                        </span>
                        {m.skipRound && (
                          <span className="text-[#B45309] font-bold">Miss R{m.skipRound}</span>
                        )}
                      </div>

                      {isRecipient && (
                        <div className="mt-1 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-xs font-bold text-[#15803D] text-center">
                          {phase === 'paying' ? `+${potTotal} MAD!` : 'Winner'}
                        </div>
                      )}
                      {isSlashedNow && (
                        <div className="mt-1 rounded-full bg-[#FEE2E2] px-2 py-0.5 text-xs font-bold text-[#B91C1C] text-center">
                          Deposit Used
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Compact View (<640px) */}
              <div className="sm:hidden p-4 space-y-4">
                <div className="text-center space-y-1 pb-3 border-b border-slate-900/8">
                  <div className="text-xs font-bold text-[#0369A1]">
                    Automatic Escrow
                  </div>
                  <div className="font-display text-2xl font-extrabold font-mono-tabular text-[#0F172A]">
                    {escrowPot.toLocaleString()} MAD Pot
                  </div>
                  <div className="text-xs text-[#475569] font-mono-tabular">
                    Deposits Locked: {vaultCollateral.toLocaleString()} MAD · Round {currentRound}/
                    {memberCount}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {members.map((m) => {
                    const isRecipient = m.position === currentRound && phase !== 'idle';
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedSeat(m.position)}
                        className={`rounded-xl p-2.5 text-left border ${
                          m.slashedThisRound
                            ? 'bg-[#FEE2E2] border-[#EF4444]'
                            : isRecipient
                              ? 'bg-[#DCFCE7] border-[#10B981]'
                              : m.position === selectedSeat
                                ? 'bg-white border-[#1A73E8]'
                                : 'bg-white/90 border-slate-900/10'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono-tabular">
                          <span className="text-[#174EA6] font-bold">Seat #{m.position}</span>
                          <span className="text-[#475569] font-semibold">
                            {REPUTATION_TIERS[m.tier].label}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-[#0F172A] mt-0.5">
                          {m.shortName}
                        </div>
                        <div className="text-xs text-[#475569] font-mono-tabular">
                          Deposit: {m.collateralRemaining} MAD
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Round Progress Strip */}
              <div className="border-t border-slate-900/8 px-4 py-3 flex items-center gap-2 overflow-x-auto bg-white/60">
                <span className="text-xs font-mono-tabular font-semibold text-[#475569] shrink-0">
                  Rounds:
                </span>
                {Array.from({ length: memberCount }, (_, i) => i + 1).map((r) => {
                  const done =
                    phase === 'completed' ||
                    phase === 'refunding' ||
                    (phase !== 'idle' && r < currentRound) ||
                    (r === currentRound && (phase === 'paying' || phase === 'round_settled'));
                  const active = phase !== 'idle' && phase !== 'completed' && r === currentRound;
                  return (
                    <div
                      key={r}
                      className={`h-7 min-w-[36px] px-2.5 rounded-full flex items-center justify-center text-xs font-mono-tabular font-bold border transition-all ${
                        done
                          ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]'
                          : active
                            ? 'bg-[#1A73E8] border-[#1A73E8] text-white'
                            : 'bg-white border-slate-900/10 text-[#475569]'
                      }`}
                    >
                      R{r}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Receipts & Deposit Table */}
            <div className="pt-2 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/8 pb-3">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('hcs')}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'hcs'
                        ? 'bg-[#1A73E8] text-white'
                        : 'bg-slate-900/5 text-[#334155] hover:bg-slate-900/10'
                    }`}
                  >
                    Verified Payment Receipts ({logs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('math')}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'math'
                        ? 'bg-[#1A73E8] text-white'
                        : 'bg-slate-900/5 text-[#334155] hover:bg-slate-900/10'
                    }`}
                  >
                    Security Deposit Breakdown
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fees')}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'fees'
                        ? 'bg-[#1A73E8] text-white'
                        : 'bg-slate-900/5 text-[#334155] hover:bg-slate-900/10'
                    }`}
                  >
                    Low Fee Comparison
                  </button>
                </div>

                <div className="text-xs font-semibold text-[#047857] flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Every Receipt Publicly Verifiable</span>
                </div>
              </div>

              {activeTab === 'hcs' && (
                <div className="divide-y divide-slate-900/6 max-h-56 overflow-y-auto pr-1">
                  {logs.map((entry) => (
                    <div
                      key={entry.seq}
                      className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-start sm:items-center gap-2.5">
                        <span className="font-mono-tabular text-xs rounded-md bg-slate-900/6 px-2 py-0.5 font-semibold text-[#334155] shrink-0">
                          Receipt #{entry.seq}
                        </span>
                        <span className="text-[#0F172A] font-medium">{entry.summary}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono-tabular text-[#475569] shrink-0">
                        <span>{entry.actor}</span>
                        <span className="text-[#047857] font-semibold">{entry.feeUsd}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'math' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono-tabular">
                    <thead>
                      <tr className="border-b border-slate-900/10 text-[#475569]">
                        <th className="py-2 pr-3">Seat</th>
                        <th className="py-2 pr-3">Member</th>
                        <th className="py-2 pr-3">Badge</th>
                        <th className="py-2 pr-3">Security Deposit Needed</th>
                        <th className="py-2">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/6">
                      {members.map((m) => (
                        <tr key={m.id} className="text-[#0F172A]">
                          <td className="py-2 pr-3 font-bold text-[#174EA6]">#{m.position}</td>
                          <td className="py-2 pr-3 font-sans font-semibold">{m.shortName}</td>
                          <td className="py-2 pr-3">{REPUTATION_TIERS[m.tier].label}</td>
                          <td className="py-2 pr-3 font-bold">
                            {m.collateralRequired.toLocaleString()} MAD
                          </td>
                          <td className="py-2 text-[#15803D] font-sans font-semibold">
                            {m.position === memberCount
                              ? 'Last Seat = 0 MAD Deposit (Best for new students saving up)'
                              : 'Covers remaining payments if missed'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'fees' && (
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-900/8 text-xs">
                  <div className="py-3 md:pr-5 space-y-1">
                    <div className="text-[#475569] font-semibold">Total Circle Payments</div>
                    <div className="font-display text-xl font-extrabold text-[#0F172A] font-mono-tabular">
                      {totalTxCount} receipts
                    </div>
                    <div className="text-xs text-[#475569]">
                      Covers all rounds, payouts, and deposit refunds.
                    </div>
                  </div>
                  <div className="py-3 md:px-5 space-y-1">
                    <div className="text-[#0369A1] font-semibold">Total Hedera Fee</div>
                    <div className="font-display text-xl font-extrabold text-[#0F172A] font-mono-tabular">
                      ~${hederaTotalUsd.toFixed(4)}{' '}
                      <span className="text-xs font-semibold text-[#047857]">
                        (~{hederaTotalMad.toFixed(2)} MAD)
                      </span>
                    </div>
                    <div className="text-xs text-[#334155]">
                      Over 99.9% of every contribution stays in the circle.
                    </div>
                  </div>
                  <div className="py-3 md:pl-5 space-y-1">
                    <div className="text-[#475569] font-semibold">High-Fee Blockchains</div>
                    <div className="font-display text-xl font-extrabold text-[#B45309] font-mono-tabular">
                      $40 – $250+
                    </div>
                    <div className="text-xs text-[#475569]">
                      High fees make 20 MAD student circles impossible elsewhere.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
