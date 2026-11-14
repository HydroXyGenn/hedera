import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Pause, Play, ShieldCheck } from 'lucide-react';
import { DaretCircle, UserProfile } from '../types/daret';
import { TIER_META, roundMad } from '../data/presets';

interface CircleExecutionStageProps {
  circle: DaretCircle;
  users: UserProfile[];
  activeUserId: string;
  isAutoRunning: boolean;
  onToggleAutoRun: () => void;
  onPaySeat: (seatNumber: number) => void;
  onPayAllRemaining: () => void;
  onToggleMissedSeat: (seatNumber: number) => void;
  onFastForwardTimer: () => void;
  onCloseRound: () => void;
  onSelectActiveWallet: (userId: string) => void;
  lastPulseType: 'contribute' | 'slash' | 'payout' | null;
}

export const CircleExecutionStage: React.FC<CircleExecutionStageProps> = ({
  circle,
  users,
  activeUserId,
  isAutoRunning,
  onToggleAutoRun,
  onPaySeat,
  onPayAllRemaining,
  onToggleMissedSeat,
  onFastForwardTimer,
  onCloseRound,
  onSelectActiveWallet,
  lastPulseType,
}) => {
  const [disputeSeat, setDisputeSeat] = useState<number>(1);
  const [disputeRound, setDisputeRound] = useState<number>(1);

  const potTarget = circle.memberCount * circle.contributionMad;
  const potProgressPct = Math.min(100, (circle.escrowPotMad / Math.max(1, potTarget)) * 100);
  const paidCount = circle.seats.filter((s) => s.paidCurrentRound).length;
  const missedCount = circle.seats.filter((s) => s.markedMissed && !s.paidCurrentRound).length;
  const pendingCount = circle.memberCount - paidCount - missedCount;

  const recipientSeat = circle.seats.find((s) => s.position === circle.currentRound);
  const recipientUser = recipientSeat?.userId
    ? users.find((u) => u.id === recipientSeat.userId)
    : null;

  // Query HCS topic log for the selected dispute member & round
  const disputeResult = useMemo(() => {
    const seat = circle.seats.find((s) => s.position === disputeSeat);
    const member = seat?.userId ? users.find((u) => u.id === seat.userId) : null;
    if (!member) return null;

    const matchingEvents = circle.events.filter(
      (ev) =>
        ev.round === disputeRound &&
        (ev.actorAccountId === member.accountId || ev.actorName.includes(member.name))
    );
    return { member, matchingEvents };
  }, [circle.events, circle.seats, disputeRound, disputeSeat, users]);

  const mins = Math.floor(circle.countdownSec / 60);
  const secs = circle.countdownSec % 60;
  const formattedClock = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {/* Top Escrow Cockpit Card */}
      <div className="glass-panel rounded-[22px] p-6 sm:p-7 space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#6B7280] tabular-nums">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#111827]">
              <span
                className={`h-2 w-2 rounded-full ${
                  circle.status === 'completed' ? 'bg-[#10B981]' : 'bg-[#1A73E8]'
                }`}
              />
              {circle.status === 'completed'
                ? `All ${circle.memberCount} Rounds Completed`
                : `Round ${circle.currentRound} of ${circle.memberCount}`}
            </span>

            <span className="text-black/15">·</span>

            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#6B7280]" />
              {circle.countdownSec === 0 ? 'Grace Expired' : `Deadline ${formattedClock}`}
            </span>

            {circle.status === 'active' && circle.countdownSec > 0 && (
              <button
                type="button"
                onClick={onFastForwardTimer}
                className="rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] px-3 py-0.5 text-[12px] font-medium text-[#111827] cursor-pointer transition-colors"
              >
                Expire Timer
              </button>
            )}
          </div>

          <h2 className="font-display text-[18px] font-semibold tracking-[-0.02em] text-[#111827]">
            {circle.status === 'completed'
              ? 'Cycle Complete — Unused Collateral Returned'
              : `Recipient This Round: Seat #${circle.currentRound} (${recipientUser?.name ?? 'Member'})`}
          </h2>
          <p className="text-[14px] text-[#6B7280] leading-[1.6]">
            {circle.status === 'completed'
              ? `Total ${(circle.memberCount * potTarget).toLocaleString()} MAD circulated securely with full HCS audit proof.`
              : `Pay individual contributions below or mark a missed payment to test automatic collateral slashing on closeRound().`}
          </p>
        </div>

        {circle.status === 'active' && (
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-black/[0.06]">
            <button
              type="button"
              disabled={pendingCount === 0}
              onClick={onPayAllRemaining}
              className={`rounded-full px-5 py-2 text-[14px] font-medium transition-colors disabled:opacity-45 cursor-pointer ${
                pendingCount > 0 ? 'btn-primary' : 'glass-pill text-[#6B7280]'
              }`}
            >
              Pay All Compliant ({pendingCount})
            </button>

            <button
              type="button"
              onClick={onCloseRound}
              className={`rounded-full px-5 py-2 text-[14px] font-medium transition-colors cursor-pointer ${
                pendingCount === 0
                  ? 'btn-primary'
                  : missedCount > 0
                    ? 'bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30 hover:bg-[#FDE68A]'
                    : 'glass-pill text-[#111827]'
              }`}
            >
              {missedCount > 0
                ? 'Slash & Close Round (closeRound())'
                : pendingCount > 0
                  ? `Force Close & Slash (${pendingCount} unpaid)`
                  : `Close Round & Pay ${potTarget} MAD`}
            </button>

            <button
              type="button"
              onClick={onToggleAutoRun}
              className="inline-flex items-center gap-1.5 rounded-full glass-pill px-4 py-2 text-[14px] font-medium text-[#111827] cursor-pointer ml-auto"
            >
              {isAutoRunning ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause Auto</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>Auto-Run Cycle</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Open Progress & Tabular Vault Figures */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-4 border-t border-black/[0.06]">
          <div className="md:col-span-6 space-y-2.5">
            <div className="flex items-center justify-between text-[14px]">
              <span className="text-[#6B7280]">Round Escrow Pot Progress</span>
              <span className="font-semibold text-[#111827] tabular-nums">
                {circle.escrowPotMad.toLocaleString()} / {potTarget.toLocaleString()} MAD
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
              <motion.div
                initial={false}
                animate={{ width: `${potProgressPct}%` }}
                transition={{ duration: 0.35 }}
                className="h-full rounded-full bg-[#1A73E8]"
              />
            </div>
            <div className="flex items-center justify-between text-[12px] tabular-nums text-[#6B7280]">
              <span>Paid: {paidCount}/{circle.memberCount}</span>
              <span className={missedCount > 0 ? 'text-[#B45309] font-semibold' : ''}>
                Missed (Slash Queued): {missedCount}
              </span>
            </div>
          </div>

          <div className="md:col-span-6 grid grid-cols-3 gap-4 md:pl-6 md:border-l border-black/[0.06]">
            <motion.div
              animate={
                lastPulseType === 'slash'
                  ? { scale: [1, 1.03, 1] }
                  : {}
              }
              className="space-y-0.5"
            >
              <div className="text-[12px] text-[#6B7280]">Collateral Vault</div>
              <div className="font-display text-[18px] font-semibold tabular-nums text-[#111827]">
                {circle.collateralVaultMad.toLocaleString()}
              </div>
              <div className="text-[12px] text-[#6B7280]">MAD locked</div>
            </motion.div>

            <div className="space-y-0.5">
              <div className="text-[12px] text-[#6B7280]">Insurance Pool</div>
              <div className="font-display text-[18px] font-semibold tabular-nums text-[#111827]">
                {roundMad(circle.insurancePoolMad).toLocaleString()}
              </div>
              <div className="text-[12px] text-[#6B7280]">{circle.insurancePct}% reserve</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[12px] text-[#6B7280]">Protocol Fees</div>
              <div className="font-display text-[18px] font-semibold tabular-nums text-[#111827]">
                {roundMad(circle.protocolTreasuryMad).toLocaleString()}
              </div>
              <div className="text-[12px] text-[#6B7280]">{circle.protocolFeePct}% collected</div>
            </div>
          </div>
        </div>

        {/* Round Stepper Timeline */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 border-t border-black/[0.06]">
          <span className="text-[12px] font-medium text-[#6B7280] shrink-0 mr-1">Rounds:</span>
          {circle.seats.map((s) => {
            const isDone = s.hasReceivedPot || circle.status === 'completed';
            const isNow = circle.status === 'active' && s.position === circle.currentRound;
            const u = s.userId ? users.find((x) => x.id === s.userId) : null;
            return (
              <div
                key={s.position}
                className={`rounded-full px-3.5 py-1 text-[12px] font-medium tabular-nums shrink-0 flex items-center gap-1.5 ${
                  isDone
                    ? 'bg-[#ECFDF5] text-[#15803D] border border-[#10B981]/20'
                    : isNow
                      ? 'pill-active font-semibold'
                      : 'bg-[#F1F5F9] text-[#6B7280]'
                }`}
              >
                <span>R{s.position}</span>
                <span className="truncate max-w-[80px]">{u?.name.split(' ')[0] ?? ''}</span>
                {isDone && <CheckCircle2 className="h-3 w-3" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Member Action Rows */}
      <div className="glass-panel rounded-[22px] p-6 sm:p-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-black/[0.06]">
          <h3 className="font-display text-[18px] font-semibold tracking-[-0.02em] text-[#111827]">
            Member Contributions &amp; Collateral Actions
          </h3>
          <span className="text-[12px] text-[#6B7280]">
            Click Pay per person or Skip / Miss to test collateral protection
          </span>
        </div>

        <div className="divide-y divide-black/[0.06]">
          {circle.seats.map((seat) => {
            const member = seat.userId ? users.find((u) => u.id === seat.userId) : null;
            if (!member) return null;
            const isRecipientNow =
              circle.status === 'active' && seat.position === circle.currentRound;
            const isActivelySelected = member.id === activeUserId;

            return (
              <div
                key={seat.position}
                className={`py-4 first:pt-1 last:pb-1 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  seat.markedMissed && !seat.paidCurrentRound
                    ? 'bg-[#FFFBEB]/80 -mx-4 px-4 rounded-2xl'
                    : isRecipientNow
                      ? 'bg-[#E8F0FE]/45 -mx-4 px-4 rounded-2xl'
                      : ''
                }`}
              >
                {/* Left Member Info */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-[12px] font-semibold tabular-nums shrink-0 mt-0.5 ${
                      isRecipientNow
                        ? 'bg-[#1A73E8] text-white'
                        : isActivelySelected
                          ? 'bg-[#111827] text-white'
                          : 'bg-[#F1F5F9] text-[#111827]'
                    }`}
                  >
                    #{seat.position}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectActiveWallet(member.id)}
                        className="font-display text-[14px] font-semibold text-[#111827] hover:text-[#1A73E8] cursor-pointer"
                      >
                        {member.name}
                      </button>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[12px] font-medium ${
                          TIER_META[member.tier].badgeColor
                        }`}
                      >
                        {member.tier}
                      </span>
                      {isRecipientNow && (
                        <span className="rounded-full bg-[#E8F0FE] text-[#1A73E8] px-2.5 py-0.5 text-[12px] font-medium">
                          Round {circle.currentRound} Recipient
                        </span>
                      )}
                      {seat.hasReceivedPot && !isRecipientNow && (
                        <span className="text-[12px] font-medium text-[#15803D]">
                          Pot Paid
                        </span>
                      )}
                    </div>

                    <div className="text-[12px] tabular-nums text-[#6B7280] flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <span>{member.accountId}</span>
                      <span>Wallet: {member.walletBalanceMad.toLocaleString()} MAD</span>
                      <span>Vault: {seat.collateralLocked.toLocaleString()} MAD</span>
                      {seat.totalSlashed > 0 && (
                        <span className="font-semibold text-[#B45309]">
                          Slashed: {seat.totalSlashed} MAD
                        </span>
                      )}
                      {(seat.futurePotLienMad ?? 0) > 0 && (
                        <span className="font-semibold text-[#B91C1C]">
                          Pot Lien: -{seat.futurePotLienMad} MAD
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Per-Member Action Buttons */}
                {circle.status === 'active' ? (
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {seat.paidCurrentRound ? (
                      <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#15803D] tabular-nums px-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Paid {circle.contributionMad} MAD
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onPaySeat(seat.position)}
                          className="rounded-full btn-primary px-4 py-1.5 text-[14px] font-medium tabular-nums cursor-pointer"
                        >
                          Pay {circle.contributionMad} MAD
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleMissedSeat(seat.position)}
                          className={`rounded-full px-4 py-1.5 text-[14px] font-medium transition-colors cursor-pointer ${
                            seat.markedMissed
                              ? 'bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30'
                              : 'glass-pill text-[#6B7280] hover:text-[#111827]'
                          }`}
                        >
                          {seat.markedMissed ? 'Marked Missed' : 'Skip / Miss'}
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <span className="text-[12px] font-medium text-[#15803D] tabular-nums shrink-0">
                    Contributed {seat.totalContributed} MAD · Completed
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive "I Paid!" Dispute Resolution Checker */}
      <div className="glass-panel rounded-[22px] p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display text-[18px] font-semibold tracking-[-0.02em] text-[#111827]">
              Dispute Verifier (&ldquo;I Paid!&rdquo; Check on HCS)
            </h3>
            <p className="text-[14px] text-[#6B7280] leading-[1.6]">
              Query Hedera Consensus Service topic{' '}
              <span className="font-mono text-[#111827]">{circle.hcsTopicId}</span> for cryptographic proof of any round.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <select
              value={disputeSeat}
              onChange={(e) => setDisputeSeat(Number(e.target.value))}
              aria-label="Dispute member seat"
              className="rounded-2xl input-surface px-3.5 py-2 text-[14px] text-[#111827]"
            >
              {circle.seats.map((s) => {
                const u = s.userId ? users.find((x) => x.id === s.userId) : null;
                return (
                  <option key={s.position} value={s.position} className="bg-white text-[#111827]">
                    Seat #{s.position} ({u?.name.split(' ')[0] ?? 'Empty'})
                  </option>
                );
              })}
            </select>

            <select
              value={disputeRound}
              onChange={(e) => setDisputeRound(Number(e.target.value))}
              aria-label="Dispute round number"
              className="rounded-2xl input-surface px-3.5 py-2 text-[14px] text-[#111827]"
            >
              {Array.from({ length: circle.memberCount }, (_, i) => i + 1).map((r) => (
                <option key={r} value={r} className="bg-white text-[#111827]">
                  Round {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {disputeResult && (
          <div className="pt-4 border-t border-black/[0.06] text-[14px]">
            {disputeResult.matchingEvents.length > 0 ? (
              <div className="space-y-2.5">
                {disputeResult.matchingEvents.map((ev) => (
                  <div key={ev.id} className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-[#15803D] font-medium">
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                      [{ev.type}] {ev.detail}
                    </span>
                    <span className="text-[12px] text-[#6B7280] tabular-nums">
                      Seq #{ev.sequenceNumber} · {ev.consensusTimestamp} · {ev.txHash}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[#6B7280]">
                No HCS contribution or slash recorded yet for{' '}
                <strong className="font-semibold text-[#111827]">
                  {disputeResult.member.name}
                </strong>{' '}
                in Round {disputeRound}.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
