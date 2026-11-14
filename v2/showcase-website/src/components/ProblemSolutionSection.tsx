import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Coins,
  FileCheck2,
  Lock,
  ShieldAlert,
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
    desc: 'If the person holding the cash disappears, everyone loses their savings.',
  },
  {
    icon: AlertTriangle,
    title: 'Early Winners Stop Paying',
    desc: 'Someone can take the first pot and quit paying for the rest of the circle.',
  },
  {
    icon: FileCheck2,
    title: 'No Proof of Payment',
    desc: 'Cash and WhatsApp screenshots cause stressful arguments over who paid.',
  },
  {
    icon: Building2,
    title: 'No Credit History Built',
    desc: 'Years of paying on time in cash never help you prove your reliability.',
  },
];

const HEDERA_SOLUTIONS = [
  {
    icon: Lock,
    title: 'Automatic Escrow',
    desc: 'The code holds the pot and pays each month’s winner automatically on time.',
  },
  {
    icon: Coins,
    title: 'Security Deposit Needed',
    desc: 'Early winners lock a refundable deposit that covers any missed payment.',
  },
  {
    icon: CheckCircle2,
    title: 'Verified Payment Receipt',
    desc: 'Every payment gets a permanent, time-stamped receipt that nobody can fake.',
  },
  {
    icon: Users,
    title: 'Reward Badges for Savers',
    desc: 'Paying on time earns Gold, Silver, and Bronze badges that cut future deposits.',
  },
];

export const ProblemSolutionSection: React.FC = () => {
  const [mode, setMode] = useState<'solution' | 'problem'>('solution');
  const activeList = mode === 'problem' ? TRUST_PROBLEMS : HEDERA_SOLUTIONS;

  return (
    <section id="idea" className="relative mx-auto max-w-7xl px-4 sm:px-6 py-10 lg:py-14">
      <div className="glass-bay rounded-3xl p-6 sm:p-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 min-w-0 space-y-4">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0F172A] leading-tight text-balance">
              What Is a Moroccan <span className="text-[#174EA6]">Daret</span>?
            </h2>

            <p className="text-[#334155] text-base leading-relaxed text-pretty">
              Friends pool a fixed amount each month and take turns receiving the full pot with
              zero interest.
            </p>

            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map((aud) => (
                <span
                  key={aud}
                  className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-[#334155]"
                >
                  {aud}
                </span>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-900/8 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#475569]">
                  Classic Monthly Circle Example
                </span>
                <span className="rounded-full bg-[#DCFCE7] px-3 py-0.5 text-xs font-bold text-[#15803D]">
                  0% Interest · No Bank Needed
                </span>
              </div>

              <div className="grid grid-cols-3 divide-x divide-slate-900/8 py-2">
                <div className="pr-3">
                  <div className="font-display text-2xl font-extrabold text-[#0F172A] font-mono-tabular">
                    10
                  </div>
                  <div className="text-xs text-[#475569]">Friends</div>
                </div>
                <div className="px-3">
                  <div className="font-display text-2xl font-extrabold text-[#0F172A] font-mono-tabular">
                    500
                  </div>
                  <div className="text-xs text-[#475569]">MAD / month</div>
                </div>
                <div className="pl-3">
                  <div className="font-display text-2xl font-extrabold text-[#174EA6] font-mono-tabular">
                    5,000
                  </div>
                  <div className="text-xs text-[#475569]">MAD Monthly Pot</div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#334155] leading-relaxed text-pretty">
                Each month, one friend receives the full <strong className="text-[#0F172A]">5,000 MAD</strong> pot until all 10 friends are paid.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 min-w-0 space-y-2">
            <img
              src="./assets/morocco_trust_circle.png"
              alt="Moroccan Daret community savings circle protected by automatic escrow"
              className="w-full aspect-video object-cover rounded-2xl"
              loading="eager"
            />
            <p className="text-xs text-[#475569] px-1">
              Traditional Moroccan savings circle protected by automatic escrow.
            </p>
          </div>
        </div>

        {/* Problem vs Solution Switch */}
        <div className="space-y-5 pt-6 border-t border-slate-900/8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-display text-xl sm:text-2xl font-extrabold text-[#0F172A] text-balance">
                {mode === 'problem'
                  ? 'Why Cash Circles Can Break'
                  : 'How Automatic Escrow Protects Everyone'}
              </h3>
              <p className="text-sm text-[#475569]">
                Compare informal cash circles with automatic escrow protection.
              </p>
            </div>

            <div className="inline-flex rounded-full p-1 bg-slate-900/5 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setMode('problem')}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  mode === 'problem'
                    ? 'bg-[#FEF3C7] text-[#B45309]'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                Cash Circle Risks
              </button>
              <button
                type="button"
                onClick={() => setMode('solution')}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  mode === 'solution'
                    ? 'bg-[#1A73E8] text-white'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                Our Safe Solution
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 divide-y md:divide-y-0 border-t border-b border-slate-900/8">
            {activeList.map((item, idx) => {
              const Icon = item.icon;
              const isProblem = mode === 'problem';
              return (
                <div
                  key={`${mode}-${item.title}`}
                  className={`py-4 flex items-start gap-4 ${
                    idx >= 2 ? 'md:border-t md:border-slate-900/8' : ''
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      isProblem
                        ? 'bg-[#FEF3C7] text-[#B45309]'
                        : 'bg-[#E0F2FE] text-[#174EA6]'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-display text-base font-bold text-[#0F172A]">
                      {item.title}
                    </h4>
                    <p className="text-sm text-[#334155] leading-relaxed text-pretty">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <a
              href="#simulator"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#174EA6] hover:text-[#1557B0] transition-colors"
            >
              <span>Try the interactive circle simulator below</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
