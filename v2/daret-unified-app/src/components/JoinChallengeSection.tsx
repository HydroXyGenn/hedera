import React, { useState } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Compass,
  Send,
  Sparkles,
} from 'lucide-react';
import { COLLABORATION_ROLES, JUDGING_CRITERIA } from '../data/daretData';

const POC_SCOPE = [
  'Create a circle with friends and monthly MAD amount',
  'Join a seat (Last Seat = 0 MAD Deposit)',
  'Send monthly payments into Automatic Escrow',
  'Cover missed payments automatically from security deposits',
  'Check Verified Payment Receipts anytime',
];

interface JoinChallengeSectionProps {
  onJumpToSimulator: () => void;
  onRunOfficialDemo: () => void;
  onOpenPocApp: () => void;
}

export const JoinChallengeSection: React.FC<JoinChallengeSectionProps> = ({ onOpenPocApp }) => {
  const [selectedRole, setSelectedRole] = useState<string>(COLLABORATION_ROLES[0].id);
  const [interestType, setInterestType] = useState<'builder' | 'tester' | 'partner'>('builder');
  const [fullName, setFullName] = useState('');
  const [campus, setCampus] = useState('');
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !contact.trim()) return;
    setSubmitted(true);
  };

  return (
    <section id="join" className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-14 lg:py-14">
      <div className="space-y-8">
        <div className="max-w-2xl space-y-2">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0F172A] leading-tight text-balance">
            Built for the Hedera Campus Challenge
          </h2>
          <p className="text-[#334155] text-sm sm:text-base leading-relaxed text-pretty">
            Try our live demo app or join our team for the 2026 Dar Blockchain × Hedera challenge.
          </p>
        </div>

        {/* PoC Scope + Judging Criteria */}
        <div className="glass-bay rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 min-w-0 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
                <Compass className="h-5 w-5 text-[#174EA6]" />
                <span>Why Judges Love This Project</span>
              </h3>
              <span className="text-xs font-bold text-[#0369A1]">100% Aligned</span>
            </div>

            <div className="divide-y divide-slate-900/8">
              {JUDGING_CRITERIA.map((item) => (
                <div key={item.label} className="py-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#0F172A]">{item.label}</span>
                    <span className="font-mono-tabular text-[#174EA6]">{item.weight}%</span>
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed">{item.proof}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 min-w-0 lg:pl-8 lg:border-l lg:border-slate-900/8 space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="font-display text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-[#174EA6]" />
                <span>What You Can Test in the Live Demo</span>
              </h3>
              <ol className="divide-y divide-slate-900/6">
                {POC_SCOPE.map((step, i) => (
                  <li
                    key={step}
                    className="py-2.5 flex items-center gap-3 text-xs sm:text-sm text-[#0F172A] font-medium"
                  >
                    <span className="h-6 w-6 rounded-full bg-[#1A73E8]/10 text-[#174EA6] flex items-center justify-center font-mono-tabular text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="pt-4 border-t border-slate-900/8 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[#334155]">
                Ready to test a real circle with friends?
              </span>
              <a
                href="#poc-app"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenPocApp();
                }}
                className="btn-primary-pill inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold cursor-pointer"
              >
                <span>Open Live Demo App</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Open Roles + Interactive Join Form */}
        <div className="glass-bay rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 min-w-0 space-y-4">
            <div className="space-y-1">
              <h3 className="font-display text-2xl font-extrabold text-[#0F172A]">
                Join Our Campus Team
              </h3>
              <p className="text-xs sm:text-sm text-[#334155]">
                Pick a role to collaborate with us on 4Hacks.
              </p>
            </div>

            <div className="divide-y divide-slate-900/8 border-t border-slate-900/8">
              {COLLABORATION_ROLES.map((role) => {
                const isSelected = role.id === selectedRole;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role.id);
                      setInterestType('builder');
                      setSubmitted(false);
                    }}
                    className={`w-full text-left py-3.5 px-3 rounded-xl transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#E0F2FE]/60' : 'hover:bg-slate-900/4'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm sm:text-base font-bold text-[#0F172A] flex items-center gap-2">
                        <Code2
                          className={`h-4 w-4 ${
                            isSelected ? 'text-[#174EA6]' : 'text-[#475569]'
                          }`}
                        />
                        {role.title}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          isSelected
                            ? 'bg-[#1A73E8] text-white'
                            : 'bg-slate-900/6 text-[#475569]'
                        }`}
                      >
                        {role.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[#334155] mt-1">{role.focus}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-6 min-w-0 lg:pl-8 lg:border-l lg:border-slate-900/8 space-y-4">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'builder', label: 'Join Team' },
                  { id: 'tester', label: 'Test a Circle' },
                  { id: 'partner', label: 'Mentor / Partner' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setInterestType(tab.id);
                    setSubmitted(false);
                  }}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    interestType === tab.id
                      ? 'bg-[#1A73E8] text-white'
                      : 'bg-slate-900/5 text-[#334155] hover:bg-slate-900/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {submitted ? (
              <div className="pt-4 border-t border-slate-900/8 space-y-3 text-center">
                <div className="mx-auto h-11 w-11 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="font-display text-xl font-extrabold text-[#0F172A]">
                  Welcome aboard, {fullName}!
                </h4>
                <p className="text-xs sm:text-sm text-[#334155]">
                  Your collaboration card for {campus || 'Campus Edition'} ({contact}) is ready.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="btn-ghost-pill inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#174EA6]" />
                  <span>Edit Details</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="join-name" className="text-xs text-[#334155] font-semibold block">
                      Your Name *
                    </label>
                    <input
                      id="join-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g., Youssef Benali"
                      className="w-full rounded-xl bg-white border border-slate-900/12 px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-[#475569] outline-none focus:border-[#1A73E8]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="join-campus" className="text-xs text-[#334155] font-semibold block">
                      University / Campus
                    </label>
                    <input
                      id="join-campus"
                      type="text"
                      value={campus}
                      onChange={(e) => setCampus(e.target.value)}
                      placeholder="e.g., ENSIAS / UM6P"
                      className="w-full rounded-xl bg-white border border-slate-900/12 px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-[#475569] outline-none focus:border-[#1A73E8]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="join-contact" className="text-xs text-[#334155] font-semibold block">
                    Email or Telegram / Discord *
                  </label>
                  <input
                    id="join-contact"
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="e.g., @youssef or youssef@campus.ma"
                    className="w-full rounded-xl bg-white border border-slate-900/12 px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-[#475569] outline-none focus:border-[#1A73E8]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary-pill inline-flex items-center justify-center gap-2 py-3 px-5 text-sm font-bold cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Join the Project</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
