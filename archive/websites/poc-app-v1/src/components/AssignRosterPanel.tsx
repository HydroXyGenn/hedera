import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Lock,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import {
  DaretCircle,
  ReputationTier,
  UserProfile,
} from '../types/daret';
import {
  TIER_META,
  calcRequiredCollateral,
  doesQualifyForCircle,
} from '../data/presets';

interface AssignRosterPanelProps {
  circle: DaretCircle;
  users: UserProfile[];
  activeUserId: string;
  joinErrorBanner: string | null;
  onDismissError: () => void;
  onAssignUserToSeat: (userId: string, seatNumber: number) => void;
  onCreateAndAssignPerson: (
    payload: {
      name: string;
      campusRole: string;
      tier: ReputationTier;
      walletBalanceMad: number;
    },
    seatNumber: number
  ) => void;
  onAddRandomPerson: (seatNumber?: number, respectGate?: boolean) => void;
  onFillRemainingRandoms: () => void;
  onRemoveFromSeat: (seatNumber: number) => void;
  onSwapSeats: (seatA: number, seatB: number) => void;
  onPrngTirage: () => void;
  onLockAndStart: () => void;
  onSelectActiveWallet: (userId: string) => void;
  onTopUpAllForStart: () => void;
}

export const AssignRosterPanel: React.FC<AssignRosterPanelProps> = ({
  circle,
  users,
  activeUserId,
  joinErrorBanner,
  onDismissError,
  onAssignUserToSeat,
  onCreateAndAssignPerson,
  onAddRandomPerson,
  onFillRemainingRandoms,
  onRemoveFromSeat,
  onSwapSeats,
  onPrngTirage,
  onLockAndStart,
  onSelectActiveWallet,
  onTopUpAllForStart,
}) => {
  const [assignMode, setAssignMode] = useState<'directory' | 'custom'>('directory');
  const [selectedDirectoryUserId, setSelectedDirectoryUserId] = useState<string>('u-karim');
  const [targetSeat, setTargetSeat] = useState<number>(() => {
    const open = circle.seats.find((s) => !s.userId);
    return open ? open.position : 1;
  });

  // Custom person form state
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState('Campus Student');
  const [customTier, setCustomTier] = useState<ReputationTier>('New');
  const [customWallet, setCustomWallet] = useState(2500);

  const [allowWildcardRandom, setAllowWildcardRandom] = useState(true);

  const isRecruiting = circle.status === 'recruiting';
  const assignedUserIds = useMemo(
    () => new Set(circle.seats.map((s) => s.userId).filter(Boolean) as string[]),
    [circle.seats]
  );

  const filledCount = assignedUserIds.size;
  const openSeats = circle.seats.filter((s) => !s.userId);
  const effectiveTargetSeat =
    circle.seats.some((s) => s.position === targetSeat && !s.userId)
      ? targetSeat
      : openSeats[0]?.position ?? targetSeat;

  // Check if any assigned user lacks enough MAD balance to lock collateral on start
  const underfundedSeats = useMemo(() => {
    return circle.seats.filter((seat) => {
      if (!seat.userId) return false;
      const u = users.find((x) => x.id === seat.userId);
      if (!u) return false;
      return u.walletBalanceMad < seat.collateralRequired;
    });
  }, [circle.seats, users]);

  const totalCollateralToLock = circle.seats.reduce(
    (sum, s) => sum + (s.userId ? s.collateralRequired : 0),
    0
  );

  // Preview applicant check
  const directoryCandidate =
    users.find((u) => u.id === selectedDirectoryUserId) ?? users[0];
  const candidateTier =
    assignMode === 'directory' ? directoryCandidate?.tier ?? 'New' : customTier;
  const candidateQualifies = doesQualifyForCircle(candidateTier, circle.minTier);
  const previewCollateral = calcRequiredCollateral(
    effectiveTargetSeat,
    circle.memberCount,
    circle.contributionMad,
    candidateTier
  );

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRecruiting) return;
    if (assignMode === 'directory') {
      if (!directoryCandidate) return;
      onAssignUserToSeat(directoryCandidate.id, effectiveTargetSeat);
    } else {
      if (!customName.trim()) return;
      onCreateAndAssignPerson(
        {
          name: customName.trim(),
          campusRole: customRole.trim() || 'Campus Member',
          tier: customTier,
          walletBalanceMad: Math.max(0, customWallet),
        },
        effectiveTargetSeat
      );
      setCustomName('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Status & Random / PRNG / Lock Bar */}
      <div className="glass-panel rounded-[22px] p-6 sm:p-7 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5 text-[12px] text-[#6B7280] tabular-nums">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#111827]">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isRecruiting
                      ? 'bg-[#F59E0B]'
                      : circle.status === 'active'
                        ? 'bg-[#10B981]'
                        : 'bg-[#1A73E8]'
                  }`}
                />
                {isRecruiting
                  ? `Recruiting Seats (${filledCount}/${circle.memberCount})`
                  : circle.status === 'active'
                    ? `Active · Round ${circle.currentRound}/${circle.memberCount}`
                    : 'Cycle Completed'}
              </span>
              <span className="text-black/15">·</span>
              <span>
                Min Tier Gate: <strong className="font-semibold text-[#111827]">{circle.minTier}+</strong>
              </span>
              <span className="text-black/15">·</span>
              <span>
                Collateral Required:{' '}
                <strong className="font-semibold text-[#111827]">
                  {totalCollateralToLock.toLocaleString()} MAD
                </strong>
              </span>
            </div>

            <h2 className="font-display text-[18px] font-semibold tracking-[-0.02em] text-[#111827]">
              {circle.name}
            </h2>
            <p className="text-[14px] text-[#6B7280] leading-[1.6]">{circle.description}</p>
          </div>
        </div>

        {isRecruiting && (
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-black/[0.06]">
            <button
              type="button"
              disabled={openSeats.length === 0}
              onClick={() => onAddRandomPerson(effectiveTargetSeat, !allowWildcardRandom)}
              className="rounded-full glass-pill px-4 py-2 text-[14px] font-medium text-[#111827] disabled:opacity-45 cursor-pointer"
            >
              + Add 1 Random
            </button>

            <button
              type="button"
              disabled={openSeats.length === 0}
              onClick={onFillRemainingRandoms}
              className="rounded-full glass-pill px-4 py-2 text-[14px] font-medium text-[#111827] disabled:opacity-45 cursor-pointer"
            >
              Fill {openSeats.length} Open with Randoms
            </button>

            <button
              type="button"
              disabled={filledCount < 2}
              onClick={onPrngTirage}
              className="rounded-full glass-pill px-4 py-2 text-[14px] font-medium text-[#111827] disabled:opacity-45 cursor-pointer"
            >
              PRNG Tirage
            </button>

            <button
              type="button"
              disabled={filledCount < circle.memberCount || underfundedSeats.length > 0}
              onClick={onLockAndStart}
              className="rounded-full btn-primary px-5 py-2 text-[14px] font-medium disabled:opacity-45 cursor-pointer ml-auto"
            >
              Lock Collateral &amp; Start
            </button>
          </div>
        )}
      </div>

      {/* Contract Join Rejection / Warning Banner */}
      {joinErrorBanner && (
        <div className="rounded-2xl bg-[#FEF2F2] border border-[#DC2626]/20 px-5 py-4 flex items-start justify-between gap-4 text-[14px] text-[#991B1B]">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-4 w-4 text-[#DC2626] mt-1 shrink-0" />
            <div>
              <strong className="font-semibold">Smart Contract join() Reverted:</strong>{' '}
              {joinErrorBanner}
            </div>
          </div>
          <button
            type="button"
            onClick={onDismissError}
            className="rounded-full px-3 py-1 text-[12px] font-medium text-[#991B1B] hover:bg-[#FEE2E2] shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {isRecruiting && underfundedSeats.length > 0 && (
        <div className="rounded-2xl bg-[#FFFBEB] border border-[#F59E0B]/25 px-5 py-4 flex flex-wrap items-center justify-between gap-4 text-[14px] text-[#92400E]">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-[#D97706] shrink-0" />
            <span>
              {underfundedSeats.length} seated member(s) have lower HTS MAD balance than their required collateral.
            </span>
          </div>
          <button
            type="button"
            onClick={onTopUpAllForStart}
            className="rounded-full bg-white border border-black/[0.06] px-4 py-1.5 text-[14px] font-medium text-[#111827] hover:bg-[#F1F5F9] cursor-pointer"
          >
            Faucet Top-Up Underfunded Wallets
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Assign Specific Person or Custom Person Builder */}
        {isRecruiting && (
          <div className="lg:col-span-5 glass-panel rounded-[22px] p-6 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-[18px] font-semibold tracking-[-0.02em] text-[#111827] whitespace-nowrap">
                Assign a Person
              </h3>

              <div className="flex rounded-full bg-[#F1F5F9] p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setAssignMode('directory')}
                  className={`rounded-full px-3 py-1 text-[12px] font-medium whitespace-nowrap cursor-pointer transition-all ${
                    assignMode === 'directory'
                      ? 'bg-white text-[#111827] shadow-sm'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  Directory
                </button>
                <button
                  type="button"
                  onClick={() => setAssignMode('custom')}
                  className={`rounded-full px-3 py-1 text-[12px] font-medium whitespace-nowrap cursor-pointer transition-all ${
                    assignMode === 'custom'
                      ? 'bg-white text-[#111827] shadow-sm'
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  Custom Person
                </button>
              </div>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              {assignMode === 'directory' ? (
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#6B7280] block">
                    Select Participant (Friends, Newcomers, or Defaulter to test rejection)
                  </label>
                  <select
                    value={selectedDirectoryUserId}
                    onChange={(e) => setSelectedDirectoryUserId(e.target.value)}
                    className="w-full rounded-2xl input-surface px-3.5 py-2.5 text-[14px] text-[#111827]"
                  >
                    {users.map((u) => {
                      const alreadyIn = assignedUserIds.has(u.id);
                      return (
                        <option key={u.id} value={u.id} className="bg-white text-[#111827]">
                          {u.name} · {u.tier} ({u.walletBalanceMad} MAD)
                          {alreadyIn ? ' — Already Seated' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-[#6B7280] block">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="e.g., Othmane S."
                        className="w-full rounded-2xl input-surface px-3.5 py-2 text-[14px] text-[#111827] placeholder:text-[#6B7280]/60"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-[#6B7280] block">Role / Group</label>
                      <input
                        type="text"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        placeholder="e.g., Campus Friend"
                        className="w-full rounded-2xl input-surface px-3.5 py-2 text-[14px] text-[#111827]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-[#6B7280] block">Reputation Tier</label>
                      <select
                        value={customTier}
                        onChange={(e) => setCustomTier(e.target.value as ReputationTier)}
                        className="w-full rounded-2xl input-surface px-3 py-2 text-[14px] text-[#111827]"
                      >
                        {(['New', 'Bronze', 'Silver', 'Gold', 'Defaulter'] as ReputationTier[]).map(
                          (t) => (
                            <option key={t} value={t} className="bg-white text-[#111827]">
                              {t} ({Math.round(TIER_META[t].multiplier * 100)}% coll.)
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-[#6B7280] block">Wallet (MAD)</label>
                      <input
                        type="number"
                        min={0}
                        max={20000}
                        step={50}
                        value={customWallet}
                        onChange={(e) => setCustomWallet(Number(e.target.value) || 0)}
                        className="w-full rounded-2xl input-surface px-3.5 py-2 text-[14px] tabular-nums text-[#111827]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Target Seat Selector */}
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-[#6B7280] block">
                  Target Seat Position
                </label>
                <div className="flex flex-wrap gap-2">
                  {circle.seats.map((seat) => {
                    const taken = Boolean(seat.userId);
                    const selected = effectiveTargetSeat === seat.position;
                    return (
                      <button
                        key={seat.position}
                        type="button"
                        onClick={() => setTargetSeat(seat.position)}
                        className={`rounded-full px-3.5 py-1 text-[12px] font-medium tabular-nums transition-colors cursor-pointer ${
                          selected
                            ? 'pill-active'
                            : taken
                              ? 'bg-[#F1F5F9] text-[#6B7280]'
                              : 'bg-[#E8F0FE] text-[#1A73E8] hover:bg-[#D2E3FC]'
                        }`}
                      >
                        #{seat.position} {taken ? '•' : '(Open)'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Contract Pre-Flight Check */}
              <div className="pt-4 border-t border-black/[0.06] space-y-2">
                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-[#6B7280]">
                    Mirror Node Gate ({circle.minTier}+ required)
                  </span>
                  <span
                    className={`font-semibold ${
                      candidateQualifies ? 'text-[#15803D]' : 'text-[#B91C1C]'
                    }`}
                  >
                    {candidateQualifies ? 'Eligible' : 'Will Revert!'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[14px] tabular-nums">
                  <span className="text-[#6B7280]">
                    Seat #{effectiveTargetSeat} Collateral ({candidateTier}{' '}
                    {Math.round(TIER_META[candidateTier].multiplier * 100)}%)
                  </span>
                  <strong className="font-semibold text-[#111827]">
                    {previewCollateral.toLocaleString()} MAD
                  </strong>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-full btn-primary py-2.5 px-5 text-[14px] font-medium cursor-pointer"
              >
                Assign to Seat #{effectiveTargetSeat} (call join())
              </button>
            </form>

            {/* Random Generator Option */}
            <label className="flex items-start gap-2.5 pt-4 border-t border-black/[0.06] text-[12px] text-[#6B7280] leading-[1.5] cursor-pointer">
              <input
                type="checkbox"
                checked={allowWildcardRandom}
                onChange={(e) => setAllowWildcardRandom(e.target.checked)}
                className="mt-0.5 rounded border-black/20 accent-[#1A73E8]"
              />
              <span>
                Include occasional Defaulter in &ldquo;+ Add 1 Random&rdquo; to demo{' '}
                <code className="font-mono text-[#111827]">join()</code> blocking
              </span>
            </label>
          </div>
        )}

        {/* RIGHT: Interactive Seat Roster Grid */}
        <div className={`${isRecruiting ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {circle.seats.map((seat) => {
              const member = seat.userId
                ? users.find((u) => u.id === seat.userId) ?? null
                : null;
              const baseCol = (circle.memberCount - seat.position) * circle.contributionMad;
              const isActivelySelected = member?.id === activeUserId;

              return (
                <div
                  key={seat.position}
                  className={`rounded-[20px] p-5 transition-all ${
                    member
                      ? isActivelySelected
                        ? 'glass-panel ring-1 ring-[#1A73E8]'
                        : 'glass-panel'
                      : 'border border-dashed border-black/15 bg-white/45 hover:bg-white/65'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-black/[0.06] whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-[14px] tabular-nums">
                      <span className="font-semibold text-[#111827]">
                        Seat #{seat.position}
                      </span>
                      <span className="text-[12px] text-[#6B7280]">
                        · R{seat.position}
                      </span>
                    </div>

                    <div className="text-[12px] font-medium text-[#6B7280] tabular-nums flex items-center gap-1 shrink-0">
                      <Lock className="h-3 w-3 text-[#6B7280]" />
                      <span>
                        {member
                          ? `${seat.collateralRequired.toLocaleString()} MAD`
                          : `${baseCol.toLocaleString()} MAD`}
                      </span>
                    </div>
                  </div>

                  {member ? (
                    <div className="pt-3.5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-display text-[14px] font-semibold text-[#111827] flex items-center gap-2">
                            <span>{member.name}</span>
                            {member.isRandom && (
                              <span className="text-[12px] font-medium text-[#1A73E8]">
                                Random
                              </span>
                            )}
                          </div>
                          <div className="text-[12px] text-[#6B7280] tabular-nums">
                            {member.accountId} · {member.campusRole}
                          </div>
                        </div>

                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[12px] font-medium shrink-0 ${
                            TIER_META[member.tier].badgeColor
                          }`}
                        >
                          {member.tier} ({Math.round(TIER_META[member.tier].multiplier * 100)}%)
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[12px] tabular-nums text-[#6B7280]">
                        <span>
                          Wallet:{' '}
                          <strong className="font-semibold text-[#111827]">
                            {member.walletBalanceMad.toLocaleString()} MAD
                          </strong>
                        </span>
                        <span>Score {member.reputationScore}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => onSelectActiveWallet(member.id)}
                          className={`rounded-full px-3 py-1 text-[12px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
                            isActivelySelected
                              ? 'pill-active'
                              : 'glass-pill text-[#111827]'
                          }`}
                        >
                          {isActivelySelected ? 'Active Wallet' : 'Act as Wallet'}
                        </button>

                        {isRecruiting && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={seat.position === 1}
                              onClick={() => onSwapSeats(seat.position, seat.position - 1)}
                              title="Move up 1 seat"
                              className="rounded-full p-1.5 text-[#6B7280] hover:bg-[#F1F5F9] hover:text-[#111827] disabled:opacity-35 cursor-pointer"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={seat.position === circle.memberCount}
                              onClick={() => onSwapSeats(seat.position, seat.position + 1)}
                              title="Move down 1 seat"
                              className="rounded-full p-1.5 text-[#6B7280] hover:bg-[#F1F5F9] hover:text-[#111827] disabled:opacity-35 cursor-pointer"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemoveFromSeat(seat.position)}
                              title="Remove from seat"
                              className="rounded-full p-1.5 text-[#6B7280] hover:bg-[#FEE2E2] hover:text-[#B91C1C] cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="pt-4 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[12px] text-[#6B7280]">
                        Open seat — assign or add random
                      </span>
                      {isRecruiting && (
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setTargetSeat(seat.position)}
                            className="rounded-full glass-pill px-3 py-1 text-[12px] font-medium text-[#111827] cursor-pointer"
                          >
                            Target
                          </button>
                          <button
                            type="button"
                            onClick={() => onAddRandomPerson(seat.position, !allowWildcardRandom)}
                            className="rounded-full bg-[#E8F0FE] hover:bg-[#D2E3FC] px-3 py-1 text-[12px] font-medium text-[#1A73E8] cursor-pointer"
                          >
                            + Random
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
