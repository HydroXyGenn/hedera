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
    <aside className="glass-panel rounded-2xl p-6 space-y-5 sticky top-20">
      {/* Tab Bar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#0F172A]/[0.06] pb-4">
        <button
          type="button"
          onClick={() => setTab('hcs')}
          className={`rounded-full px-2.5 sm:px-3 py-1.5 text-[11.5px] sm:text-[12px] font-semibold whitespace-nowrap cursor-pointer transition-colors ${
            tab === 'hcs'
              ? 'pill-active'
              : 'bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A] hover:bg-[#E2E8F0]'
          }`}
        >
          HCS Log ({circle.events.length})
        </button>

        <button
          type="button"
          onClick={() => setTab('mirror')}
          className={`rounded-full px-2.5 sm:px-3 py-1.5 text-[11.5px] sm:text-[12px] font-semibold whitespace-nowrap cursor-pointer transition-colors ${
            tab === 'mirror'
              ? 'pill-active'
              : 'bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A] hover:bg-[#E2E8F0]'
          }`}
        >
          Mirror Node
        </button>

        <button
          type="button"
          onClick={() => setTab('ledger')}
          className={`rounded-full px-2.5 sm:px-3 py-1.5 text-[11.5px] sm:text-[12px] font-semibold whitespace-nowrap cursor-pointer transition-colors ${
            tab === 'ledger'
              ? 'pill-active'
              : 'bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A] hover:bg-[#E2E8F0]'
          }`}
        >
          Contract Ledger
        </button>
      </div>

      {/* TAB 1: HCS Audit Stream */}
      {tab === 'hcs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between font-mono-tabular text-[12px] text-[#475569]">
            <span>Topic {circle.hcsTopicId}</span>
            <span>Contract {circle.contractAddress.slice(0, 10)}…</span>
          </div>

          <div className="divide-y divide-[#0F172A]/[0.06] max-h-[540px] overflow-y-auto pr-1">
            {[...circle.events]
              .sort((a, b) => b.sequenceNumber - a.sequenceNumber)
              .map((ev) => {
              const isAlert =
                ev.type === 'COLLATERAL_SLASHED' ||
                ev.type === 'GRACE_MISSED' ||
                ev.type === 'JOIN_REJECTED';
              const isSuccess =
                ev.type === 'ROUND_CLOSED_PAYOUT' || ev.type === 'COLLATERAL_REFUNDED';

              return (
                <div key={ev.id} className="py-3.5 first:pt-1 last:pb-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-mono-tabular text-[12px] font-semibold">
                      <span className="text-[#475569]">#{ev.sequenceNumber}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isAlert
                            ? 'bg-[#FEE2E2] text-[#B91C1C]'
                            : isSuccess
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : 'bg-[#E0F2FE] text-[#0369A1]'
                        }`}
                      >
                        {ev.type}
                      </span>
                    </div>
                    <span className="font-mono-tabular text-[12px] text-[#475569]">
                      {ev.feeUsd}
                    </span>
                  </div>

                  <p className="text-[13px] text-[#0F172A] leading-[1.55]">{ev.detail}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono-tabular text-[11px] text-[#475569]">
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
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-[#475569] block">
              Inspect Member Mirror Node History (Free Query)
            </label>
            <select
              value={inspectedUser.id}
              onChange={(e) => setInspectUserId(e.target.value)}
              className="w-full rounded-xl input-surface px-3.5 py-2.5 text-[13px] text-[#0F172A]"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id} className="bg-white text-[#0F172A]">
                  {u.name} · {u.accountId} ({u.tier})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-display text-[17px] font-semibold text-[#0F172A]">
                  {inspectedUser.name}
                </div>
                <div className="font-mono-tabular text-[12px] text-[#475569]">
                  Account {inspectedUser.accountId} · {inspectedUser.campusRole}
                </div>
              </div>
              <span
                className={`rounded-full border px-3 py-0.5 text-[12px] font-semibold ${
                  TIER_META[inspectedUser.tier].badgeColor
                }`}
              >
                {inspectedUser.tier}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[13px] font-mono-tabular">
                <span className="text-[#475569]">Computed Reputation Score</span>
                <strong className="font-semibold text-[#0F172A]">
                  {inspectedUser.reputationScore} / 1000
                </strong>
              </div>
              <div className="h-2 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, inspectedUser.reputationScore / 10)}%` }}
                  className={`h-full rounded-full transition-all ${
                    inspectedUser.tier === 'Defaulter' ? 'bg-[#EF4444]' : 'bg-[#1A73E8]'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-6 pt-4 border-t border-[#0F172A]/[0.06]">
              <div>
                <div className="text-[12px] text-[#475569]">Completed Circles</div>
                <div className="font-mono-tabular text-[14px] font-semibold text-[#0F172A] mt-0.5">
                  {inspectedUser.completedCircles}
                </div>
              </div>
              <div>
                <div className="text-[12px] text-[#475569]">On-Time Rate</div>
                <div className="font-mono-tabular text-[14px] font-semibold text-[#0F172A] mt-0.5">
                  {inspectedUser.onTimeRate}%
                </div>
              </div>
              <div>
                <div className="text-[12px] text-[#475569]">Defaults</div>
                <div
                  className={`font-mono-tabular text-[14px] font-semibold mt-0.5 ${
                    inspectedUser.defaultsCount > 0 ? 'text-[#B91C1C]' : 'text-[#0F172A]'
                  }`}
                >
                  {inspectedUser.defaultsCount}
                </div>
              </div>
              <div>
                <div className="text-[12px] text-[#475569]">Total Volume</div>
                <div className="font-mono-tabular text-[14px] font-semibold text-[#0F172A] mt-0.5">
                  {inspectedUser.totalVolumeMad.toLocaleString()} MAD
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#0F172A]/[0.06] text-[12px] text-[#475569] leading-[1.6]">
              <strong className="font-semibold text-[#0F172A]">Soulbound HTS Badge:</strong>{' '}
              {TIER_META[inspectedUser.tier].shortRule}. Cannot be transferred or reset by generating a fresh wallet (new accounts begin at New = 100% collateral).
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Contract & Wallet Accounting */}
      {tab === 'ledger' && (
        <div className="space-y-5">
          <div className="space-y-3">
            <h3 className="font-display text-[16px] font-semibold text-[#0F172A]">
              Escrow &amp; Wallet State (MAD)
            </h3>

            <div className="divide-y divide-[#0F172A]/[0.06] text-[13px] font-mono-tabular">
              <div className="py-2.5 flex justify-between">
                <span className="font-sans text-[#475569]">Circle Escrow Pot</span>
                <span className="font-semibold text-[#0F172A]">
                  {circle.escrowPotMad.toLocaleString()} MAD
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-sans text-[#475569]">Locked Collateral Vault</span>
                <span className="font-semibold text-[#0F172A]">
                  {circle.collateralVaultMad.toLocaleString()} MAD
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-sans text-[#475569]">Insurance Pool Reserve</span>
                <span className="font-semibold text-[#0F172A]">
                  {roundMad(circle.insurancePoolMad).toLocaleString()} MAD
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-sans text-[#475569]">
                  Protocol Treasury ({circle.protocolFeePct}%)
                </span>
                <span className="font-semibold text-[#0F172A]">
                  {roundMad(circle.protocolTreasuryMad).toLocaleString()} MAD
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-sans text-[#475569]">Sum of Directory Wallets</span>
                <span className="font-semibold text-[#0F172A]">
                  {totalWalletsMad.toLocaleString()} MAD
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#0F172A]/[0.06] space-y-1.5">
            <div className="text-[12px] font-semibold text-[#475569]">
              Cumulative Hedera Gas Cost
            </div>
            <div className="font-mono-tabular text-[17px] font-semibold text-[#0F172A]">
              ~${totalTxFeesUsd.toFixed(4)} USD{' '}
              <span className="text-[12px] font-normal text-[#475569]">
                ({circle.events.length} on-chain events)
              </span>
            </div>
            <p className="text-[12px] text-[#475569] leading-[1.55]">
              Every join, contribution, slash, and payout executes with 3–5s deterministic finality.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
