import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  position: number;
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

const DEFAULT_POC_TIERS: Record<number, ReputationTier> = {
  1: 'New',
  2: 'New',
  3: 'Silver',
  4: 'Gold',
};

const DEFAULT_POC_SKIP: Record<number, number | null> = {
  1: 3,
};

export function roundMad(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calcCollateral(
  position: number,
  count: number,
  amount: number,
  tier: ReputationTier
): number {
  const base = Math.max(0, count - position) * amount;
  const mult = REPUTATION_TIERS[tier].collateralMultiplier;
  return roundMad(base * mult);
}

export function buildInitialMembers(
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

interface ResetOptions {
  customTiers?: Record<number, ReputationTier>;
  customSkipBySeat?: Record<number, number | null>;
  orderIndices?: number[];
  banner?: string | null;
  customLabel?: string;
}

interface SimulationContextValue {
  memberCount: number;
  contribution: number;
  period: PeriodOption;
  protocolFeePct: number;
  insurancePct: number;
  speed: 1 | 2;
  members: SimMember[];
  selectedSeat: number;
  phase: SimPhase;
  currentRound: number;
  isPlaying: boolean;
  escrowPot: number;
  vaultCollateral: number;
  protocolTreasury: number;
  insurancePool: number;
  bannerAlert: string | null;
  isShuffling: boolean;
  logs: HcsLogEntry[];
  potTotal: number;
  cycleVolume: number;
  totalInitialCollateral: number;
  totalSlashedInCycle: number;
  isSlashActive: boolean;
  selectedMember: SimMember | undefined;
  totalTxCount: number;
  hederaTotalUsd: number;
  hederaTotalMad: number;
  setPeriod: React.Dispatch<React.SetStateAction<PeriodOption>>;
  setProtocolFeePct: React.Dispatch<React.SetStateAction<number>>;
  setInsurancePct: React.Dispatch<React.SetStateAction<number>>;
  setSpeed: React.Dispatch<React.SetStateAction<1 | 2>>;
  setSelectedSeat: React.Dispatch<React.SetStateAction<number>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  handleMemberCountChange: (next: number) => void;
  handleContributionChange: (next: number) => void;
  handleMemberTierChange: (seat: number, tier: ReputationTier) => void;
  handleToggleSkipNext: (seat: number) => void;
  handlePrngTirage: () => void;
  stepForward: () => void;
  resetSimulation: (nextCount?: number, nextAmount?: number, opts?: ResetOptions) => void;
  loadPreset: (preset: 'poc-demo' | 'micro' | 'classic', autoStart?: boolean) => void;
  triggerQuickSlashDemo: () => void;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [memberCount, setMemberCount] = useState<number>(4);
  const [contribution, setContribution] = useState<number>(250);
  const [period, setPeriod] = useState<PeriodOption>('2 min (PoC)');
  const [protocolFeePct, setProtocolFeePct] = useState<number>(0.5);
  const [insurancePct, setInsurancePct] = useState<number>(1);
  const [speed, setSpeed] = useState<1 | 2>(1);

  const [members, setMembers] = useState<SimMember[]>(() =>
    buildInitialMembers(4, 250, {
      customTiers: DEFAULT_POC_TIERS,
      customSkipBySeat: DEFAULT_POC_SKIP,
    })
  );
  const [selectedSeat, setSelectedSeat] = useState<number>(1);

  const [phase, setPhase] = useState<SimPhase>('idle');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [escrowPot, setEscrowPot] = useState<number>(0);
  const [vaultCollateral, setVaultCollateral] = useState<number>(0);
  const [protocolTreasury, setProtocolTreasury] = useState<number>(0);
  const [insurancePool, setInsurancePool] = useState<number>(0);
  const [bannerAlert, setBannerAlert] = useState<string | null>(null);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);

  const seqRef = useRef<number>(418);
  const [logs, setLogs] = useState<HcsLogEntry[]>(() => [
    {
      seq: 418,
      timestamp: '00:00.0',
      round: 0,
      type: 'CIRCLE_CREATED',
      summary: 'Circle #104 deployed · 4 members × 250 MAD/round · Seat #1 skip test armed for R3',
      actor: 'HSCS 0.0.49102',
      feeUsd: '$0.0005',
    },
  ]);

  const appendLog = useCallback((entry: Omit<HcsLogEntry, 'seq' | 'timestamp'>) => {
    seqRef.current += 1;
    const now = new Date();
    const ts = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${Math.floor(now.getMilliseconds() / 100)}`;
    setLogs((prev) => [{ ...entry, seq: seqRef.current, timestamp: ts }, ...prev].slice(0, 60));
  }, []);

  const resetSimulation = useCallback(
    (nextCount = memberCount, nextAmount = contribution, opts?: ResetOptions) => {
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
            `Circle ready · ${nextCount} members × ${nextAmount} MAD (${(nextCount * nextAmount).toLocaleString()} MAD pot)`,
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
          customTiers: DEFAULT_POC_TIERS,
          customSkipBySeat: DEFAULT_POC_SKIP,
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

  const handleMemberCountChange = (next: number) => {
    const clamped = Math.max(3, Math.min(12, next));
    setMemberCount(clamped);
    resetSimulation(clamped, contribution);
  };

  const handleContributionChange = (next: number) => {
    const clamped = Math.max(20, Math.min(2000, next));
    setContribution(clamped);
    resetSimulation(memberCount, clamped);
  };

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
    }, 480);
  };

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
    const targetRound =
      phase === 'idle' ? Math.min(memberCount, Math.max(2, seat + 1)) : currentRound;
    setMembers((prev) =>
      prev.map((m) => {
        if (m.position !== seat) return m;
        const nextSkip = m.skipRound === targetRound ? null : targetRound;
        return { ...m, skipRound: nextSkip };
      })
    );
  };

  const stepForward = useCallback(() => {
    if (phase === 'idle') {
      const totalLock = roundMad(members.reduce((sum, m) => sum + m.collateralRequired, 0));
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
        const totalRefund = roundMad(members.reduce((sum, m) => sum + m.collateralRemaining, 0));
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
        const totalRefund = roundMad(members.reduce((sum, m) => sum + m.collateralRemaining, 0));
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

  // Quick interactive slash snapshot right from Hero telemetry bay
  const triggerQuickSlashDemo = useCallback(() => {
    setIsPlaying(false);
    setMemberCount(4);
    setContribution(250);
    setPeriod('2 min (PoC)');
    setProtocolFeePct(0.5);
    setInsurancePct(1);

    const baseMembers = buildInitialMembers(4, 250, {
      customTiers: DEFAULT_POC_TIERS,
      customSkipBySeat: {},
    });

    const slashedMembers = baseMembers.map((m) => {
      if (m.position === 1) {
        return {
          ...m,
          hasReceivedPot: true,
          paidThisRound: false,
          slashedThisRound: true,
          collateralRemaining: 500,
          totalContributed: 500,
          totalSlashed: 250,
          skipRound: null,
        };
      }
      if (m.position === 2) {
        return {
          ...m,
          hasReceivedPot: true,
          paidThisRound: true,
          totalContributed: 750,
        };
      }
      return {
        ...m,
        paidThisRound: true,
        totalContributed: 750,
      };
    });

    setMembers(slashedMembers);
    setSelectedSeat(1);
    setCurrentRound(3);
    setPhase('slashing');
    setEscrowPot(1000);
    setVaultCollateral(1125);
    setProtocolTreasury(13.75);
    setInsurancePool(27.5);
    setBannerAlert(
      'Auto-Slash Executed! Salma (#1) skipped Round 3 -> 250 MAD pulled from her 750 MAD collateral. Amina (#3) still receives 1,000 MAD!'
    );

    seqRef.current += 2;
    const now = new Date();
    const ts = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${Math.floor(now.getMilliseconds() / 100)}`;
    setLogs((prev) =>
      [
        {
          seq: seqRef.current,
          timestamp: ts,
          round: 3,
          type: 'COLLATERAL_SLASHED' as const,
          summary: 'Slashed 250 MAD collateral from Salma (#1) · Pot restored to 1,000 MAD',
          actor: 'Salma',
          amountMad: 250,
          feeUsd: '$0.0001',
        },
        {
          seq: seqRef.current - 1,
          timestamp: ts,
          round: 3,
          type: 'GRACE_MISSED' as const,
          summary: 'Salma (#1) missed 250 MAD contribution · auto-slash queued',
          actor: '0.0.481920',
          amountMad: 250,
          feeUsd: '$0.0001',
        },
        ...prev,
      ].slice(0, 60)
    );
  }, []);

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
  const totalSlashedInCycle = useMemo(
    () => roundMad(members.reduce((sum, m) => sum + m.totalSlashed, 0)),
    [members]
  );
  const isSlashActive =
    phase === 'slashing' ||
    totalSlashedInCycle > 0 ||
    members.some((m) => !m.paidThisRound && phase === 'contributing' && m.skipRound === currentRound);

  const selectedMember = members.find((m) => m.position === selectedSeat) ?? members[0];
  const totalTxCount = memberCount * (memberCount + 1) + 2;
  const hederaTotalUsd = totalTxCount * 0.0001;
  const hederaTotalMad = hederaTotalUsd * 10;

  return (
    <SimulationContext.Provider
      value={{
        memberCount,
        contribution,
        period,
        protocolFeePct,
        insurancePct,
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
        totalSlashedInCycle,
        isSlashActive,
        selectedMember,
        totalTxCount,
        hederaTotalUsd,
        hederaTotalMad,
        setPeriod,
        setProtocolFeePct,
        setInsurancePct,
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
        triggerQuickSlashDemo,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return ctx;
}
