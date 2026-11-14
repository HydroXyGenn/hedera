import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppHeader } from './components/AppHeader';
import {
  CreateCircleModal,
  CreateCirclePayload,
} from './components/CreateCircleModal';
import { AssignRosterPanel } from './components/AssignRosterPanel';
import { CircleExecutionStage } from './components/CircleExecutionStage';
import { MirrorAndLedgerPanel } from './components/MirrorAndLedgerPanel';
import {
  DaretCircle,
  HcsEvent,
  HederaServiceKey,
  ReputationTier,
  UserProfile,
} from './types/daret';
import {
  INITIAL_CIRCLES,
  INITIAL_USERS,
  TIER_META,
  calcRequiredCollateral,
  createEmptySeats,
  deriveTierFromStats,
  doesQualifyForCircle,
  generateRandomUser,
  makeTxHash,
  nowTimestamp,
  roundMad,
} from './data/presets';

const STORAGE_KEY = 'daret_hedera_poc_v1';

interface SavedState {
  users: UserProfile[];
  circles: DaretCircle[];
  activeCircleId: string;
  activeUserId: string;
}

function loadInitialState(): SavedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SavedState;
      if (parsed?.circles?.length && parsed?.users?.length) {
        return parsed;
      }
    }
  } catch {
    // Ignore invalid storage
  }
  return {
    users: INITIAL_USERS,
    circles: INITIAL_CIRCLES,
    activeCircleId: INITIAL_CIRCLES[0].id,
    activeUserId: INITIAL_USERS[0].id,
  };
}

export function App() {
  const initial = useMemo(() => loadInitialState(), []);
  const [users, setUsers] = useState<UserProfile[]>(initial.users);
  const [circles, setCircles] = useState<DaretCircle[]>(initial.circles);
  const [activeCircleId, setActiveCircleId] = useState<string>(initial.activeCircleId);
  const [activeUserId, setActiveUserId] = useState<string>(initial.activeUserId);

  const [createOpen, setCreateOpen] = useState(false);
  const [joinErrorBanner, setJoinErrorBanner] = useState<string | null>(null);
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [highlightedServices, setHighlightedServices] = useState<HederaServiceKey[]>(['EVM', 'HCS']);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [lastPulseType, setLastPulseType] = useState<'contribute' | 'slash' | 'payout' | null>(null);

  const pulseTimeoutRef = useRef<number | null>(null);

  // Persist locally so users can reload without losing custom circles/people
  useEffect(() => {
    try {
      const payload: SavedState = { users, circles, activeCircleId, activeUserId };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota issues
    }
  }, [users, circles, activeCircleId, activeUserId]);

  const activeCircle =
    circles.find((c) => c.id === activeCircleId) ?? circles[0];

  const triggerServiceHighlight = useCallback((services: HederaServiceKey[], pulse?: 'contribute' | 'slash' | 'payout') => {
    setHighlightedServices(services);
    if (pulse) setLastPulseType(pulse);
    if (pulseTimeoutRef.current) window.clearTimeout(pulseTimeoutRef.current);
    pulseTimeoutRef.current = window.setTimeout(() => {
      setLastPulseType(null);
    }, 900);
  }, []);

  const flashToast = useCallback((msg: string) => {
    setStatusToast(msg);
    window.setTimeout(() => {
      setStatusToast((cur) => (cur === msg ? null : cur));
    }, 5200);
  }, []);

  const makeEvent = (
    circle: DaretCircle,
    partial: Omit<HcsEvent, 'id' | 'sequenceNumber' | 'topicId' | 'consensusTimestamp' | 'txHash'>
  ): HcsEvent => {
    const nextSeq = (circle.events[0]?.sequenceNumber ?? 0) + 1;
    return {
      ...partial,
      id: `ev-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      sequenceNumber: nextSeq,
      topicId: circle.hcsTopicId,
      consensusTimestamp: nowTimestamp(),
      txHash: makeTxHash(),
    };
  };

  // Live countdown ticker when active
  useEffect(() => {
    if (!activeCircle || activeCircle.status !== 'active' || activeCircle.countdownSec <= 0) {
      return;
    }
    const timer = window.setInterval(() => {
      setCircles((prev) =>
        prev.map((c) =>
          c.id === activeCircle.id && c.status === 'active' && c.countdownSec > 0
            ? { ...c, countdownSec: c.countdownSec - 1 }
            : c
        )
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [activeCircle]);

  const handleResetAll = () => {
    setIsAutoRunning(false);
    setUsers(INITIAL_USERS);
    setCircles(INITIAL_CIRCLES);
    setActiveCircleId(INITIAL_CIRCLES[0].id);
    setActiveUserId(INITIAL_USERS[0].id);
    setJoinErrorBanner(null);
    flashToast('Reset all circles, HTS wallets, and Mirror Node histories to initial demo state.');
  };

  const handleFaucetTopUp = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, walletBalanceMad: roundMad(u.walletBalanceMad + 1000) } : u
      )
    );
    triggerServiceHighlight(['HTS', 'FEES']);
    flashToast('Minted +1,000 test MAD HTS tokens to wallet.');
  };

  const handleTopUpAllForStart = () => {
    setUsers((prev) =>
      prev.map((u) => {
        const seat = activeCircle.seats.find((s) => s.userId === u.id);
        if (!seat || u.walletBalanceMad >= seat.collateralRequired + activeCircle.contributionMad) {
          return u;
        }
        return {
          ...u,
          walletBalanceMad: roundMad(seat.collateralRequired + activeCircle.contributionMad * 2),
        };
      })
    );
    triggerServiceHighlight(['HTS']);
    flashToast('Topped up underfunded member wallets for demo start.');
  };

  // Create brand-new circle
  const handleCreateCircle = (payload: CreateCirclePayload) => {
    const newId = `c-${Date.now()}`;
    const topicId = `0.0.${884600 + Math.floor(Math.random() * 9000)}`;
    let seats = createEmptySeats(payload.memberCount, payload.contributionMad);
    const createdUsers: UserProfile[] = [];
    const existingNames = new Set(users.map((u) => u.name));

    if (payload.fillMode !== 'empty') {
      for (let i = 0; i < payload.memberCount; i++) {
        let rand = generateRandomUser(existingNames, false);
        while (!doesQualifyForCircle(rand.tier, payload.minTier)) {
          rand = generateRandomUser(existingNames, false);
        }
        existingNames.add(rand.name);
        createdUsers.push(rand);
        seats[i] = {
          ...seats[i],
          userId: rand.id,
          collateralRequired: calcRequiredCollateral(
            i + 1,
            payload.memberCount,
            payload.contributionMad,
            rand.tier
          ),
        };
      }

      if (payload.fillMode === 'prng-randoms') {
        const assigned = seats.map((s) => s.userId);
        for (let i = assigned.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [assigned[i], assigned[j]] = [assigned[j], assigned[i]];
        }
        seats = seats.map((s, idx) => {
          const u = createdUsers.find((x) => x.id === assigned[idx]);
          return {
            ...s,
            userId: assigned[idx],
            collateralRequired: u
              ? calcRequiredCollateral(idx + 1, payload.memberCount, payload.contributionMad, u.tier)
              : s.collateralRequired,
          };
        });
      }
    }

    const creator = users.find((u) => u.id === activeUserId) ?? users[0];
    const baseCircle: DaretCircle = {
      id: newId,
      name: payload.name,
      description: `Custom ${payload.memberCount}-member circle · ${payload.contributionMad} MAD / ${payload.period} · MinTier: ${payload.minTier}+`,
      contractAddress: makeTxHash().padEnd(42, 'a'),
      hcsTopicId: topicId,
      memberCount: payload.memberCount,
      contributionMad: payload.contributionMad,
      period: payload.period,
      minTier: payload.minTier,
      protocolFeePct: payload.protocolFeePct,
      insurancePct: payload.insurancePct,
      drawMode: payload.fillMode === 'prng-randoms' ? 'prng' : 'manual',
      status: 'recruiting',
      currentRound: 1,
      countdownSec: 120,
      escrowPotMad: 0,
      collateralVaultMad: 0,
      protocolTreasuryMad: 0,
      insurancePoolMad: 0,
      seats,
      events: [],
    };

    const initEvents: HcsEvent[] = [
      {
        id: `ev-${Date.now()}`,
        sequenceNumber: 1,
        topicId,
        consensusTimestamp: nowTimestamp(),
        txHash: makeTxHash(),
        type: 'CIRCLE_CREATED',
        actorAccountId: creator.accountId,
        actorName: creator.name,
        round: 0,
        feeUsd: '$0.0005',
        detail: `Deployed "${payload.name}" · ${payload.memberCount} seats × ${payload.contributionMad} MAD`,
        servicesUsed: ['EVM', 'HCS'],
      },
    ];

    if (payload.fillMode === 'prng-randoms') {
      initEvents.unshift({
        id: `ev-${Date.now()}-prng`,
        sequenceNumber: 2,
        topicId,
        consensusTimestamp: nowTimestamp(),
        txHash: makeTxHash(),
        type: 'PRNG_TIRAGE',
        actorAccountId: '0.0.0169',
        actorName: 'Hedera Native PRNG',
        round: 0,
        feeUsd: '$0.0001',
        detail: `Populated ${payload.memberCount} random participants & shuffled seats via PRNG`,
        servicesUsed: ['PRNG', 'MIRROR', 'HCS'],
      });
    }

    baseCircle.events = initEvents;
    if (createdUsers.length > 0) {
      setUsers((prev) => [...prev, ...createdUsers]);
    }
    setCircles((prev) => [baseCircle, ...prev]);
    setActiveCircleId(newId);
    setJoinErrorBanner(null);
    triggerServiceHighlight(['EVM', 'HCS']);
    flashToast(`Deployed circle "${payload.name}" on Hedera EVM + HCS Topic ${topicId}`);
  };

  // Assign an existing directory user to a seat (enforces minTier!)
  const assignUserInternal = (candidate: UserProfile, seatNumber: number) => {
    if (!activeCircle || activeCircle.status !== 'recruiting') return;

    if (!doesQualifyForCircle(candidate.tier, activeCircle.minTier)) {
      const msg = `${candidate.name} (${candidate.tier}) does not meet minTier=${activeCircle.minTier}. Contract refused join()!`;
      setJoinErrorBanner(msg);
      const rejectEv = makeEvent(activeCircle, {
        type: 'JOIN_REJECTED',
        actorAccountId: candidate.accountId,
        actorName: candidate.name,
        round: 0,
        feeUsd: '$0.0001',
        detail: `join(seat=${seatNumber}) reverted: tier=${candidate.tier} < required=${activeCircle.minTier}`,
        servicesUsed: ['EVM', 'MIRROR', 'HCS'],
      });
      setCircles((prev) =>
        prev.map((c) =>
          c.id === activeCircle.id ? { ...c, events: [rejectEv, ...c.events] } : c
        )
      );
      triggerServiceHighlight(['EVM', 'MIRROR', 'HCS']);
      return;
    }

    setJoinErrorBanner(null);
    const reqCollateral = calcRequiredCollateral(
      seatNumber,
      activeCircle.memberCount,
      activeCircle.contributionMad,
      candidate.tier
    );

    setCircles((prev) =>
      prev.map((c) => {
        if (c.id !== activeCircle.id) return c;
        // Remove candidate from any prior seat in this circle so nobody occupies 2 seats
        const cleanedSeats = c.seats.map((s) =>
          s.userId === candidate.id
            ? {
                ...s,
                userId: null,
                collateralRequired: (c.memberCount - s.position) * c.contributionMad,
              }
            : s
        );
        const nextSeats = cleanedSeats.map((s) =>
          s.position === seatNumber
            ? { ...s, userId: candidate.id, collateralRequired: reqCollateral }
            : s
        );
        const joinEv = makeEvent(c, {
          type: 'MEMBER_JOINED',
          actorAccountId: candidate.accountId,
          actorName: candidate.name,
          round: 0,
          amountMad: reqCollateral,
          feeUsd: '$0.0001',
          detail: `Assigned to Seat #${seatNumber} (${candidate.tier} tier · ${reqCollateral} MAD collateral)`,
          servicesUsed: ['EVM', 'MIRROR', 'HTS', 'HCS'],
        });
        return { ...c, seats: nextSeats, events: [joinEv, ...c.events] };
      })
    );
    triggerServiceHighlight(['EVM', 'MIRROR', 'HTS', 'HCS']);
    flashToast(`Assigned ${candidate.name} to Seat #${seatNumber} (${reqCollateral} MAD collateral).`);
  };

  const handleAssignUserToSeat = (userId: string, seatNumber: number) => {
    const candidate = users.find((u) => u.id === userId);
    if (!candidate) return;
    assignUserInternal(candidate, seatNumber);
  };

  const handleCreateAndAssignPerson = (
    payload: {
      name: string;
      campusRole: string;
      tier: ReputationTier;
      walletBalanceMad: number;
    },
    seatNumber: number
  ) => {
    const statsByTier: Record<ReputationTier, { completed: number; defaults: number; onTime: number }> = {
      New: { completed: 0, defaults: 0, onTime: 100 },
      Bronze: { completed: 2, defaults: 0, onTime: 94 },
      Silver: { completed: 4, defaults: 0, onTime: 96 },
      Gold: { completed: 6, defaults: 0, onTime: 100 },
      Defaulter: { completed: 1, defaults: 1, onTime: 65 },
    };
    const st = statsByTier[payload.tier];
    const { score } = deriveTierFromStats(st.completed, st.defaults, st.onTime);
    const newPerson: UserProfile = {
      id: `u-custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: payload.name,
      campusRole: payload.campusRole,
      accountId: `0.0.${485000 + Math.floor(Math.random() * 4900)}`,
      walletBalanceMad: payload.walletBalanceMad,
      tier: payload.tier,
      reputationScore: score,
      completedCircles: st.completed,
      onTimeRate: st.onTime,
      defaultsCount: st.defaults,
      totalVolumeMad: st.completed * 3000,
      accountAgeMonths: st.completed === 0 ? 1 : st.completed * 3,
    };
    setUsers((prev) => [...prev, newPerson]);
    assignUserInternal(newPerson, seatNumber);
  };

  const handleAddRandomPerson = (seatNumber?: number, respectGate = false) => {
    if (!activeCircle || activeCircle.status !== 'recruiting') return;
    const openSeat =
      seatNumber !== undefined
        ? activeCircle.seats.find((s) => s.position === seatNumber)
        : activeCircle.seats.find((s) => !s.userId);
    if (!openSeat) return;

    const existingNames = new Set(users.map((u) => u.name));
    let rand = generateRandomUser(existingNames, !respectGate);
    if (respectGate) {
      let guard = 0;
      while (!doesQualifyForCircle(rand.tier, activeCircle.minTier) && guard < 15) {
        rand = generateRandomUser(existingNames, false);
        guard++;
      }
    }
    setUsers((prev) => [...prev, rand]);
    assignUserInternal(rand, openSeat.position);
  };

  const handleFillRemainingRandoms = () => {
    if (!activeCircle || activeCircle.status !== 'recruiting') return;
    const openPositions = activeCircle.seats.filter((s) => !s.userId).map((s) => s.position);
    if (openPositions.length === 0) return;

    const existingNames = new Set(users.map((u) => u.name));
    const newlyCreated: UserProfile[] = [];
    const seatToUser = new Map<number, UserProfile>();

    for (const pos of openPositions) {
      let rand = generateRandomUser(existingNames, false);
      while (!doesQualifyForCircle(rand.tier, activeCircle.minTier)) {
        rand = generateRandomUser(existingNames, false);
      }
      existingNames.add(rand.name);
      newlyCreated.push(rand);
      seatToUser.set(pos, rand);
    }

    setUsers((prev) => [...prev, ...newlyCreated]);
    setCircles((prev) =>
      prev.map((c) => {
        if (c.id !== activeCircle.id) return c;
        const nextSeats = c.seats.map((s) => {
          const u = seatToUser.get(s.position);
          if (!u) return s;
          return {
            ...s,
            userId: u.id,
            collateralRequired: calcRequiredCollateral(
              s.position,
              c.memberCount,
              c.contributionMad,
              u.tier
            ),
          };
        });
        const ev = makeEvent(c, {
          type: 'MEMBER_JOINED',
          actorAccountId: newlyCreated[0].accountId,
          actorName: `${newlyCreated.length} Randoms`,
          round: 0,
          feeUsd: `$${(newlyCreated.length * 0.0001).toFixed(4)}`,
          detail: `Populated ${newlyCreated.length} open seat(s) with qualified random participants`,
          servicesUsed: ['EVM', 'MIRROR', 'HCS'],
        });
        return { ...c, seats: nextSeats, events: [ev, ...c.events] };
      })
    );
    setJoinErrorBanner(null);
    triggerServiceHighlight(['EVM', 'MIRROR', 'HCS']);
    flashToast(`Added ${newlyCreated.length} random participant(s) to open seats.`);
  };

  const handleRemoveFromSeat = (seatNumber: number) => {
    if (!activeCircle || activeCircle.status !== 'recruiting') return;
    setCircles((prev) =>
      prev.map((c) => {
        if (c.id !== activeCircle.id) return c;
        const nextSeats = c.seats.map((s) =>
          s.position === seatNumber
            ? {
                ...s,
                userId: null,
                collateralRequired: (c.memberCount - s.position) * c.contributionMad,
              }
            : s
        );
        return { ...c, seats: nextSeats };
      })
    );
  };

  const handleSwapSeats = (seatA: number, seatB: number) => {
    if (!activeCircle || activeCircle.status !== 'recruiting') return;
    setCircles((prev) =>
      prev.map((c) => {
        if (c.id !== activeCircle.id) return c;
        const a = c.seats.find((s) => s.position === seatA);
        const b = c.seats.find((s) => s.position === seatB);
        if (!a || !b) return c;

        const userA = a.userId ? users.find((u) => u.id === a.userId) ?? null : null;
        const userB = b.userId ? users.find((u) => u.id === b.userId) ?? null : null;

        const nextSeats = c.seats.map((s) => {
          if (s.position === seatA) {
            return {
              ...s,
              userId: b.userId,
              collateralRequired: userB
                ? calcRequiredCollateral(seatA, c.memberCount, c.contributionMad, userB.tier)
                : (c.memberCount - seatA) * c.contributionMad,
            };
          }
          if (s.position === seatB) {
            return {
              ...s,
              userId: a.userId,
              collateralRequired: userA
                ? calcRequiredCollateral(seatB, c.memberCount, c.contributionMad, userA.tier)
                : (c.memberCount - seatB) * c.contributionMad,
            };
          }
          return s;
        });
        return { ...c, seats: nextSeats };
      })
    );
  };

  const handlePrngTirage = () => {
    if (!activeCircle || activeCircle.status !== 'recruiting') return;
    const seatedUserIds = activeCircle.seats.map((s) => s.userId);
    for (let i = seatedUserIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [seatedUserIds[i], seatedUserIds[j]] = [seatedUserIds[j], seatedUserIds[i]];
    }
    setCircles((prev) =>
      prev.map((c) => {
        if (c.id !== activeCircle.id) return c;
        const nextSeats = c.seats.map((s, idx) => {
          const uid = seatedUserIds[idx];
          const u = uid ? users.find((x) => x.id === uid) : null;
          return {
            ...s,
            userId: uid,
            collateralRequired: u
              ? calcRequiredCollateral(s.position, c.memberCount, c.contributionMad, u.tier)
              : (c.memberCount - s.position) * c.contributionMad,
          };
        });
        const ev = makeEvent(c, {
          type: 'PRNG_TIRAGE',
          actorAccountId: '0.0.0169',
          actorName: 'Hedera Native PRNG',
          round: 0,
          feeUsd: '$0.0001',
          detail: 'Executed fair on-chain PRNG tirage & recomputed collateral requirements',
          servicesUsed: ['PRNG', 'HCS'],
        });
        return { ...c, drawMode: 'prng', seats: nextSeats, events: [ev, ...c.events] };
      })
    );
    triggerServiceHighlight(['PRNG', 'HCS']);
    flashToast('Hedera Native PRNG Tirage shuffled seats and recalculated collateral.');
  };

  // Lock collateral & activate circle
  const handleLockAndStart = () => {
    if (!activeCircle || activeCircle.status !== 'recruiting') return;
    if (activeCircle.seats.some((s) => !s.userId)) return;

    const totalVault = roundMad(
      activeCircle.seats.reduce((sum, s) => sum + s.collateralRequired, 0)
    );

    // Deduct locked collateral from each member wallet
    const deductionMap = new Map<string, number>();
    activeCircle.seats.forEach((s) => {
      if (s.userId) deductionMap.set(s.userId, s.collateralRequired);
    });

    setUsers((prev) =>
      prev.map((u) => {
        const lockAmt = deductionMap.get(u.id);
        if (!lockAmt) return u;
        return { ...u, walletBalanceMad: roundMad(Math.max(0, u.walletBalanceMad - lockAmt)) };
      })
    );

    setCircles((prev) =>
      prev.map((c) => {
        if (c.id !== activeCircle.id) return c;
        const nextSeats = c.seats.map((s) => ({
          ...s,
          collateralLocked: s.collateralRequired,
        }));
        const ev = makeEvent(c, {
          type: 'COLLATERAL_LOCKED',
          actorAccountId: c.contractAddress.slice(0, 12),
          actorName: 'All Members',
          round: 1,
          amountMad: totalVault,
          feeUsd: '$0.0002',
          detail: `Locked ${totalVault.toLocaleString()} MAD collateral into Escrow · Round 1 opened`,
          servicesUsed: ['EVM', 'HTS', 'HCS'],
        });
        return {
          ...c,
          status: 'active',
          currentRound: 1,
          countdownSec: 120,
          collateralVaultMad: totalVault,
          seats: nextSeats,
          events: [ev, ...c.events],
        };
      })
    );
    triggerServiceHighlight(['EVM', 'HTS', 'HCS'], 'contribute');
    flashToast(`Circle active! ${totalVault.toLocaleString()} MAD collateral locked. Round 1 is open.`);
  };

  // Pay contribution for a single seat
  const paySeatsBatch = useCallback(
    (seatNumbers: number[]) => {
      if (!activeCircle || activeCircle.status !== 'active') return;
      const targetSet = new Set(seatNumbers);
      const payingSeats = activeCircle.seats.filter(
        (s) => targetSet.has(s.position) && !s.paidCurrentRound && s.userId
      );
      if (payingSeats.length === 0) return;

      const feeEach = roundMad((activeCircle.contributionMad * activeCircle.protocolFeePct) / 100);
      const insEach = roundMad((activeCircle.contributionMad * activeCircle.insurancePct) / 100);
      const totalChargeEach = roundMad(activeCircle.contributionMad + feeEach + insEach);

      const userDeductions = new Map<string, number>();
      for (const s of payingSeats) {
        if (s.userId) userDeductions.set(s.userId, totalChargeEach);
      }

      setUsers((prev) =>
        prev.map((u) => {
          const charge = userDeductions.get(u.id);
          if (!charge) return u;
          return { ...u, walletBalanceMad: roundMad(Math.max(0, u.walletBalanceMad - charge)) };
        })
      );

      setCircles((prev) =>
        prev.map((c) => {
          if (c.id !== activeCircle.id) return c;
          const addedPot = roundMad(payingSeats.length * c.contributionMad);
          const addedFee = roundMad(payingSeats.length * feeEach);
          const addedIns = roundMad(payingSeats.length * insEach);

          const nextSeats = c.seats.map((s) =>
            targetSet.has(s.position) && !s.paidCurrentRound
              ? {
                  ...s,
                  paidCurrentRound: true,
                  markedMissed: false,
                  totalContributed: roundMad(s.totalContributed + c.contributionMad),
                }
              : s
          );

          const newEvents: HcsEvent[] = [...c.events];
          payingSeats.forEach((ps, idx) => {
            const member = users.find((u) => u.id === ps.userId);
            if (!member) return;
            const seq = (newEvents[0]?.sequenceNumber ?? 0) + 1;
            newEvents.unshift({
              id: `ev-${Date.now()}-${idx}-${ps.position}`,
              sequenceNumber: seq,
              topicId: c.hcsTopicId,
              consensusTimestamp: nowTimestamp(),
              txHash: makeTxHash(),
              type: 'CONTRIBUTION_PAID',
              actorAccountId: member.accountId,
              actorName: member.name,
              round: c.currentRound,
              amountMad: c.contributionMad,
              feeUsd: '$0.0001',
              detail: `Paid ${c.contributionMad} MAD into Round ${c.currentRound} escrow (+${feeEach} fee, +${insEach} ins)`,
              servicesUsed: ['EVM', 'HTS', 'HCS', 'FEES'],
            });
          });

          return {
            ...c,
            escrowPotMad: roundMad(c.escrowPotMad + addedPot),
            protocolTreasuryMad: roundMad(c.protocolTreasuryMad + addedFee),
            insurancePoolMad: roundMad(c.insurancePoolMad + addedIns),
            seats: nextSeats,
            events: newEvents,
          };
        })
      );

      triggerServiceHighlight(['EVM', 'HTS', 'HCS', 'FEES'], 'contribute');
    },
    [activeCircle, triggerServiceHighlight, users]
  );

  const handlePaySeat = (seatNumber: number) => paySeatsBatch([seatNumber]);

  const handlePayAllRemaining = () => {
    if (!activeCircle) return;
    const seatsToPay = activeCircle.seats
      .filter((s) => !s.paidCurrentRound && !s.markedMissed)
      .map((s) => s.position);
    paySeatsBatch(seatsToPay);
  };

  const handleToggleMissedSeat = (seatNumber: number) => {
    if (!activeCircle || activeCircle.status !== 'active') return;
    setCircles((prev) =>
      prev.map((c) => {
        if (c.id !== activeCircle.id) return c;
        return {
          ...c,
          seats: c.seats.map((s) =>
            s.position === seatNumber ? { ...s, markedMissed: !s.markedMissed } : s
          ),
        };
      })
    );
  };

  const handleFastForwardTimer = () => {
    if (!activeCircle) return;
    setCircles((prev) =>
      prev.map((c) => (c.id === activeCircle.id ? { ...c, countdownSec: 0 } : c))
    );
  };

  // Close round: auto-slash any unpaid seat, pay full pot to recipient, refund collateral on final round
  const handleCloseRound = useCallback(() => {
    if (!activeCircle || activeCircle.status !== 'active') return;

    const roundNum = activeCircle.currentRound;
    const recipientSeat = activeCircle.seats.find((s) => s.position === roundNum);
    const recipientUser = recipientSeat?.userId
      ? users.find((u) => u.id === recipientSeat.userId)
      : null;

    let vaultDrop = 0;
    let insDrop = 0;
    let potAddition = 0;
    const defaulters = new Set<string>();
    const newEvents: HcsEvent[] = [...activeCircle.events];

    const pushEv = (partial: Omit<HcsEvent, 'id' | 'sequenceNumber' | 'topicId' | 'consensusTimestamp' | 'txHash'>) => {
      const seq = (newEvents[0]?.sequenceNumber ?? 0) + 1;
      newEvents.unshift({
        ...partial,
        id: `ev-${Date.now()}-${seq}-${Math.floor(Math.random() * 1000)}`,
        sequenceNumber: seq,
        topicId: activeCircle.hcsTopicId,
        consensusTimestamp: nowTimestamp(),
        txHash: makeTxHash(),
      });
    };

    let settledSeats = activeCircle.seats.map((seat) => {
      if (seat.paidCurrentRound) return seat;
      const member = seat.userId ? users.find((u) => u.id === seat.userId) : null;
      if (member) defaulters.add(member.id);

      const shortfall = activeCircle.contributionMad;
      const fromVault = Math.min(shortfall, seat.collateralLocked);
      const remainderAfterVault = roundMad(shortfall - fromVault);
      const fromIns = Math.min(remainderAfterVault, roundMad(activeCircle.insurancePoolMad - insDrop));
      const lienAdvance =
        !seat.hasReceivedPot && seat.position > roundNum
          ? roundMad(remainderAfterVault - fromIns)
          : 0;

      vaultDrop = roundMad(vaultDrop + fromVault);
      insDrop = roundMad(insDrop + fromIns);
      potAddition = roundMad(potAddition + fromVault + fromIns + lienAdvance);

      if (member) {
        pushEv({
          type: 'GRACE_MISSED',
          actorAccountId: member.accountId,
          actorName: member.name,
          round: roundNum,
          amountMad: shortfall,
          feeUsd: '$0.0001',
          detail: `Missed Round ${roundNum} deadline — automatic enforcement triggered`,
          servicesUsed: ['EVM', 'HCS'],
        });
        pushEv({
          type: 'COLLATERAL_SLASHED',
          actorAccountId: member.accountId,
          actorName: member.name,
          round: roundNum,
          amountMad: fromVault,
          feeUsd: '$0.0001',
          detail:
            lienAdvance > 0
              ? `Slashed ${fromVault} MAD collateral + ${lienAdvance} MAD lien on future Round #${seat.position} pot · Recipient protected 100%`
              : `Slashed ${fromVault} MAD from locked collateral${fromIns > 0 ? ` (+${fromIns} MAD insurance)` : ''} · Pot protected`,
          servicesUsed: ['EVM', 'HTS', 'HCS', 'MIRROR'],
        });
      }

      return {
        ...seat,
        slashedCurrentRound: true,
        collateralLocked: roundMad(seat.collateralLocked - fromVault),
        totalSlashed: roundMad(seat.totalSlashed + fromVault),
        futurePotLienMad: roundMad((seat.futurePotLienMad ?? 0) + lienAdvance),
      };
    });

    const recipientLien = recipientSeat?.futurePotLienMad ?? 0;
    const grossPot = roundMad(activeCircle.escrowPotMad + potAddition);
    const finalPotPaid = roundMad(Math.max(0, grossPot - recipientLien));
    if (recipientUser) {
      pushEv({
        type: 'ROUND_CLOSED_PAYOUT',
        actorAccountId: recipientUser.accountId,
        actorName: recipientUser.name,
        round: roundNum,
        amountMad: finalPotPaid,
        feeUsd: '$0.0001',
        detail:
          recipientLien > 0
            ? `Round ${roundNum} closed · Paid ${finalPotPaid.toLocaleString()} MAD net pot to Seat #${roundNum} (${recipientLien} MAD prior lien settled)`
            : `Round ${roundNum} closed · Paid ${finalPotPaid.toLocaleString()} MAD pot to Seat #${roundNum} (${recipientUser.name})`,
        servicesUsed: ['EVM', 'HTS', 'HCS', 'FEES'],
      });
    }

    const isFinalRound = roundNum >= activeCircle.memberCount;
    const refundMap = new Map<string, number>();
    let totalRefunded = 0;

    if (isFinalRound) {
      settledSeats = settledSeats.map((s) => {
        if (s.userId && s.collateralLocked > 0) {
          refundMap.set(s.userId, s.collateralLocked);
          totalRefunded = roundMad(totalRefunded + s.collateralLocked);
        }
        return {
          ...s,
          hasReceivedPot: s.position === roundNum ? true : s.hasReceivedPot,
          collateralLocked: 0,
          paidCurrentRound: false,
          markedMissed: false,
          slashedCurrentRound: false,
        };
      });

      pushEv({
        type: 'COLLATERAL_REFUNDED',
        actorAccountId: activeCircle.contractAddress.slice(0, 12),
        actorName: 'Escrow Vault',
        round: roundNum,
        amountMad: totalRefunded,
        feeUsd: '$0.0002',
        detail: `Cycle complete! Returned ${totalRefunded.toLocaleString()} MAD unused collateral & updated Mirror Node tiers`,
        servicesUsed: ['EVM', 'HTS', 'HCS', 'MIRROR'],
      });
    } else {
      settledSeats = settledSeats.map((s) => ({
        ...s,
        hasReceivedPot: s.position === roundNum ? true : s.hasReceivedPot,
        paidCurrentRound: false,
        markedMissed: false,
        slashedCurrentRound: false,
      }));
    }

    // Update wallets + Mirror Node reputation scores
    const seatedIds = new Set(activeCircle.seats.map((s) => s.userId).filter(Boolean) as string[]);
    setUsers((prev) =>
      prev.map((u) => {
        let nextBalance = u.walletBalanceMad;
        if (recipientUser && u.id === recipientUser.id) {
          nextBalance = roundMad(nextBalance + finalPotPaid);
        }
        const refund = refundMap.get(u.id);
        if (refund) {
          nextBalance = roundMad(nextBalance + refund);
        }

        let nextCompleted = u.completedCircles;
        let nextDefaults = u.defaultsCount;
        let nextOnTime = u.onTimeRate;
        let nextVol = u.totalVolumeMad;

        if (defaulters.has(u.id)) {
          nextDefaults += 1;
          nextOnTime = Math.max(40, u.onTimeRate - 18);
        }
        if (isFinalRound && seatedIds.has(u.id)) {
          nextCompleted += 1;
          nextVol = roundMad(u.totalVolumeMad + activeCircle.memberCount * activeCircle.contributionMad);
        }

        const derived = deriveTierFromStats(nextCompleted, nextDefaults, nextOnTime);
        return {
          ...u,
          walletBalanceMad: nextBalance,
          completedCircles: nextCompleted,
          defaultsCount: nextDefaults,
          onTimeRate: nextOnTime,
          totalVolumeMad: nextVol,
          tier: derived.tier,
          reputationScore: derived.score,
        };
      })
    );

    setCircles((prev) =>
      prev.map((c) => {
        if (c.id !== activeCircle.id) return c;
        return {
          ...c,
          status: isFinalRound ? 'completed' : 'active',
          currentRound: isFinalRound ? roundNum : roundNum + 1,
          countdownSec: isFinalRound ? 0 : 120,
          escrowPotMad: 0,
          collateralVaultMad: isFinalRound
            ? 0
            : roundMad(Math.max(0, c.collateralVaultMad - vaultDrop)),
          insurancePoolMad: roundMad(Math.max(0, c.insurancePoolMad - insDrop)),
          seats: settledSeats,
          events: newEvents,
        };
      })
    );

    if (defaulters.size > 0) {
      triggerServiceHighlight(['EVM', 'HTS', 'HCS', 'MIRROR'], 'slash');
      flashToast(
        `Auto-Slashed ${vaultDrop} MAD collateral to cover missed payment — ${recipientUser?.name ?? `Seat #${roundNum}`} still paid ${finalPotPaid} MAD!`
      );
    } else {
      triggerServiceHighlight(['EVM', 'HTS', 'HCS', 'FEES'], 'payout');
      flashToast(
        isFinalRound
          ? `Cycle Complete! Paid ${finalPotPaid} MAD to ${recipientUser?.name} & returned ${totalRefunded} MAD collateral.`
          : `Round ${roundNum} settled! ${finalPotPaid} MAD sent to ${recipientUser?.name}.`
      );
    }

    if (isFinalRound) setIsAutoRunning(false);
  }, [activeCircle, flashToast, triggerServiceHighlight, users]);

  // Auto-run cycle step effect
  useEffect(() => {
    if (!isAutoRunning || !activeCircle || activeCircle.status !== 'active') return;
    const unpaidNonMissed = activeCircle.seats.filter(
      (s) => !s.paidCurrentRound && !s.markedMissed
    );
    const timer = window.setTimeout(() => {
      if (unpaidNonMissed.length > 0) {
        paySeatsBatch(unpaidNonMissed.map((s) => s.position));
      } else {
        handleCloseRound();
      }
    }, 950);
    return () => window.clearTimeout(timer);
  }, [activeCircle, handleCloseRound, isAutoRunning, paySeatsBatch]);

  const activeUser = users.find((u) => u.id === activeUserId) ?? users[0];

  return (
    <div className="min-h-screen text-[#111827] pb-16">
      <AppHeader
        circles={circles}
        activeCircleId={activeCircle.id}
        onSelectCircle={(id) => {
          setIsAutoRunning(false);
          setJoinErrorBanner(null);
          setActiveCircleId(id);
        }}
        onOpenCreateModal={() => setCreateOpen(true)}
        users={users}
        activeUserId={activeUserId}
        onSelectUser={setActiveUserId}
        onFaucetTopUp={handleFaucetTopUp}
        onResetAll={handleResetAll}
        highlightedServices={highlightedServices}
      />

      {/* Global Toast Notification */}
      {statusToast && (
        <div className="mx-auto max-w-[1440px] px-6 sm:px-8 pt-4">
          <div className="glass-panel-luminous rounded-2xl px-5 py-3 text-[14px] font-medium text-[#111827] flex items-center justify-between gap-4">
            <span>{statusToast}</span>
            <button
              type="button"
              onClick={() => setStatusToast(null)}
              className="rounded-full px-3 py-1 text-[12px] font-semibold text-[#1A73E8] hover:bg-[#E8F0FE] cursor-pointer shrink-0"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Main Split Functional Workspace */}
      <main className="mx-auto max-w-[1440px] px-6 sm:px-8 pt-7">
        {/* Quick Context Strip */}
        <div className="mb-7 pb-4 border-b border-black/[0.06] flex flex-wrap items-center justify-between gap-4 text-[14px]">
          <div className="flex flex-wrap items-center gap-4 tabular-nums">
            <span className="text-[#6B7280]">
              Pot Size:{' '}
              <strong className="font-semibold text-[#111827]">
                {(activeCircle.memberCount * activeCircle.contributionMad).toLocaleString()} MAD
              </strong>
            </span>
            <span className="text-black/15">|</span>
            <span className="text-[#6B7280]">
              Contribution:{' '}
              <strong className="font-semibold text-[#111827]">
                {activeCircle.contributionMad} MAD
              </strong>{' '}
              / {activeCircle.period}
            </span>
            <span className="text-black/15">|</span>
            <span className="text-[#6B7280]">
              Active Actor:{' '}
              <strong className="font-semibold text-[#111827]">{activeUser.name}</strong> (
              {TIER_META[activeUser.tier].label})
            </span>
          </div>
          <div className="text-[12px] text-[#6B7280] tabular-nums">
            EVM Contract {activeCircle.contractAddress.slice(0, 14)}… · Topic {activeCircle.hcsTopicId}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Primary Functional Area */}
          <div className="lg:col-span-8 space-y-7">
            {activeCircle.status === 'recruiting' ? (
              <AssignRosterPanel
                circle={activeCircle}
                users={users}
                activeUserId={activeUserId}
                joinErrorBanner={joinErrorBanner}
                onDismissError={() => setJoinErrorBanner(null)}
                onAssignUserToSeat={handleAssignUserToSeat}
                onCreateAndAssignPerson={handleCreateAndAssignPerson}
                onAddRandomPerson={handleAddRandomPerson}
                onFillRemainingRandoms={handleFillRemainingRandoms}
                onRemoveFromSeat={handleRemoveFromSeat}
                onSwapSeats={handleSwapSeats}
                onPrngTirage={handlePrngTirage}
                onLockAndStart={handleLockAndStart}
                onSelectActiveWallet={setActiveUserId}
                onTopUpAllForStart={handleTopUpAllForStart}
              />
            ) : (
              <>
                <CircleExecutionStage
                  circle={activeCircle}
                  users={users}
                  activeUserId={activeUserId}
                  isAutoRunning={isAutoRunning}
                  onToggleAutoRun={() => setIsAutoRunning((v) => !v)}
                  onPaySeat={handlePaySeat}
                  onPayAllRemaining={handlePayAllRemaining}
                  onToggleMissedSeat={handleToggleMissedSeat}
                  onFastForwardTimer={handleFastForwardTimer}
                  onCloseRound={handleCloseRound}
                  onSelectActiveWallet={setActiveUserId}
                  lastPulseType={lastPulseType}
                />

                {/* Collapsible / Secondary Roster Overview during Active/Completed */}
                <details className="glass-panel rounded-[22px] p-6">
                  <summary className="cursor-pointer font-display text-[14px] font-semibold text-[#111827]">
                    View Full Seat Assignments &amp; Collateral Terms ({activeCircle.memberCount} members)
                  </summary>
                  <div className="pt-4">
                    <AssignRosterPanel
                      circle={activeCircle}
                      users={users}
                      activeUserId={activeUserId}
                      joinErrorBanner={null}
                      onDismissError={() => {}}
                      onAssignUserToSeat={() => {}}
                      onCreateAndAssignPerson={() => {}}
                      onAddRandomPerson={() => {}}
                      onFillRemainingRandoms={() => {}}
                      onRemoveFromSeat={() => {}}
                      onSwapSeats={() => {}}
                      onPrngTirage={() => {}}
                      onLockAndStart={() => {}}
                      onSelectActiveWallet={setActiveUserId}
                      onTopUpAllForStart={() => {}}
                    />
                  </div>
                </details>
              </>
            )}
          </div>

          {/* Right Live Hedera Telemetry & Mirror Node Inspector */}
          <div className="lg:col-span-4">
            <MirrorAndLedgerPanel
              circle={activeCircle}
              users={users}
              activeUserId={activeUserId}
            />
          </div>
        </div>
      </main>

      <CreateCircleModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateCircle}
      />
    </div>
  );
}

export default App;
