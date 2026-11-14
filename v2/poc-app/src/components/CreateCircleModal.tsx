import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/25 backdrop-blur-sm p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-circle-title"
        className="glass-panel-deep rounded-2xl w-full max-w-2xl p-7 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2
              id="create-circle-title"
              className="font-display text-[19px] font-bold tracking-[-0.02em] text-[#0F172A]"
            >
              Deploy a New Daret Circle
            </h2>
            <p className="text-[13px] text-[#475569] font-mono-tabular">
              Smart Contract Factory · createCircle()
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full p-2 text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-[#475569] block">
              Circle Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., ENSIAS Spring Savings"
              className="w-full rounded-xl input-surface px-4 py-2.5 text-[14px] text-[#0F172A]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#475569] font-medium">Seats / Persons (N)</span>
                <span className="font-mono-tabular font-semibold text-[#0F172A]">
                  {memberCount} seats
                </span>
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
              <div className="flex justify-between text-[13px]">
                <span className="text-[#475569] font-medium">Round Amount (C)</span>
                <span className="font-mono-tabular font-semibold text-[#0F172A]">
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
                    className={`rounded-full px-3 py-1 text-[12px] font-semibold font-mono-tabular cursor-pointer transition-colors ${
                      contributionMad === c ? 'pill-active' : 'glass-pill text-[#475569]'
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
              <label className="text-[12px] font-semibold text-[#475569] block">Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as RoundPeriod)}
                className="w-full rounded-xl input-surface px-3 py-2 text-[13px] text-[#0F172A]"
              >
                <option value="2 min (PoC)" className="bg-white text-[#0F172A]">
                  2 min (PoC)
                </option>
                <option value="Weekly" className="bg-white text-[#0F172A]">
                  Weekly
                </option>
                <option value="Monthly" className="bg-white text-[#0F172A]">
                  Monthly
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-[#475569] block">
                Min Tier Gate
              </label>
              <select
                value={minTier}
                onChange={(e) => setMinTier(e.target.value as ReputationTier)}
                className="w-full rounded-xl input-surface px-3 py-2 text-[13px] text-[#0F172A]"
              >
                <option value="New" className="bg-white text-[#0F172A]">
                  Any (New+)
                </option>
                <option value="Bronze" className="bg-white text-[#0F172A]">
                  Bronze+
                </option>
                <option value="Silver" className="bg-white text-[#0F172A]">
                  Silver+
                </option>
                <option value="Gold" className="bg-white text-[#0F172A]">
                  Gold Only
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-[#475569] block">
                Protocol Fee
              </label>
              <select
                value={protocolFeePct}
                onChange={(e) => setProtocolFeePct(Number(e.target.value))}
                className="w-full rounded-xl input-surface px-3 py-2 text-[13px] text-[#0F172A]"
              >
                <option value={0} className="bg-white text-[#0F172A]">
                  0%
                </option>
                <option value={0.5} className="bg-white text-[#0F172A]">
                  0.5%
                </option>
                <option value={1} className="bg-white text-[#0F172A]">
                  1%
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-[#475569] block">
                Insurance Pool
              </label>
              <select
                value={insurancePct}
                onChange={(e) => setInsurancePct(Number(e.target.value))}
                className="w-full rounded-xl input-surface px-3 py-2 text-[13px] text-[#0F172A]"
              >
                <option value={0} className="bg-white text-[#0F172A]">
                  0%
                </option>
                <option value={1} className="bg-white text-[#0F172A]">
                  1%
                </option>
                <option value={2} className="bg-white text-[#0F172A]">
                  2%
                </option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[12px] font-semibold text-[#475569] block">
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
                    className={`rounded-xl p-3.5 text-left border transition-all cursor-pointer space-y-1 ${
                      selected
                        ? 'bg-[#E0F2FE]/65 border-[#1A73E8]'
                        : 'bg-[#F8FAFC] border-[#0F172A]/[0.07] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <div
                      className={`text-[13px] font-semibold ${
                        selected ? 'text-[#0369A1]' : 'text-[#0F172A]'
                      }`}
                    >
                      {opt.title}
                    </div>
                    <p className="text-[12px] text-[#475569] leading-[1.45]">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#0F172A]/[0.06] pt-4 flex items-center justify-between text-[13px] font-mono-tabular">
            <span className="text-[#475569]">
              Pot / Round:{' '}
              <strong className="font-semibold text-[#0F172A]">
                {(memberCount * contributionMad).toLocaleString()} MAD
              </strong>
            </span>
            <span className="text-[#475569]">
              Full Cycle:{' '}
              <strong className="font-semibold text-[#0F172A]">
                {(memberCount * memberCount * contributionMad).toLocaleString()} MAD
              </strong>
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full glass-pill px-5 py-2 text-[13px] font-semibold text-[#0F172A] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full btn-primary px-6 py-2 text-[13px] font-semibold cursor-pointer"
            >
              Deploy Circle &amp; Topic
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
