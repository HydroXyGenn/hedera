import {
  CircleSeat,
  DaretCircle,
  ReputationTier,
  UserProfile,
} from '../types/daret';

export const TIER_ORDER: Record<ReputationTier, number> = {
  Defaulter: 0,
  New: 1,
  Bronze: 2,
  Silver: 3,
  Gold: 4,
};

export const TIER_META: Record<
  ReputationTier,
  {
    label: string;
    multiplier: number;
    badgeColor: string;
    shortRule: string;
    minScore: number;
  }
> = {
  Gold: {
    label: 'Gold',
    multiplier: 0.25,
    badgeColor: 'bg-[#FEF3C7] text-[#B45309] border-[#F59E0B]/25',
    shortRule: '25% collateral · All early seats unlocked',
    minScore: 840,
  },
  Silver: {
    label: 'Silver',
    multiplier: 0.5,
    badgeColor: 'bg-[#E0F2FE] text-[#0369A1] border-[#0284C7]/20',
    shortRule: '50% collateral · Mid & late seats unlocked',
    minScore: 680,
  },
  Bronze: {
    label: 'Bronze',
    multiplier: 0.75,
    badgeColor: 'bg-[#F1F5F9] text-[#0F172A] border-[#0F172A]/10',
    shortRule: '75% collateral · Mid-order seats',
    minScore: 520,
  },
  New: {
    label: 'New',
    multiplier: 1.0,
    badgeColor: 'bg-[#F1F5F9] text-[#475569] border-[#0F172A]/08',
    shortRule: '100% collateral · No prior HCS history',
    minScore: 400,
  },
  Defaulter: {
    label: 'Defaulter',
    multiplier: 1.0,
    badgeColor: 'bg-[#FEE2E2] text-[#B91C1C] border-[#EF4444]/25',
    shortRule: 'Blocked on strict circles · 100% collateral',
    minScore: 150,
  },
};

export function roundMad(v: number): number {
  return Math.round(v * 100) / 100;
}

export function calcRequiredCollateral(
  position: number,
  memberCount: number,
  contributionMad: number,
  tier: ReputationTier
): number {
  const base = Math.max(0, memberCount - position) * contributionMad;
  return roundMad(base * TIER_META[tier].multiplier);
}

export function doesQualifyForCircle(
  applicantTier: ReputationTier,
  minTier: ReputationTier
): boolean {
  return TIER_ORDER[applicantTier] >= TIER_ORDER[minTier];
}

export function deriveTierFromStats(
  completedCircles: number,
  defaultsCount: number,
  onTimeRate: number
): { tier: ReputationTier; score: number } {
  if (defaultsCount > 0) {
    const score = Math.max(80, 320 - defaultsCount * 110);
    return { tier: 'Defaulter', score };
  }
  if (completedCircles === 0) {
    return { tier: 'New', score: 420 };
  }
  if (completedCircles >= 5 && onTimeRate >= 97) {
    return { tier: 'Gold', score: Math.min(990, 840 + completedCircles * 18) };
  }
  if (completedCircles >= 3 && onTimeRate >= 92) {
    return { tier: 'Silver', score: 700 + completedCircles * 22 };
  }
  return { tier: 'Bronze', score: 540 + completedCircles * 30 };
}

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'u-salma',
    name: 'Salma Bennani',
    campusRole: 'ENSIAS Engineering',
    accountId: '0.0.481920',
    walletBalanceMad: 3500,
    tier: 'Gold',
    reputationScore: 930,
    completedCircles: 6,
    onTimeRate: 100,
    defaultsCount: 0,
    totalVolumeMad: 24000,
    accountAgeMonths: 18,
  },
  {
    id: 'u-youssef',
    name: 'Youssef Alami',
    campusRole: 'Campus Freshman',
    accountId: '0.0.481927',
    walletBalanceMad: 2500,
    tier: 'New',
    reputationScore: 420,
    completedCircles: 0,
    onTimeRate: 100,
    defaultsCount: 0,
    totalVolumeMad: 0,
    accountAgeMonths: 1,
  },
  {
    id: 'u-amina',
    name: 'Amina Kabbaj',
    campusRole: 'Campus Co-op Lead',
    accountId: '0.0.481934',
    walletBalanceMad: 3000,
    tier: 'Silver',
    reputationScore: 765,
    completedCircles: 3,
    onTimeRate: 96,
    defaultsCount: 0,
    totalVolumeMad: 11500,
    accountAgeMonths: 11,
  },
  {
    id: 'u-karim',
    name: 'Karim El Idrissi',
    campusRole: 'Junior Dev',
    accountId: '0.0.481941',
    walletBalanceMad: 2400,
    tier: 'Bronze',
    reputationScore: 610,
    completedCircles: 2,
    onTimeRate: 94,
    defaultsCount: 0,
    totalVolumeMad: 5200,
    accountAgeMonths: 6,
  },
  {
    id: 'u-nadia',
    name: 'Nadia Mansouri',
    campusRole: 'Diaspora Saver',
    accountId: '0.0.481952',
    walletBalanceMad: 4200,
    tier: 'Gold',
    reputationScore: 955,
    completedCircles: 8,
    onTimeRate: 100,
    defaultsCount: 0,
    totalVolumeMad: 40000,
    accountAgeMonths: 24,
  },
  {
    id: 'u-omar',
    name: 'Omar Tazi',
    campusRole: 'Merchant Circle',
    accountId: '0.0.481960',
    walletBalanceMad: 2200,
    tier: 'Defaulter',
    reputationScore: 210,
    completedCircles: 1,
    onTimeRate: 62,
    defaultsCount: 1,
    totalVolumeMad: 2000,
    accountAgeMonths: 5,
  },
  {
    id: 'u-lina',
    name: 'Lina Zemmouri',
    campusRole: 'UM6P Design',
    accountId: '0.0.481968',
    walletBalanceMad: 2800,
    tier: 'Silver',
    reputationScore: 790,
    completedCircles: 4,
    onTimeRate: 98,
    defaultsCount: 0,
    totalVolumeMad: 14000,
    accountAgeMonths: 13,
  },
  {
    id: 'u-mehdi',
    name: 'Mehdi Rachidi',
    campusRole: 'Pharmacy Intern',
    accountId: '0.0.481974',
    walletBalanceMad: 1900,
    tier: 'New',
    reputationScore: 420,
    completedCircles: 0,
    onTimeRate: 100,
    defaultsCount: 0,
    totalVolumeMad: 0,
    accountAgeMonths: 2,
  },
];

const RANDOM_FIRST_NAMES = [
  'Rania', 'Ziad', 'Kenza', 'Adam', 'Meryem', 'Ilyas', 'Chaimae', 'Anas',
  'Hajar', 'Bilal', 'Soukaina', 'Walid', 'Ghita', 'Othmane', 'Rim', 'Saad',
];
const RANDOM_LAST_NAMES = [
  'Berrada', 'Fassi', 'Benjelloun', 'Skalli', 'Amrani', 'Chakir', 'Kettani', 'Lazaar',
  'Bensaid', 'Cherkaoui', 'Harrak', 'Bouchra', 'Mernissi', 'Rhouma', 'Tahiri', 'Ouazzani',
];
const RANDOM_ROLES = [
  'FST Student', 'EMI Campus', 'INPT Member', 'Small Trader', 'UI/UX Fellow',
  'UM6P Cohort', 'Co-op Member', 'Diaspora Youth',
];

export function generateRandomUser(existingIds: Set<string>, allowDefaulter = true): UserProfile {
  const first = RANDOM_FIRST_NAMES[Math.floor(Math.random() * RANDOM_FIRST_NAMES.length)];
  const last = RANDOM_LAST_NAMES[Math.floor(Math.random() * RANDOM_LAST_NAMES.length)];
  const role = RANDOM_ROLES[Math.floor(Math.random() * RANDOM_ROLES.length)];
  const acctSuffix = 482100 + Math.floor(Math.random() * 8800);
  const id = `u-rand-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const roll = Math.random();

  let completed = 0;
  let defaults = 0;
  let onTime = 100;
  if (allowDefaulter && roll < 0.12) {
    completed = 1;
    defaults = 1;
    onTime = 68;
  } else if (roll < 0.42) {
    completed = 0;
  } else if (roll < 0.65) {
    completed = 1 + Math.floor(Math.random() * 2);
    onTime = 93 + Math.floor(Math.random() * 6);
  } else if (roll < 0.85) {
    completed = 3 + Math.floor(Math.random() * 2);
    onTime = 95 + Math.floor(Math.random() * 5);
  } else {
    completed = 5 + Math.floor(Math.random() * 4);
    onTime = 98 + Math.floor(Math.random() * 3);
  }

  const { tier, score } = deriveTierFromStats(completed, defaults, onTime);
  const uniqueName = existingIds.has(`${first} ${last}`)
    ? `${first} ${last} ${Math.floor(10 + Math.random() * 89)}`
    : `${first} ${last}`;

  return {
    id,
    name: uniqueName,
    campusRole: role,
    accountId: `0.0.${acctSuffix}`,
    walletBalanceMad: 2200 + Math.floor(Math.random() * 2400),
    tier,
    reputationScore: score,
    completedCircles: completed,
    onTimeRate: onTime,
    defaultsCount: defaults,
    totalVolumeMad: completed * 3500,
    accountAgeMonths: completed === 0 ? 1 : 3 + completed * 3,
    isRandom: true,
  };
}

export function createEmptySeats(count: number, contributionMad: number): CircleSeat[] {
  return Array.from({ length: count }, (_, idx) => {
    const position = idx + 1;
    return {
      position,
      userId: null,
      collateralRequired: (count - position) * contributionMad,
      collateralLocked: 0,
      paidCurrentRound: false,
      markedMissed: false,
      slashedCurrentRound: false,
      hasReceivedPot: false,
      totalContributed: 0,
      totalSlashed: 0,
    };
  });
}

export function makeTxHash(): string {
  const chars = '0123456789abcdef';
  let h = '0x';
  for (let i = 0; i < 16; i++) h += chars[Math.floor(Math.random() * chars.length)];
  return h;
}

export function nowTimestamp(): string {
  const d = new Date();
  return d.toISOString().replace('T', ' ').slice(0, 19) + 'Z';
}

export const INITIAL_CIRCLES: DaretCircle[] = [
  {
    id: 'c-hackathon-demo',
    name: 'Campus Hackathon Demo Circle',
    description:
      '4-member PoC circle (2-min rounds). Seat #4 is still open—assign a person, add a random, or test New vs Gold collateral before locking.',
    contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f88421',
    hcsTopicId: '0.0.884210',
    memberCount: 4,
    contributionMad: 250,
    period: '2 min (PoC)',
    minTier: 'New',
    protocolFeePct: 0.5,
    insurancePct: 1,
    drawMode: 'manual',
    status: 'recruiting',
    currentRound: 1,
    countdownSec: 120,
    escrowPotMad: 0,
    collateralVaultMad: 0,
    protocolTreasuryMad: 0,
    insurancePoolMad: 0,
    seats: [
      {
        position: 1,
        userId: 'u-youssef', // New -> 750 MAD collateral (demonstrates full slash power!)
        collateralRequired: 750,
        collateralLocked: 0,
        paidCurrentRound: false,
        markedMissed: false,
        slashedCurrentRound: false,
        hasReceivedPot: false,
        totalContributed: 0,
        totalSlashed: 0,
      },
      {
        position: 2,
        userId: 'u-salma', // Gold -> 25% of 500 = 125 MAD collateral
        collateralRequired: 125,
        collateralLocked: 0,
        paidCurrentRound: false,
        markedMissed: false,
        slashedCurrentRound: false,
        hasReceivedPot: false,
        totalContributed: 0,
        totalSlashed: 0,
      },
      {
        position: 3,
        userId: 'u-amina', // Silver -> 50% of 250 = 125 MAD collateral
        collateralRequired: 125,
        collateralLocked: 0,
        paidCurrentRound: false,
        markedMissed: false,
        slashedCurrentRound: false,
        hasReceivedPot: false,
        totalContributed: 0,
        totalSlashed: 0,
      },
      {
        position: 4,
        userId: null, // Open slot ready for user to assign or add random!
        collateralRequired: 0,
        collateralLocked: 0,
        paidCurrentRound: false,
        markedMissed: false,
        slashedCurrentRound: false,
        hasReceivedPot: false,
        totalContributed: 0,
        totalSlashed: 0,
      },
    ],
    events: [
      {
        id: 'ev-1',
        sequenceNumber: 1,
        topicId: '0.0.884210',
        consensusTimestamp: '2026-11-13 19:40:00Z',
        txHash: '0xa91c48b2f1e0349d',
        type: 'CIRCLE_CREATED',
        actorAccountId: '0.0.481920',
        actorName: 'Salma Bennani',
        round: 0,
        feeUsd: '$0.0005',
        detail: 'Deployed 4-seat circle · 250 MAD/round · MinTier: New',
        servicesUsed: ['EVM', 'HCS'],
      },
      {
        id: 'ev-2',
        sequenceNumber: 2,
        topicId: '0.0.884210',
        consensusTimestamp: '2026-11-13 19:40:14Z',
        txHash: '0xb73e90a1d428c021',
        type: 'MEMBER_JOINED',
        actorAccountId: '0.0.481927',
        actorName: 'Youssef Alami',
        round: 0,
        amountMad: 750,
        feeUsd: '$0.0001',
        detail: 'Seat #1 claimed (New tier · 750 MAD collateral req)',
        servicesUsed: ['EVM', 'MIRROR', 'HCS'],
      },
      {
        id: 'ev-3',
        sequenceNumber: 3,
        topicId: '0.0.884210',
        consensusTimestamp: '2026-11-13 19:40:28Z',
        txHash: '0xc41f02b9921a7e44',
        type: 'MEMBER_JOINED',
        actorAccountId: '0.0.481920',
        actorName: 'Salma Bennani',
        round: 0,
        amountMad: 125,
        feeUsd: '$0.0001',
        detail: 'Seat #2 claimed (Gold tier · 25% rate = 125 MAD collateral)',
        servicesUsed: ['EVM', 'HTS', 'MIRROR', 'HCS'],
      },
      {
        id: 'ev-4',
        sequenceNumber: 4,
        topicId: '0.0.884210',
        consensusTimestamp: '2026-11-13 19:40:41Z',
        txHash: '0xd89a77e0135f8b09',
        type: 'MEMBER_JOINED',
        actorAccountId: '0.0.481934',
        actorName: 'Amina Kabbaj',
        round: 0,
        amountMad: 125,
        feeUsd: '$0.0001',
        detail: 'Seat #3 claimed (Silver tier · 50% rate = 125 MAD collateral)',
        servicesUsed: ['EVM', 'HTS', 'MIRROR', 'HCS'],
      },
    ],
  },
  {
    id: 'c-micro-20',
    name: 'ENSIAS 20 MAD Micro-Savings',
    description:
      'Active 6-student micro-daret proving Hedera’s ~$0.0001 fee leaves tiny 20 MAD weekly contributions >99.5% intact.',
    contractAddress: '0x918a11Ff8920C14a0927D1e5819F3b80aA120042',
    hcsTopicId: '0.0.884315',
    memberCount: 6,
    contributionMad: 20,
    period: 'Weekly',
    minTier: 'New',
    protocolFeePct: 0.5,
    insurancePct: 1,
    drawMode: 'prng',
    status: 'active',
    currentRound: 2,
    countdownSec: 120,
    escrowPotMad: 60,
    collateralVaultMad: 175,
    protocolTreasuryMad: 0.9,
    insurancePoolMad: 1.8,
    seats: [
      { position: 1, userId: 'u-karim', collateralRequired: 75, collateralLocked: 75, paidCurrentRound: true, markedMissed: false, slashedCurrentRound: false, hasReceivedPot: true, totalContributed: 40, totalSlashed: 0 },
      { position: 2, userId: 'u-salma', collateralRequired: 20, collateralLocked: 20, paidCurrentRound: true, markedMissed: false, slashedCurrentRound: false, hasReceivedPot: false, totalContributed: 40, totalSlashed: 0 },
      { position: 3, userId: 'u-lina', collateralRequired: 30, collateralLocked: 30, paidCurrentRound: true, markedMissed: false, slashedCurrentRound: false, hasReceivedPot: false, totalContributed: 40, totalSlashed: 0 },
      { position: 4, userId: 'u-youssef', collateralRequired: 40, collateralLocked: 40, paidCurrentRound: false, markedMissed: false, slashedCurrentRound: false, hasReceivedPot: false, totalContributed: 20, totalSlashed: 0 },
      { position: 5, userId: 'u-amina', collateralRequired: 10, collateralLocked: 10, paidCurrentRound: false, markedMissed: false, slashedCurrentRound: false, hasReceivedPot: false, totalContributed: 20, totalSlashed: 0 },
      { position: 6, userId: 'u-mehdi', collateralRequired: 0, collateralLocked: 0, paidCurrentRound: false, markedMissed: false, slashedCurrentRound: false, hasReceivedPot: false, totalContributed: 20, totalSlashed: 0 },
    ],
    events: [
      {
        id: 'ev-m1',
        sequenceNumber: 1,
        topicId: '0.0.884315',
        consensusTimestamp: '2026-11-12 10:00:00Z',
        txHash: '0x1120af77b4c9e201',
        type: 'PRNG_TIRAGE',
        actorAccountId: '0.0.0169',
        actorName: 'Hedera Native PRNG',
        round: 0,
        feeUsd: '$0.0001',
        detail: 'Fair on-chain tirage drew seats #1..#6 for 20 MAD weekly circle',
        servicesUsed: ['PRNG', 'HCS'],
      },
      {
        id: 'ev-m2',
        sequenceNumber: 2,
        topicId: '0.0.884315',
        consensusTimestamp: '2026-11-12 10:05:12Z',
        txHash: '0x44f18e92a31c7002',
        type: 'ROUND_CLOSED_PAYOUT',
        actorAccountId: '0.0.481941',
        actorName: 'Karim El Idrissi',
        round: 1,
        amountMad: 120,
        feeUsd: '$0.0001',
        detail: 'Round 1 closed · 120 MAD pot transferred to Seat #1 (Karim)',
        servicesUsed: ['EVM', 'HTS', 'HCS', 'FEES'],
      },
    ],
  },
  {
    id: 'c-trusted-bronze',
    name: 'Trusted Co-op Circle (Bronze+ Only)',
    description:
      'Gated 5-member circle enforcing minTier = Bronze. Try assigning a New or Defaulter user to observe smart-contract join() rejection!',
    contractAddress: '0x331f99Aa1024E78c4481F2014c9d3381B9071190',
    hcsTopicId: '0.0.884509',
    memberCount: 5,
    contributionMad: 500,
    period: 'Monthly',
    minTier: 'Bronze',
    protocolFeePct: 1,
    insurancePct: 1,
    drawMode: 'manual',
    status: 'recruiting',
    currentRound: 1,
    countdownSec: 120,
    escrowPotMad: 0,
    collateralVaultMad: 0,
    protocolTreasuryMad: 0,
    insurancePoolMad: 0,
    seats: [
      { position: 1, userId: 'u-nadia', collateralRequired: 500, collateralLocked: 0, paidCurrentRound: false, markedMissed: false, slashedCurrentRound: false, hasReceivedPot: false, totalContributed: 0, totalSlashed: 0 },
      { position: 2, userId: 'u-lina', collateralRequired: 750, collateralLocked: 0, paidCurrentRound: false, markedMissed: false, slashedCurrentRound: false, hasReceivedPot: false, totalContributed: 0, totalSlashed: 0 },
      { position: 3, userId: null, collateralRequired: 1000, collateralLocked: 0, paidCurrentRound: false, markedMissed: false, slashedCurrentRound: false, hasReceivedPot: false, totalContributed: 0, totalSlashed: 0 },
      { position: 4, userId: null, collateralRequired: 500, collateralLocked: 0, paidCurrentRound: false, markedMissed: false, slashedCurrentRound: false, hasReceivedPot: false, totalContributed: 0, totalSlashed: 0 },
      { position: 5, userId: null, collateralRequired: 0, collateralLocked: 0, paidCurrentRound: false, markedMissed: false, slashedCurrentRound: false, hasReceivedPot: false, totalContributed: 0, totalSlashed: 0 },
    ],
    events: [
      {
        id: 'ev-t1',
        sequenceNumber: 1,
        topicId: '0.0.884509',
        consensusTimestamp: '2026-11-13 18:10:00Z',
        txHash: '0x88e104cc91a209b3',
        type: 'CIRCLE_CREATED',
        actorAccountId: '0.0.481952',
        actorName: 'Nadia Mansouri',
        round: 0,
        feeUsd: '$0.0005',
        detail: 'Created gated circle · 5 seats × 500 MAD · Contract requires Bronze+ tier',
        servicesUsed: ['EVM', 'HCS'],
      },
    ],
  },
];
