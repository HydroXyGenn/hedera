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
  onSwitchToShowcase?: () => void;
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
  onSwitchToShowcase,
}) => {
  const activeUser = users.find((u) => u.id === activeUserId) ?? users[0];

  return (
    <header className="sticky top-0 z-40 border-b border-[#0F172A]/[0.06] bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 pt-2.5 pb-1 flex justify-center border-b border-[#0F172A]/[0.05] bg-slate-50/70">
        <div
          role="navigation"
          aria-label="App mode switcher"
          className="inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-xl p-1 border border-slate-900/10 shadow-sm"
        >
          <a
            href="#top"
            onClick={(e) => {
              if (onSwitchToShowcase) {
                e.preventDefault();
                onSwitchToShowcase();
              }
            }}
            className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-bold text-[#334155] hover:text-[#0F172A] hover:bg-slate-900/5 transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>1. How It Works</span>
          </a>
          <a
            href="#poc-app"
            aria-current="page"
            onClick={(e) => e.preventDefault()}
            className="rounded-full bg-[#1A73E8] text-white px-4 py-1.5 text-xs font-bold transition-colors whitespace-nowrap"
          >
            2. Try Live Demo
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-3 flex flex-wrap xl:flex-nowrap items-center justify-between gap-3">
        {/* Brand + Circle Switcher */}
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <div className="flex items-center gap-2.5 sm:pr-3.5 sm:border-r sm:border-[#0F172A]/[0.08] shrink-0">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              aria-hidden="true"
              className="shrink-0"
            >
              <rect
                x="1"
                y="1"
                width="26"
                height="26"
                rx="8"
                fill="#E0F2FE"
                stroke="#0284C7"
                strokeOpacity="0.22"
              />
              <circle
                cx="14"
                cy="14"
                r="7.5"
                stroke="#1A73E8"
                strokeWidth="1.75"
              />
              <circle cx="14" cy="6.5" r="1.8" fill="#10B981" />
              <circle cx="21.5" cy="14" r="1.8" fill="#1A73E8" />
              <circle cx="14" cy="21.5" r="1.8" fill="#1A73E8" />
              <circle cx="6.5" cy="14" r="1.8" fill="#0F172A" />
            </svg>
            <div className="leading-tight whitespace-nowrap">
              <div className="font-display text-[16px] font-bold tracking-[-0.02em] text-[#0F172A]">
                Daret on Hedera
              </div>
              <div className="text-[11px] font-medium text-[#475569]">
                PoC Console · Testnet
              </div>
            </div>
          </div>

          <nav aria-label="Circle Switcher" className="flex flex-wrap items-center gap-1.5 min-w-0 max-w-full">
            {circles.map((c) => {
              const active = c.id === activeCircleId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectCircle(c.id)}
                  className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap max-w-full min-w-0 ${
                    active ? 'pill-active' : 'glass-pill text-[#334155]'
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
                  <span className="truncate max-w-full sm:max-w-[260px]">{c.name}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1 rounded-full glass-pill px-3.5 py-1.5 text-[12px] font-semibold text-[#0F172A] whitespace-nowrap cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-[#1A73E8]" />
              <span>New Circle</span>
            </button>
          </nav>
        </div>

        {/* Service Status + Wallet Selector + Reset */}
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto min-w-0">
          <div className="hidden 2xl:flex items-center gap-2 text-[11px] font-mono-tabular text-[#475569] mr-1">
            {SERVICE_BADGES.map((sb, idx) => {
              const lit = highlightedServices.includes(sb.key);
              return (
                <React.Fragment key={sb.key}>
                  {idx > 0 && <span className="text-[#0F172A]/15">·</span>}
                  <span
                    className={`transition-colors ${
                      lit ? 'text-[#1A73E8] font-semibold' : 'text-[#475569]'
                    }`}
                  >
                    {sb.label}
                  </span>
                </React.Fragment>
              );
            })}
          </div>

          {activeUser && (
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-x-2 gap-y-1.5 rounded-2xl sm:rounded-full bg-[#F1F5F9] border border-[#0F172A]/[0.07] px-3 py-1.5 flex-1 sm:flex-initial max-w-full min-w-0">
              <select
                value={activeUser.id}
                onChange={(e) => onSelectUser(e.target.value)}
                aria-label="Active Hedera wallet persona"
                className="bg-transparent text-[13px] font-semibold text-[#0F172A] outline-none cursor-pointer min-w-0 w-full sm:w-auto max-w-full"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="bg-white text-[#0F172A]">
                    {u.name} ({u.tier})
                  </option>
                ))}
              </select>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                  TIER_META[activeUser.tier].badgeColor
                }`}
              >
                {activeUser.tier}
              </span>
              <span className="font-mono-tabular text-[13px] font-semibold text-[#0F172A]">
                {activeUser.walletBalanceMad.toLocaleString()} MAD
              </span>
              <button
                type="button"
                onClick={() => onFaucetTopUp(activeUser.id)}
                title="Mint +1,000 test MAD HTS tokens to this wallet"
                className="rounded-full bg-white hover:bg-[#E0F2FE] border border-[#0F172A]/[0.08] px-2.5 py-0.5 text-[11px] font-mono-tabular font-semibold text-[#1A73E8] transition-colors cursor-pointer"
              >
                +1k
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onResetAll}
            title="Reset all circles and wallets to initial demo state"
            className="inline-flex items-center gap-1.5 rounded-full glass-pill px-3.5 py-1.5 text-[13px] font-semibold text-[#475569] hover:text-[#0F172A] cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
