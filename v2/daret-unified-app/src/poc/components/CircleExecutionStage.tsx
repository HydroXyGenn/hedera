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
      {/* Escrow Round Controller */}
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="font-display text-[17px] font-semibold text-[#0F172A]">
              {circle.status === 'completed'
                ? 'Cycle Complete — Unused Collateral Returned'
                : `Recipient This Round: Seat #${circle.currentRound} (${recipientUser?.name ?? 'Member'})`}
            </h2>
            <p className="text-[14px] text-[#475569] leading-[1.55]">
              {circle.status === 'completed'
                ? `Total ${(circle.memberCount * potTarget).toLocaleString()} MAD circulated securely with full HCS audit proof.`
                : 'Pay individual contributions in the seat ledger below or trigger Skip / Miss to test automatic collateral slashing on closeRound().'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-[12px] font-mono-tabular shrink-0">
            <span
              className={`rounded-full px-3 py-1 font-semibold ${
                circle.status === 'completed'
                  ? 'bg-[#DCFCE7] text-[#15803D]'
                  : 'bg-[#E0F2FE] text-[#0369A1]'
              }`}
            >
              {circle.status === 'completed'
                ? `All ${circle.memberCount} Rounds Done`
                : `Round ${circle.currentRound} / ${circle.memberCount}`}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F5F9] px-3 py-1 font-semibold text-[#0F172A]">
              <Clock className="h-3.5 w-3.5 text-[#475569]" />
              {circle.countdownSec === 0 ? 'Grace Expired' : `Deadline ${formattedClock}`}
            </span>

            {circle.status === 'active' && circle.countdownSec > 0 && (
              <button
                type="button"
                onClick={onFastForwardTimer}
                className="rounded-full glass-pill px-3 py-1 text-[12px] font-semibold text-[#0F172A] cursor-pointer"
              >
                Expire Timer
              </button>
            )}
          </div>
        </div>

        {circle.status === 'active' && (
          <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-[#0F172A]/[0.06]">
            <button
              type="button"
              disabled={pendingCount === 0}
              onClick={onPayAllRemaining}
              className={`rounded-full px-5 py-2 text-[13px] font-semibold transition-colors disabled:opacity-45 cursor-pointer ${
                pendingCount > 0 ? 'btn-primary' : 'glass-pill text-[#475569]'
              }`}
            >
              Pay All Compliant ({pendingCount})
            </button>

            <button
              type="button"
              onClick={onCloseRound}
              className={`rounded-full px-5 py-2 text-[13px] font-semibold transition-colors cursor-pointer ${
                pendingCount === 0
                  ? 'btn-primary'
                  : missedCount > 0
                    ? 'bg-[#FEF3C7] text-[#B45309] border border-[#F59E0B]/30 hover:bg-[#FDE68A]/80'
                    : 'glass-pill text-[#0F172A]'
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
              className="inline-flex items-center gap-1.5 rounded-full glass-pill px-4 py-2 text-[13px] font-semibold text-[#0F172A] cursor-pointer ml-auto"
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

        {/* Escrow Progress & Vault Totals */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-4 border-t border-[#0F172A]/[0.06]">
          <div className="md:col-span-6 space-y-2">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#475569] font-medium">Round Escrow Pot Progress</span>
              <span className="font-mono-tabular font-semibold text-[#0F172A]">
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
            <div className="flex items-center justify-between text-[12px] font-mono-tabular text-[#475569]">
              <span>Paid: {paidCount}/{circle.memberCount}</span>
              <span className={missedCount > 0 ? 'text-[#B45309] font-semibold' : ''}>
                Missed (Slash Queued): {missedCount}
              </span>
            </div>
          </div>

          <div className="md:col-span-6 grid grid-cols-3 gap-4 md:pl-6 md:border-l border-[#0F172A]/[0.06]">
            <motion.div
              animate={lastPulseType === 'slash' ? { scale: [1, 1.03, 1] } : {}}
              className="space-y-0.5"
            >
              <div className="text-[11px] font-semibold text-[#475569]">Collateral Vault</div>
              <div className="font-mono-tabular text-[17px] font-semibold text-[#0F172A]">
                {circle.collateralVaultMad.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#475569]">MAD locked</div>
            </motion.div>

            <div className="space-y-0.5">
              <div className="text-[11px] font-semibold text-[#475569]">Insurance Pool</div>
              <div className="font-mono-tabular text-[17px] font-semibold text-[#0F172A]">
                {roundMad(circle.insurancePoolMad).toLocaleString()}
              </div>
              <div className="text-[11px] text-[#475569]">{circle.insurancePct}% reserve</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[11px] font-semibold text-[#475569]">Protocol Fees</div>
              <div className="font-mono-tabular text-[17px] font-semibold text-[#0F172A]">
                {roundMad(circle.protocolTreasuryMad).toLocaleString()}
              </div>
              <div className="text-[11px] text-[#475569]">{circle.protocolFeePct}% collected</div>
            </div>
          </div>
        </div>

        {/* Round Stepper */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 border-t border-[#0F172A]/[0.06]">
          <span className="text-[12px] font-semibold text-[#475569] shrink-0 mr-1">Rounds:</span>
          {circle.seats.map((s) => {
            const isDone = s.hasReceivedPot || circle.status === 'completed';
            const isNow = circle.status === 'active' && s.position === circle.currentRound;
            const u = s.userId ? users.find((x) => x.id === s.userId) : null;
            return (
              <div
                key={s.position}
                className={`rounded-full px-3 py-1 text-[12px] font-semibold font-mono-tabular shrink-0 flex items-center gap-1.5 ${
                  isDone
                    ? 'bg-[#DCFCE7] text-[#15803D]'
                    : isNow
                      ? 'pill-active'
                      : 'bg-[#F1F5F9] text-[#475569]'
                }`}
              >
                <span>R{s.position}</span>
                <span className="truncate max-w-[76px] font-sans">
                  {u?.name.split(' ')[0] ?? ''}
                </span>
                {isDone && <CheckCircle2 className="h-3 w-3" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Porcelain Glass Seat Ledger (Member Contributions & Collateral Actions) */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#0F172A]/[0.06] flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-[16px] font-semibold text-[#0F172A]">
            Seat Contribution &amp; Collateral Ledger
          </h3>
          <span className="text-[12px] text-[#475569]">
            Click Pay per seat or Skip / Miss to test automated collateral protection
          </span>
        </div>

        <div className="hidden md:grid md:grid-cols-[44px_minmax(0,1.5fr)_94px_96px_196px] gap-3 px-5 py-2.5 bg-[#F1F5F9]/75 border-b border-[#0F172A]/[0.06] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569]">
          <div>Seat</div>
          <div>Participant</div>
          <div className="text-right">Wallet</div>
          <div className="text-right">Vault / Slash</div>
          <div className="text-right">Round Action</div>
        </div>

        <div className="divide-y divide-[#0F172A]/[0.06]">
          {circle.seats.map((seat) => {
            const member = seat.userId ? users.find((u) => u.id === seat.userId) : null;
            if (!member) return null;
            const isRecipientNow =
              circle.status === 'active' && seat.position === circle.currentRound;
            const isActivelySelected = member.id === activeUserId;
            const hasFaultAlert = seat.slashedCurrentRound || seat.totalSlashed > 0;

            return (
              <div
                key={seat.position}
                className={`px-5 py-3.5 grid grid-cols-1 md:grid-cols-[44px_minmax(0,1.5fr)_94px_96px_196px] gap-3 items-center transition-colors ${
                  seat.markedMissed && !seat.paidCurrentRound
                    ? 'bg-[#FEF3C7]/45'
                    : hasFaultAlert
                      ? 'bg-[#FEE2E2]/35'
                      : isRecipientNow
                        ? 'bg-[#E0F2FE]/35'
                        : 'hover:bg-white/60'
                }`}
              >
                {/* Seat # */}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full font-mono-tabular text-[12px] font-semibold shrink-0 ${
                      isRecipientNow
                        ? 'bg-[#1A73E8] text-white'
                        : isActivelySelected
                          ? 'bg-[#0F172A] text-white'
                          : 'bg-[#F1F5F9] text-[#0F172A]'
                    }`}
                  >
                    #{seat.position}
                  </span>
                </div>

                {/* Participant */}
                <div className="min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSelectActiveWallet(member.id)}
                      className="text-[13px] font-semibold text-[#0F172A] hover:text-[#1A73E8] cursor-pointer truncate"
                    >
                      {member.name}
                    </button>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${
                        TIER_META[member.tier].badgeColor
                      }`}
                    >
                      {member.tier}
                    </span>
                    {isRecipientNow && (
                      <span className="rounded-full bg-[#E0F2FE] text-[#0369A1] px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">
                        R{circle.currentRound} Recipient
                      </span>
                    )}
                    {seat.hasReceivedPot && !isRecipientNow && (
                      <span className="rounded-full bg-[#DCFCE7] text-[#15803D] px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">
                        Pot Paid
                      </span>
                    )}
                  </div>
                  <div className="font-mono-tabular text-[11px] text-[#475569]">
                    {member.accountId} · Score {member.reputationScore}
                  </div>
                </div>

                {/* Wallet */}
                <div className="md:text-right font-mono-tabular text-[12px] font-semibold text-[#0F172A] whitespace-nowrap">
                  {member.walletBalanceMad.toLocaleString()} MAD
                </div>

                {/* Vault / Slashed */}
                <div className="md:text-right font-mono-tabular text-[12px] space-y-0.5 whitespace-nowrap">
                  <div className="font-semibold text-[#0F172A]">
                    {seat.collateralLocked.toLocaleString()} MAD
                  </div>
                  {seat.totalSlashed > 0 && (
                    <div className="text-[11px] font-semibold text-[#B91C1C]">
                      Slashed: {seat.totalSlashed} MAD
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center md:justify-end gap-1.5 whitespace-nowrap">
                  {circle.status === 'active' ? (
                    seat.paidCurrentRound ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] text-[#15803D] px-3 py-1 text-[12px] font-semibold font-mono-tabular">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Paid {circle.contributionMad} MAD
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onPaySeat(seat.position)}
                          className="rounded-full btn-primary px-3.5 py-1.5 text-[12px] font-semibold font-mono-tabular cursor-pointer"
                        >
                          Pay {circle.contributionMad} MAD
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleMissedSeat(seat.position)}
                          className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors cursor-pointer ${
                            seat.markedMissed
                              ? 'bg-[#FEF3C7] text-[#B45309] border border-[#F59E0B]/30'
                              : 'glass-pill text-[#475569] hover:text-[#0F172A]'
                          }`}
                        >
                          {seat.markedMissed ? 'Marked Missed' : 'Skip / Miss'}
                        </button>
                      </>
                    )
                  ) : (
                    <span className="text-[12px] font-semibold text-[#15803D] font-mono-tabular">
                      Contributed {seat.totalContributed} MAD
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive "I Paid!" HCS Dispute Verifier */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-display text-[16px] font-semibold text-[#0F172A]">
              Dispute Verifier (&ldquo;I Paid!&rdquo; Check on HCS)
            </h3>
            <p className="text-[13px] text-[#475569] leading-[1.55]">
              Query Hedera Consensus Service topic{' '}
              <span className="font-mono-tabular font-semibold text-[#0F172A]">
                {circle.hcsTopicId}
              </span>{' '}
              for immutable proof of any round.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <select
              value={disputeSeat}
              onChange={(e) => setDisputeSeat(Number(e.target.value))}
              aria-label="Dispute member seat"
              className="rounded-xl input-surface px-3 py-2 text-[13px] text-[#0F172A]"
            >
              {circle.seats.map((s) => {
                const u = s.userId ? users.find((x) => x.id === s.userId) : null;
                return (
                  <option key={s.position} value={s.position} className="bg-white text-[#0F172A]">
                    Seat #{s.position} ({u?.name.split(' ')[0] ?? 'Empty'})
                  </option>
                );
              })}
            </select>

            <select
              value={disputeRound}
              onChange={(e) => setDisputeRound(Number(e.target.value))}
              aria-label="Dispute round number"
              className="rounded-xl input-surface px-3 py-2 text-[13px] text-[#0F172A]"
            >
              {Array.from({ length: circle.memberCount }, (_, i) => i + 1).map((r) => (
                <option key={r} value={r} className="bg-white text-[#0F172A]">
                  Round {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {disputeResult && (
          <div className="pt-4 border-t border-[#0F172A]/[0.06] text-[13px]">
            {disputeResult.matchingEvents.length > 0 ? (
              <div className="divide-y divide-[#0F172A]/[0.06]">
                {disputeResult.matchingEvents.map((ev) => {
                  const isFaultEv =
                    ev.type === 'COLLATERAL_SLASHED' || ev.type === 'GRACE_MISSED';
                  return (
                    <div
                      key={ev.id}
                      className="py-2.5 first:pt-0 last:pb-0 flex flex-wrap items-center justify-between gap-3"
                    >
                      <span
                        className={`inline-flex items-center gap-2 font-semibold ${
                          isFaultEv ? 'text-[#B91C1C]' : 'text-[#15803D]'
                        }`}
                      >
                        <ShieldCheck className="h-4 w-4 shrink-0" />
                        [{ev.type}] {ev.detail}
                      </span>
                      <span className="font-mono-tabular text-[12px] text-[#475569]">
                        Seq #{ev.sequenceNumber} · {ev.consensusTimestamp} · {ev.txHash}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-[#475569]">
                No HCS contribution or slash recorded yet for{' '}
                <strong className="font-semibold text-[#0F172A]">
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
