import React from 'react';
import { ArrowDownRight, ArrowUpRight, Play } from 'lucide-react';
import { EscrowSixPack } from './EscrowSixPack';

interface HeroSectionProps {
  onJumpToSimulator: () => void;
  onRunOfficialDemo: () => void;
  onOpenPocApp: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onJumpToSimulator,
  onRunOfficialDemo,
  onOpenPocApp,
}) => {

  return (
    <section
      id="top"
      className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-12 lg:pt-10 lg:pb-16"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Editorial Column */}
        <div className="lg:col-span-5 min-w-0 space-y-5">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-[#0F172A] leading-[1.06] tracking-[-0.03em] text-balance">
            Save Together Safely with Automatic Escrow.
          </h1>

          <p className="text-base sm:text-lg text-[#334155] leading-relaxed text-pretty">
            We protect traditional Moroccan <strong className="text-[#0F172A]">Daret</strong>{' '}
            savings circles withrefundable security deposits and instant payment receipts so every
            winner gets paid 100% on time.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="#poc-app"
              onClick={(e) => {
                e.preventDefault();
                onOpenPocApp();
              }}
              className="btn-primary-pill inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold cursor-pointer"
            >
              <span>Try Live Demo App</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>

            <button
              type="button"
              onClick={onRunOfficialDemo}
              className="btn-ghost-pill inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold cursor-pointer"
            >
              <Play className="h-4 w-4 fill-[#1A73E8] text-[#1A73E8]" />
              <span>Watch Missed-Payment Demo</span>
            </button>

            <button
              type="button"
              onClick={onJumpToSimulator}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#174EA6] hover:underline cursor-pointer"
            >
              <span>Or customize circle below</span>
              <ArrowDownRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Summary & Seat List */}
        <div className="lg:col-span-7 min-w-0">
          <EscrowSixPack />
        </div>
      </div>
    </section>
  );
};
