import React, { useState } from 'react';
import { ArrowUpRight, Menu, Play, X } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

interface NavbarProps {
  onRunDemo: () => void;
  onOpenPocApp: () => void;
}

const NAV_LINKS = [
  { href: '#idea', label: 'Why Daret' },
  { href: '#simulator', label: 'Simulator' },
  { href: '#math', label: 'Security Deposit' },
  { href: '#hedera', label: 'How Hedera Helps' },
];

export const Navbar: React.FC<NavbarProps> = ({ onRunDemo, onOpenPocApp }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSlashActive } = useSimulation();

  const handleOpenPoc = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setMobileOpen(false);
    onOpenPocApp();
  };

  return (
    <header className="sticky top-3 z-50 mx-auto max-w-7xl px-4 sm:px-6 space-y-2">
      {/* Top Mode Switcher: [1. How It Works] <-> [2. Try Live Demo] */}
      <div className="flex justify-center">
        <div
          role="navigation"
          aria-label="App mode switcher"
          className="inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-xl p-1 border border-slate-900/10 shadow-sm"
        >
          <a
            href="#top"
            aria-current="page"
            className="rounded-full bg-[#1A73E8] text-white px-4 py-1.5 text-xs font-bold transition-colors whitespace-nowrap"
          >
            1. How It Works
          </a>
          <a
            href="#poc-app"
            onClick={handleOpenPoc}
            className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-bold text-[#334155] hover:text-[#0F172A] hover:bg-slate-900/5 transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>2. Try Live Demo</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#174EA6]" />
          </a>
        </div>
      </div>

      <nav
        aria-label="Primary navigation"
        className="rounded-full px-4 py-2.5 sm:px-5 flex items-center justify-between gap-3 bg-white/92 backdrop-blur-xl border border-slate-900/8 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.95)]"
      >
        <div className="flex items-center gap-2.5 min-w-0 shrink-0">
          <a href="#top" className="flex items-center gap-2 group whitespace-nowrap">
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1A73E8]/10 border border-[#1A73E8]/20">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-[#174EA6] transition-transform group-hover:scale-105"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="8" />
                <circle cx="12" cy="12" r="3" fill="#10B981" stroke="none" />
              </svg>
            </span>
            <span className="font-display text-sm sm:text-base font-extrabold text-[#0F172A] tracking-tight whitespace-nowrap">
              Daret <span className="text-[#174EA6] font-bold">on Hedera</span>
            </span>
          </a>

          <span
            className={`hidden xl:inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
              isSlashActive
                ? 'bg-[#FEE2E2] text-[#B91C1C]'
                : 'bg-[#DCFCE7] text-[#15803D]'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${
                isSlashActive ? 'bg-[#EF4444]' : 'bg-[#10B981]'
              }`}
            />
            {isSlashActive ? 'Deposit Covered Missed Payment' : 'Circle Safe & On Time'}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#334155] hover:text-[#0F172A] hover:bg-slate-900/5 transition-colors whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRunDemo}
            className="btn-ghost-pill inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            <Play className="h-3.5 w-3.5 fill-[#1A73E8] text-[#1A73E8] shrink-0" />
            <span>Watch Missed-Payment Demo</span>
          </button>
          <a
            href="#poc-app"
            onClick={handleOpenPoc}
            className="btn-primary-pill inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold whitespace-nowrap cursor-pointer"
          >
            <span>2. Try Live Demo</span>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          className="lg:hidden rounded-full btn-ghost-pill p-2 text-[#0F172A] cursor-pointer"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="mt-2 glass-bay rounded-2xl p-4 lg:hidden flex flex-col gap-1.5">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-[#334155] hover:text-[#0F172A] hover:bg-slate-900/5"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2.5 mt-1 border-t border-slate-900/8 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onRunDemo();
              }}
              className="flex-1 btn-ghost-pill py-2 text-xs font-semibold cursor-pointer"
            >
              Watch Demo
            </button>
            <a
              href="#poc-app"
              onClick={handleOpenPoc}
              className="flex-1 text-center btn-primary-pill py-2 text-xs font-bold cursor-pointer"
            >
              2. Try Live Demo
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
