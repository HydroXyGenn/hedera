import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ReputationTier, RoundPeriod } from '../types/daret';

export interface CreateCirclePayload {
  name: string;
  memberCount: number;
  contributionMad: number;
  period: RoundPeriod;
  minTier: ReputationTier;
  protocolFeePct: number;
  insurancePct: number;
  fillMode: 'empty' | 'randoms' | 'prng-randoms';
}

interface CreateCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: CreateCirclePayload) => void;
}

const CONTRIBUTION_CHIPS = [20, 100, 250, 500, 1000];

export const CreateCircleModal: React.FC<CreateCircleModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('My Campus Daret');
  const [memberCount, setMemberCount] = useState(5);
  const [contributionMad, setContributionMad] = useState(200);
  const [period, setPeriod] = useState<RoundPeriod>('2 min (PoC)');
  const [minTier, setMinTier] = useState<ReputationTier>('New');
  const [protocolFeePct, setProtocolFeePct] = useState(0.5);
  const [insurancePct, setInsurancePct] = useState(1);
  const [fillMode, setFillMode] = useState<'empty' | 'randoms' | 'prng-randoms'>('empty');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      name: name.trim() || 'Untitled Daret Circle',
      memberCount,
      contributionMad,
      period,
      minTier,
      protocolFeePct,
      insurancePct,
      fillMode,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm p-6">
      <div className="glass-panel-deep rounded-[24px] w-full max-w-2xl p-7 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[12px] font-medium text-[#6B7280]">
              Smart Contract Factory · createCircle()
            </div>
            <h2 className="font-display text-[18px] font-semibold tracking-[-0.02em] text-[#111827]">
              Deploy a New Daret Circle
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full p-2 text-[#6B7280] hover:bg-[#F1F5F9] hover:text-[#111827] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#6B7280] block">Circle Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., ENSIAS Spring Savings"
              className="w-full rounded-2xl input-surface px-4 py-2.5 text-[14px] text-[#111827]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <div className="flex justify-between text-[14px]">
                <span className="text-[#6B7280]">Seats / Persons (N)</span>
                <span className="font-semibold text-[#111827] tabular-nums">{memberCount} seats</span>
              </div>
              <input
                type="range"
                min={3}
                max={12}
                value={memberCount}
                onChange={(e) => setMemberCount(Number(e.target.value))}
                className="glass-slider w-full"
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between text-[14px]">
                <span className="text-[#6B7280]">Round Amount (C)</span>
                <span className="font-semibold text-[#111827] tabular-nums">
                  {contributionMad} MAD
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={2000}
                step={10}
                value={contributionMad}
                onChange={(e) => setContributionMad(Number(e.target.value))}
                className="glass-slider w-full"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {CONTRIBUTION_CHIPS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setContributionMad(c)}
                    className={`rounded-full px-3 py-1 text-[12px] font-medium tabular-nums cursor-pointer transition-colors ${
                      contributionMad === c
                        ? 'pill-active'
                        : 'glass-pill text-[#6B7280]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#6B7280] block">Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as RoundPeriod)}
                className="w-full rounded-2xl input-surface px-3 py-2 text-[14px] text-[#111827]"
              >
                <option value="2 min (PoC)" className="bg-white text-[#111827]">2 min (PoC)</option>
                <option value="Weekly" className="bg-white text-[#111827]">Weekly</option>
                <option value="Monthly" className="bg-white text-[#111827]">Monthly</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#6B7280] block">Min Tier Gate</label>
              <select
                value={minTier}
                onChange={(e) => setMinTier(e.target.value as ReputationTier)}
                className="w-full rounded-2xl input-surface px-3 py-2 text-[14px] text-[#111827]"
              >
                <option value="New" className="bg-white text-[#111827]">Any (New+)</option>
                <option value="Bronze" className="bg-white text-[#111827]">Bronze+</option>
                <option value="Silver" className="bg-white text-[#111827]">Silver+</option>
                <option value="Gold" className="bg-white text-[#111827]">Gold Only</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#6B7280] block">Protocol Fee</label>
              <select
                value={protocolFeePct}
                onChange={(e) => setProtocolFeePct(Number(e.target.value))}
                className="w-full rounded-2xl input-surface px-3 py-2 text-[14px] text-[#111827]"
              >
                <option value={0} className="bg-white text-[#111827]">0%</option>
                <option value={0.5} className="bg-white text-[#111827]">0.5%</option>
                <option value={1} className="bg-white text-[#111827]">1%</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#6B7280] block">Insurance Pool</label>
              <select
                value={insurancePct}
                onChange={(e) => setInsurancePct(Number(e.target.value))}
                className="w-full rounded-2xl input-surface px-3 py-2 text-[14px] text-[#111827]"
              >
                <option value={0} className="bg-white text-[#111827]">0%</option>
                <option value={1} className="bg-white text-[#111827]">1%</option>
                <option value={2} className="bg-white text-[#111827]">2%</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[12px] font-medium text-[#6B7280] block">
              Initial Seat Population
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'empty' as const,
                  title: 'Start Empty',
                  desc: 'Assign people or add randoms one by one',
                },
                {
                  id: 'randoms' as const,
                  title: 'Fill Randoms',
                  desc: 'Auto-populate all seats with qualified randoms',
                },
                {
                  id: 'prng-randoms' as const,
                  title: 'Randoms + PRNG',
                  desc: 'Populate & run Hedera PRNG seat draw',
                },
              ].map((opt) => {
                const selected = fillMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFillMode(opt.id)}
                    className={`rounded-2xl p-4 text-left border transition-all cursor-pointer space-y-1 ${
                      selected
                        ? 'bg-[#E8F0FE]/60 border-[#1A73E8]'
                        : 'bg-[#F8FAFC] border-black/[0.06] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <div
                      className={`text-[14px] font-semibold ${
                        selected ? 'text-[#1A73E8]' : 'text-[#111827]'
                      }`}
                    >
                      {opt.title}
                    </div>
                    <p className="text-[12px] text-[#6B7280] leading-[1.5]">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-black/[0.06] pt-4 flex items-center justify-between text-[14px] tabular-nums">
            <span className="text-[#6B7280]">
              Pot / Round:{' '}
              <strong className="font-semibold text-[#111827]">
                {(memberCount * contributionMad).toLocaleString()} MAD
              </strong>
            </span>
            <span className="text-[#6B7280]">
              Full Cycle:{' '}
              <strong className="font-semibold text-[#111827]">
                {(memberCount * memberCount * contributionMad).toLocaleString()} MAD
              </strong>
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full glass-pill px-5 py-2.5 text-[14px] font-medium text-[#111827] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full btn-primary px-6 py-2.5 text-[14px] font-medium cursor-pointer"
            >
              Deploy Circle &amp; Topic
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
