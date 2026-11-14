import React, { useState } from 'react';
import { Menu, Play, Sparkles, X } from 'lucide-react';

interface NavbarProps {
  onRunDemo: () => void;
}

const NAV_LINKS = [
  { href: '#idea', label: 'The Idea' },
  { href: '#simulator', label: 'Live Simulator' },
  { href: '#math', label: 'Collateral Math' },
  { href: '#hedera', label: 'Hedera Stack' },
  { href: '#economics', label: 'Economics' },
  { href: '#join', label: 'Join Project' },
];

export const Navbar: React.FC<NavbarProps> = ({ onRunDemo }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-3 z-50 mx-auto max-w-7xl px-4 sm:px-6">
      <nav className="glass-panel rounded-2xl px-4 py-2.5 sm:px-6 flex items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2.5 group">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl glass-pill shadow-inner">
            <span className="h-4 w-4 rounded-full bg-gradient-to-tr from-sky-400 via-cyan-200 to-white shadow-[0_0_12px_rgba(165,243,252,0.9)] group-hover:scale-110 transition-transform" />
          </span>
          <div className="leading-tight">
            <div className="font-display text-sm sm:text-base font-bold text-white tracking-tight">
              Daret <span className="text-cyan-200 font-medium">on Hedera</span>
            </div>
            <div className="text-[10px] font-mono-tabular uppercase tracking-widest text-sky-200/80">
              Campus Challenge 2026
            </div>
          </div>
        </a>

        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-sky-100/90 hover:text-white hover:bg-white/12 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={onRunDemo}
            className="inline-flex items-center gap-1.5 rounded-xl glass-pill px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/25 transition-all cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-cyan-200 text-cyan-200" />
            Run PoC Demo
          </button>
          <a
            href="#join"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white text-[#06297a] px-3.5 py-2 text-xs font-bold shadow-[0_6px_20px_rgba(255,255,255,0.28)] hover:bg-cyan-50 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Join Team
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          className="lg:hidden rounded-xl glass-pill p-2 text-white cursor-pointer"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="mt-2 glass-panel-deep rounded-2xl p-4 lg:hidden flex flex-col gap-2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-medium text-sky-100 hover:bg-white/12"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 border-t border-white/15 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onRunDemo();
              }}
              className="flex-1 rounded-xl glass-pill py-2 text-xs font-semibold text-white cursor-pointer"
            >
              Run PoC Demo
            </button>
            <a
              href="#join"
              onClick={() => setMobileOpen(false)}
              className="flex-1 text-center rounded-xl bg-white text-[#06297a] py-2 text-xs font-bold"
            >
              Join Team
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
