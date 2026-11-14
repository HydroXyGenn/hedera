import React, { useState } from 'react';
import {
  Activity,
  BadgeCheck,
  Code2,
  Coins,
  Cpu,
  Dices,
  SearchCheck,
} from 'lucide-react';
import { HEDERA_STACK } from '../data/daretData';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  evm: Code2,
  hts: Coins,
  hcs: Activity,
  mirror: SearchCheck,
  prng: Dices,
  fees: Cpu,
};

export const HederaArchitectureSection: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('evm');
  const active = HEDERA_STACK.find((s) => s.id === selectedId) ?? HEDERA_STACK[0];

  return (
    <section id="hedera" className="relative mx-auto max-w-7xl px-4 sm:px-6 py-10 lg:py-14">
      <div className="glass-bay rounded-3xl p-6 sm:p-10 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0F172A] leading-tight text-balance">
              Why We Built Daret on Hedera
            </h2>
            <p className="text-[#334155] text-sm sm:text-base leading-relaxed text-pretty">
              Hedera gives every circle automatic escrow, instant receipts, and ~$0.0001 fees so
              even 20 MAD student savings work.
            </p>
          </div>

          <div className="rounded-full bg-[#E0F2FE] px-4 py-2 text-xs font-bold text-[#0369A1] shrink-0">
            6 Built-In Protections
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          <div className="lg:col-span-6 min-w-0 space-y-6">
            <div className="space-y-2">
              <img
                src="./assets/hedera_hashgraph_architecture.png"
                alt="Automatic Escrow, Digital Badges, and Verified Payment Receipts on Hedera"
                className="w-full aspect-video object-cover rounded-2xl"
                loading="eager"
              />
              <p className="text-xs text-[#475569] px-1">
                Automatic Escrow · Digital Trust Badges · Verified Payment Receipts.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-900/8 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-xl font-extrabold text-[#0F172A]">
                  {active.component}
                </h3>
                <span className="rounded-full bg-[#DCFCE7] px-3 py-0.5 text-xs font-bold text-[#15803D]">
                  {active.tag}
                </span>
              </div>

              <div className="text-sm font-semibold text-[#174EA6]">{active.need}</div>
              <p className="text-sm text-[#334155] leading-relaxed">{active.detail}</p>
            </div>
          </div>

          <div className="lg:col-span-6 min-w-0 lg:pl-8 lg:border-l lg:border-slate-900/8 divide-y divide-slate-900/8">
            {HEDERA_STACK.map((service) => {
              const Icon = ICONS[service.id] ?? BadgeCheck;
              const isSelected = service.id === selectedId;

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedId(service.id)}
                  className={`w-full max-w-full min-w-0 py-3.5 px-3 rounded-xl text-left transition-colors cursor-pointer flex items-start gap-3.5 ${
                    isSelected ? 'bg-[#E0F2FE]/60' : 'hover:bg-slate-900/4'
                  }`}
                >
                  <div
                    className={`mt-0.5 h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-[#1A73E8] text-white'
                        : 'bg-slate-900/5 text-[#334155]'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-display text-base font-bold text-[#0F172A]">
                        {service.component}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          isSelected
                            ? 'bg-[#1A73E8] text-white'
                            : 'bg-slate-900/6 text-[#475569]'
                        }`}
                      >
                        {service.tag}
                      </span>
                    </div>
                    <p className="text-xs text-[#334155]">{service.summary}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
