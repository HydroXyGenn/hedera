import { useCallback, useEffect, useRef, useState } from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { AmbientPorcelainCanvas } from './components/AmbientPorcelainCanvas';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProblemSolutionSection } from './components/ProblemSolutionSection';
import { LiveDaretSimulator } from './components/LiveDaretSimulator';
import { MathAndReputationSection } from './components/MathAndReputationSection';
import { HederaArchitectureSection } from './components/HederaArchitectureSection';
import { EconomicsAndRoadmapSection } from './components/EconomicsAndRoadmapSection';
import { JoinChallengeSection } from './components/JoinChallengeSection';
import { PocConsoleApp } from './poc/PocConsoleApp';

type AppView = 'showcase' | 'poc';

function resolveViewFromLocation(): AppView {
  if (typeof window === 'undefined') return 'showcase';
  const hash = window.location.hash.toLowerCase();
  const path = window.location.pathname.toLowerCase();
  if (hash === '#poc-app' || hash === '#demo' || path.includes('poc-app')) {
    return 'poc';
  }
  return 'showcase';
}

function ShowcaseContent({ onOpenPocApp }: { onOpenPocApp: () => void }) {
  const simulatorRef = useRef<HTMLDivElement | null>(null);
  const { loadPreset } = useSimulation();

  const scrollToSimulator = () => {
    simulatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleRunOfficialDemo = () => {
    loadPreset('poc-demo', true);
    scrollToSimulator();
  };

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-clip text-[#0F172A]">
      <AmbientPorcelainCanvas />

      <div className="relative z-10">
        <Navbar onRunDemo={handleRunOfficialDemo} onOpenPocApp={onOpenPocApp} />

        <main>
          <HeroSection
            onJumpToSimulator={scrollToSimulator}
            onRunOfficialDemo={handleRunOfficialDemo}
            onOpenPocApp={onOpenPocApp}
          />

          <ProblemSolutionSection />

          <div ref={simulatorRef}>
            <LiveDaretSimulator />
          </div>

          <MathAndReputationSection />

          <HederaArchitectureSection />

          <EconomicsAndRoadmapSection />

          <JoinChallengeSection
            onJumpToSimulator={scrollToSimulator}
            onRunOfficialDemo={handleRunOfficialDemo}
            onOpenPocApp={onOpenPocApp}
          />
        </main>

        <footer className="mx-auto max-w-7xl px-4 sm:px-6 pb-10">
          <div className="border-t border-slate-900/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#475569]">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" aria-hidden="true" />
              <span>
                <strong className="text-[#0F172A]">Daret on Hedera</strong> · Hedera Cross Campus
                Challenge 2026
              </span>
            </div>

            <div className="font-mono-tabular text-xs text-[#475569]">
              Automatic Escrow · 0% Interest · ~$0.0001 Verified Payment Receipt
            </div>

            <div className="flex flex-wrap items-center gap-4 font-semibold">
              <a href="#idea" className="hover:text-[#0F172A] transition-colors">
                Why Daret
              </a>
              <a href="#simulator" className="hover:text-[#0F172A] transition-colors">
                Simulator
              </a>
              <a href="#math" className="hover:text-[#0F172A] transition-colors">
                Security Deposit
              </a>
              <a href="#join" className="hover:text-[#0F172A] transition-colors">
                Join Team
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export function App() {
  const [activeView, setActiveView] = useState<AppView>(() => resolveViewFromLocation());

  useEffect(() => {
    const syncFromUrl = () => {
      setActiveView(resolveViewFromLocation());
    };
    window.addEventListener('hashchange', syncFromUrl);
    window.addEventListener('popstate', syncFromUrl);
    return () => {
      window.removeEventListener('hashchange', syncFromUrl);
      window.removeEventListener('popstate', syncFromUrl);
    };
  }, []);

  const openPocApp = useCallback(() => {
    setActiveView('poc');
    if (window.location.hash !== '#poc-app') {
      window.history.pushState(null, '', '#poc-app');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openShowcase = useCallback(() => {
    setActiveView('showcase');
    if (window.location.hash !== '#top') {
      window.history.pushState(null, '', '#top');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (activeView === 'poc') {
    return <PocConsoleApp onSwitchToShowcase={openShowcase} />;
  }

  return (
    <SimulationProvider>
      <ShowcaseContent onOpenPocApp={openPocApp} />
    </SimulationProvider>
  );
}

export default App;
