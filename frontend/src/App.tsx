import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CastleScene } from './three/CastleScene';
import { StorytellingLanding } from './components/StorytellingLanding';
import { LoadingPipeline } from './components/LoadingPipeline';
import { ErrorAlert } from './components/ErrorAlert';
import { DashboardHeader } from './components/Dashboard/DashboardHeader';
import { HealthIndicators } from './components/Dashboard/HealthIndicators';
import { LanguageDistribution } from './components/Dashboard/LanguageDistribution';
import { ContributorLeaderboard } from './components/Dashboard/ContributorLeaderboard';
import { CommitVelocity } from './components/Dashboard/CommitVelocity';
import { StructureVisualizer } from './components/Dashboard/StructureVisualizer';
import { DependenciesExplorer } from './components/Dashboard/DependenciesExplorer';
import { IssuesAndPRs } from './components/Dashboard/IssuesAndPRs';
import { AskRepoLensAssistant } from './components/Dashboard/AskRepoLensAssistant';
import { ExportModal } from './components/Dashboard/ExportModal';
import type { RepoAnalysisResponse, SampleRepo } from './types';
import { analyzeRepository, fetchSampleRepositories, fetchRateLimit } from './services/api';
import confetti from 'canvas-confetti';

export function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentView, setCurrentView] = useState<'landing' | 'loading' | 'dashboard'>('landing');
  const [targetUrl, setTargetUrl] = useState('');
  const [analysisData, setAnalysisData] = useState<RepoAnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [samples, setSamples] = useState<SampleRepo[]>([]);
  const [rateLimit, setRateLimit] = useState<{ remaining: number; limit: number }>({ remaining: 60, limit: 60 });
  const [activeModal, setActiveModal] = useState<'export' | 'json' | null>(null);

  // Track page scroll progress for 3D camera
  useEffect(() => {
    const handleScroll = () => {
      if (currentView !== 'landing') return;
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const current = window.scrollY / totalScroll;
        setScrollProgress(Math.min(1, Math.max(0, current)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  // Load initial samples and rate limits
  useEffect(() => {
    fetchSampleRepositories().then(setSamples);
    fetchRateLimit().then(setRateLimit);
  }, []);

  const handleStartAnalysis = async (url: string) => {
    setTargetUrl(url);
    setCurrentView('loading');
    setErrorMessage(null);

    try {
      const result = await analyzeRepository(url);
      setAnalysisData(result);
      if (result.rate_limit_remaining !== undefined) {
        setRateLimit((prev) => ({ ...prev, remaining: result.rate_limit_remaining || prev.remaining }));
      }
      setCurrentView('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Trigger celebratory confetti for high scores
      if (result.health.overall_score >= 80) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f2fe', '#8a2be2', '#38bdf8', '#34d399'],
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while analyzing this repository.');
      setCurrentView('landing');
    }
  };

  const handleReset = () => {
    setAnalysisData(null);
    setErrorMessage(null);
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-fortress-950 text-slate-100 relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-white">
      {/* Background 3D Digital Castle Scene (Active on landing) */}
      {currentView === 'landing' && (
        <CastleScene scrollProgress={scrollProgress} />
      )}

      {/* Cyber ambient grid lines */}
      <div className="fixed inset-0 cyber-grid opacity-25 pointer-events-none z-0" />

      {/* Top Navigation */}
      <Navbar
        currentRepo={analysisData?.repository}
        onReset={handleReset}
        rateLimitRemaining={rateLimit.remaining}
      />

      {/* VIEW 1: Scroll-driven 3D Storytelling Landing */}
      {currentView === 'landing' && (
        <StorytellingLanding
          onAnalyze={handleStartAnalysis}
          samples={samples}
          isLoading={false}
          scrollProgress={scrollProgress}
        />
      )}

      {/* VIEW 2: Animated Pipeline Loader */}
      {currentView === 'loading' && (
        <LoadingPipeline repoUrl={targetUrl} />
      )}

      {/* VIEW 3: Telemetry Intelligence Dashboard */}
      {currentView === 'dashboard' && analysisData && (
        <main className="relative z-10 pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
          {/* Section 1: Top Metadata Banner */}
          <DashboardHeader
            repo={analysisData.repository}
            onExport={() => setActiveModal('export')}
            onViewJson={() => setActiveModal('json')}
          />

          {/* Section 2: Health Indicators (6 Dimensions + Methodology) */}
          <HealthIndicators health={analysisData.health} />

          {/* Section 3: Dual Grid (Languages + Contributor Network) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LanguageDistribution languages={analysisData.languages} />
            <ContributorLeaderboard contributors={analysisData.contributors} />
          </div>

          {/* Section 4: Dual Grid (Commit Velocity + Issues & PRs) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CommitVelocity commits={analysisData.commits} />
            <IssuesAndPRs
              issuesAndPrs={analysisData.issues_and_prs}
              repo={analysisData.repository}
            />
          </div>

          {/* Section 5: Architecture & Interactive File Tree */}
          <StructureVisualizer structure={analysisData.structure} />

          {/* Section 6: Dependencies & Manifest Explorer */}
          <DependenciesExplorer dependencies={analysisData.dependencies} />

          {/* Section 7: Ask RepoLens Intelligence Terminal */}
          <AskRepoLensAssistant
            initialPreviews={analysisData.assistant_previews}
            repoUrl={analysisData.repository.html_url}
          />
        </main>
      )}

      {/* Error Modal */}
      {errorMessage && (
        <ErrorAlert
          message={errorMessage}
          onRetry={() => setErrorMessage(null)}
        />
      )}

      {/* Export / JSON Inspector Modal */}
      {activeModal && analysisData && (
        <ExportModal
          data={analysisData}
          defaultTab={activeModal === 'json' ? 'json' : 'report'}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}

export default App;
