import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Compass,
  Presentation,
  Send,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  COLLABORATION_ROLES,
  JUDGING_CRITERIA,
  PITCH_SLIDES,
} from '../data/daretData';

const POC_SCOPE = [
  'Create a circle (members, MAD amount, round period)',
  'Join with a chosen position and tier-adjusted collateral',
  'Contribute each round into smart contract escrow',
  'Close round: pay recipient & auto-slash collateral on shortfall',
  'Log every event to HCS and verify live on Mirror Node dashboard',
];

export const JoinChallengeSection: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>(COLLABORATION_ROLES[0].id);
  const [interestType, setInterestType] = useState<'builder' | 'tester' | 'partner'>('builder');
  const [fullName, setFullName] = useState('');
  const [campus, setCampus] = useState('');
  const [contact, setContact] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !contact.trim()) return;
    setSubmitted(true);
  };

  return (
    <section id="join" className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-20 lg:py-20">
      <div className="space-y-10">
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full glass-pill px-3 py-1 text-xs font-semibold text-cyan-100">
            <Award className="h-3.5 w-3.5 text-cyan-200" />
            <span>HEDERA CROSS CAMPUS CHALLENGE 2026 · DAR BLOCKCHAIN × HEDERA</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Built for 4Hacks Campus Edition. Open for Builders &amp; Pioneers.
          </h2>
          <p className="text-sky-100/90 text-sm sm:text-base leading-relaxed">
            Our mission is a crystal-clear, working Proof of Concept on Hedera Testnet—demonstrating
            financial inclusion, provable escrow, and real Maghreb impact. Join our team on 4Hacks,
            help test campus circles, or collaborate on smart contracts and UX.
          </p>
        </div>

        {/* PoC Scope + Judging Criteria + 5-Min Pitch Blueprint */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Judging Alignment Card */}
          <div className="lg:col-span-6 glass-panel rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Compass className="h-5 w-5 text-cyan-200" />
                <span>Hackathon Judging Alignment (100%)</span>
              </h3>
              <span className="text-xs font-mono-tabular text-cyan-200">Official Criteria</span>
            </div>

            <div className="space-y-3">
              {JUDGING_CRITERIA.map((item) => (
                <div key={item.label} className="rounded-2xl bg-white/8 border border-white/15 p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-white">{item.label}</span>
                    <span className="font-mono-tabular text-cyan-200">{item.weight}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      style={{ width: `${item.weight * 3.5}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-white"
                    />
                  </div>
                  <p className="text-[11px] text-sky-100/80 leading-relaxed">{item.proof}</p>
                </div>
              ))}
            </div>
          </div>

          {/* PoC Scope & 5-Min Pitch Deck Roadmap */}
          <div className="lg:col-span-6 space-y-6">
            <div className="glass-panel rounded-3xl p-6 space-y-4">
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-cyan-200" />
                <span>Hackathon PoC Scope (5 Core Capabilities)</span>
              </h3>
              <div className="space-y-2">
                {POC_SCOPE.map((step, i) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 rounded-xl bg-white/8 border border-white/15 px-3.5 py-2.5 text-xs sm:text-sm text-white"
                  >
                    <span className="h-6 w-6 rounded-lg bg-cyan-300/25 border border-cyan-200/45 flex items-center justify-center font-mono-tabular text-xs font-bold text-cyan-100 shrink-0">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel-deep rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <Presentation className="h-5 w-5 text-cyan-200" />
                  <span>5-Minute Pitch Structure (EN / FR)</span>
                </h3>
                <span className="text-[11px] font-mono-tabular text-sky-200">7 Slides</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PITCH_SLIDES.map((s) => (
                  <div key={s.slide} className="rounded-xl bg-white/8 border border-white/15 p-3">
                    <div className="text-xs font-bold text-cyan-200 font-mono-tabular">{s.slide}</div>
                    <p className="text-[11px] text-sky-100/85 mt-0.5 leading-snug">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Open Roles + Interactive Join Form */}
        <div className="glass-panel-luminous rounded-3xl p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Open Team Tracks */}
          <div className="lg:col-span-6 space-y-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/30 px-3 py-1 text-[11px] font-semibold text-white">
                <Users className="h-3.5 w-3.5 text-cyan-200" />
                <span>WE ARE RECRUITING &amp; INVITING CAMPUS PILOTS</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Want to Build or Pilot Daret on Hedera?
              </h3>
              <p className="text-xs sm:text-sm text-sky-50/90 leading-relaxed">
                Select a track that fits your strengths—whether you write Solidity, wire Hedera SDKs,
                craft crisp UI, or organize campus savings circles on 4Hacks.
              </p>
            </div>

            <div className="space-y-3">
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
                    className={`w-full text-left rounded-2xl p-4 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white/20 border-white shadow-[0_8px_28px_rgba(255,255,255,0.18)]'
                        : 'bg-white/8 border-white/20 hover:bg-white/14'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-cyan-200" />
                        {role.title}
                      </span>
                      <span className="rounded-full bg-cyan-300/20 border border-cyan-200/40 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-50">
                        {role.badge}
                      </span>
                    </div>
                    <p className="text-xs text-sky-100/85 mt-1.5 leading-relaxed">{role.focus}</p>
                    <div className="text-[10px] font-mono-tabular text-cyan-200 mt-1.5">{role.stack}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Application / Interest Form */}
          <div className="lg:col-span-6 glass-panel-deep rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'builder', label: 'Join Team (4Hacks)' },
                  { id: 'tester', label: 'Testnet Circle Pilot' },
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
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    interestType === tab.id
                      ? 'bg-white text-[#06297a]'
                      : 'bg-white/10 text-sky-100 hover:bg-white/20'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-emerald-400/18 border border-emerald-300/50 p-6 space-y-3 text-center"
              >
                <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-400/25 border border-emerald-200/50 flex items-center justify-center text-emerald-100">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="font-display text-xl font-bold text-white">
                  Welcome to Daret on Hedera, {fullName}!
                </h4>
                <p className="text-xs sm:text-sm text-sky-50/90 leading-relaxed">
                  Your interest card for{' '}
                  <strong className="text-cyan-100">
                    {interestType === 'builder'
                      ? COLLABORATION_ROLES.find((r) => r.id === selectedRole)?.title
                      : interestType === 'tester'
                        ? 'Campus Testnet Circle Pilot'
                        : 'Advisory / Institutional Partnership'}
                  </strong>{' '}
                  ({campus || 'Campus Edition'}) has been prepared locally for this interactive preview.
                </p>
                <div className="rounded-xl bg-black/25 border border-white/15 p-3 text-left text-[11px] font-mono-tabular text-cyan-100 space-y-1">
                  <div>Next Step: Register &amp; join our team on your 4Hacks Campus Edition page!</div>
                  <div>Contact recorded: {contact}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="inline-flex items-center gap-1.5 rounded-xl glass-pill px-4 py-2 text-xs font-semibold text-white hover:bg-white/25 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Edit or Submit Another Track</span>
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h4 className="font-display text-lg font-bold text-white">
                    {interestType === 'builder'
                      ? 'Express Interest to Join the 4Hacks Team'
                      : interestType === 'tester'
                        ? 'Sign Up for Campus Testnet Demo'
                        : 'Connect as a Mentor, University, or Partner'}
                  </h4>
                  <p className="text-xs text-sky-100/80 mt-0.5">
                    Selected track:{' '}
                    <span className="text-cyan-200 font-semibold">
                      {interestType === 'builder'
                        ? COLLABORATION_ROLES.find((r) => r.id === selectedRole)?.title
                        : interestType === 'tester'
                          ? '4-Member Testnet Circle Participant'
                          : 'Partner / Legal / Financial Advisor'}
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-sky-100 font-medium block">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g., Youssef Benali"
                      className="w-full rounded-xl bg-white/10 border border-white/25 px-3 py-2.5 text-sm text-white placeholder:text-sky-200/45 outline-none focus:border-cyan-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-sky-100 font-medium block">University / Campus</label>
                    <input
                      type="text"
                      value={campus}
                      onChange={(e) => setCampus(e.target.value)}
                      placeholder="e.g., ENSIAS / UM6P / FST"
                      className="w-full rounded-xl bg-white/10 border border-white/25 px-3 py-2.5 text-sm text-white placeholder:text-sky-200/45 outline-none focus:border-cyan-200"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-sky-100 font-medium block">
                    Email, Discord, or GitHub Handle *
                  </label>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="e.g., @youssef-dev or youssef@campus.ma"
                    className="w-full rounded-xl bg-white/10 border border-white/25 px-3 py-2.5 text-sm text-white placeholder:text-sky-200/45 outline-none focus:border-cyan-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-sky-100 font-medium block">
                    What would you love to contribute?
                  </label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Tell us about your Solidity, Hedera SDK, UI/UX, or campus community experience..."
                    className="w-full rounded-xl bg-white/10 border border-white/25 px-3 py-2.5 text-sm text-white placeholder:text-sky-200/45 outline-none focus:border-cyan-200 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-[#06297a] py-3 px-5 text-sm font-bold shadow-[0_10px_28px_rgba(255,255,255,0.28)] hover:bg-cyan-50 transition-all cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Generate Collaboration Card</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
