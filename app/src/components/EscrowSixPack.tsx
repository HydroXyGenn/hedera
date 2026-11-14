import React from 'react';
import { Play, RotateCcw, ShieldAlert, StepForward } from 'lucide-react';
import { REPUTATION_TIERS } from '../data/daretData';
import { useSimulation } from '../context/SimulationContext';

export const EscrowSixPack: React.FC = () => {
  const {
    memberCount,
    contribution,
    members,
    selectedSeat,
    setSelectedSeat,
    phase,
    currentRound,
    totalSlashedInCycle,
    isSlashActive,
    potTotal,
    stepForward,
    triggerQuickSlashDemo,
    resetSimulation,
  } = useSimulation();

  const activeRecipient =
    members.find((m) => m.position === currentRound) ?? members[0];

  const statusHeading = isSlashActive
    ? 'Safe · Deposit Covered'
    : phase === 'completed'
      ? 'Paid · All Rounds Done'
      : phase === 'paying'
        ? 'Paid · Sent on Time'
        : 'Safe · Protected';

  const statusSubtext = isSlashActive
    ? totalSlashedInCycle > 0
      ? `${totalSlashedInCycle.toLocaleString()} MAD deposit covered missed payment`
      : 'Missed payment covered by security deposit'
    : phase === 'completed'
      ? 'Unused security deposits returned'
      : 'Automatic Escrow & Verified Payment Receipt';

  return (
    <div
      aria-label="Circle Summary and Member Seats"
      className="glass-bay rounded-3xl p-5 sm:p-6 space-y-5 min-w-0"
    >
      {/* Clean Human Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#475569]">
        <span className="font-bold text-[#0F172A]">
          Automatic Escrow · {memberCount} Friends × {contribution} MAD
        </span>
        <span className="font-semibold text-[#15803D]">
          Verified Payment Receipt · ~$0.0001 Fee
        </span>
      </div>

      {/* 3 Simple, Big Summary Cards (Hairline-Divided to Avoid Nested Card Clutter) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-900/10 border-y border-slate-900/10 py-4">
        <div className="py-2 sm:py-0 sm:pr-4 space-y-1">
          <div className="text-xs font-semibold text-[#475569]">
            Total Monthly Pot (MAD)
          </div>
          <div className="font-display text-2xl sm:text-3xl font-extrabold font-mono-tabular text-[#0F172A]">
            {potTotal.toLocaleString()} MAD
          </div>
          <div className="text-xs text-[#334155]">
            {memberCount} members × {contribution} MAD each
          </div>
        </div>

        <div className="py-2 sm:py-0 sm:px-4 space-y-1">
          <div className="text-xs font-semibold text-[#475569]">
            Current Round Winner
          </div>
          <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#174EA6] truncate">
            {activeRecipient?.shortName ?? 'Salma'}
          </div>
          <div className="text-xs text-[#334155] font-mono-tabular">
            Seat #{currentRound} · Round {currentRound} of {memberCount}
          </div>
        </div>

        <div className="py-2 sm:py-0 sm:pl-4 space-y-1">
          <div className="text-xs font-semibold text-[#475569]">
            Circle Status (Safe / Paid)
          </div>
          <div
            className={`font-display text-xl sm:text-2xl font-extrabold ${
              isSlashActive ? 'text-[#B91C1C]' : 'text-[#15803D]'
            }`}
          >
            {statusHeading}
          </div>
          <div className="text-xs text-[#334155]">{statusSubtext}</div>
        </div>
      </div>

      {/* Friendly Note on Last Seat */}
      <div className="rounded-2xl bg-[#DCFCE7]/80 px-4 py-2.5 text-xs font-bold text-[#15803D] flex flex-wrap items-center justify-between gap-2">
        <span>Last Seat = 0 MAD Deposit (Best for new students saving up)</span>
        <span className="font-mono-tabular">Seat #{memberCount}: 0 MAD Deposit</span>
      </div>

      {/* Seat Rotation List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-[#0F172A]">
            Payout Order &amp; Security Deposit Needed
          </span>
          <span className="text-xs text-[#475569]">
            Click any person to inspect or edit below
          </span>
        </div>

        <div className="max-h-[268px] overflow-y-auto divide-y divide-slate-900/8 pr-1">
          {members.map((m) => {
            const isSelected = m.position === selectedSeat;
            const isRecipientNow =
              m.position === currentRound && phase !== 'idle' && phase !== 'completed';
            const isSlashed = m.slashedThisRound || m.totalSlashed > 0;
            const isLastSeat = m.position === memberCount;

            let statusText = `Turn #${m.position}`;
            let statusClass = 'bg-[#F1F5F9] text-[#334155]';

            if (isSlashed) {
              statusText = `Deposit Used (−${m.totalSlashed} MAD)`;
              statusClass = 'bg-[#FEE2E2] text-[#B91C1C]';
            } else if (m.hasReceivedPot) {
              statusText = `Paid ${potTotal} MAD`;
              statusClass = 'bg-[#DCFCE7] text-[#15803D]';
            } else if (isRecipientNow) {
              statusText = `Winner Round ${currentRound}`;
              statusClass = 'bg-[#E0F2FE] text-[#0369A1]';
            } else if (m.position === 1 && phase === 'idle') {
              statusText = 'First Winner';
              statusClass = 'bg-[#E0F2FE] text-[#0369A1]';
            } else if (isLastSeat) {
              statusText = '0 MAD Deposit';
              statusClass = 'bg-[#DCFCE7] text-[#15803D]';
            }

            return (
              <button
                key={`${m.id}-${m.position}`}
                type="button"
                onClick={() => setSelectedSeat(m.position)}
                className={`w-full max-w-full min-w-0 py-2.5 px-3 rounded-xl flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                  isSelected ? 'bg-[#1A73E8]/8' : 'hover:bg-slate-900/4'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-[#0F172A] truncate">
                      Seat #{m.position} · {m.shortName}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        REPUTATION_TIERS[m.tier].pillBg
                      }`}
                    >
                      {REPUTATION_TIERS[m.tier].label}
                    </span>
                  </div>
                  <div className="font-mono-tabular text-xs text-[#475569] mt-0.5">
                    {isLastSeat
                      ? 'Last Seat = 0 MAD Deposit (Best for new students saving up)'
                      : `Security Deposit Needed: ${m.collateralRequired.toLocaleString()} MAD`}
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold font-mono-tabular ${statusClass}`}
                >
                  {statusText}
                </span>
              </button>
            );
          })}
        </div>

        {/* Simple Control Bar */}
        <div className="pt-3 border-t border-slate-900/8 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={stepForward}
              disabled={phase === 'completed'}
              className="btn-ghost-pill inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold cursor-pointer disabled:opacity-45"
            >
              {phase === 'idle' ? (
                <Play className="h-3.5 w-3.5 text-[#174EA6]" />
              ) : (
                <StepForward className="h-3.5 w-3.5 text-[#174EA6]" />
              )}
              <span>{phase === 'idle' ? 'Start Circle' : 'Next Step'}</span>
            </button>

            <button
              type="button"
              onClick={triggerQuickSlashDemo}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold border transition-colors cursor-pointer ${
                isSlashActive
                  ? 'bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]'
                  : 'bg-[#FEF3C7]/85 text-[#B45309] border-[#FCD34D] hover:bg-[#FEF3C7]'
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>{isSlashActive ? 'Missed Payment Covered' : 'Test a Missed Payment'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => resetSimulation(memberCount, contribution)}
            aria-label="Reset circle preview"
            className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-slate-900/5 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
