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
    maxEarlyAccess: 'All positions (including #1)',
    badgeSummary: 'Non-transferable HTS Soulbound Badge · 99%+ on-time history',
    effectText: 'Minimal collateral (25% of base); unlocked access to early positions.',
    accentClass: 'text-amber-200 border-amber-300/45',
    pillBg: 'bg-amber-400/20 text-amber-100 border-amber-300/45',
  },
  Silver: {
    id: 'Silver',
    label: 'Silver',
    collateralMultiplier: 0.5,
    maxEarlyAccess: 'Mid & late positions',
    badgeSummary: 'Non-transferable HTS Badge · Multiple completed circles',
    effectText: 'Reduced collateral (50% of base); access to mid-order positions.',
    accentClass: 'text-cyan-100 border-cyan-200/45',
    pillBg: 'bg-cyan-300/20 text-cyan-50 border-cyan-200/45',
  },
  Bronze: {
    id: 'Bronze',
    label: 'Bronze',
    collateralMultiplier: 0.75,
    maxEarlyAccess: 'Mid & late positions',
    badgeSummary: 'Non-transferable HTS Badge · 1+ completed circle',
    effectText: 'Reduced collateral (75% of base); access to mid-order positions.',
    accentClass: 'text-sky-100 border-sky-300/45',
    pillBg: 'bg-sky-300/20 text-sky-100 border-sky-300/45',
  },
  New: {
    id: 'New',
    label: 'New',
    collateralMultiplier: 1.0,
    maxEarlyAccess: 'Capped circle size · Full collateral',
    badgeSummary: 'No prior HCS history · Cold-start safe',
    effectText: 'Full 100% collateral for the chosen position; cap on circle size.',
    accentClass: 'text-white border-white/35',
    pillBg: 'bg-white/15 text-white border-white/35',
  },
  Defaulter: {
    id: 'Defaulter',
    label: 'Defaulter',
    collateralMultiplier: 1.0,
    maxEarlyAccess: 'Latest positions only (or blocked)',
    badgeSummary: 'Heavy, slowly decaying Mirror Node penalty',
    effectText: 'Blocked by strict circles, or full collateral and latest positions only.',
    accentClass: 'text-rose-200 border-rose-300/45',
    pillBg: 'bg-rose-400/20 text-rose-100 border-rose-300/45',
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
    need: 'Hold the pot and collateral, run payouts & penalties',
    component: 'Smart Contract (EVM, Solidity)',
    tag: 'Escrow & Slashing',
    summary: 'createCircle(), join(), contribute(), closeRound(), slashCollateral()',
    detail: 'Holds circle escrow and locked collateral autonomously. When a member misses a deadline after grace, the contract transfers their exact shortfall from locked collateral so the recipient is still paid on time.',
    whyHedera: 'Deterministic execution with predictable low gas costs—never stalls behind volatile fee spikes.',
  },
  {
    id: 'hts',
    need: 'Circle currency & non-transferable reputation tier',
    component: 'Hedera Token Service (HTS)',
    tag: 'Tokens & Badges',
    summary: 'Circle stablecoin / PoC test token + Soulbound Tier NFTs',
    detail: 'Native HTS tokens represent circle deposits (test token in PoC; regulated MAD stablecoin or e-money in production). Membership and reputation tiers are issued as non-transferable HTS badges.',
    whyHedera: 'Native token minting, freezing, and custom badge logic without complex ERC boilerplate.',
  },
  {
    id: 'hcs',
    need: 'Undeniable record of every circle event',
    component: 'Hedera Consensus Service (HCS)',
    tag: 'Immutable Audit Log',
    summary: 'One dedicated topic per circle · consensus timestamps',
    detail: 'Every deposit, missed deadline, automatic collateral slash, and payout emits a cryptographic message to the circle’s HCS topic. Settles "I paid!" disputes permanently.',
    whyHedera: 'Tamper-proof public ordering at fractions of a cent per message.',
  },
  {
    id: 'mirror',
    need: 'Dashboard telemetry and reputation scoring',
    component: 'Mirror Node API',
    tag: 'Free History Read',
    summary: 'Reads full account history for free to compute member tiers',
    detail: 'Before accepting join(), the app and verifier inspect completed circles, on-time rate, defaults (heavy, slowly decaying penalty), total volume handled, and account age across all past HCS topics.',
    whyHedera: 'Zero-cost historical indexing without running expensive archive nodes.',
  },
  {
    id: 'prng',
    need: 'Fair draw of positions (Tirage)',
    component: 'Native Pseudo-Random Number Generation',
    tag: 'Fair Tirage',
    summary: 'On-chain randomness resolves competing slot requests',
    detail: 'When multiple members want the same early payout slot, Hedera’s native PRNG executes an unbiased, verifiable draw—mirroring the beloved traditional tirage without human manipulation.',
    whyHedera: 'Built directly into Hedera smart contract precompiles—no external oracle cost.',
  },
  {
    id: 'fees',
    need: 'Make tiny 20 MAD student & trader deposits viable',
    component: 'Fixed Low Fees & 3–5s Finality',
    tag: 'Micro-Payment Ready',
    summary: '~$0.0001 transaction cost · 3 to 5 second finality',
    detail: 'On high-fee chains, gas eats small 20 MAD contributions alive. On Hedera, network fees stay negligible (a few cents across an entire 10-month circle) with instant confirmation.',
    whyHedera: 'Essential for financial inclusion across students, small merchants, and unbanked savers.',
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
    title: 'Protocol Fee',
    mechanism: '0.5% to 1% on each contribution, collected natively by the contract.',
    notes: 'Primary early revenue stream—far cheaper than losing an entire pot to fraud.',
    phase: 'Phase 1+',
  },
  {
    title: 'Early-Slot Collateral Financing',
    mechanism: 'A licensed partner or platform pool lends collateral for early slots for a small fee.',
    notes: 'Transforms the Daret into accessible micro-credit via a licensed lending/microfinance partner.',
    phase: 'Phase 3',
  },
  {
    title: 'Insurance Pool Margin',
    mechanism: 'Part of the optional 1–2% insurance fee retained after covering rare shortfalls.',
    notes: 'High margin because (N - k) × C collateral already covers almost all default risk.',
    phase: 'Phase 2+',
  },
  {
    title: 'Float Yield (Production)',
    mechanism: 'Idle escrow & collateral held in a regulated yield-bearing instrument via licensed partner.',
    notes: 'Requires proper regulatory authorization; explicitly excluded from testnet PoC.',
    phase: 'Phase 3',
  },
  {
    title: 'B2B / White-Label',
    mechanism: 'Subscriptions for universities, associations, employers, and cooperatives.',
    notes: 'Enables payroll-linked Darets & campus circles with predictable recurring SaaS revenue.',
    phase: 'Phase 2–3',
  },
  {
    title: 'Consent-Based Reputation API',
    mechanism: 'Microfinance institutions & lenders pay to query verified HCS payment track records.',
    notes: 'Builds a bankable credit identity for millions without traditional bank history.',
    phase: 'Phase 3',
  },
  {
    title: 'MAD On/Off-Ramp Partnerships',
    mechanism: 'Revenue share with mobile-money, payment, and exchange partners.',
    notes: 'Abstracts away wallets & crypto so non-technical users save seamlessly in MAD.',
    phase: 'Phase 2+',
  },
];

export const JUDGING_CRITERIA = [
  { label: 'Meaningful Hedera Integration', weight: 25, proof: '6 native Hedera components: EVM Escrow, HTS Tokens/Soulbound Badges, HCS Audit Topics, Mirror Node Reputation, Native PRNG Tirage, and $0.0001 micro-fees.' },
  { label: 'Technical Execution & Functionality', weight: 20, proof: 'Full interactive circle math, automated collateral slashing, live round progression, and real-time HCS event telemetry.' },
  { label: 'Problem Relevance & Clarity', weight: 15, proof: 'Directly protects millions of Maghreb Daret savers from organizer disappearance, early-payout default, and payment disputes.' },
  { label: 'Innovation & Differentiation', weight: 15, proof: 'Arithmetic collateral formula (N - k) × C paired with Mirror Node Soulbound Tiers turns social trust into provable game theory.' },
  { label: 'Real-World Impact & Adoption Potential', weight: 15, proof: 'Serves campus students, small traders, diaspora families, and unbanked users with viable 20 MAD micro-deposits and a clear 3-phase rollout.' },
  { label: 'Pitch & Product Demonstration', weight: 10, proof: 'Includes the exact 4-member 2-minute live slash demo script & New vs. Gold collateral comparison ready for 4Hacks judges.' },
];

export const PITCH_SLIDES = [
  { slide: '1 · Project & Team', desc: 'Daret on Hedera — "The code becomes the organizer." Trustless digital rotating savings circle.' },
  { slide: '2 · Problem', desc: 'Social-trust Darets suffer organizer fraud, post-payout default, zero payment proof, and unbanked exclusion.' },
  { slide: '3 · Solution', desc: 'EVM escrow + (N - k) × C collateral + automatic slashing + Mirror Node reputation tiers.' },
  { slide: '4 · Product / PoC', desc: '4-member demo: Member #1 skips a payment, contract slashes collateral, Recipient #3 still paid in full.' },
  { slide: '5 · Technology & Hedera', desc: 'EVM, HTS, HCS, Mirror Node, Native PRNG, and 3–5s finality with negligible fees.' },
  { slide: '6 · Impact & Adoption', desc: 'Campus students, cooperatives, diaspora & unbanked savers; 50,000 MAD/circle illustrative economics.' },
  { slide: '7 · Vision', desc: 'Phase 1 Campus PoC -> Phase 2 Regulated Pilot -> Phase 3 B2B, Reputation API & Collateral Financing.' },
];

export const COLLABORATION_ROLES = [
  {
    id: 'solidity',
    title: 'Smart Contract Engineer (Hedera EVM)',
    badge: 'Core PoC',
    focus: 'Solidity escrow, (N - k) × C collateral vault, grace window & auto-slashing logic, PRNG tie-break.',
    stack: 'Solidity · Hardhat / Foundry · Hedera JSON-RPC Relay',
  },
  {
    id: 'hedera-sdk',
    title: 'Hedera Services & Mirror Node Dev',
    badge: '25% Judging Weight',
    focus: 'HCS circle topic logger, HTS test stablecoin & Soulbound Tier NFTs, Mirror Node reputation scorer.',
    stack: 'Hedera JS/TS SDK · Mirror Node REST · HTS / HCS',
  },
  {
    id: 'frontend',
    title: 'Frontend & Liquid-Glass UX Designer',
    badge: 'Demo Experience',
    focus: 'Interactive circle cockpit, Darija/French/English accessibility, HashPack / Blade wallet UX.',
    stack: 'React · TypeScript · Tailwind · Framer Motion',
  },
  {
    id: 'campus-pilot',
    title: 'Campus Pilot, Legal & Community Lead',
    badge: 'Adoption & 4Hacks',
    focus: '4Hacks Campus Edition pitch, university circle pilots, partner outreach & Moroccan regulatory alignment.',
    stack: '4Hacks · Pitch Deck · User Testing · Compliance Research',
  },
];
