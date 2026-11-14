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
  embedded?: boolean;
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
  embedded = false,
}) => {
  const [assignMode, setAssignMode] = useState<'directory' | 'custom'>('directory');
  const [selectedDirectoryUserId, setSelectedDirectoryUserId] = useState<string>('u-karim');
  const [targetSeat, setTargetSeat] = useState<number>(() => {
    const open = circle.seats.find((s) => !s.userId);
    return open ? open.position : 1;
  });

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
      {/* Circle Setup & Lifecycle Toolbar */}
      {!embedded && (
        <div className="glass-panel rounded-2xl p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <h2 className="font-display text-[17px] font-semibold text-[#0F172A]">
                {isRecruiting ? 'Seat Recruitment & Collateral Staging' : 'Enrolled Seat Assignments'}
              </h2>
              <p className="text-[14px] text-[#475569] leading-[1.55] max-w-2xl">
                {circle.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[12px] font-mono-tabular text-[#475569] shrink-0">
              <span className="rounded-full bg-[#F1F5F9] px-3 py-1 font-semibold text-[#0F172A]">
                {filledCount}/{circle.memberCount} Seated
              </span>
              <span className="rounded-full bg-[#E0F2FE] px-3 py-1 font-semibold text-[#0369A1]">
                Gate: {circle.minTier}+
              </span>
              <span className="rounded-full bg-[#F1F5F9] px-3 py-1 font-semibold text-[#0F172A]">
                Staged: {totalCollateralToLock.toLocaleString()} MAD
              </span>
            </div>
          </div>

          {isRecruiting && (
            <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-[#0F172A]/[0.06]">
              <button
                type="button"
                disabled={openSeats.length === 0}
                onClick={() => onAddRandomPerson(effectiveTargetSeat, !allowWildcardRandom)}
                className="rounded-full glass-pill px-4 py-2 text-[13px] font-semibold text-[#0F172A] disabled:opacity-45 cursor-pointer"
              >
                + Add 1 Random
              </button>

              <button
                type="button"
                disabled={openSeats.length === 0}
                onClick={onFillRemainingRandoms}
                className="rounded-full glass-pill px-4 py-2 text-[13px] font-semibold text-[#0F172A] disabled:opacity-45 cursor-pointer"
              >
                Fill {openSeats.length} Open with Randoms
              </button>

              <button
                type="button"
                disabled={filledCount < 2}
                onClick={onPrngTirage}
                className="rounded-full glass-pill px-4 py-2 text-[13px] font-semibold text-[#0F172A] disabled:opacity-45 cursor-pointer"
              >
                PRNG Tirage
              </button>

              <button
                type="button"
                disabled={filledCount < circle.memberCount || underfundedSeats.length > 0}
                onClick={onLockAndStart}
                className="rounded-full btn-primary px-5 py-2 text-[13px] font-semibold disabled:opacity-45 cursor-pointer ml-auto"
              >
                Lock Collateral &amp; Start
              </button>
            </div>
          )}
        </div>
      )}

      {/* Contract Join Rejection Banner */}
      {joinErrorBanner && (
        <div
          role="alert"
          className="rounded-2xl bg-[#FEE2E2] border border-[#EF4444]/25 px-5 py-4 flex items-start justify-between gap-4 text-[14px] text-[#B91C1C]"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-4 w-4 text-[#B91C1C] mt-1 shrink-0" />
            <div>
              <strong className="font-semibold">Smart Contract join() Reverted:</strong>{' '}
              {joinErrorBanner}
            </div>
          </div>
          <button
            type="button"
            onClick={onDismissError}
            className="rounded-full px-3 py-1 text-[12px] font-semibold text-[#B91C1C] hover:bg-white/60 shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Underfunded Wallets Warning */}
      {isRecruiting && underfundedSeats.length > 0 && (
        <div className="rounded-2xl bg-[#FEF3C7] border border-[#F59E0B]/25 px-5 py-4 flex flex-wrap items-center justify-between gap-4 text-[14px] text-[#B45309]">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-[#B45309] shrink-0" />
            <span>
              {underfundedSeats.length} seated member(s) hold less HTS MAD than their required collateral.
            </span>
          </div>
          <button
            type="button"
            onClick={onTopUpAllForStart}
            className="rounded-full bg-white border border-[#0F172A]/[0.08] px-4 py-1.5 text-[13px] font-semibold text-[#0F172A] hover:bg-[#F8FAFC] cursor-pointer"
          >
            Faucet Top-Up Underfunded Wallets
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Assign Participant Workbench */}
        {isRecruiting && (
          <div className="lg:col-span-5 glass-panel rounded-2xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-[16px] font-semibold text-[#0F172A]">
                Assign a Person
              </h3>

              <div className="flex rounded-full bg-[#F1F5F9] p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setAssignMode('directory')}
                  className={`rounded-full px-3 py-1 text-[12px] font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    assignMode === 'directory'
                      ? 'bg-white text-[#0F172A] shadow-xs'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  Directory
                </button>
                <button
                  type="button"
                  onClick={() => setAssignMode('custom')}
                  className={`rounded-full px-3 py-1 text-[12px] font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    assignMode === 'custom'
                      ? 'bg-white text-[#0F172A] shadow-xs'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  Custom Person
                </button>
              </div>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              {assignMode === 'directory' ? (
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#475569] block">
                    Participant Directory (Includes Defaulter for Gate Test)
                  </label>
                  <select
                    value={selectedDirectoryUserId}
                    onChange={(e) => setSelectedDirectoryUserId(e.target.value)}
                    className="w-full rounded-xl input-surface px-3.5 py-2.5 text-[14px] text-[#0F172A]"
                  >
                    {users.map((u) => {
                      const alreadyIn = assignedUserIds.has(u.id);
                      return (
                        <option key={u.id} value={u.id} className="bg-white text-[#0F172A]">
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
                      <label className="text-[12px] font-semibold text-[#475569] block">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="e.g., Othmane S."
                        className="w-full rounded-xl input-surface px-3.5 py-2 text-[14px] text-[#0F172A] placeholder:text-[#475569]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-semibold text-[#475569] block">
                        Role / Group
                      </label>
                      <input
                        type="text"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        placeholder="e.g., Campus Friend"
                        className="w-full rounded-xl input-surface px-3.5 py-2 text-[14px] text-[#0F172A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-semibold text-[#475569] block">
                        Reputation Tier
                      </label>
                      <select
                        value={customTier}
                        onChange={(e) => setCustomTier(e.target.value as ReputationTier)}
                        className="w-full rounded-xl input-surface px-3.5 py-2 text-[14px] text-[#0F172A]"
                      >
                        {(['New', 'Bronze', 'Silver', 'Gold', 'Defaulter'] as ReputationTier[]).map(
                          (t) => (
                            <option key={t} value={t} className="bg-white text-[#0F172A]">
                              {t} ({Math.round(TIER_META[t].multiplier * 100)}% coll.)
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-semibold text-[#475569] block">
                        Wallet (MAD)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={20000}
                        step={50}
                        value={customWallet}
                        onChange={(e) => setCustomWallet(Number(e.target.value) || 0)}
                        className="w-full rounded-xl input-surface px-3.5 py-2 text-[14px] font-mono-tabular text-[#0F172A]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Target Seat Selector */}
              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-[#475569] block">
                  Target Seat Position
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {circle.seats.map((seat) => {
                    const taken = Boolean(seat.userId);
                    const selected = effectiveTargetSeat === seat.position;
                    return (
                      <button
                        key={seat.position}
                        type="button"
                        onClick={() => setTargetSeat(seat.position)}
                        className={`rounded-full px-3 py-1 text-[12px] font-semibold font-mono-tabular transition-colors cursor-pointer ${
                          selected
                            ? 'pill-active'
                            : taken
                              ? 'bg-[#F1F5F9] text-[#475569]'
                              : 'bg-[#E0F2FE] text-[#0369A1] hover:bg-[#BAE6FD]/60'
                        }`}
                      >
                        #{seat.position} {taken ? '•' : '(Open)'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contract Pre-Flight Check */}
              <div className="pt-4 border-t border-[#0F172A]/[0.06] space-y-2">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#475569]">
                    Mirror Node Gate ({circle.minTier}+ required)
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
                      candidateQualifies
                        ? 'bg-[#DCFCE7] text-[#15803D]'
                        : 'bg-[#FEE2E2] text-[#B91C1C]'
                    }`}
                  >
                    {candidateQualifies ? 'Eligible' : 'Will Revert'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#475569]">
                    Seat #{effectiveTargetSeat} Collateral ({candidateTier}{' '}
                    {Math.round(TIER_META[candidateTier].multiplier * 100)}%)
                  </span>
                  <strong className="font-mono-tabular font-semibold text-[#0F172A]">
                    {previewCollateral.toLocaleString()} MAD
                  </strong>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-full btn-primary py-2.5 px-5 text-[14px] font-semibold cursor-pointer"
              >
                Assign to Seat #{effectiveTargetSeat} (call join())
              </button>
            </form>

            <label className="flex items-start gap-2.5 pt-4 border-t border-[#0F172A]/[0.06] text-[12px] text-[#475569] leading-[1.5] cursor-pointer">
              <input
                type="checkbox"
                checked={allowWildcardRandom}
                onChange={(e) => setAllowWildcardRandom(e.target.checked)}
                className="mt-0.5 rounded border-[#0F172A]/20 accent-[#1A73E8]"
              />
              <span>
                Include occasional Defaulter in &ldquo;+ Add 1 Random&rdquo; to test{' '}
                <code className="font-mono-tabular text-[#0F172A]">join()</code> rejection
              </span>
            </label>
          </div>
        )}

        {/* Right: Porcelain Glass Seat Ledger */}
        <div
          className={`${isRecruiting ? 'lg:col-span-7' : 'lg:col-span-12'} ${
            embedded ? 'border-t border-[#0F172A]/[0.06]' : 'glass-panel rounded-2xl'
          } overflow-hidden`}
        >
          <div className="px-5 py-4 border-b border-[#0F172A]/[0.06] flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-[16px] font-semibold text-[#0F172A]">
              Seat Rotation Ledger
            </h3>
            <span className="text-[12px] font-mono-tabular text-[#475569]">
              Required Collateral = (N − k) × C × Tier
            </span>
          </div>

          <div className="hidden sm:grid sm:grid-cols-[44px_minmax(0,1fr)_72px_76px_132px] gap-2 px-4 py-2.5 bg-[#F1F5F9]/75 border-b border-[#0F172A]/[0.06] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569]">
            <div>Seat</div>
            <div>Member</div>
            <div className="text-right">Collateral</div>
            <div className="text-right">Wallet</div>
            <div className="text-right">Action</div>
          </div>

          <div className="divide-y divide-[#0F172A]/[0.06]">
            {circle.seats.map((seat) => {
              const member = seat.userId
                ? users.find((u) => u.id === seat.userId) ?? null
                : null;
              const baseCol = (circle.memberCount - seat.position) * circle.contributionMad;
              const isActivelySelected = member?.id === activeUserId;
              const isTargetedOpen = isRecruiting && !member && effectiveTargetSeat === seat.position;

              return (
                <div
                  key={seat.position}
                  className={`px-4 py-3 transition-colors grid grid-cols-1 sm:grid-cols-[44px_minmax(0,1fr)_72px_76px_132px] gap-2 items-center ${
                    isActivelySelected
                      ? 'bg-[#E0F2FE]/35'
                      : isTargetedOpen
                        ? 'bg-[#F8FAFC]/80'
                        : 'hover:bg-white/60'
                  }`}
                >
                  {/* Seat Index */}
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="font-mono-tabular text-[13px] font-semibold text-[#0F172A]">
                      #{seat.position}
                    </span>
                    <span className="font-mono-tabular text-[11px] text-[#475569]">
                      R{seat.position}
                    </span>
                  </div>

                  {/* Member Identity + Tier */}
                  <div className="min-w-0">
                    {member ? (
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[13px] font-semibold text-[#0F172A] truncate">
                            {member.name}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${
                              TIER_META[member.tier].badgeColor
                            }`}
                          >
                            {member.tier} ({Math.round(TIER_META[member.tier].multiplier * 100)}%)
                          </span>
                          {member.isRandom && (
                            <span className="text-[11px] font-medium text-[#0369A1]">Random</span>
                          )}
                        </div>
                        <div className="font-mono-tabular text-[11px] text-[#475569] truncate">
                          {member.accountId} · {member.campusRole}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[13px] text-[#475569]">
                        Open seat — ready for assignment
                      </div>
                    )}
                  </div>

                  {/* Collateral */}
                  <div className="sm:text-right font-mono-tabular text-[12px] font-semibold text-[#0F172A] flex sm:justify-end items-center gap-1 whitespace-nowrap">
                    <Lock className="h-3 w-3 text-[#475569] shrink-0" />
                    <span>
                      {(member ? seat.collateralRequired : baseCol).toLocaleString()} MAD
                    </span>
                  </div>

                  {/* Wallet & Score */}
                  <div className="sm:text-right font-mono-tabular text-[12px] whitespace-nowrap">
                    {member ? (
                      <div>
                        <div className="font-semibold text-[#0F172A]">
                          {member.walletBalanceMad.toLocaleString()} MAD
                        </div>
                        <div className="text-[11px] text-[#475569]">
                          Score {member.reputationScore}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[#475569]">—</span>
                    )}
                  </div>

                  {/* Row Controls */}
                  <div className="flex items-center sm:justify-end gap-1 whitespace-nowrap">
                    {member ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onSelectActiveWallet(member.id)}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                            isActivelySelected
                              ? 'pill-active'
                              : 'glass-pill text-[#334155]'
                          }`}
                        >
                          {isActivelySelected ? 'Active' : 'Act'}
                        </button>

                        {isRecruiting && (
                          <>
                            <button
                              type="button"
                              disabled={seat.position === 1}
                              onClick={() => onSwapSeats(seat.position, seat.position - 1)}
                              title="Move up 1 seat"
                              className="rounded-full p-1 text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] disabled:opacity-35 cursor-pointer"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={seat.position === circle.memberCount}
                              onClick={() => onSwapSeats(seat.position, seat.position + 1)}
                              title="Move down 1 seat"
                              className="rounded-full p-1 text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] disabled:opacity-35 cursor-pointer"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemoveFromSeat(seat.position)}
                              title="Remove from seat"
                              className="rounded-full p-1 text-[#475569] hover:bg-[#FEE2E2] hover:text-[#B91C1C] cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      isRecruiting && (
                        <>
                          <button
                            type="button"
                            onClick={() => setTargetSeat(seat.position)}
                            className="rounded-full glass-pill px-2.5 py-1 text-[11px] font-semibold text-[#0F172A] cursor-pointer"
                          >
                            Target
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onAddRandomPerson(seat.position, !allowWildcardRandom)
                            }
                            className="rounded-full bg-[#E0F2FE] hover:bg-[#BAE6FD]/70 px-2.5 py-1 text-[11px] font-semibold text-[#0369A1] cursor-pointer"
                          >
                            + Random
                          </button>
                        </>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
