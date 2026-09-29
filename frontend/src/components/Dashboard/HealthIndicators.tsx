import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, HelpCircle, Check, AlertCircle, ChevronDown, ChevronUp, Sparkles, Award } from 'lucide-react';
import type { HealthScore } from '../../types';

interface HealthProps {
  health: HealthScore;
}

export const HealthIndicators: React.FC<HealthProps> = ({ health }) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40';
    if (score >= 70) return 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40';
    if (score >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-950/40';
    return 'text-rose-400 border-rose-500/30 bg-rose-950/40';
  };

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.3)]';
      case 'A':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(0,242,254,0.3)]';
      case 'B':
        return 'bg-sky-500/20 text-sky-300 border-sky-400/50';
      case 'C':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/50';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-400/50';
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-2xl glass-panel border-cyan-500/20 relative">
      {/* Header with Title & Calculation Modal Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              RepoLens Health Indicators
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Transparent telemetry score across 6 engineering and governance dimensions.
          </p>
        </div>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 transition-all"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showExplanation ? 'Hide Methodology' : 'How this score is calculated'}</span>
        </button>
      </div>

      {/* Methodology Drawer */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6 p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs text-slate-300 space-y-2"
          >
            <div className="font-semibold text-cyan-300 flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Calculation Methodology & Transparency Guarantee</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              {health.calculation_methodology}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
              {health.dimensions.map((d) => (
                <div key={d.name} className="p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-cyan-300 font-semibold">{d.name} ({Math.round(d.weight * 100)}%):</span>
                  <div className="text-[10px] text-slate-400 mt-0.5">{d.formula_explanation}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Score Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-center bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80">
        {/* Left: Big Score Gauge */}
        <div className="flex items-center justify-center lg:justify-start gap-6">
          <div className="relative flex items-center justify-center">
            <svg className="w-28 h-28 -rotate-90 transform">
              <circle
                cx="56"
                cy="56"
                r="48"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r="48"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={301.6}
                strokeDashoffset={301.6 - (301.6 * health.overall_score) / 100}
                strokeLinecap="round"
                className="text-cyan-400 transition-all duration-1000 ease-out"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{health.overall_score}</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">/ 100</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border ${getGradeBadge(health.grade)}`}>
                Grade {health.grade}
              </span>
              <span className="text-xs text-slate-400 font-mono">Overall Index</span>
            </div>
            <div className="text-base font-bold text-white tracking-wide">
              {health.status_label}
            </div>
          </div>
        </div>

        {/* Right: Summary Verdict */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-slate-950/60 border border-cyan-500/20 text-xs sm:text-sm text-slate-300 leading-relaxed flex items-start gap-3">
          <Award className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-white mb-1">RepoLens Executive Assessment</div>
            <p>{health.summary_verdict}</p>
          </div>
        </div>
      </div>

      {/* 6 Dimension Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {health.dimensions.map((dim) => {
          const isExpanded = expandedDimension === dim.name;
          return (
            <div
              key={dim.name}
              className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-bold text-sm text-slate-200">{dim.name}</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${getScoreColor(dim.score)}`}>
                    {dim.score}/100
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                    style={{ width: `${dim.score}%` }}
                  />
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {dim.description}
                </p>
              </div>

              {/* Expandable Signals */}
              <div>
                <button
                  onClick={() => setExpandedDimension(isExpanded ? null : dim.name)}
                  className="w-full pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
                >
                  <span>{isExpanded ? 'Hide Signals' : 'View Detected Signals'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 space-y-1.5 text-[11px] text-slate-300"
                    >
                      {dim.positive_signals.map((sig, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-emerald-400">
                          <Check className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>{sig}</span>
                        </div>
                      ))}
                      {dim.improvement_areas.map((imp, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-amber-400">
                          <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>{imp}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
