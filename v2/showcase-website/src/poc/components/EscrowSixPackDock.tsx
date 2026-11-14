import React from 'react';
import { DaretCircle, UserProfile } from '../types/daret';
import { TIER_META } from '../data/presets';

interface EscrowSixPackDockProps {
  circle: DaretCircle;
  users: UserProfile[];
  activeUser: UserProfile;
  joinErrorBanner: string | null;
  lastPulseType: 'contribute' | 'slash' | 'payout' | null;
}

interface DialGaugeProps {
  indexLabel: string;
  title: string;
  ratio: number; // 0..1
  accentColor: string;
  readout: string;
  caption: string;
  surfaceTone?: 'default' | 'fault' | 'warn';
  alertBadge?: {
    label: string;
    tone: 'fault' | 'warn' | 'nominal' | 'info';
  };
}

const DIAL_CX = 56;
const DIAL_CY = 47;
const DIAL_R = 25.5;
const START_RAD = (-210 * Math.PI) / 180;
const END_RAD = (30 * Math.PI) / 180;
const ARC_LENGTH = (240 / 360) * 2 * Math.PI * DIAL_R;

const ARC_START_X = DIAL_CX + DIAL_R * Math.cos(START_RAD);
const ARC_START_Y = DIAL_CY + DIAL_R * Math.sin(START_RAD);
const ARC_END_X = DIAL_CX + DIAL_R * Math.cos(END_RAD);
const ARC_END_Y = DIAL_CY + DIAL_R * Math.sin(END_RAD);
const ARC_PATH = `M ${ARC_START_X.toFixed(2)} ${ARC_START_Y.toFixed(2)} A ${DIAL_R} ${DIAL_R} 0 1 1 ${ARC_END_X.toFixed(2)} ${ARC_END_Y.toFixed(2)}`;

const TICK_INDICES = Array.from({ length: 25 }, (_, i) => i);

const DialGauge: React.FC<DialGaugeProps> = ({
  indexLabel,
  title,
  ratio,
  accentColor,
  readout,
  caption,
  surfaceTone = 'default',
  alertBadge,
}) => {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(ratio) ? ratio : 0));
  const dashOffset = ARC_LENGTH * (1 - clamped);
  const needleDeg = -120 + clamped * 240;

  const badgeToneClass =
    alertBadge?.tone === 'fault'
      ? 'bg-[#FEE2E2] text-[#B91C1C]'
      : alertBadge?.tone === 'warn'
        ? 'bg-[#FEF3C7] text-[#B45309]'
        : alertBadge?.tone === 'nominal'
          ? 'bg-[#DCFCE7] text-[#15803D]'
          : 'bg-[#E0F2FE] text-[#0369A1]';

  const cellSurface =
    surfaceTone === 'fault'
      ? 'bg-[#FEF2F2]/85'
      : surfaceTone === 'warn'
        ? 'bg-[#FFFBEB]/80'
        : 'bg-white/75';

  return (
    <div className={`${cellSurface} px-3.5 py-3.5 flex flex-col justify-between gap-2 min-w-0 transition-colors`}>
      <div className="flex flex-wrap items-center justify-between gap-x-1.5 gap-y-1 min-h-[20px]">
        <div className="text-[11px] font-semibold tracking-[0.01em] text-[#475569] whitespace-nowrap">
          <span className="font-mono-tabular text-[#0F172A] mr-1">{indexLabel}</span>
          <span>{title}</span>
        </div>
        {alertBadge && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold tracking-[0.02em] shrink-0 ${badgeToneClass}`}
          >
            {alertBadge.tone === 'fault' && (
              <svg
                width="8"
                height="8"
                viewBox="0 0 10 10"
                aria-hidden="true"
                className="shrink-0"
              >
                <path d="M5 1.2L9.2 8.8H0.8L5 1.2Z" fill="currentColor" />
              </svg>
            )}
            <span>{alertBadge.label}</span>
          </span>
        )}
      </div>

      <div className="flex justify-center py-0.5">
        <svg
          width="112"
          height="92"
          viewBox="0 0 112 92"
          aria-hidden="true"
          className="shrink-0"
        >
          <circle
            cx={DIAL_CX}
            cy={DIAL_CY}
            r="42"
            fill="rgba(248, 250, 252, 0.9)"
            stroke="rgba(15, 23, 42, 0.11)"
            strokeWidth="1"
          />
          <circle
            cx={DIAL_CX}
            cy={DIAL_CY}
            r="37.5"
            fill="rgba(255, 255, 255, 0.94)"
            stroke="rgba(15, 23, 42, 0.06)"
            strokeWidth="0.75"
          />

          <path
            d={ARC_PATH}
            fill="none"
            stroke="rgba(15, 23, 42, 0.09)"
            strokeWidth="4.2"
            strokeLinecap="round"
          />

          <path
            d={ARC_PATH}
            fill="none"
            stroke={accentColor}
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeDasharray={ARC_LENGTH}
            strokeDashoffset={dashOffset}
            style={{
              transition:
                'stroke-dashoffset 420ms cubic-bezier(0.16, 1, 0.3, 1), stroke 220ms ease',
            }}
          />

          {TICK_INDICES.map((i) => {
            const isMajor = i % 6 === 0;
            const rad = ((-210 + (i / 24) * 240) * Math.PI) / 180;
            const r1 = isMajor ? 29.5 : 32;
            const r2 = 35.5;
            const x1 = DIAL_CX + r1 * Math.cos(rad);
            const y1 = DIAL_CY + r1 * Math.sin(rad);
            const x2 = DIAL_CX + r2 * Math.cos(rad);
            const y2 = DIAL_CY + r2 * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1.toFixed(2)}
                y1={y1.toFixed(2)}
                x2={x2.toFixed(2)}
                y2={y2.toFixed(2)}
                stroke={isMajor ? 'rgba(15, 23, 42, 0.42)' : 'rgba(15, 23, 42, 0.18)'}
                strokeWidth={isMajor ? '1.35' : '0.85'}
                strokeLinecap="round"
              />
            );
          })}

          <text
            x="34"
            y="73.5"
            textAnchor="middle"
            fontSize="6.5"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill="#475569"
          >
            0
          </text>
          <text
            x="77"
            y="73.5"
            textAnchor="middle"
            fontSize="6"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill="#475569"
          >
            MAX
          </text>

          <g
            style={{
              transform: `rotate(${needleDeg.toFixed(1)}deg)`,
              transformOrigin: `${DIAL_CX}px ${DIAL_CY}px`,
              transition: 'transform 460ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <polygon
              points={`${DIAL_CX},${DIAL_CY - 27} ${DIAL_CX + 2.1},${DIAL_CY} ${DIAL_CX + 1.2},${DIAL_CY + 9} ${DIAL_CX - 1.2},${DIAL_CY + 9} ${DIAL_CX - 2.1},${DIAL_CY}`}
              fill={accentColor}
            />
          </g>

          <circle cx={DIAL_CX} cy={DIAL_CY} r="5" fill="#0F172A" />
          <circle cx={DIAL_CX} cy={DIAL_CY} r="2.7" fill="#FFFFFF" />
          <circle cx={DIAL_CX} cy={DIAL_CY} r="1.3" fill={accentColor} />
        </svg>
      </div>

      <div className="min-w-0 space-y-0.5 text-center">
        <div className="font-mono-tabular text-[14px] font-bold text-[#0F172A] truncate">
          {readout}
        </div>
        <div className="text-[11px] text-[#475569] truncate">{caption}</div>
      </div>
    </div>
  );
};

export const EscrowSixPackDock: React.FC<EscrowSixPackDockProps> = ({
  circle,
  users,
  activeUser,
  joinErrorBanner,
  lastPulseType,
}) => {
  const potTarget = circle.memberCount * circle.contributionMad;
  const paidCount = circle.seats.filter((s) => s.paidCurrentRound).length;
  const missedQueuedCount =
    circle.status === 'active'
      ? circle.seats.filter((s) => s.markedMissed && !s.paidCurrentRound).length
      : 0;

  // 01 Pot Liquidity
  const potRatio =
    circle.status === 'completed'
      ? 1
      : potTarget > 0
        ? circle.escrowPotMad / potTarget
        : 0;
  const potReadout =
    circle.status === 'completed'
      ? `${potTarget.toLocaleString()} MAD`
      : `${circle.escrowPotMad.toLocaleString()} / ${potTarget.toLocaleString()} MAD`;
  const potCaption =
    circle.status === 'completed'
      ? `All ${circle.memberCount} rounds paid`
      : circle.status === 'active'
        ? `${paidCount}/${circle.memberCount} paid this round`
        : 'Escrow standby (recruiting)';

  // 02 Collateral Coverage ((N - k) * C)
  const expectedRequiredCollateral = circle.seats.reduce(
    (sum, s) => sum + (s.userId ? s.collateralRequired : 0),
    0
  );
  const fullNominalCollateral = circle.seats.reduce(
    (sum, s) => sum + Math.max(0, circle.memberCount - s.position) * circle.contributionMad,
    0
  );
  const currentCollateralMad =
    circle.status === 'active'
      ? circle.collateralVaultMad
      : circle.status === 'recruiting'
        ? expectedRequiredCollateral
        : 0;
  const collateralDenom =
    circle.status === 'active'
      ? Math.max(1, expectedRequiredCollateral)
      : Math.max(1, fullNominalCollateral);
  const collateralRatio =
    circle.status === 'completed' ? 1 : currentCollateralMad / collateralDenom;
  const collateralReadout =
    circle.status === 'completed'
      ? '0 MAD'
      : `${currentCollateralMad.toLocaleString()} MAD`;
  const collateralCaption =
    circle.status === 'completed'
      ? 'Returned on final round'
      : circle.status === 'active'
        ? 'Locked (N − k) × C escrow'
        : 'Staged for lock & start';

  // 03 HCS Finality / Seq
  const latestSeq = circle.events.reduce(
    (max, ev) => Math.max(max, ev.sequenceNumber),
    0
  );
  const latestEv = circle.events.find((ev) => ev.sequenceNumber === latestSeq);
  const seqRatio = Math.min(1, latestSeq / Math.max(6, circle.memberCount * 3));
  const hcsReadout = `SEQ #${String(latestSeq).padStart(2, '0')}`;
  const hcsCaption = latestEv
    ? `${latestEv.type} · ${latestEv.feeUsd}`
    : `Topic ${circle.hcsTopicId}`;

  // 04 Rotation Round
  const recipientSeat = circle.seats.find((s) => s.position === circle.currentRound);
  const recipientUser = recipientSeat?.userId
    ? users.find((u) => u.id === recipientSeat.userId)
    : null;
  const roundRatio =
    circle.status === 'recruiting'
      ? 0.06
      : circle.currentRound / Math.max(1, circle.memberCount);
  const mins = Math.floor(circle.countdownSec / 60);
  const secs = circle.countdownSec % 60;
  const clockLabel = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const roundReadout = `Round ${circle.currentRound} / ${circle.memberCount}`;
  const roundCaption =
    circle.status === 'completed'
      ? 'Cycle complete'
      : recipientUser
        ? `Seat #${circle.currentRound} · ${recipientUser.name.split(' ')[0]}${
            circle.status === 'active' ? ` · ${clockLabel}` : ''
          }`
        : `Seat #${circle.currentRound} · Open`;

  // 05 Circle Trust Health
  const seatedUsers = circle.seats
    .map((s) => (s.userId ? users.find((u) => u.id === s.userId) : undefined))
    .filter((u): u is UserProfile => Boolean(u));
  const avgTrustScore =
    seatedUsers.length > 0
      ? Math.round(
          seatedUsers.reduce((sum, u) => sum + u.reputationScore, 0) / seatedUsers.length
        )
      : 0;
  const tierCounts = seatedUsers.reduce<Record<string, number>>((acc, u) => {
    const code = u.tier === 'Defaulter' ? 'DEF' : u.tier[0];
    acc[code] = (acc[code] ?? 0) + 1;
    return acc;
  }, {});
  const tierMix =
    seatedUsers.length > 0
      ? Object.entries(tierCounts)
          .map(([k, v]) => `${v}${k}`)
          .join(' ')
      : `Min ${circle.minTier}+`;
  const hasDefaulterSeated = seatedUsers.some((u) => u.tier === 'Defaulter');
  const trustRatio = avgTrustScore / 1000;
  const trustColor = hasDefaulterSeated
    ? '#EF4444'
    : avgTrustScore >= 680
      ? '#10B981'
      : avgTrustScore >= 450
        ? '#1A73E8'
        : '#F59E0B';

  // 06 Slash Guard
  const slashEvents = circle.events.filter((e) => e.type === 'COLLATERAL_SLASHED');
  const rejectEvents = circle.events.filter((e) => e.type === 'JOIN_REJECTED');
  const totalSlashedMad = circle.seats.reduce((sum, s) => sum + s.totalSlashed, 0);
  const isSlashed =
    slashEvents.length > 0 || totalSlashedMad > 0 || lastPulseType === 'slash';
  const isRejected = !isSlashed && (rejectEvents.length > 0 || joinErrorBanner !== null);
  const isArmed = !isSlashed && !isRejected && missedQueuedCount > 0;

  const slashRatio = isSlashed
    ? 0.92
    : isRejected
      ? 0.84
      : isArmed
        ? 0.56
        : 0.1;
  const slashColor = isSlashed || isRejected ? '#EF4444' : isArmed ? '#F59E0B' : '#10B981';
  const slashReadout = isSlashed
    ? `${totalSlashedMad.toLocaleString()} MAD`
    : isRejected
      ? `${rejectEvents.length || 1} BLOCKED`
      : isArmed
        ? `${missedQueuedCount} QUEUED`
        : '0 FAULTS';
  const slashCaption = isSlashed
    ? `${slashEvents.length} slash event · Pot covered`
    : isRejected
      ? 'Defaulter join() reverted'
      : isArmed
        ? 'Close round to enforce slash'
        : 'Escrow collateral nominal';
  const slashBadge: DialGaugeProps['alertBadge'] =
    isSlashed || isRejected
      ? { label: 'SLASH EXECUTED', tone: 'fault' }
      : isArmed
        ? { label: 'ARMED', tone: 'warn' }
        : { label: 'NOMINAL', tone: 'nominal' };

  const statusPill =
    circle.status === 'active'
      ? {
          label: `Active · R${circle.currentRound}/${circle.memberCount}`,
          cls: 'bg-[#DCFCE7] text-[#15803D]',
        }
      : circle.status === 'completed'
        ? { label: 'Cycle Complete', cls: 'bg-[#E0F2FE] text-[#0369A1]' }
        : {
            label: `Recruiting · ${seatedUsers.length}/${circle.memberCount}`,
            cls: 'bg-[#FEF3C7] text-[#B45309]',
          };

  return (
    <section
      aria-label="Live Six-Pack Escrow Telemetry"
      className="glass-panel rounded-2xl overflow-hidden mb-7"
    >
      {/* Workspace Summary Header */}
      <div className="px-5 py-3.5 border-b border-[#0F172A]/[0.06] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <h1 className="font-display text-[24px] sm:text-[26px] font-extrabold tracking-[-0.025em] leading-[1.15] text-[#0F172A]">
            {circle.name}
          </h1>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold shrink-0 ${statusPill.cls}`}
          >
            {statusPill.label}
          </span>
          <span className="font-mono-tabular text-[12px] text-[#475569]">
            {circle.memberCount} × {circle.contributionMad} MAD · {circle.period}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[12px] font-mono-tabular text-[#475569]">
          <span>
            Actor:{' '}
            <strong className="font-semibold text-[#0F172A]">{activeUser.name}</strong>{' '}
            <span>({TIER_META[activeUser.tier].label})</span>
          </span>
          <span className="text-[#0F172A]/15">|</span>
          <span>
            EVM {circle.contractAddress.slice(0, 10)}… · Topic {circle.hcsTopicId}
          </span>
        </div>
      </div>

      {/* 6-Instrument Telemetry Strip with Hairline Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-px bg-[#0F172A]/[0.06]">
        <DialGauge
          indexLabel="01"
          title="Pot Liquidity"
          ratio={potRatio}
          accentColor={
            circle.status === 'completed' || paidCount === circle.memberCount
              ? '#10B981'
              : '#1A73E8'
          }
          readout={potReadout}
          caption={potCaption}
        />

        <DialGauge
          indexLabel="02"
          title="Collateral Coverage"
          ratio={collateralRatio}
          accentColor="#10B981"
          readout={collateralReadout}
          caption={collateralCaption}
        />

        <DialGauge
          indexLabel="03"
          title="HCS Finality"
          ratio={seqRatio}
          accentColor="#1A73E8"
          readout={hcsReadout}
          caption={hcsCaption}
        />

        <DialGauge
          indexLabel="04"
          title="Rotation Round"
          ratio={roundRatio}
          accentColor={circle.status === 'completed' ? '#10B981' : '#1A73E8'}
          readout={roundReadout}
          caption={roundCaption}
        />

        <DialGauge
          indexLabel="05"
          title="Circle Trust Health"
          ratio={trustRatio}
          accentColor={trustColor}
          readout={seatedUsers.length > 0 ? `${avgTrustScore} / 1000` : '— / 1000'}
          caption={`${seatedUsers.length}/${circle.memberCount} seated · ${tierMix}`}
        />

        <DialGauge
          indexLabel="06"
          title="Slash Guard"
          ratio={slashRatio}
          accentColor={slashColor}
          readout={slashReadout}
          caption={slashCaption}
          surfaceTone={isSlashed || isRejected ? 'fault' : isArmed ? 'warn' : 'default'}
          alertBadge={slashBadge}
        />
      </div>
    </section>
  );
};
