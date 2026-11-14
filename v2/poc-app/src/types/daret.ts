export type ReputationTier = 'New' | 'Bronze' | 'Silver' | 'Gold' | 'Defaulter';

export type RoundPeriod = '2 min (PoC)' | 'Weekly' | 'Monthly';

export type HederaServiceKey = 'EVM' | 'HTS' | 'HCS' | 'MIRROR' | 'PRNG' | 'FEES';

export interface UserProfile {
  id: string;
  name: string;
  campusRole: string;
  accountId: string;
  walletBalanceMad: number;
  tier: ReputationTier;
  reputationScore: number; // 0 - 1000
  completedCircles: number;
  onTimeRate: number; // 0 - 100
  defaultsCount: number;
  totalVolumeMad: number;
  accountAgeMonths: number;
  isRandom?: boolean;
}

export interface CircleSeat {
  position: number; // 1..N
  userId: string | null;
  collateralRequired: number;
  collateralLocked: number;
  paidCurrentRound: boolean;
  markedMissed: boolean;
  slashedCurrentRound: boolean;
  hasReceivedPot: boolean;
  totalContributed: number;
  totalSlashed: number;
  futurePotLienMad?: number;
}

export type HcsEventType =
  | 'CIRCLE_CREATED'
  | 'MEMBER_JOINED'
  | 'JOIN_REJECTED'
  | 'PRNG_TIRAGE'
  | 'COLLATERAL_LOCKED'
  | 'CONTRIBUTION_PAID'
  | 'GRACE_MISSED'
  | 'COLLATERAL_SLASHED'
  | 'ROUND_CLOSED_PAYOUT'
  | 'COLLATERAL_REFUNDED';

export interface HcsEvent {
  id: string;
  sequenceNumber: number;
  topicId: string;
  consensusTimestamp: string;
  txHash: string;
  type: HcsEventType;
  actorAccountId: string;
  actorName: string;
  round: number;
  amountMad?: number;
  feeUsd: string;
  detail: string;
  servicesUsed: HederaServiceKey[];
}

export interface DaretCircle {
  id: string;
  name: string;
  description: string;
  contractAddress: string;
  hcsTopicId: string;
  memberCount: number;
  contributionMad: number;
  period: RoundPeriod;
  minTier: ReputationTier;
  protocolFeePct: number;
  insurancePct: number;
  drawMode: 'manual' | 'prng';
  status: 'recruiting' | 'active' | 'completed';
  currentRound: number;
  countdownSec: number;
  escrowPotMad: number;
  collateralVaultMad: number;
  protocolTreasuryMad: number;
  insurancePoolMad: number;
  seats: CircleSeat[];
  events: HcsEvent[];
}
