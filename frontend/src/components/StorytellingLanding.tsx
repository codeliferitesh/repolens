import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Sparkles, Terminal, Layers, Users, GitCommit, ShieldCheck, ChevronDown } from 'lucide-react';
import type { SampleRepo } from '../types';

interface LandingProps {
  onAnalyze: (url: string) => void;
  samples: SampleRepo[];
  isLoading: boolean;
  scrollProgress: number;
}

export const StorytellingLanding: React.FC<LandingProps> = ({
  onAnalyze,
  samples,
  isLoading,
  scrollProgress,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setValidationError('Please enter a GitHub repository URL or owner/repo slug.');
      return;
    }
    const isValid = /(?:github\.com\/)?([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/.test(trimmed);
    if (!isValid) {
      setValidationError('Please enter a valid format, e.g. https://github.com/facebook/react or facebook/react');
      return;
    }
    setValidationError(null);
    onAnalyze(trimmed);
  };

  const handleSampleClick = (url: string) => {
    setInputUrl(url);
    setValidationError(null);
    onAnalyze(url);
  };

  const isStage1 = scrollProgress <= 0.22;
  const isStage2 = scrollProgress > 0.22 && scrollProgress <= 0.48;
  const isStage3 = scrollProgress > 0.48 && scrollProgress <= 0.70;
  const isStage4 = scrollProgress > 0.70 && scrollProgress <= 0.86;

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative z-10 w-full">
      {/* Scroll Indicator at top/bottom */}
      {scrollProgress < 0.85 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-auto">
          <button
            onClick={scrollToBottom}
            className="flex flex-col items-center gap-2 text-cyan-400/80 hover:text-cyan-300 transition-colors group"
          >
            <span className="text-xs uppercase tracking-widest font-mono text-slate-400 group-hover:text-cyan-300">
              Scroll or Click to Enter
            </span>
            <div className="w-8 h-12 rounded-full border-2 border-cyan-500/30 flex items-start justify-center p-1.5 backdrop-blur-sm bg-fortress-950/40">
              <motion.div
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe]"
              />
            </div>
            <ChevronDown className="w-4 h-4 text-cyan-400 animate-bounce -mt-1" />
          </button>
        </div>
      )}

      {/* STAGE 1: Outside Fortress */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isStage1 ? 1 : 0.1, y: isStage1 ? 0 : -20 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GitHub Repository Intelligence Platform</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight mb-6 bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            REPOLENS
          </h1>

          <p className="text-xl sm:text-2xl md:text-3xl text-cyan-200/90 font-light tracking-wide mb-4 glow-text-cyan">
            "Enter the repository. Discover its architecture."
          </p>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
            Stateless deep codebase telemetry, architectural hierarchy, dependency intelligence, and verified health indicators.
          </p>
        </motion.div>
      </section>

      {/* STAGE 2: Approaching Fortress */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          animate={{ opacity: isStage2 ? 1 : 0.15, scale: isStage2 ? 1 : 0.95 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 px-3 py-1 rounded bg-indigo-950/60 border border-indigo-500/30 mb-4 inline-block">
            Section 02 // Discovery
          </span>
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 text-white">
            Every repository <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">
              has a story.
            </span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-lg mx-auto">
            Beyond stars and forks lies the true architectural pulse of a software system.
          </p>
        </motion.div>
      </section>

      {/* STAGE 3: Gateway Arrival */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          animate={{ opacity: isStage3 ? 1 : 0.15, y: isStage3 ? 0 : 20 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 px-3 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 mb-6 inline-block">
            Section 03 // Fortress Gates
          </span>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-8 text-white">
            Commits. Dependencies. <br />
            <span className="text-cyan-400 glow-text-cyan">Contributors. Architecture.</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-xl glass-panel border-cyan-500/20">
              <GitCommit className="w-5 h-5 text-cyan-400 mb-2" />
              <div className="text-sm font-semibold text-white">Commit Cadence</div>
              <div className="text-xs text-slate-400 mt-1">Velocity & author activity</div>
            </div>
            <div className="p-4 rounded-xl glass-panel border-cyan-500/20">
              <Layers className="w-5 h-5 text-indigo-400 mb-2" />
              <div className="text-sm font-semibold text-white">Dependencies</div>
              <div className="text-xs text-slate-400 mt-1">Manifest inspection</div>
            </div>
            <div className="p-4 rounded-xl glass-panel border-cyan-500/20">
              <Users className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="text-sm font-semibold text-white">Contributors</div>
              <div className="text-xs text-slate-400 mt-1">Bus-factor resilience</div>
            </div>
            <div className="p-4 rounded-xl glass-panel border-cyan-500/20">
              <ShieldCheck className="w-5 h-5 text-purple-400 mb-2" />
              <div className="text-sm font-semibold text-white">Health Indicators</div>
              <div className="text-xs text-slate-400 mt-1">6-dimension telemetry</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* STAGE 4: Doors Opening */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          animate={{ opacity: isStage4 ? 1 : 0.15, scale: isStage4 ? 1 : 0.9 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="p-4 rounded-full bg-cyan-500/10 border border-cyan-400/40 w-16 h-16 mx-auto flex items-center justify-center mb-6 animate-pulse-glow">
            <Terminal className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Fortress Doors Unlocked.
          </h2>
          <p className="text-cyan-200/90 text-lg">
            Transmuting public repository data into actionable engineering intelligence.
          </p>
        </motion.div>
      </section>

      {/* STAGE 5: The Interactive Analyzer Interface */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-16 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-4xl mx-auto"
        >
          {/* Main Input Card */}
          <div className="relative p-6 sm:p-10 rounded-2xl glass-panel border-cyan-500/30 shadow-[0_0_50px_rgba(0,242,254,0.15)] overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 px-3 py-1 rounded bg-cyan-950/80 border border-cyan-500/30 mb-3 inline-block">
                Repository Telemetry Scanner
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Enter Public Repository URL
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-xl mx-auto">
                Paste any GitHub repository link. Our Python engine performs deep telemetry on commits, languages, dependencies, and structure.
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="relative z-10 mb-6">
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-cyan-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => {
                      setInputUrl(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="https://github.com/facebook/react or owner/repo"
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-4 rounded-xl glass-input text-white placeholder-slate-500 font-mono text-sm sm:text-base focus:ring-2 focus:ring-cyan-400/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,242,254,0.4)] hover:shadow-[0_0_35px_rgba(0,242,254,0.6)] transition-all duration-300 disabled:opacity-50 group"
                >
                  <span>{isLoading ? 'Scanning...' : 'Analyze Repository'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Validation error message */}
              {validationError && (
                <p className="mt-3 text-sm text-rose-400 font-medium text-left flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  {validationError}
                </p>
              )}
            </form>

            {/* Sample Repositories Showcase */}
            <div className="relative z-10 pt-4 border-t border-slate-800">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3 text-left">
                Or explore curated showcase repositories:
              </div>
              <div className="flex flex-wrap gap-2">
                {samples.map((sample) => (
                  <button
                    key={sample.url}
                    onClick={() => handleSampleClick(sample.url)}
                    disabled={isLoading}
                    className="group px-3 py-2 rounded-lg bg-slate-900/80 hover:bg-cyan-950/60 border border-slate-700/60 hover:border-cyan-500/50 text-left transition-all text-xs"
                  >
                    <div className="font-semibold text-slate-200 group-hover:text-cyan-300 flex items-center gap-1.5">
                      <span>{sample.owner}/{sample.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 group-hover:text-slate-400 mt-0.5">
                      {sample.category}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
