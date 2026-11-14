import React from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { DaretCircle, HederaServiceKey, UserProfile } from '../types/daret';
import { TIER_META } from '../data/presets';

interface AppHeaderProps {
  circles: DaretCircle[];
  activeCircleId: string;
  onSelectCircle: (id: string) => void;
  onOpenCreateModal: () => void;
  users: UserProfile[];
  activeUserId: string;
  onSelectUser: (id: string) => void;
  onFaucetTopUp: (userId: string) => void;
  onResetAll: () => void;
  highlightedServices: HederaServiceKey[];
}

const SERVICE_BADGES: { key: HederaServiceKey; label: string }[] = [
  { key: 'EVM', label: 'EVM' },
  { key: 'HTS', label: 'HTS' },
  { key: 'HCS', label: 'HCS' },
  { key: 'MIRROR', label: 'Mirror' },
  { key: 'PRNG', label: 'PRNG' },
  { key: 'FEES', label: '$0.0001' },
];

export const AppHeader: React.FC<AppHeaderProps> = ({
  circles,
  activeCircleId,
  onSelectCircle,
  onOpenCreateModal,
  users,
  activeUserId,
  onSelectUser,
  onFaucetTopUp,
  onResetAll,
  highlightedServices,
}) => {
  const activeUser = users.find((u) => u.id === activeUserId) ?? users[0];

  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/75 backdrop-blur-xl">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 py-3 flex flex-wrap xl:flex-nowrap items-center justify-between gap-3">
        {/* Left: App Brand + Circle Switcher */}
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <div className="flex items-center pr-3 border-r border-black/[0.06] shrink-0">
            <div className="leading-tight whitespace-nowrap">
              <div className="font-display text-[18px] font-semibold tracking-[-0.02em] text-[#111827]">
                Daret <span className="font-normal text-[#6B7280]">PoC</span>
              </div>
              <div className="text-[12px] text-[#6B7280]">
                Hedera Testnet
              </div>
            </div>
          </div>

          {/* Circle Switcher */}
          <div className="flex flex-wrap items-center gap-1.5">
            {circles.map((c) => {
              const active = c.id === activeCircleId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectCircle(c.id)}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    active
                      ? 'pill-active'
                      : 'glass-pill text-[#111827]'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      active
                        ? 'bg-white'
                        : c.status === 'active'
                          ? 'bg-[#10B981]'
                          : c.status === 'completed'
                            ? 'bg-[#1A73E8]'
                            : 'bg-[#F59E0B]'
                    }`}
                  />
                  <span className="max-w-[125px] truncate">{c.name}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1 rounded-full glass-pill px-3 py-1.5 text-[12px] font-medium text-[#111827] whitespace-nowrap cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-[#1A73E8]" />
              <span>New Circle</span>
            </button>
          </div>
        </div>

        {/* Right: Clean Service Indicators + Wallet Switcher + Reset */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Hedera Services Unboxed Strip */}
          <div className="hidden 2xl:flex items-center gap-2 text-[12px] tabular-nums text-[#6B7280]">
            {SERVICE_BADGES.map((sb, idx) => {
              const lit = highlightedServices.includes(sb.key);
              return (
                <React.Fragment key={sb.key}>
                  {idx > 0 && <span className="text-black/15">·</span>}
                  <span
                    className={`transition-colors ${
                      lit ? 'text-[#1A73E8] font-semibold' : 'text-[#6B7280]'
                    }`}
                  >
                    {sb.label}
                  </span>
                </React.Fragment>
              );
            })}
          </div>

          {/* Active Wallet Persona Selector */}
          {activeUser && (
            <div className="flex items-center gap-2.5 rounded-full bg-[#F1F5F9]/85 border border-black/[0.06] px-3.5 py-1.5 whitespace-nowrap">
              <select
                value={activeUser.id}
                onChange={(e) => onSelectUser(e.target.value)}
                aria-label="Active Hedera wallet persona"
                className="bg-transparent text-[14px] font-medium text-[#111827] outline-none cursor-pointer max-w-[145px]"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="bg-white text-[#111827]">
                    {u.name} ({u.tier})
                  </option>
                ))}
              </select>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[12px] font-medium ${
                  TIER_META[activeUser.tier].badgeColor
                }`}
              >
                {activeUser.tier}
              </span>
              <span className="text-[14px] font-semibold text-[#111827] tabular-nums">
                {activeUser.walletBalanceMad.toLocaleString()} MAD
              </span>
              <button
                type="button"
                onClick={() => onFaucetTopUp(activeUser.id)}
                title="Mint +1,000 test MAD HTS tokens to this wallet"
                className="rounded-full bg-white hover:bg-[#E8F0FE] border border-black/[0.06] px-3 py-0.5 text-[12px] font-semibold text-[#1A73E8] tabular-nums transition-colors cursor-pointer"
              >
                +1k
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onResetAll}
            title="Reset all circles and wallets to initial demo state"
            className="inline-flex items-center gap-1.5 rounded-full glass-pill px-3.5 py-1.5 text-[14px] font-medium text-[#6B7280] hover:text-[#111827] cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
