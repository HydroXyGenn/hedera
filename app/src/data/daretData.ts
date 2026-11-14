export type ReputationTier = 'New' | 'Bronze' | 'Silver' | 'Gold' | 'Defaulter';

export interface TierMetadata {
  id: ReputationTier;
  label: string;
  collateralMultiplier: number;
  maxEarlyAccess: string;
  badgeSummary: string;
  effectText: string;
  accentClass: string;
  pillBg: string;
}

export const REPUTATION_TIERS: Record<ReputationTier, TierMetadata> = {
  Gold: {
    id: 'Gold',
    label: 'Gold',
    collateralMultiplier: 0.25,
    maxEarlyAccess: 'All seats (including #1)',
    badgeSummary: 'Verified on-time saver · 75% deposit discount',
    effectText: 'Pays only 25% of the standard security deposit and unlocks Seat #1.',
    accentClass: 'text-[#15803D] border-[#15803D]/20',
    pillBg: 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]/70',
  },
  Silver: {
    id: 'Silver',
    label: 'Silver',
    collateralMultiplier: 0.5,
    maxEarlyAccess: 'Middle & late seats',
    badgeSummary: 'Trusted repeat saver · 50% deposit discount',
    effectText: 'Pays only 50% of the standard security deposit for middle seats.',
    accentClass: 'text-[#0369A1] border-[#0369A1]/20',
    pillBg: 'bg-[#E0F2FE] text-[#0369A1] border-[#7DD3FC]/70',
  },
  Bronze: {
    id: 'Bronze',
    label: 'Bronze',
    collateralMultiplier: 0.75,
    maxEarlyAccess: 'Middle & late seats',
    badgeSummary: 'Completed 1+ circle · 25% deposit discount',
    effectText: 'Pays 75% of the standard security deposit after finishing a circle.',
    accentClass: 'text-[#B45309] border-[#B45309]/20',
    pillBg: 'bg-[#FEF3C7] text-[#B45309] border-[#FCD34D]/70',
  },
  New: {
    id: 'New',
    label: 'New',
    collateralMultiplier: 1.0,
    maxEarlyAccess: '100% deposit or Last Seat (0 MAD)',
    badgeSummary: 'First-time member · Full deposit or last seat',
    effectText: 'Pays 100% security deposit for early seats, or 0 MAD in the last seat.',
    accentClass: 'text-[#334155] border-slate-900/15',
    pillBg: 'bg-[#F1F5F9] text-[#334155] border-slate-900/12',
  },
  Defaulter: {
    id: 'Defaulter',
    label: 'Missed Payment',
    collateralMultiplier: 1.0,
    maxEarlyAccess: 'Blocked from strict circles',
    badgeSummary: 'Past missed payment on record',
    effectText: 'Blocked from strict circles or restricted to the last seat only.',
    accentClass: 'text-[#B91C1C] border-[#B91C1C]/25',
    pillBg: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5]/70',
  },
};

export interface MemberSeed {
  id: string;
  name: string;
  shortName: string;
  accountId: string;
  defaultTier: ReputationTier;
  roleTag: string;
}

export const MEMBER_POOL: MemberSeed[] = [
  { id: 'm1', name: 'Salma Bennani', shortName: 'Salma', accountId: '0.0.481920', defaultTier: 'Gold', roleTag: 'Engineering Student' },
  { id: 'm2', name: 'Youssef Alami', shortName: 'Youssef', accountId: '0.0.481927', defaultTier: 'New', roleTag: 'Campus Freshman' },
  { id: 'm3', name: 'Amina Kabbaj', shortName: 'Amina', accountId: '0.0.481934', defaultTier: 'Silver', roleTag: 'Co-op Merchant' },
  { id: 'm4', name: 'Karim El Idrissi', shortName: 'Karim', accountId: '0.0.481941', defaultTier: 'Bronze', roleTag: 'Junior Dev' },
  { id: 'm5', name: 'Nadia Mansouri', shortName: 'Nadia', accountId: '0.0.481952', defaultTier: 'Gold', roleTag: 'Diaspora Saver' },
  { id: 'm6', name: 'Omar Tazi', shortName: 'Omar', accountId: '0.0.481960', defaultTier: 'Silver', roleTag: 'Local Trader' },
  { id: 'm7', name: 'Lina Zemmouri', shortName: 'Lina', accountId: '0.0.481968', defaultTier: 'New', roleTag: 'Design Student' },
  { id: 'm8', name: 'Mehdi Rachidi', shortName: 'Mehdi', accountId: '0.0.481974', defaultTier: 'Bronze', roleTag: 'Pharmacy Intern' },
  { id: 'm9', name: 'Sofia Haddad', shortName: 'Sofia', accountId: '0.0.481981', defaultTier: 'Gold', roleTag: 'Association Lead' },
  { id: 'm10', name: 'Hamza Lahlou', shortName: 'Hamza', accountId: '0.0.481990', defaultTier: 'Silver', roleTag: 'Campus Club' },
  { id: 'm11', name: 'Ines Chraibi', shortName: 'Ines', accountId: '0.0.482003', defaultTier: 'New', roleTag: 'Grad Researcher' },
  { id: 'm12', name: 'Tarek Naciri', shortName: 'Tarek', accountId: '0.0.482015', defaultTier: 'Bronze', roleTag: 'Freelancer' },
];

export interface HederaServiceCard {
  id: string;
  need: string;
  component: string;
  tag: string;
  summary: string;
  detail: string;
  whyHedera: string;
}

export const HEDERA_STACK: HederaServiceCard[] = [
  {
    id: 'evm',
    need: 'Holds the monthly pot and security deposits safely',
    component: 'Automatic Escrow Vault',
    tag: 'Safe Pot',
    summary: 'Collects payments and sends the pot to the winner automatically.',
    detail: 'If someone misses a payment, their security deposit covers it automatically so the winner gets paid on time.',
    whyHedera: 'Runs automatically on time with near-zero fees.',
  },
  {
    id: 'hts',
    need: 'Digital Dirhams and non-transferable trust badges',
    component: 'Digital Dirhams & Trust Badges',
    tag: 'Badges',
    summary: 'Tracks circle deposits and rewards on-time savers with Gold, Silver, or Bronze badges.',
    detail: 'Trust badges stay attached to your account so good savers unlock lower security deposits.',
    whyHedera: 'Built-in digital badges without complicated setup.',
  },
  {
    id: 'hcs',
    need: 'Permanent proof for every single payment',
    component: 'Verified Payment Receipts',
    tag: 'Receipts',
    summary: 'Every payment creates an unchangeable receipt with the exact time.',
    detail: 'Ends WhatsApp screenshot arguments forever—anyone can verify who paid in seconds.',
    whyHedera: 'Public, tamper-proof receipts costing a fraction of a cent.',
  },
  {
    id: 'mirror',
    need: 'Free lookup of past savings history',
    component: 'Automatic Trust Check',
    tag: 'Free History',
    summary: 'Checks past circles for free to calculate each member’s trust badge.',
    detail: 'New wallets start as New (100% deposit), so someone who missed a payment cannot cheat by making a new account.',
    whyHedera: 'Instant history checks at zero cost to members.',
  },
  {
    id: 'prng',
    need: 'Fair draw of payout turns (Tirage)',
    component: 'Fair Random Draw (Tirage)',
    tag: 'Fair Draw',
    summary: 'Picks payout turns fairly when multiple friends want the early rounds.',
    detail: 'Brings the traditional Moroccan tirage online so nobody can rig the order.',
    whyHedera: 'Verifiable random draw built right into the network.',
  },
  {
    id: 'fees',
    need: 'Keep tiny 20 MAD student circles affordable',
    component: 'Sub-Cent Transaction Fees',
    tag: '~$0.0001 Fee',
    summary: 'Costs ~$0.0001 per payment and confirms in 3 to 5 seconds.',
    detail: 'Even a 20 MAD student savings circle keeps over 99.9% of its money.',
    whyHedera: 'Fixed ultra-low fees make micro-savings work for everyone.',
  },
];

export interface RevenueStream {
  title: string;
  mechanism: string;
  notes: string;
  phase: string;
}

export const REVENUE_STREAMS: RevenueStream[] = [
  {
    title: 'Small Circle Fee (0.5% – 1%)',
    mechanism: 'A tiny service fee per round keeps the circle 100% protected.',
    notes: 'Far cheaper than losing a whole pot to a missed payment.',
    phase: 'Phase 1+',
  },
  {
    title: 'Security Deposit Micro-Loans',
    mechanism: 'Licensed partners can cover a student’s early-seat deposit for a small fee.',
    notes: 'Helps cash-strapped members access early payout rounds.',
    phase: 'Phase 3',
  },
  {
    title: 'Backup Safety Pool (1% – 2%)',
    mechanism: 'Optional shared reserve that covers rare shortfalls on discounted seats.',
    notes: 'Keeps every payout 100% guaranteed.',
    phase: 'Phase 2+',
  },
  {
    title: 'Campus & Co-op Subscriptions',
    mechanism: 'Simple monthly plans for universities, associations, and workplaces.',
    notes: 'Lets organizations run trusted savings circles for their members.',
    phase: 'Phase 2–3',
  },
];

export const JUDGING_CRITERIA = [
  { label: 'Hedera Integration', weight: 25, proof: 'Uses Automatic Escrow, Digital Badges, Verified Payment Receipts, Free Trust Checks, and Fair Random Draw.' },
  { label: 'Working Live Demo', weight: 20, proof: 'Full interactive circle setup, security deposit calculation, missed-payment coverage, and receipt check.' },
  { label: 'Real Moroccan Problem', weight: 15, proof: 'Stops pot theft, missed payments after early payouts, and WhatsApp receipt disputes.' },
  { label: 'Simple Deposit Protection', weight: 15, proof: 'Early winners lock a security deposit while the last seat locks 0 MAD.' },
  { label: 'Financial Inclusion', weight: 15, proof: 'Supports 20 MAD student circles with sub-cent fees and portable savings history.' },
  { label: 'Clear 2-Minute Demo', weight: 10, proof: 'One-click demo shows a missed payment covered automatically on time.' },
];

export const PITCH_SLIDES = [
  { slide: '1 · Intro', desc: 'Daret on Hedera — Moroccan rotating savings protected by automatic escrow.' },
  { slide: '2 · Problem', desc: 'Informal Darets break when someone takes the first pot and stops paying.' },
  { slide: '3 · Solution', desc: 'Automatic Escrow + Security Deposits + Verified Payment Receipts.' },
  { slide: '4 · Live Demo', desc: 'One member misses Round 3, their deposit covers it, and the winner gets paid 100%.' },
  { slide: '5 · Why Hedera', desc: '~$0.0001 fees and 3-second receipts make even 20 MAD student circles work.' },
  { slide: '6 · Impact', desc: 'Built for Moroccan students, families, traders, and unbanked savers.' },
  { slide: '7 · Roadmap', desc: 'Campus PoC today, licensed partner pilot next, nationwide circles at scale.' },
];

export const COLLABORATION_ROLES = [
  {
    id: 'solidity',
    title: 'Smart Contract Builder',
    badge: 'Core PoC',
    focus: 'Maintain automatic escrow, security deposit protection, and fair draw.',
    stack: 'Solidity · Hedera Testnet',
  },
  {
    id: 'hedera-sdk',
    title: 'Hedera Receipts & Badges Dev',
    badge: '25% Weight',
    focus: 'Connect payment receipts, trust badges, and free history checks.',
    stack: 'TypeScript · Hedera SDK',
  },
  {
    id: 'frontend',
    title: 'Product & UX Designer',
    badge: 'Simple UX',
    focus: 'Keep the Moroccan Daret experience clear in English, French, and Darija.',
    stack: 'React · Tailwind CSS',
  },
];
