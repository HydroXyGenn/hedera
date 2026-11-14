import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  Zap,
} from 'lucide-react';
import {
  MEMBER_POOL,
  REPUTATION_TIERS,
  ReputationTier,
} from '../data/daretData';

export type SimPhase =
  | 'idle'
  | 'locking'
  | 'contributing'
  | 'slashing'
  | 'paying'
  | 'round_settled'
  | 'refunding'
  | 'completed';

export type PeriodOption = '2 min (PoC)' | 'Weekly' | 'Monthly';

export interface SimMember {
  id: string;
  name: string;
  shortName: string;
  accountId: string;
  position: number; // 1..N
  tier: ReputationTier;
  skipRound: number | null;
  collateralRequired: number;
  collateralRemaining: number;
  paidThisRound: boolean;
  slashedThisRound: boolean;
  hasReceivedPot: boolean;
  totalContributed: number;
  totalSlashed: number;
}

export interface HcsLogEntry {
  seq: number;
  timestamp: string;
  round: number;
  type:
    | 'CIRCLE_CREATED'
    | 'PRNG_TIRAGE'
    | 'COLLATERAL_LOCKED'
    | 'CONTRIBUTION'
    | 'GRACE_MISSED'
    | 'COLLATERAL_SLASHED'
    | 'POT_PAID'
    | 'COLLATERAL_REFUNDED';
  summary: string;
  actor: string;
  amountMad?: number;
  feeUsd: string;
}

export interface SimulatorPresetTrigger {
  key: number;
  preset: 'poc-demo' | 'micro' | 'classic';
}

interface LiveDaretSimulatorProps {
  externalTrigger?: SimulatorPresetTrigger | null;
}

const CONTRIBUTION_PRESETS = [20, 100, 250, 500, 1000];

const PHASE_LABELS: Record<SimPhase, { title: string; subtitle: string; badgeClass: string }> = {
  idle: {
    title: 'Ready to Deploy Circle',
    subtitle: 'Configure members, MAD amount, reputation tiers, or test a missed payment—then press Play or Step.',
    badgeClass: 'bg-white/15 text-white border-white/30',
  },
  locking: {
    title: 'Phase 1 · Locking Collateral into Escrow',
    subtitle: 'Each member locks (N − k) × C adjusted by their Mirror Node reputation tier.',
    badgeClass: 'bg-sky-300/25 text-sky-100 border-sky-200/45',
  },
  contributing: {
    title: 'Phase 2 · Collecting Round Contributions',
    subtitle: 'Members send their round deposit into the Hedera EVM escrow pot (with negligible ~$0.0001 fee).',
    badgeClass: 'bg-cyan-300/25 text-cyan-50 border-cyan-200/50',
  },
  slashing: {
    title: 'Phase 3 · Grace Expired → Auto-Slashing Collateral!',
    subtitle: 'Contract automatically draws the shortfall from the defaulter’s locked collateral. Recipient stays 100% protected.',
    badgeClass: 'bg-amber-400/30 text-amber-100 border-amber-300/60',
  },
  paying: {
    title: 'Phase 4 · Closing Round & Paying Recipient',
    subtitle: 'Full pot releases from the escrow orb directly to this round’s scheduled recipient in 3–5 seconds.',
    badgeClass: 'bg-emerald-400/25 text-emerald-100 border-emerald-300/50',
  },
  round_settled: {
    title: 'Round Settled & Logged to HCS',
    subtitle: 'Immutable timestamp recorded on Hedera Consensus Service. Advancing to next round.',
    badgeClass: 'bg-cyan-300/25 text-cyan-50 border-cyan-200/45',
  },
  refunding: {
    title: 'Final Phase · Returning Unused Collateral',
    subtitle: 'All rounds completed! Smart contract unlocks and returns remaining collateral to every member.',
    badgeClass: 'bg-indigo-300/25 text-indigo-100 border-indigo-200/45',
  },
  completed: {
    title: 'Cycle Complete · Zero Uncovered Loss',
    subtitle: 'Every member received the pot once, unused collateral returned, and Mirror Node reputation scores upgraded.',
    badgeClass: 'bg-emerald-400/30 text-emerald-50 border-emerald-300/55',
  },
};

function roundMad(value: number): number {
  return Math.round(value * 100) / 100;
}

function calcCollateral(position: number, count: number, amount: number, tier: ReputationTier): number {
  const base = Math.max(0, count - position) * amount;
  const mult = REPUTATION_TIERS[tier].collateralMultiplier;
  return roundMad(base * mult);
}

function buildInitialMembers(
  count: number,
  amount: number,
  options?: {
    customTiers?: Record<number, ReputationTier>;
    customSkipBySeat?: Record<number, number | null>;
    orderIndices?: number[];
  }
): SimMember[] {
  const indices = options?.orderIndices ?? Array.from({ length: count }, (_, i) => i);
  return Array.from({ length: count }, (_, seatIdx) => {
    const position = seatIdx + 1;
    const poolMember = MEMBER_POOL[indices[seatIdx] % MEMBER_POOL.length];
    const tier = options?.customTiers?.[position] ?? poolMember.defaultTier;
    const skipRound = options?.customSkipBySeat?.[position] ?? null;
    const req = calcCollateral(position, count, amount, tier);
    return {
      id: poolMember.id,
      name: poolMember.name,
      shortName: poolMember.shortName,
      accountId: poolMember.accountId,
      position,
      tier,
      skipRound,
      collateralRequired: req,
      collateralRemaining: req,
      paidThisRound: false,
      slashedThisRound: false,
      hasReceivedPot: false,
      totalContributed: 0,
      totalSlashed: 0,
    };
  });
}

// Compute orbital coordinates inside a 700 x 520 arena
function getSeatCoords(index: number, total: number) {
  const cx = 350;
  const cy = 260;
  const rx = total >= 9 ? 255 : 238;
  const ry = total >= 9 ? 196 : 184;
  // Start at top (-90 deg) and sweep clockwise
  const angle = -Math.PI / 2 + (index / total) * Math.PI * 2;
  return {
    x: cx + Math.cos(angle) * rx,
    y: cy + Math.sin(angle) * ry,
    angle,
  };
}

export const LiveDaretSimulator: React.FC<LiveDaretSimulatorProps> = ({ externalTrigger }) => {
  const [memberCount, setMemberCount] = useState<number>(6);
  const [contribution, setContribution] = useState<number>(500);
  const [period, setPeriod] = useState<PeriodOption>('Monthly');
  const [protocolFeePct, setProtocolFeePct] = useState<number>(0.5);
  const [insurancePct, setInsurancePct] = useState<number>(1);
  const [speed, setSpeed] = useState<1 | 2>(1);

  const [members, setMembers] = useState<SimMember[]>(() => buildInitialMembers(6, 500));
  const [selectedSeat, setSelectedSeat] = useState<number>(1);

  const [phase, setPhase] = useState<SimPhase>('idle');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [escrowPot, setEscrowPot] = useState<number>(0);
  const [vaultCollateral, setVaultCollateral] = useState<number>(0);
  const [protocolTreasury, setProtocolTreasury] = useState<number>(0);
  const [insurancePool, setInsurancePool] = useState<number>(0);
  const [bannerAlert, setBannerAlert] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hcs' | 'math' | 'fees'>('hcs');
  const [isShuffling, setIsShuffling] = useState<boolean>(false);

  const seqRef = useRef<number>(101);
  const [logs, setLogs] = useState<HcsLogEntry[]>(() => [
    {
      seq: 100,
      timestamp: '00:00.0',
      round: 0,
      type: 'CIRCLE_CREATED',
      summary: 'Circle deployed · 6 members · 500 MAD/round · Escrow contract armed',
      actor: 'Factory 0.0.880102',
      feeUsd: '$0.0005',
    },
  ]);

  const appendLog = useCallback(
    (entry: Omit<HcsLogEntry, 'seq' | 'timestamp'>) => {
      seqRef.current += 1;
      const now = new Date();
      const ts = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${Math.floor(now.getMilliseconds() / 100)}`;
      setLogs((prev) => [{ ...entry, seq: seqRef.current, timestamp: ts }, ...prev].slice(0, 60));
    },
    []
  );

  // Reset circle cleanly when configuration changes
  const resetSimulation = useCallback(
    (
      nextCount = memberCount,
      nextAmount = contribution,
      opts?: {
        customTiers?: Record<number, ReputationTier>;
        customSkipBySeat?: Record<number, number | null>;
        orderIndices?: number[];
        banner?: string | null;
        customLabel?: string;
      }
    ) => {
      setIsPlaying(false);
      setPhase('idle');
      setCurrentRound(1);
      setEscrowPot(0);
      setVaultCollateral(0);
      setProtocolTreasury(0);
      setInsurancePool(0);
      setBannerAlert(opts?.banner ?? null);
      const nextMembers = buildInitialMembers(nextCount, nextAmount, opts);
      setMembers(nextMembers);
      setSelectedSeat((prev) => Math.min(prev, nextCount));
      seqRef.current += 1;
      setLogs([
        {
          seq: seqRef.current,
          timestamp: '00:00.0',
          round: 0,
          type: 'CIRCLE_CREATED',
          summary:
            opts?.customLabel ??
            `Circle ready · ${nextCount} members × ${nextAmount} MAD (${nextCount * nextAmount} MAD pot)`,
          actor: 'Escrow 0.0.884210',
          feeUsd: '$0.0005',
        },
      ]);
    },
    [memberCount, contribution]
  );

  const loadPreset = useCallback(
    (preset: 'poc-demo' | 'micro' | 'classic', autoStart = false) => {
      if (preset === 'poc-demo') {
        setMemberCount(4);
        setContribution(250);
        setPeriod('2 min (PoC)');
        setProtocolFeePct(0.5);
        setInsurancePct(1);
        resetSimulation(4, 250, {
          customTiers: { 1: 'New', 2: 'New', 3: 'Silver', 4: 'Gold' },
          customSkipBySeat: { 1: 3 },
          banner:
            'Official Hackathon Demo Loaded: Seat #1 (Salma, New) receives Pot #1 then skips Round 3 — watch Hedera slash her collateral while Seat #3 still gets paid 1,000 MAD!',
          customLabel:
            'Hackathon PoC Preset · 4 members × 250 MAD · 2-min period · Seat #1 skips Round 3',
        });
        setSelectedSeat(1);
        if (autoStart) {
          setTimeout(() => setIsPlaying(true), 120);
        }
      } else if (preset === 'micro') {
        setMemberCount(6);
        setContribution(20);
        setPeriod('Weekly');
        setProtocolFeePct(0.5);
        setInsurancePct(1);
        resetSimulation(6, 20, {
          banner:
            'Campus Micro-Daret: 20 MAD weekly contributions stay >99.9% intact thanks to Hedera’s ~$0.0001 fixed fee.',
          customLabel: 'Campus Micro-Daret · 6 students × 20 MAD/week',
        });
      } else {
        setMemberCount(10);
        setContribution(500);
        setPeriod('Monthly');
        setProtocolFeePct(1);
        setInsurancePct(1);
        resetSimulation(10, 500, {
          banner:
            'Classic Maghreb Daret: 10 friends × 500 MAD/month = 5,000 MAD monthly pot (50,000 MAD total cycle).',
          customLabel: 'Classic Maghreb Circle · 10 members × 500 MAD/month',
        });
      }
    },
    [resetSimulation]
  );

  // Handle Hero "Watch 4-Member Slash Demo" external trigger
  const lastTriggerKeyRef = useRef<number>(0);
  useEffect(() => {
    if (externalTrigger && externalTrigger.key !== lastTriggerKeyRef.current) {
      lastTriggerKeyRef.current = externalTrigger.key;
      loadPreset(externalTrigger.preset, true);
    }
  }, [externalTrigger, loadPreset]);

  // Update member count slider
  const handleMemberCountChange = (next: number) => {
    const clamped = Math.max(3, Math.min(12, next));
    setMemberCount(clamped);
    resetSimulation(clamped, contribution);
  };

  // Update contribution amount
  const handleContributionChange = (next: number) => {
    const clamped = Math.max(20, Math.min(2000, next));
    setContribution(clamped);
    resetSimulation(memberCount, clamped);
  };

  // Fair On-Chain PRNG Tirage Draw
  const handlePrngTirage = () => {
    if (phase !== 'idle') {
      resetSimulation(memberCount, contribution);
    }
    setIsShuffling(true);
    const poolIndices = Array.from({ length: memberCount }, (_, i) => i);
    for (let i = poolIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [poolIndices[i], poolIndices[j]] = [poolIndices[j], poolIndices[i]];
    }
    setTimeout(() => {
      const shuffled = buildInitialMembers(memberCount, contribution, {
        orderIndices: poolIndices,
      });
      setMembers(shuffled);
      setIsShuffling(false);
      setBannerAlert(
        `Hedera Native PRNG Tirage completed: ${shuffled[0].shortName} drew Seat #1, ${shuffled[memberCount - 1].shortName} drew Seat #${memberCount} (Pure Saver · 0 MAD collateral).`
      );
      appendLog({
        round: 0,
        type: 'PRNG_TIRAGE',
        summary: `Native PRNG assigned positions 1..${memberCount} fairly on-chain`,
        actor: 'Hedera PRNG 0x169',
        feeUsd: '$0.0001',
      });
    }, 520);
  };

  // Update a specific member's Reputation Tier or Skip Round toggle
  const handleMemberTierChange = (seat: number, tier: ReputationTier) => {
    if (phase !== 'idle') return;
    setMembers((prev) =>
      prev.map((m) => {
        if (m.position !== seat) return m;
        const req = calcCollateral(m.position, memberCount, contribution, tier);
        return {
          ...m,
          tier,
          collateralRequired: req,
          collateralRemaining: req,
        };
      })
    );
  };

  const handleToggleSkipNext = (seat: number) => {
    const targetRound = phase === 'idle' ? Math.min(memberCount, Math.max(2, seat + 1)) : currentRound;
    setMembers((prev) =>
      prev.map((m) => {
        if (m.position !== seat) return m;
        const nextSkip = m.skipRound === targetRound ? null : targetRound;
        return { ...m, skipRound: nextSkip };
      })
    );
  };

  // Step state machine forward by one discrete phase
  const stepForward = useCallback(() => {
    if (phase === 'idle') {
      const totalLock = roundMad(
        members.reduce((sum, m) => sum + m.collateralRequired, 0)
      );
      setPhase('locking');
      setVaultCollateral(totalLock);
      setBannerAlert(
        `All ${memberCount} members locked ${totalLock.toLocaleString()} MAD combined collateral into Hedera EVM Escrow.`
      );
      appendLog({
        round: 1,
        type: 'COLLATERAL_LOCKED',
        summary: `${memberCount} members locked ${totalLock.toLocaleString()} MAD collateral (scaled by tier)`,
        actor: 'Escrow Vault',
        amountMad: totalLock,
        feeUsd: '$0.0002',
      });
      return;
    }

    if (phase === 'locking' || phase === 'round_settled') {
      const roundToRun = phase === 'locking' ? 1 : currentRound + 1;
      if (roundToRun > memberCount) {
        const totalRefund = roundMad(
          members.reduce((sum, m) => sum + m.collateralRemaining, 0)
        );
        setPhase('refunding');
        setVaultCollateral(0);
        setBannerAlert(
          `Cycle finished! ${totalRefund.toLocaleString()} MAD unused collateral unlocked and returned to compliant members.`
        );
        appendLog({
          round: memberCount,
          type: 'COLLATERAL_REFUNDED',
          summary: `Returned ${totalRefund.toLocaleString()} MAD unused collateral to members`,
          actor: 'Escrow Vault',
          amountMad: totalRefund,
          feeUsd: '$0.0002',
        });
        return;
      }

      setCurrentRound(roundToRun);
      let collected = 0;
      let feeCollected = 0;
      let insCollected = 0;
      const missedMembers: SimMember[] = [];

      const updated = members.map((m) => {
        const isSkipping = m.skipRound === roundToRun;
        if (isSkipping) {
          missedMembers.push(m);
          return {
            ...m,
            paidThisRound: false,
            slashedThisRound: false,
          };
        }
        collected += contribution;
        feeCollected += roundMad((contribution * protocolFeePct) / 100);
        insCollected += roundMad((contribution * insurancePct) / 100);
        return {
          ...m,
          paidThisRound: true,
          slashedThisRound: false,
          totalContributed: roundMad(m.totalContributed + contribution),
        };
      });

      setMembers(updated);
      setEscrowPot(roundMad(collected));
      setProtocolTreasury((p) => roundMad(p + feeCollected));
      setInsurancePool((p) => roundMad(p + insCollected));
      setPhase('contributing');

      if (missedMembers.length > 0) {
        const names = missedMembers.map((x) => `${x.shortName} (#${x.position})`).join(', ');
        setBannerAlert(
          `Round ${roundToRun}: ${memberCount - missedMembers.length}/${memberCount} paid. ${names} missed payment — grace period triggered!`
        );
        appendLog({
          round: roundToRun,
          type: 'GRACE_MISSED',
          summary: `${names} missed ${contribution} MAD contribution · auto-slash queued`,
          actor: missedMembers[0].accountId,
          amountMad: contribution * missedMembers.length,
          feeUsd: '$0.0001',
        });
      } else {
        setBannerAlert(
          `Round ${roundToRun}: All ${memberCount} members contributed ${contribution} MAD (${roundMad(collected).toLocaleString()} MAD in pot).`
        );
        appendLog({
          round: roundToRun,
          type: 'CONTRIBUTION',
          summary: `${memberCount} contributions received (${roundMad(collected).toLocaleString()} MAD pot)`,
          actor: `${memberCount} Members`,
          amountMad: roundMad(collected),
          feeUsd: `$${(memberCount * 0.0001).toFixed(4)}`,
        });
      }
      return;
    }

    if (phase === 'contributing') {
      const missed = members.filter((m) => !m.paidThisRound);
      if (missed.length > 0) {
        let slashedTotal = 0;
        let vaultDrop = 0;
        let insUsed = 0;

        const nextMembers = members.map((m) => {
          if (m.paidThisRound) return m;
          const fromCollateral = Math.min(contribution, m.collateralRemaining);
          const remainingGap = roundMad(contribution - fromCollateral);
          slashedTotal += contribution;
          vaultDrop += fromCollateral;
          insUsed += remainingGap;
          return {
            ...m,
            slashedThisRound: true,
            collateralRemaining: roundMad(m.collateralRemaining - fromCollateral),
            totalSlashed: roundMad(m.totalSlashed + fromCollateral),
            skipRound: null,
          };
        });

        setMembers(nextMembers);
        setVaultCollateral((v) => roundMad(Math.max(0, v - vaultDrop)));
        setInsurancePool((ins) => roundMad(Math.max(0, ins - insUsed)));
        setEscrowPot((pot) => roundMad(pot + slashedTotal));
        setPhase('slashing');

        const recipient = nextMembers.find((m) => m.position === currentRound);
        setBannerAlert(
          `Auto-Slash Executed! ${vaultDrop.toLocaleString()} MAD pulled from collateral${
            insUsed > 0 ? ` (+${insUsed} MAD from Insurance Pool)` : ''
          }. ${recipient?.shortName ?? `Seat #${currentRound}`} still receives 100% of the pot!`
        );
        appendLog({
          round: currentRound,
          type: 'COLLATERAL_SLASHED',
          summary: `Slashed ${vaultDrop} MAD collateral to cover shortfall · Pot restored to 100%`,
          actor: missed.map((x) => x.shortName).join(', '),
          amountMad: vaultDrop,
          feeUsd: '$0.0001',
        });
        return;
      }

      // Otherwise go straight to paying recipient
      const fullPot = roundMad(memberCount * contribution);
      const recipient = members.find((m) => m.position === currentRound);
      setMembers((prev) =>
        prev.map((m) => (m.position === currentRound ? { ...m, hasReceivedPot: true } : m))
      );
      setEscrowPot(0);
      setPhase('paying');
      setBannerAlert(
        `Round ${currentRound} Closed: ${fullPot.toLocaleString()} MAD released directly to ${recipient?.shortName} (Seat #${currentRound}) in 3.4s!`
      );
      appendLog({
        round: currentRound,
        type: 'POT_PAID',
        summary: `Paid ${fullPot.toLocaleString()} MAD pot to ${recipient?.shortName} (Seat #${currentRound})`,
        actor: recipient?.accountId ?? `Seat #${currentRound}`,
        amountMad: fullPot,
        feeUsd: '$0.0001',
      });
      return;
    }

    if (phase === 'slashing') {
      const fullPot = roundMad(memberCount * contribution);
      const recipient = members.find((m) => m.position === currentRound);
      setMembers((prev) =>
        prev.map((m) => (m.position === currentRound ? { ...m, hasReceivedPot: true } : m))
      );
      setEscrowPot(0);
      setPhase('paying');
      setBannerAlert(
        `Protected Payout Delivered! ${recipient?.shortName} (Seat #${currentRound}) received full ${fullPot.toLocaleString()} MAD despite the missed payment.`
      );
      appendLog({
        round: currentRound,
        type: 'POT_PAID',
        summary: `Paid full ${fullPot.toLocaleString()} MAD pot to ${recipient?.shortName} (covered by slash)`,
        actor: recipient?.accountId ?? `Seat #${currentRound}`,
        amountMad: fullPot,
        feeUsd: '$0.0001',
      });
      return;
    }

    if (phase === 'paying') {
      if (currentRound >= memberCount) {
        const totalRefund = roundMad(
          members.reduce((sum, m) => sum + m.collateralRemaining, 0)
        );
        setPhase('refunding');
        setVaultCollateral(0);
        setBannerAlert(
          `All ${memberCount} rounds paid! Returning ${totalRefund.toLocaleString()} MAD unused collateral to members.`
        );
        appendLog({
          round: currentRound,
          type: 'COLLATERAL_REFUNDED',
          summary: `Cycle complete · returned ${totalRefund.toLocaleString()} MAD remaining collateral`,
          actor: 'Escrow Vault',
          amountMad: totalRefund,
          feeUsd: '$0.0002',
        });
      } else {
        setPhase('round_settled');
      }
      return;
    }

    if (phase === 'refunding') {
      setMembers((prev) => prev.map((m) => ({ ...m, collateralRemaining: 0 })));
      setPhase('completed');
      setIsPlaying(false);
      setBannerAlert(
        `Cycle Complete! ${(memberCount * memberCount * contribution).toLocaleString()} MAD circulated securely with zero organizer risk.`
      );
      return;
    }
  }, [
    phase,
    members,
    memberCount,
    currentRound,
    contribution,
    protocolFeePct,
    insurancePct,
    appendLog,
  ]);

  // Auto-play timer when isPlaying === true
  useEffect(() => {
    if (!isPlaying) return;
    if (phase === 'completed') {
      setIsPlaying(false);
      return;
    }
    const baseMs =
      phase === 'idle'
        ? 300
        : phase === 'round_settled'
          ? 900
          : phase === 'slashing' || phase === 'paying'
            ? 1500
            : 1250;
    const timer = setTimeout(() => {
      stepForward();
    }, baseMs / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, phase, speed, stepForward]);

  const potTotal = memberCount * contribution;
  const cycleVolume = memberCount * potTotal;
  const totalInitialCollateral = useMemo(
    () => roundMad(members.reduce((sum, m) => sum + m.collateralRequired, 0)),
    [members]
  );
  const selectedMember = members.find((m) => m.position === selectedSeat) ?? members[0];
  const phaseMeta = PHASE_LABELS[phase];

  // Hedera vs High-Gas fee comparison numbers
  const totalTxCount = memberCount * (memberCount + 1) + 2;
  const hederaTotalUsd = totalTxCount * 0.0001;
  const hederaTotalMad = hederaTotalUsd * 10; // ~10 MAD/USD illustrative conversion

  return (
    <section id="simulator" className="relative mx-auto max-w-7xl px-4 sm:px-6 py-14 lg:py-20">
      {/* Section Header */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full glass-pill px-3 py-1 text-xs font-semibold text-cyan-100">
            <Zap className="h-3.5 w-3.5 text-cyan-200" />
            <span>INTERACTIVE FULL-ON EXAMPLE</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Build Your Circle. Watch Every Dirham Move.
          </h2>
          <p className="text-sky-100/90 text-sm sm:text-base leading-relaxed">
            Choose the number of people, contribution in MAD, reputation tiers, and even force a
            member to skip a payment—then watch Hedera’s smart contract escrow, collateral
            slashing, and HCS audit log execute in real time.
          </p>
        </div>

        {/* Quick Scenario Presets */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => loadPreset('poc-demo', true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white text-[#06297a] px-3.5 py-2 text-xs font-bold shadow-[0_6px_22px_rgba(255,255,255,0.28)] hover:bg-cyan-50 transition-all cursor-pointer"
          >
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span>Official PoC Slash Demo (4 × 250)</span>
          </button>
          <button
            type="button"
            onClick={() => loadPreset('micro', false)}
            className="inline-flex items-center gap-1.5 rounded-xl glass-pill px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/25 transition-all cursor-pointer"
          >
            <span>20 MAD Micro-Circle (6)</span>
          </button>
          <button
            type="button"
            onClick={() => loadPreset('classic', false)}
            className="inline-flex items-center gap-1.5 rounded-xl glass-pill px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/25 transition-all cursor-pointer"
          >
            <span>Classic Maghreb (10 × 500)</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Interactive Cockpit */}
      <div className="glass-panel rounded-3xl p-4 sm:p-6 lg:p-7 space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* LEFT DECK: Configuration Controls */}
          <div className="xl:col-span-4 space-y-4">
            <div className="glass-panel-deep rounded-2xl p-4 sm:p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-cyan-200" />
                  <span>Circle Parameters</span>
                </h3>
                <span className="text-[11px] font-mono-tabular text-cyan-200">
                  {phase === 'idle' ? 'Editable' : 'Locked mid-cycle'}
                </span>
              </div>

              {/* Number of Persons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sky-100/85 font-medium">Number of Persons (N)</span>
                  <span className="font-mono-tabular font-bold text-white bg-white/15 px-2 py-0.5 rounded-lg">
                    {memberCount} members
                  </span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={12}
                  step={1}
                  value={memberCount}
                  onChange={(e) => handleMemberCountChange(Number(e.target.value))}
                  aria-label="Number of persons in circle"
                  className="glass-slider w-full"
                />
                <div className="flex justify-between text-[10px] font-mono-tabular text-sky-200/70">
                  <span>3 (Min)</span>
                  <span>6 (Campus)</span>
                  <span>10 (Classic)</span>
                  <span>12 (Max)</span>
                </div>
              </div>

              {/* Contribution Money */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sky-100/85 font-medium">Contribution per Round (C)</span>
                  <span className="font-mono-tabular font-bold text-cyan-100 bg-cyan-400/20 border border-cyan-300/35 px-2 py-0.5 rounded-lg">
                    {contribution.toLocaleString()} MAD
                  </span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={2000}
                  step={10}
                  value={contribution}
                  onChange={(e) => handleContributionChange(Number(e.target.value))}
                  aria-label="Contribution amount in MAD"
                  className="glass-slider w-full"
                />
                <div className="flex flex-wrap gap-1.5">
                  {CONTRIBUTION_PRESETS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleContributionChange(val)}
                      className={`rounded-lg px-2 py-1 text-[11px] font-mono-tabular font-semibold transition-all cursor-pointer ${
                        contribution === val
                          ? 'bg-white text-[#06297a]'
                          : 'bg-white/10 text-sky-100 hover:bg-white/20'
                      }`}
                    >
                      {val} MAD
                    </button>
                  ))}
                </div>
              </div>

              {/* Period & Fee Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-sky-100/80 font-medium block">
                    Round Period
                  </label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as PeriodOption)}
                    className="w-full rounded-xl bg-white/12 border border-white/25 px-2.5 py-2 text-xs text-white outline-none focus:border-cyan-200"
                  >
                    <option value="2 min (PoC)" className="bg-[#06297a]">2 min (PoC)</option>
                    <option value="Weekly" className="bg-[#06297a]">Weekly</option>
                    <option value="Monthly" className="bg-[#06297a]">Monthly</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-sky-100/80 font-medium block">
                    Protocol Fee / Insurance
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setProtocolFeePct((v) => (v === 0 ? 0.5 : v === 0.5 ? 1 : 0))
                      }
                      className="flex-1 rounded-xl bg-white/12 border border-white/25 py-2 text-[11px] font-mono-tabular text-white hover:bg-white/20 cursor-pointer"
                      title="Cycle Protocol Fee: 0%, 0.5%, or 1%"
                    >
                      Fee {protocolFeePct}%
                    </button>
                    <button
                      type="button"
                      onClick={() => setInsurancePct((v) => (v === 0 ? 1 : v === 1 ? 2 : 0))}
                      className="flex-1 rounded-xl bg-white/12 border border-white/25 py-2 text-[11px] font-mono-tabular text-cyan-100 hover:bg-white/20 cursor-pointer"
                      title="Optional Insurance Pool: 0%, 1%, or 2%"
                    >
                      Ins {insurancePct}%
                    </button>
                  </div>
                </div>
              </div>

              {/* Pot & Cycle Summary Strip */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/15 text-center">
                <div className="rounded-xl bg-white/8 p-2">
                  <div className="text-[10px] text-sky-200/75">Pot / Round</div>
                  <div className="text-sm font-bold font-mono-tabular text-white">
                    {potTotal.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-cyan-200/80">MAD</div>
                </div>
                <div className="rounded-xl bg-white/8 p-2">
                  <div className="text-[10px] text-sky-200/75">Full Cycle</div>
                  <div className="text-sm font-bold font-mono-tabular text-cyan-100">
                    {cycleVolume.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-cyan-200/80">MAD</div>
                </div>
                <div className="rounded-xl bg-white/8 p-2">
                  <div className="text-[10px] text-sky-200/75">Total Collateral</div>
                  <div className="text-sm font-bold font-mono-tabular text-white">
                    {totalInitialCollateral.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-cyan-200/80">MAD locked</div>
                </div>
              </div>

              {/* Fair On-Chain PRNG Button */}
              <button
                type="button"
                onClick={handlePrngTirage}
                disabled={isShuffling}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl glass-pill py-2.5 px-3 text-xs font-semibold text-white hover:bg-white/25 transition-all cursor-pointer disabled:opacity-60"
              >
                <Dices className={`h-4 w-4 text-cyan-200 ${isShuffling ? 'animate-spin' : ''}`} />
                <span>{isShuffling ? 'Running Hedera PRNG Tirage…' : 'Shuffle Seats via Hedera PRNG (Tirage)'}</span>
              </button>
            </div>

            {/* Selected Seat Inspector & Fault Injection */}
            {selectedMember && (
              <div className="glass-panel-deep rounded-2xl p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-cyan-200/85">
                      Inspecting Seat #{selectedMember.position}
                    </div>
                    <div className="font-display text-base font-bold text-white">
                      {selectedMember.name}{' '}
                      <span className="text-xs font-mono-tabular font-normal text-sky-200/75">
                        ({selectedMember.accountId})
                      </span>
                    </div>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                      REPUTATION_TIERS[selectedMember.tier].pillBg
                    }`}
                  >
                    {selectedMember.tier}
                  </span>
                </div>

                <div className="text-xs text-sky-100/85 flex items-center justify-between bg-white/8 rounded-xl px-3 py-2">
                  <span>
                    Base ({memberCount} − {selectedMember.position}) × {contribution} MAD ×{' '}
                    {Math.round(REPUTATION_TIERS[selectedMember.tier].collateralMultiplier * 100)}%
                  </span>
                  <strong className="font-mono-tabular text-white">
                    {selectedMember.collateralRequired.toLocaleString()} MAD
                  </strong>
                </div>

                {/* Tier Selector */}
                <div className="space-y-1.5">
                  <div className="text-[11px] text-sky-200/80 flex items-center justify-between">
                    <span>Change Reputation Tier (when idle)</span>
                    <span className="font-mono-tabular text-cyan-200">HTS Badge</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {(['New', 'Bronze', 'Silver', 'Gold', 'Defaulter'] as ReputationTier[]).map(
                      (tier) => (
                        <button
                          key={tier}
                          type="button"
                          disabled={phase !== 'idle'}
                          onClick={() => handleMemberTierChange(selectedMember.position, tier)}
                          className={`rounded-lg py-1.5 text-[10px] font-semibold transition-all cursor-pointer disabled:opacity-45 ${
                            selectedMember.tier === tier
                              ? 'bg-white text-[#06297a]'
                              : 'bg-white/10 text-sky-100 hover:bg-white/20'
                          }`}
                        >
                          {tier}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Force Missed Payment Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleSkipNext(selectedMember.position)}
                  disabled={phase === 'completed'}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold border transition-all cursor-pointer disabled:opacity-50 ${
                    selectedMember.skipRound
                      ? 'bg-amber-400/25 border-amber-300/60 text-amber-100'
                      : 'bg-white/10 border-white/25 text-white hover:bg-amber-400/20 hover:border-amber-300/45'
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-200" />
                  <span>
                    {selectedMember.skipRound
                      ? `Scheduled to Skip Round ${selectedMember.skipRound} (Click to Cancel)`
                      : `Simulate Missed Payment for ${selectedMember.shortName}`}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* CENTER STAGE: Animated Orbital Escrow Flow */}
          <div className="xl:col-span-8 space-y-4">
            {/* Phase Status & Transport Controls Bar */}
            <div className="glass-panel-deep rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${phaseMeta.badgeClass}`}
                  >
                    {phase === 'idle'
                      ? 'Standby'
                      : phase === 'completed'
                        ? 'Settled'
                        : `Round ${currentRound} of ${memberCount}`}
                  </span>
                  <span className="text-xs font-mono-tabular text-cyan-200/85">
                    {period} · Pot {potTotal.toLocaleString()} MAD
                  </span>
                </div>
                <div className="font-display text-base sm:text-lg font-bold text-white">
                  {phaseMeta.title}
                </div>
                <p className="text-xs text-sky-100/80">{phaseMeta.subtitle}</p>
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
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white text-[#06297a] px-4 py-2 text-xs font-bold shadow-[0_6px_20px_rgba(255,255,255,0.28)] hover:bg-cyan-50 transition-all cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>{phase === 'completed' ? 'Replay' : 'Play Flow'}</span>
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
                  className="inline-flex items-center gap-1.5 rounded-xl glass-pill px-3 py-2 text-xs font-semibold text-white hover:bg-white/25 transition-all cursor-pointer disabled:opacity-45"
                >
                  <StepForward className="h-3.5 w-3.5" />
                  <span>Step</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))}
                  className="inline-flex items-center gap-1 rounded-xl glass-pill px-2.5 py-2 text-xs font-mono-tabular font-semibold text-cyan-100 hover:bg-white/25 transition-all cursor-pointer"
                  title="Toggle animation speed"
                >
                  <FastForward className="h-3.5 w-3.5" />
                  <span>{speed}×</span>
                </button>

                <button
                  type="button"
                  onClick={() => resetSimulation(memberCount, contribution)}
                  aria-label="Reset simulation"
                  className="inline-flex items-center justify-center rounded-xl glass-pill p-2 text-sky-100 hover:text-white hover:bg-white/25 transition-all cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Live Action Alert Banner */}
            {bannerAlert && (
              <motion.div
                key={bannerAlert}
                initial={{ opacity: 0.55, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium border flex items-center gap-2.5 ${
                  phase === 'slashing' || bannerAlert.includes('missed')
                    ? 'bg-amber-400/20 border-amber-300/50 text-amber-50'
                    : phase === 'completed' || phase === 'paying'
                      ? 'bg-emerald-400/18 border-emerald-300/45 text-emerald-50'
                      : 'glass-panel-luminous text-white'
                }`}
              >
                <Info className="h-4 w-4 shrink-0 text-cyan-200" />
                <span>{bannerAlert}</span>
              </motion.div>
            )}

            {/* ORBITAL VISUAL STAGE */}
            <div className="relative glass-panel-deep rounded-3xl overflow-hidden border border-white/25">
              {/* Atmospheric core glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.22) 0%, rgba(15, 58, 150, 0.08) 48%, transparent 75%)',
                }}
              />

              {/* Desktop / Tablet Orbital Stage (SVG paths + positioned glass nodes) */}
              <div className="hidden sm:block relative w-full aspect-[700/520] max-h-[540px] mx-auto">
                <svg
                  viewBox="0 0 700 520"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                >
                  <defs>
                    <radialGradient id="orbCoreGrad" cx="38%" cy="32%" r="70%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
                      <stop offset="32%" stopColor="rgba(125,211,252,0.72)" />
                      <stop offset="72%" stopColor="rgba(29,98,224,0.78)" />
                      <stop offset="100%" stopColor="rgba(103,232,249,0.92)" />
                    </radialGradient>
                    <filter id="glowSoft" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Outer Orbit Ring */}
                  <ellipse
                    cx="350"
                    cy="260"
                    rx={memberCount >= 9 ? 255 : 238}
                    ry={memberCount >= 9 ? 196 : 184}
                    fill="none"
                    stroke="rgba(186, 230, 253, 0.22)"
                    strokeWidth="1.5"
                    strokeDasharray="6 6"
                  />

                  {/* Connecting spokes + Animated Money Particles */}
                  {members.map((m, idx) => {
                    const { x, y } = getSeatCoords(idx, memberCount);
                    const isRecipient = m.position === currentRound && phase !== 'idle';
                    const isSlashed = m.slashedThisRound && phase === 'slashing';
                    const isContributing = m.paidThisRound && phase === 'contributing';
                    const isLocking = m.collateralRequired > 0 && phase === 'locking';
                    const isPaying = isRecipient && phase === 'paying';
                    const isRefunding = phase === 'refunding' && m.collateralRemaining > 0;

                    // Midpoint offset for graceful curved flow path
                    const midX = (x + 350) / 2 + (260 - y) * 0.14;
                    const midY = (y + 260) / 2 + (x - 350) * 0.14;

                    return (
                      <g key={m.id}>
                        <path
                          d={`M ${x} ${y} Q ${midX} ${midY} 350 260`}
                          fill="none"
                          stroke={
                            isSlashed
                              ? 'rgba(251, 191, 36, 0.8)'
                              : isPaying
                                ? 'rgba(110, 231, 183, 0.9)'
                                : isRecipient
                                  ? 'rgba(125, 211, 252, 0.6)'
                                  : 'rgba(255, 255, 255, 0.14)'
                          }
                          strokeWidth={isPaying || isSlashed ? 2.6 : 1.25}
                        />

                        {/* Locking Collateral Particles (Member -> Center) */}
                        {isLocking && (
                          <motion.circle
                            key={`lock-${m.id}-${currentRound}`}
                            r={5}
                            fill="#93c5fd"
                            filter="url(#glowSoft)"
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

                        {/* Round Contribution Particles (Member -> Center Pot) */}
                        {isContributing && (
                          <motion.circle
                            key={`contrib-${m.id}-${currentRound}`}
                            r={5.5}
                            fill="#67e8f9"
                            filter="url(#glowSoft)"
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

                        {/* Auto-Slash Rescue Beam (Defaulter Vault -> Center Pot) */}
                        {isSlashed && (
                          <motion.circle
                            key={`slash-${m.id}-${currentRound}`}
                            r={7}
                            fill="#fbbf24"
                            filter="url(#glowSoft)"
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

                        {/* Pot Payout Comet (Center Pot -> Recipient!) */}
                        {isPaying && (
                          <>
                            <motion.circle
                              key={`pay1-${m.id}-${currentRound}`}
                              r={9}
                              fill="#ffffff"
                              filter="url(#glowSoft)"
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
                            <motion.circle
                              key={`pay2-${m.id}-${currentRound}`}
                              r={6}
                              fill="#5eead4"
                              filter="url(#glowSoft)"
                              initial={{ cx: 350, cy: 260, opacity: 0 }}
                              animate={{
                                cx: [350, midX, x],
                                cy: [260, midY, y],
                                opacity: [0, 1, 1, 0],
                              }}
                              transition={{
                                duration: 0.95 / speed,
                                repeat: Infinity,
                                delay: 0.22 / speed,
                                ease: 'easeOut',
                              }}
                            />
                          </>
                        )}

                        {/* Refund Unused Collateral (Center -> Compliant Members) */}
                        {isRefunding && (
                          <motion.circle
                            key={`refund-${m.id}`}
                            r={5}
                            fill="#a5b4fc"
                            filter="url(#glowSoft)"
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

                  {/* Central Liquid-Glass Escrow Core Visual */}
                  <circle
                    cx="350"
                    cy="260"
                    r="80"
                    fill="url(#orbCoreGrad)"
                    opacity="0.28"
                    filter="url(#glowSoft)"
                  />
                </svg>

                {/* Central Interactive Escrow Orb Readout */}
                <div
                  style={{ left: '50%', top: '50%' }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-[176px] h-[176px] rounded-full glass-panel-luminous flex flex-col items-center justify-center text-center p-3 shadow-[0_0_50px_rgba(56,189,248,0.35)]"
                >
                  <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-cyan-100">
                    Hedera Escrow
                  </div>
                  <div className="font-display text-2xl font-extrabold font-mono-tabular text-white leading-tight mt-0.5">
                    {escrowPot.toLocaleString()}
                    <span className="text-xs font-semibold text-cyan-200 ml-1">MAD</span>
                  </div>
                  <div className="text-[10px] text-sky-100/80">Current Round Pot</div>
                  <div className="mt-2 w-full border-t border-white/20 pt-1.5 flex items-center justify-around text-[10px] font-mono-tabular">
                    <div>
                      <div className="text-sky-200/75">Vault</div>
                      <div className="font-bold text-white">{vaultCollateral.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sky-200/75">Ins+Fee</div>
                      <div className="font-bold text-cyan-200">
                        {roundMad(insurancePool + protocolTreasury).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Member Seat Glass Nodes Around the Ring */}
                {members.map((m, idx) => {
                  const { x, y } = getSeatCoords(idx, memberCount);
                  const leftPct = (x / 700) * 100;
                  const topPct = (y / 520) * 100;
                  const isRecipient = m.position === currentRound && phase !== 'idle' && phase !== 'completed';
                  const isSelected = m.position === selectedSeat;
                  const isSlashedNow = m.slashedThisRound && phase === 'slashing';
                  const isMissedWait = !m.paidThisRound && phase === 'contributing' && m.skipRound === currentRound;

                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedSeat(m.position)}
                      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-[114px] rounded-2xl p-2 text-left transition-all cursor-pointer border ${
                        isSlashedNow || isMissedWait
                          ? 'bg-amber-950/80 border-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.45)] scale-105 z-20'
                          : isRecipient && phase === 'paying'
                            ? 'bg-emerald-950/75 border-emerald-300 shadow-[0_0_26px_rgba(110,231,183,0.55)] scale-105 z-20'
                            : isSelected
                              ? 'glass-panel-luminous border-white scale-105 z-20'
                              : 'glass-panel-deep border-white/25 hover:border-cyan-200/65 z-10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono-tabular text-[10px] font-bold text-cyan-200">
                          #{m.position}
                        </span>
                        <span
                          className={`rounded-md border px-1.5 py-0.2 text-[9px] font-semibold ${
                            REPUTATION_TIERS[m.tier].pillBg
                          }`}
                        >
                          {m.tier}
                        </span>
                      </div>

                      <div className="mt-0.5 flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{m.shortName}</span>
                        {m.hasReceivedPot && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
                        )}
                      </div>

                      {/* Collateral mini meter */}
                      <div className="mt-1 flex items-center justify-between text-[9px] font-mono-tabular text-sky-100/80">
                        <span className="inline-flex items-center gap-0.5">
                          <Lock className="h-2.5 w-2.5 text-cyan-200" />
                          {m.collateralRemaining}
                        </span>
                        {m.skipRound && (
                          <span className="text-amber-200 font-bold">Skip R{m.skipRound}</span>
                        )}
                      </div>

                      {/* Turn / Status Micro Pill */}
                      {isRecipient && (
                        <div className="mt-1 rounded-md bg-emerald-400/25 border border-emerald-300/45 px-1.5 py-0.5 text-[9px] font-bold text-emerald-100 text-center">
                          {phase === 'paying' ? `+${potTotal} MAD!` : 'Pot Turn'}
                        </div>
                      )}
                      {isSlashedNow && (
                        <div className="mt-1 rounded-md bg-amber-400/30 border border-amber-300/60 px-1.5 py-0.5 text-[9px] font-bold text-amber-100 text-center">
                          Slashed!
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Compact Grid View (<640px) */}
              <div className="sm:hidden p-4 space-y-4">
                <div className="glass-panel-luminous rounded-2xl p-4 text-center space-y-1">
                  <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-cyan-100">
                    Hedera Smart Contract Escrow
                  </div>
                  <div className="font-display text-2xl font-extrabold font-mono-tabular text-white">
                    {escrowPot.toLocaleString()} MAD Pot
                  </div>
                  <div className="text-xs text-sky-100/85 font-mono-tabular">
                    Vault Locked: {vaultCollateral.toLocaleString()} MAD · Round {currentRound}/{memberCount}
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
                            ? 'bg-amber-950/75 border-amber-300'
                            : isRecipient
                              ? 'bg-emerald-950/60 border-emerald-300'
                              : m.position === selectedSeat
                                ? 'glass-panel-luminous border-white'
                                : 'glass-panel border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono-tabular">
                          <span className="text-cyan-200 font-bold">Seat #{m.position}</span>
                          <span className="text-white/85">{m.tier}</span>
                        </div>
                        <div className="text-xs font-bold text-white mt-0.5">{m.shortName}</div>
                        <div className="text-[10px] text-sky-100/75 font-mono-tabular">
                          Vault: {m.collateralRemaining} MAD
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Round Progress Strip */}
              <div className="border-t border-white/15 px-4 py-3 flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] font-mono-tabular text-sky-200/80 shrink-0">
                  Timeline:
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
                      className={`h-7 min-w-[34px] px-2 rounded-lg flex items-center justify-center text-[11px] font-mono-tabular font-semibold border transition-all ${
                        done
                          ? 'bg-emerald-400/25 border-emerald-300/45 text-emerald-100'
                          : active
                            ? 'bg-white text-[#06297a] border-white shadow'
                            : 'bg-white/8 border-white/15 text-sky-100/70'
                      }`}
                    >
                      R{r}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* UNDER THE HOOD: Live HCS Stream / Collateral Math Table / Fee Reality */}
            <div className="glass-panel-deep rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-3">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('hcs')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'hcs'
                        ? 'bg-white text-[#06297a]'
                        : 'bg-white/10 text-sky-100 hover:bg-white/20'
                    }`}
                  >
                    Live HCS Audit Topic ({logs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('math')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'math'
                        ? 'bg-white text-[#06297a]'
                        : 'bg-white/10 text-sky-100 hover:bg-white/20'
                    }`}
                  >
                    Collateral & Risk Math Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fees')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'fees'
                        ? 'bg-white text-[#06297a]'
                        : 'bg-white/10 text-sky-100 hover:bg-white/20'
                    }`}
                  >
                    Micro-Fee Viability Proof
                  </button>
                </div>

                <div className="text-[11px] font-mono-tabular text-cyan-200/90 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>HCS Topic 0.0.884210 · Mirror Node Live</span>
                </div>
              </div>

              {activeTab === 'hcs' && (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {logs.map((entry) => (
                    <div
                      key={entry.seq}
                      className="rounded-xl bg-white/8 border border-white/15 px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-start sm:items-center gap-2.5">
                        <span className="font-mono-tabular text-[10px] rounded-md bg-cyan-300/20 border border-cyan-200/35 px-1.5 py-0.5 text-cyan-100 shrink-0">
                          #{entry.seq}
                        </span>
                        <div>
                          <span
                            className={`font-mono-tabular text-[10px] font-bold mr-2 ${
                              entry.type === 'COLLATERAL_SLASHED' || entry.type === 'GRACE_MISSED'
                                ? 'text-amber-300'
                                : entry.type === 'POT_PAID'
                                  ? 'text-emerald-300'
                                  : 'text-cyan-200'
                            }`}
                          >
                            [{entry.type}]
                          </span>
                          <span className="text-white/95">{entry.summary}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-mono-tabular text-sky-200/75 shrink-0">
                        <span>{entry.actor}</span>
                        <span className="text-emerald-200">{entry.feeUsd}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'math' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono-tabular">
                    <thead>
                      <tr className="border-b border-white/15 text-sky-200/80">
                        <th className="py-2 pr-3">Seat k</th>
                        <th className="py-2 pr-3">Member</th>
                        <th className="py-2 pr-3">Tier</th>
                        <th className="py-2 pr-3">Paid at Turn</th>
                        <th className="py-2 pr-3">Max Owed (N−k)×C</th>
                        <th className="py-2 pr-3">Required Collateral</th>
                        <th className="py-2">Default Incentive</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {members.map((m) => {
                        const paidAtTurn = m.position * contribution;
                        const maxOwed = (memberCount - m.position) * contribution;
                        return (
                          <tr key={m.id} className="text-white/90">
                            <td className="py-2 pr-3 font-bold text-cyan-200">#{m.position}</td>
                            <td className="py-2 pr-3 font-sans">{m.shortName}</td>
                            <td className="py-2 pr-3">{m.tier}</td>
                            <td className="py-2 pr-3">{paidAtTurn.toLocaleString()} MAD</td>
                            <td className="py-2 pr-3">{maxOwed.toLocaleString()} MAD</td>
                            <td className="py-2 pr-3 font-bold text-cyan-100">
                              {m.collateralRequired.toLocaleString()} MAD
                            </td>
                            <td className="py-2 text-emerald-300">
                              {m.position === memberCount
                                ? 'Pure Saver (0 MAD risk)'
                                : m.tier === 'New'
                                  ? '≤ 0 MAD (Covered 100%)'
                                  : 'Tier-backed + Insurance'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'fees' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl bg-white/10 border border-white/20 p-3.5 space-y-1">
                    <div className="text-sky-200/80">Total Cycle Transactions</div>
                    <div className="font-display text-xl font-bold text-white font-mono-tabular">
                      {totalTxCount} txs
                    </div>
                    <div className="text-[11px] text-sky-100/80">
                      Includes joins, {memberCount}×{memberCount} deposits, payouts & refunds.
                    </div>
                  </div>
                  <div className="rounded-xl bg-cyan-400/15 border border-cyan-200/40 p-3.5 space-y-1">
                    <div className="text-cyan-100">Hedera Network Cost</div>
                    <div className="font-display text-xl font-bold text-white font-mono-tabular">
                      ~${hederaTotalUsd.toFixed(4)}{' '}
                      <span className="text-xs font-normal text-cyan-200">
                        (~{hederaTotalMad.toFixed(2)} MAD)
                      </span>
                    </div>
                    <div className="text-[11px] text-cyan-50/90">
                      {(((contribution - hederaTotalMad / memberCount) / contribution) * 100).toFixed(2)}%
                      of even a {contribution} MAD deposit stays in the circle.
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/10 border border-white/20 p-3.5 space-y-1">
                    <div className="text-sky-200/80">High-Gas Chain Comparison</div>
                    <div className="font-display text-xl font-bold text-amber-200 font-mono-tabular">
                      ~$40 – $250+
                    </div>
                    <div className="text-[11px] text-sky-100/80">
                      On congested gas chains, fees wipe out a 20 MAD or 100 MAD student circle.
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
