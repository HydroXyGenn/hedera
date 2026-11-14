import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Coins,
  FileCheck2,
  Lock,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';

const AUDIENCES = [
  'Students & Campus Groups',
  'Neighbours & Friends',
  'Colleagues & Co-ops',
  'Diaspora Families',
  'Small Traders',
  'Unbanked Savers',
];

const TRUST_PROBLEMS = [
  {
    icon: ShieldAlert,
    title: 'Organizer Can Disappear',
    desc: 'In an informal circle, one person collects the cash or holds the bank transfers. If they vanish, everyone loses.',
  },
  {
    icon: AlertTriangle,
    title: 'Early Recipients Quit Paying',
    desc: 'Someone who wins Slot #1 or #2 receives the whole pot early, then ghosts the group for the remaining rounds.',
  },
  {
    icon: FileCheck2,
    title: 'Disputes Without Proof',
    desc: '"I sent it!" vs. "I never received it!" WhatsApp screenshots and paper notebooks leave no verifiable truth.',
  },
  {
    icon: Building2,
    title: 'Unbanked Exclusion',
    desc: 'People without bank accounts have almost no safe, interest-free, recognized way to save or prove payment discipline.',
  },
];

const HEDERA_SOLUTIONS = [
  {
    icon: Lock,
    title: 'Smart Contract Escrow',
    desc: 'Code replaces the human organizer. Hedera EVM holds the pot and collateral autonomously and pays the exact recipient.',
  },
  {
    icon: Coins,
    title: 'Arithmetic Collateral (N − k) × C',
    desc: 'Early recipients lock matching collateral upfront. Missing a payment triggers an automatic slash—defaulting never pays.',
  },
  {
    icon: CheckCircle2,
    title: 'Tamper-Proof HCS Receipts',
    desc: 'Every circle writes every deposit, late notice, slash, and payout to its own Hedera Consensus Service topic with timestamp proof.',
  },
  {
    icon: Users,
    title: 'Portable On-Chain Reputation',
    desc: 'Mirror Node computes a member’s reliability tier across circles into a non-transferable HTS badge—lowering future collateral.',
  },
];

export const ProblemSolutionSection: React.FC = () => {
  const [mode, setMode] = useState<'solution' | 'problem'>('solution');

  const activeList = mode === 'problem' ? TRUST_PROBLEMS : HEDERA_SOLUTIONS;

  return (
    <section id="idea" className="relative mx-auto max-w-7xl px-4 sm:px-6 py-14 lg:py-20">
      <div className="glass-panel rounded-3xl p-6 sm:p-10 lg:p-12 space-y-10">
        {/* Top Explanation Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full glass-pill px-3 py-1 text-xs font-semibold text-cyan-100">
              <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
              <span>1 · THE IDEA</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
              What is a <span className="text-cyan-200">Daret</span>, and why put it on Hedera?
            </h2>
            <p className="text-sky-100/90 text-base leading-relaxed">
              Across Morocco and the Maghreb, millions rely on the <strong className="text-white">Daret</strong>—a
              community rotating savings circle where friends pool money and take turns receiving the
              full pot. Zero interest, zero banks, pure mutual support.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {AUDIENCES.map((aud) => (
                <span
                  key={aud}
                  className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-medium text-sky-100"
                >
                  {aud}
                </span>
              ))}
            </div>
          </div>

          {/* Concrete Maghreb Example Card */}
          <div className="lg:col-span-5 glass-panel-luminous rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-tabular uppercase tracking-wider text-cyan-100">
                Classic Example
              </span>
              <span className="rounded-full bg-cyan-300/20 border border-cyan-200/40 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-50">
                0% Interest · No Bank
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-white/10 border border-white/20 p-3">
                <div className="font-display text-2xl font-bold text-white font-mono-tabular">10</div>
                <div className="text-[11px] text-sky-100/80">Friends</div>
              </div>
              <div className="rounded-xl bg-white/10 border border-white/20 p-3">
                <div className="font-display text-2xl font-bold text-white font-mono-tabular">500</div>
                <div className="text-[11px] text-sky-100/80">MAD / month</div>
              </div>
              <div className="rounded-xl bg-cyan-400/20 border border-cyan-200/45 p-3">
                <div className="font-display text-2xl font-bold text-cyan-100 font-mono-tabular">5,000</div>
                <div className="text-[11px] text-cyan-100/90">MAD Pot / mo</div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-sky-50/90 leading-relaxed">
              Every month, one member receives the entire <strong className="text-white">5,000 MAD</strong> pot.
              Over 10 months, <strong className="text-white">50,000 MAD</strong> circulates cleanly and everyone gets
              exactly what they put in—until social trust breaks.
            </p>
          </div>
        </div>

        {/* Interactive Problem vs Solution Switch */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/15 pt-6">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                {mode === 'problem'
                  ? 'Why Informal Social-Trust Darets Break'
                  : 'How Daret on Hedera Fixes Every Failure Mode'}
              </h3>
              <p className="text-sm text-sky-100/80">
                Toggle between traditional trust-only circles and Hedera’s smart contract enforcement.
              </p>
            </div>

            <div className="inline-flex rounded-2xl p-1 glass-panel-deep self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setMode('problem')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  mode === 'problem'
                    ? 'bg-amber-400/25 text-amber-100 border border-amber-300/45 shadow'
                    : 'text-sky-100/75 hover:text-white'
                }`}
              >
                Social Trust Risks
              </button>
              <button
                type="button"
                onClick={() => setMode('solution')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  mode === 'solution'
                    ? 'bg-white text-[#06297a] shadow-[0_6px_20px_rgba(255,255,255,0.25)]'
                    : 'text-sky-100/75 hover:text-white'
                }`}
              >
                Hedera Solution
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeList.map((item, idx) => {
              const Icon = item.icon;
              const isProblem = mode === 'problem';
              return (
                <motion.div
                  key={`${mode}-${item.title}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`rounded-2xl p-5 border transition-colors ${
                    isProblem
                      ? 'bg-amber-950/25 border-amber-300/30'
                      : 'glass-panel-luminous border-white/30'
                  }`}
                >
                  <div
                    className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border ${
                      isProblem
                        ? 'bg-amber-400/20 border-amber-300/40 text-amber-200'
                        : 'bg-cyan-300/20 border-cyan-200/45 text-cyan-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-display text-base font-bold text-white mb-1.5">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-sky-100/85 leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <a
              href="#simulator"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-cyan-200 hover:text-white transition-colors"
            >
              <span>See it move in real time in the Interactive Simulator</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
