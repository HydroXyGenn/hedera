import { useRef, useState } from 'react';
import { FloatingGlyphField } from './components/FloatingGlyphField';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProblemSolutionSection } from './components/ProblemSolutionSection';
import {
  LiveDaretSimulator,
  SimulatorPresetTrigger,
} from './components/LiveDaretSimulator';
import { MathAndReputationSection } from './components/MathAndReputationSection';
import { HederaArchitectureSection } from './components/HederaArchitectureSection';
import { EconomicsAndRoadmapSection } from './components/EconomicsAndRoadmapSection';
import { JoinChallengeSection } from './components/JoinChallengeSection';

export function App() {
  const simulatorRef = useRef<HTMLDivElement | null>(null);
  const [presetTrigger, setPresetTrigger] = useState<SimulatorPresetTrigger | null>(null);

  const scrollToSimulator = () => {
    simulatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleRunOfficialDemo = () => {
    setPresetTrigger({ key: Date.now(), preset: 'poc-demo' });
    scrollToSimulator();
  };

  return (
    <div className="relative min-h-screen text-white">
      <FloatingGlyphField />

      <div className="relative z-10">
        <Navbar onRunDemo={handleRunOfficialDemo} />

        <main>
          <HeroSection
            onJumpToSimulator={scrollToSimulator}
            onRunOfficialDemo={handleRunOfficialDemo}
          />

          <ProblemSolutionSection />

          <div ref={simulatorRef}>
            <LiveDaretSimulator externalTrigger={presetTrigger} />
          </div>

          <MathAndReputationSection />

          <HederaArchitectureSection />

          <EconomicsAndRoadmapSection />

          <JoinChallengeSection />
        </main>

        <footer className="mx-auto max-w-7xl px-4 sm:px-6 pb-10">
          <div className="glass-panel rounded-3xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sky-100/80">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9]" />
              <span>
                <strong className="text-white">Daret on Hedera</strong> · Built for Hedera Cross Campus
                Challenge 2026 (Dar Blockchain × Hedera · 4Hacks)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a href="#idea" className="hover:text-white transition-colors">
                The Idea
              </a>
              <a href="#simulator" className="hover:text-white transition-colors">
                Simulator
              </a>
              <a href="#hedera" className="hover:text-white transition-colors">
                Hedera Stack
              </a>
              <a href="#join" className="hover:text-white transition-colors">
                Join Project
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
