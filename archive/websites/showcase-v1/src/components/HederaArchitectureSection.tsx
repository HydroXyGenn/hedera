import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  BadgeCheck,
  Code2,
  Coins,
  Cpu,
  Dices,
  Layers,
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
    <section id="hedera" className="relative mx-auto max-w-7xl px-4 sm:px-6 py-14 lg:py-20">
      <div className="glass-panel rounded-3xl p-6 sm:p-10 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full glass-pill px-3 py-1 text-xs font-semibold text-cyan-100">
              <Layers className="h-3.5 w-3.5 text-cyan-200" />
              <span>2 · WHERE HEDERA IS IMPLEMENTED</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
              Why Hedera? Six Native Services, Zero Reinvention.
            </h2>
            <p className="text-sky-100/90 text-sm sm:text-base leading-relaxed">
              Tokenization, immutable audit topics, on-chain randomness, and free historical queries
              are native to Hedera—so our team writes clean, trustworthy escrow logic while keeping
              transaction costs at fractions of a cent.
            </p>
          </div>

          <div className="glass-pill rounded-2xl px-4 py-2.5 text-xs font-mono-tabular text-cyan-100 shrink-0">
            Judging Criterion #1 · <strong className="text-white">25% Evaluation Weight</strong>
          </div>
        </div>

        {/* 6 Interactive Service Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {HEDERA_STACK.map((service) => {
            const Icon = ICONS[service.id] ?? BadgeCheck;
            const isSelected = service.id === selectedId;

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => setSelectedId(service.id)}
                className={`text-left rounded-2xl p-5 transition-all cursor-pointer border ${
                  isSelected
                    ? 'glass-panel-luminous border-white/60 shadow-[0_12px_36px_rgba(125,211,252,0.22)] -translate-y-0.5'
                    : 'glass-panel-deep border-white/20 hover:border-cyan-200/45'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-cyan-300/20 border border-cyan-200/40 flex items-center justify-center text-cyan-100 shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-white/12 border border-white/20 px-2.5 py-0.5 text-[10px] font-mono-tabular text-cyan-100">
                    {service.tag}
                  </span>
                </div>

                <div className="text-[11px] uppercase tracking-wider text-sky-200/75 font-medium">
                  Need: {service.need}
                </div>
                <h3 className="font-display text-lg font-bold text-white mt-1">
                  {service.component}
                </h3>
                <p className="text-xs text-sky-100/85 mt-2 font-mono-tabular">
                  {service.summary}
                </p>
              </button>
            );
          })}
        </div>

        {/* Deep-Dive Selected Component Panel */}
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="glass-panel-luminous rounded-2xl p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
        >
          <div className="lg:col-span-8 space-y-2">
            <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-cyan-100">
              Deep Dive · {active.component}
            </div>
            <h4 className="font-display text-xl font-bold text-white">{active.need}</h4>
            <p className="text-sm text-sky-50/90 leading-relaxed">{active.detail}</p>
          </div>
          <div className="lg:col-span-4 rounded-2xl bg-white/12 border border-white/25 p-4 space-y-1.5">
            <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-emerald-200">
              Why Hedera Wins Here
            </div>
            <p className="text-xs sm:text-sm text-white/95 leading-relaxed">{active.whyHedera}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
