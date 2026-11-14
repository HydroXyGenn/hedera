import React, { useState } from 'react';
import { DaretCircle, UserProfile } from '../types/daret';
import { TIER_META, roundMad } from '../data/presets';

interface MirrorAndLedgerPanelProps {
  circle: DaretCircle;
  users: UserProfile[];
  activeUserId: string;
}

export const MirrorAndLedgerPanel: React.FC<MirrorAndLedgerPanelProps> = ({
  circle,
  users,
  activeUserId,
}) => {
  const [tab, setTab] = useState<'hcs' | 'mirror' | 'ledger'>('hcs');
  const [inspectUserId, setInspectUserId] = useState<string>(activeUserId);

  const inspectedUser =
    users.find((u) => u.id === inspectUserId) ??
    users.find((u) => u.id === activeUserId) ??
    users[0];

  const totalWalletsMad = roundMad(users.reduce((s, u) => s + u.walletBalanceMad, 0));
  const totalTxFeesUsd = roundMad(circle.events.length * 0.0001);

  return (
    <aside className="glass-panel rounded-[22px] p-6 sm:p-7 space-y-6 sticky top-24">
      {/* Tab Bar */}
      <div className="flex items-center gap-1.5 border-b border-black/[0.06] pb-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setTab('hcs')}
          className={`rounded-full px-3 py-1.5 text-[12px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
            tab === 'hcs'
              ? 'pill-active'
              : 'bg-[#F1F5F9] text-[#6B7280] hover:text-[#111827] hover:bg-[#E2E8F0]'
          }`}
        >
          HCS Log ({circle.events.length})
        </button>

        <button
          type="button"
          onClick={() => setTab('mirror')}
          className={`rounded-full px-3 py-1.5 text-[12px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
            tab === 'mirror'
              ? 'pill-active'
              : 'bg-[#F1F5F9] text-[#6B7280] hover:text-[#111827] hover:bg-[#E2E8F0]'
          }`}
        >
          Mirror Node
        </button>

        <button
          type="button"
          onClick={() => setTab('ledger')}
          className={`rounded-full px-3 py-1.5 text-[12px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
            tab === 'ledger'
              ? 'pill-active'
              : 'bg-[#F1F5F9] text-[#6B7280] hover:text-[#111827] hover:bg-[#E2E8F0]'
          }`}
        >
          Contract Ledger
        </button>
      </div>

      {/* TAB 1: HCS Audit Stream */}
      {tab === 'hcs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-[12px] text-[#6B7280] tabular-nums">
            <span>Topic {circle.hcsTopicId}</span>
            <span>Contract {circle.contractAddress.slice(0, 10)}…</span>
          </div>

          <div className="divide-y divide-black/[0.06] max-h-[540px] overflow-y-auto pr-1">
            {circle.events.map((ev) => {
              const isAlert =
                ev.type === 'COLLATERAL_SLASHED' ||
                ev.type === 'GRACE_MISSED' ||
                ev.type === 'JOIN_REJECTED';
              const isSuccess =
                ev.type === 'ROUND_CLOSED_PAYOUT' || ev.type === 'COLLATERAL_REFUNDED';

              return (
                <div key={ev.id} className="py-4 first:pt-1 last:pb-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[12px] font-semibold tabular-nums">
                      <span className="text-[#6B7280]">#{ev.sequenceNumber}</span>
                      <span
                        className={
                          isAlert
                            ? 'text-[#B91C1C]'
                            : isSuccess
                              ? 'text-[#15803D]'
                              : 'text-[#1A73E8]'
                        }
                      >
                        {ev.type}
                      </span>
                    </div>
                    <span className="text-[12px] text-[#6B7280] tabular-nums">
                      {ev.feeUsd}
                    </span>
                  </div>

                  <p className="text-[14px] text-[#111827] leading-[1.6]">{ev.detail}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#6B7280] tabular-nums">
                    <span>
                      {ev.actorName} ({ev.actorAccountId})
                    </span>
                    <span>{ev.servicesUsed.join(' · ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Mirror Node Reputation Inspector */}
      {tab === 'mirror' && inspectedUser && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#6B7280] block">
              Inspect Any Member’s Mirror Node History (Free Query)
            </label>
            <select
              value={inspectedUser.id}
              onChange={(e) => setInspectUserId(e.target.value)}
              className="w-full rounded-2xl input-surface px-3.5 py-2.5 text-[14px] text-[#111827]"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id} className="bg-white text-[#111827]">
                  {u.name} · {u.accountId} ({u.tier})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-display text-[18px] font-semibold tracking-[-0.02em] text-[#111827]">
                  {inspectedUser.name}
                </div>
                <div className="text-[12px] text-[#6B7280] tabular-nums">
                  Account {inspectedUser.accountId} · {inspectedUser.campusRole}
                </div>
              </div>
              <span
                className={`rounded-full border px-3 py-0.5 text-[12px] font-medium ${
                  TIER_META[inspectedUser.tier].badgeColor
                }`}
              >
                {inspectedUser.tier}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[14px] tabular-nums">
                <span className="text-[#6B7280]">Computed Reputation Score</span>
                <strong className="font-semibold text-[#111827]">
                  {inspectedUser.reputationScore} / 1000
                </strong>
              </div>
              <div className="h-2 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, inspectedUser.reputationScore / 10)}%` }}
                  className={`h-full rounded-full transition-all ${
                    inspectedUser.tier === 'Defaulter' ? 'bg-[#DC2626]' : 'bg-[#1A73E8]'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-6 pt-4 border-t border-black/[0.06]">
              <div>
                <div className="text-[12px] text-[#6B7280]">Completed Circles</div>
                <div className="text-[14px] font-semibold text-[#111827] tabular-nums mt-0.5">
                  {inspectedUser.completedCircles}
                </div>
              </div>
              <div>
                <div className="text-[12px] text-[#6B7280]">On-Time Rate</div>
                <div className="text-[14px] font-semibold text-[#111827] tabular-nums mt-0.5">
                  {inspectedUser.onTimeRate}%
                </div>
              </div>
              <div>
                <div className="text-[12px] text-[#6B7280]">Defaults</div>
                <div
                  className={`text-[14px] font-semibold tabular-nums mt-0.5 ${
                    inspectedUser.defaultsCount > 0 ? 'text-[#B91C1C]' : 'text-[#111827]'
                  }`}
                >
                  {inspectedUser.defaultsCount}
                </div>
              </div>
              <div>
                <div className="text-[12px] text-[#6B7280]">Total Volume</div>
                <div className="text-[14px] font-semibold text-[#111827] tabular-nums mt-0.5">
                  {inspectedUser.totalVolumeMad.toLocaleString()} MAD
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-black/[0.06] text-[12px] text-[#6B7280] leading-[1.6]">
              <strong className="font-semibold text-[#111827]">Soulbound HTS Badge:</strong>{' '}
              {TIER_META[inspectedUser.tier].shortRule}. Cannot be sold or reset by creating a fake wallet (new accounts start at New = 100% collateral).
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Contract & Wallet Accounting */}
      {tab === 'ledger' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-display text-[18px] font-semibold tracking-[-0.02em] text-[#111827]">
              Escrow &amp; Wallet State (MAD)
            </h3>

            <div className="divide-y divide-black/[0.06] text-[14px] tabular-nums">
              <div className="py-2.5 flex justify-between">
                <span className="text-[#6B7280]">Circle Escrow Pot</span>
                <span className="font-semibold text-[#111827]">
                  {circle.escrowPotMad.toLocaleString()} MAD
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#6B7280]">Locked Collateral Vault</span>
                <span className="font-semibold text-[#111827]">
                  {circle.collateralVaultMad.toLocaleString()} MAD
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#6B7280]">Insurance Pool Reserve</span>
                <span className="font-semibold text-[#111827]">
                  {roundMad(circle.insurancePoolMad).toLocaleString()} MAD
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#6B7280]">Protocol Treasury ({circle.protocolFeePct}%)</span>
                <span className="font-semibold text-[#111827]">
                  {roundMad(circle.protocolTreasuryMad).toLocaleString()} MAD
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#6B7280]">Sum of Directory Wallets</span>
                <span className="font-semibold text-[#111827]">
                  {totalWalletsMad.toLocaleString()} MAD
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-black/[0.06] space-y-1.5">
            <div className="text-[12px] font-medium text-[#6B7280]">
              Cumulative Hedera Gas Cost
            </div>
            <div className="font-display text-[18px] font-semibold tabular-nums text-[#111827]">
              ~${totalTxFeesUsd.toFixed(4)} USD{' '}
              <span className="text-[12px] font-normal text-[#6B7280]">
                ({circle.events.length} on-chain events)
              </span>
            </div>
            <p className="text-[12px] text-[#6B7280] leading-[1.6]">
              Every join, contribution, slash, and payout executes with 3–5s deterministic finality.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
