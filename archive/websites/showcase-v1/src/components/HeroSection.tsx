import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, Play, ShieldCheck, Sparkles, Users, Zap } from 'lucide-react';
import { LiquidGlassOrb } from './LiquidGlassOrb';

interface HeroSectionProps {
  onJumpToSimulator: () => void;
  onRunOfficialDemo: () => void;
}

const QUICK_METRICS = [
  { label: 'Interest Rate', value: '0%', sub: 'Pure community saving' },
  { label: 'Hedera Finality', value: '3–5s', sub: 'Deterministic payout' },
  { label: 'Network Fee', value: '~$0.0001', sub: '20 MAD deposits viable' },
  { label: 'Audit Proof', value: '100% HCS', sub: 'Zero "I paid!" disputes' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onJumpToSimulator,
  onRunOfficialDemo,
}) => {
  return (
    <section
      id="top"
      className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-16 lg:pt-14 lg:pb-24"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
        {/* Left Editorial Column */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="inline-flex flex-wrap items-center gap-2 rounded-full glass-pill px-3.5 py-1.5 text-[11px] sm:text-xs font-medium text-cyan-50">
            <span className="inline-block h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9]" />
            <span>Dar Blockchain × Hedera · Cross Campus Challenge 2026</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05] tracking-tight">
            The Code Becomes{' '}
            <span className="bg-gradient-to-r from-white via-cyan-100 to-sky-300 bg-clip-text text-transparent">
              the Organizer.
            </span>
          </h1>

          <p className="max-w-2xl text-base sm:text-lg text-sky-100/90 leading-relaxed">
            A <strong className="text-white font-semibold">Daret</strong> is the rotating
            savings circle trusted by millions across Morocco and the Maghreb.{' '}
            <strong className="text-cyan-100 font-semibold">Daret on Hedera</strong> puts the
            pot and collateral inside a smart contract so nobody can disappear with the funds,
            arithmetic replaces blind trust, and every single payment is publicly provable.
          </p>

          {/* Interactive CTA Pair */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onJumpToSimulator}
              className="group inline-flex items-center gap-2 rounded-2xl bg-white text-[#06297a] px-4 sm:px-5 py-3 text-sm font-bold shadow-[0_14px_34px_rgba(186,230,253,0.34)] hover:bg-cyan-50 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Explore Live Circle Simulator</span>
              <ArrowDownRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={onRunOfficialDemo}
              className="inline-flex items-center gap-2 rounded-2xl glass-panel-luminous px-4 sm:px-5 py-3 text-sm font-semibold text-white hover:bg-white/25 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Play className="h-4 w-4 fill-cyan-200 text-cyan-200" />
              <span>Watch 4-Member Slash Demo</span>
            </button>

            <a
              href="#join"
              className="inline-flex items-center gap-1.5 rounded-2xl glass-pill px-4 py-3 text-sm font-semibold text-cyan-50 hover:bg-white/20 hover:text-white transition-all"
            >
              <Users className="h-4 w-4 text-cyan-200" />
              <span>Join Project</span>
            </a>
          </div>

          {/* 4 Metric Glass Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            {QUICK_METRICS.map((m) => (
              <div
                key={m.label}
                className="glass-panel rounded-2xl px-3.5 py-3 space-y-0.5"
              >
                <div className="text-[11px] font-medium text-sky-200/80 uppercase tracking-wider">
                  {m.label}
                </div>
                <div className="font-display text-xl sm:text-2xl font-bold text-white font-mono-tabular">
                  {m.value}
                </div>
                <div className="text-[11px] text-cyan-100/75">{m.sub}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Liquid Glass Sphere Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 relative flex flex-col items-center justify-center"
        >
          <div className="relative w-full max-w-[440px] flex items-center justify-center">
            <LiquidGlassOrb size={440} intensity={1} className="w-full" />

            {/* Floating Refractive HUD Badges Orbiting the Orb */}
            <div className="hidden sm:flex z-20 absolute -left-4 top-8 glass-panel-luminous rounded-2xl px-3.5 py-2.5 items-center gap-2.5 shadow-lg animate-float-slow">
              <div className="h-8 w-8 rounded-xl bg-cyan-300/25 border border-cyan-200/45 flex items-center justify-center text-cyan-100">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <div className="text-[11px] text-sky-100/80">Escrow Formula</div>
                <div className="text-xs font-bold font-mono-tabular text-white">
                  Collateral = (N − k) × C
                </div>
              </div>
            </div>

            <div
              className="hidden sm:flex z-20 absolute -right-2 bottom-12 glass-panel-luminous rounded-2xl px-3.5 py-2.5 items-center gap-2.5 shadow-lg animate-float-slow"
              style={{ animationDelay: '1.8s' }}
            >
              <div className="h-8 w-8 rounded-xl bg-white/20 border border-white/40 flex items-center justify-center text-white">
                <Zap className="h-4 w-4 text-cyan-200" />
              </div>
              <div className="leading-tight">
                <div className="text-[11px] text-sky-100/80">HCS Event Stream</div>
                <div className="text-xs font-bold font-mono-tabular text-cyan-100">
                  Topic 0.0.884210 · Verified
                </div>
              </div>
            </div>

            <div
              className="hidden sm:flex z-20 absolute left-6 bottom-2 glass-pill rounded-full px-3 py-1 items-center gap-1.5 text-[11px] font-medium text-white"
            >
              <Sparkles className="h-3 w-3 text-cyan-200" />
              <span>Move cursor across the orb</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
