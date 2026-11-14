<!-- Auto-converted by Microsoft MarkItDown Hook to save tokens -->
<!-- Source: c:\Users\lenovo\Desktop\hedera\Daret_on_Hedera_Project_Overview (1).pdf -->

# Daret_on_Hedera_Project_Overview (1).pdf (3 pages)


## Page 1

Daret on Hedera - Hedera Cross Campus Challenge 2026
Page 1
Daret on Hedera
A trustless digital rotating savings circle
One-line pitch: the code becomes the organizer. Money and rules are enforced by Hedera, so nobody can run
away with the pot, and every payment is publicly provable.
1. The idea
A daret is the rotating savings circle used by millions of people in Morocco and across the Maghreb. For example,
10 friends each put in 500 MAD per month, and each month one member receives the whole pot of 5,000 MAD.
Everyone gets their money back over the cycle, with no interest and no bank.
The problem. A daret runs on social trust only:

The organizer can disappear with the pot.

A member who has already received their turn can stop paying.

Disputes ("I paid!") have no proof.

People without a bank account have few safe alternatives for saving.
The solution. A smart contract holds the pot in escrow, applies the rules automatically, pays the right member
each round, and logs every event on Hedera. Collateral rules make default unprofitable, and a reputation score
lets circles accept members with confidence.
Who it is for. Students and campus groups, neighbours, colleagues, diaspora families, small traders and anyone
who already uses informal savings circles.
2. Where Hedera is implemented
Need
Hedera component
What it does in the project
Hold the pot and collateral,
run payouts and penalties
Smart contract (EVM,
Solidity)
Escrow, join, contribute, close round, pay the round's
recipient, slash collateral on default.
Circle currency
Hedera Token Service
(HTS)
A test token for the PoC (a regulated stablecoin in
production). NFT or badge for membership and reputation
tier.
Undeniable record of every
event
Hedera Consensus Service
(HCS)
One topic per circle logs each contribution, late payment,
default and payout with a timestamp. Tamper-proof.
Dashboard and reputation
score
Mirror Node API
Reads the full history of any account for free and computes
each member's tier.
Fair draw of positions
Native pseudo-random
number generation
Picks the order on-chain when several members want the
same slot, like the traditional tirage.
Viable tiny payments
Fixed low fees, 3 to 5
second finality
A 20 MAD contribution is still worth making. On many
chains the fee would eat the contribution.
Why Hedera? It enables a verifiable, near-free, fast ledger for small and frequent payments, with token and
audit-log services built in, so the team writes less custom code and the result is easier to trust.


## Page 2

Daret on Hedera - Hedera Cross Campus Challenge 2026
Page 2
3. Solution to the "someone runs away with the money" problem
The risk is the early recipient who stops paying. The design below solves it with arithmetic, not with trust.
The key insight
With N members and a contribution of C, the member in position k receives the pot in round k having paid only k
x C. If they quit, they owe (N - k) x C. The first member is the riskiest; the last member is risk-free because they
are paid only after everyone else.
Required collateral for position k = (N - k) x C. It shrinks as the position gets later.
The rules enforced by the contract
1
Choose a position, lock matching collateral. Want the money early? Lock more. Happy to wait? Lock little
or nothing, and act as a pure saver. People sort themselves, and no one gains by defaulting.
2
Everyone contributes each round into the contract's escrow.
3
If someone misses a payment after a short grace period, the contract automatically takes the missing
amount from their collateral. The recipient is still paid in full and on time.
4
At the end of the circle, unused collateral is returned.
5
Optional insurance pool: a 1 to 2% fee per contribution covers rare shortfalls.
6
Reputation lowers the cost of trust (see below).
Using reputation before someone joins
Every circle writes its events to HCS against each member's account ID. Before accepting a new member, a
circle reads that history through the Mirror Node and computes a score: completed circles, on-time rate, defaults
(heavy, slowly decaying penalty), total volume handled and account age. The score maps to simple tiers.
Tier
Effect when joining
New (no history)
Full collateral for the chosen position; cap on circle size.
Bronze / Silver
Reduced collateral; access to mid-order positions.
Gold
Minimal collateral; access to early positions.
Defaulter
Blocked, or full collateral and latest positions only.

The circle creator can set a minimum tier, and the contract refuses join() if the applicant does not qualify.

The tier is exposed as a non-transferable HTS badge, so reputation cannot be sold.

Cold start: newcomers start with full collateral or small circles to build a record safely.

Fake accounts: a defaulter who restarts with a new account is treated as New and pays full collateral, so
resetting gains nothing.

Privacy: the UI shows tiers instead of raw histories; optional zero-knowledge proofs are a future step.
Why it is a real answer: no trust in an organizer, default is never profitable, every dispute is settled by the
public log, and people with no collateral can still take part as late-position savers.
4. How to make a profit from the service
Hedera's fees are tiny and fixed, so the cost of running a circle is a few cents while the value it secures is
thousands of dirhams. That gap is where the business sits.
Revenue stream
How it works
Notes
Protocol fee
0.5% to 1% on each contribution, taken by the
contract.
Main early revenue. Small enough to stay
far cheaper than losing a pot to fraud.
Early-slot collateral
financing
A partner or the platform's pool lends the collateral
for an early position, in exchange for a small fee.
Turns the daret into micro-credit. Needs a
licensed lending or microfinance partner.


## Page 3

Daret on Hedera - Hedera Cross Campus Challenge 2026
Page 3
Revenue stream
How it works
Notes
Insurance pool margin
Part of the optional 1 to 2% insurance fee is
retained after covering shortfalls.
Works because collateral already covers
most defaults; actual losses stay low.
Float yield (production)
Idle escrow and collateral are held in a regulated,
yield-bearing instrument via a licensed partner.
Only with the right authorization. Not part
of the PoC.
B2B / white-label
Subscription for universities, associations,
employers and cooperatives that run many circles
(for example payroll-linked darets).
Predictable recurring revenue, and a path
to scale.
Reputation API
Microfinance institutions and lenders pay to query a
member's verified payment record (with the
member's consent).
Builds a credit history for people with no
bank record.
On/off-ramp
partnerships
Revenue share with payment, mobile-money or
exchange partners that convert MAD to and from
the circle's token.
Reduces friction for non-crypto users.
Illustrative unit economics
These figures are assumptions for explanation, not forecasts.
Item
Example
One circle
10 members x 500 MAD per month x 10 months = 50,000 MAD flowing through the circle
Protocol fee at 1%
500 MAD per circle per cycle
Hedera network cost
A few cents in total for all transactions, which is negligible
1,000 active circles
About 500,000 MAD in fees per cycle, before partner costs and operations
Growth path

Phase 1: testnet PoC and campus circles.

Phase 2: pilot with a university or association, a licensed partner, and a regulated stablecoin or e-money
token.

Phase 3: B2B packages, the reputation API and collateral financing.
Regulation note: crypto and savings regulation in Morocco is still evolving. For the hackathon, present this as
a transparent escrow and ledger on testnet, not a replacement for banks. Any real deployment would need
legal advice and a licensed partner for holding customer funds, lending and yield.
5. PoC scope for the hackathon
1
Create a circle (members, amount, period).
2
Join with a position and matching collateral.
3
Contribute each round.
4
Close the round: pay the recipient and slash collateral if someone is short.
5
Write every event to HCS and show it on a dashboard through the Mirror Node.
Demo script: run a 4-member circle with a 2-minute period. Make one member deliberately skip a payment and
show the contract covering the gap from their collateral while the recipient is still paid. Then show two applicants
joining the same circle, one New and one Gold, with different collateral amounts.
Check the challenge's thematic areas on your 4Hacks Campus Edition page to confirm that financial inclusion fits.
