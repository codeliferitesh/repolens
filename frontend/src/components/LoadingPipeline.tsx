import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles, Terminal } from 'lucide-react';

interface LoadingProps {
  repoUrl: string;
}

const PIPELINE_STEPS = [
  { id: 1, label: 'Connecting to GitHub API...', duration: 800 },
  { id: 2, label: 'Reading repository metadata & tree...', duration: 1100 },
  { id: 3, label: 'Analyzing commit velocity & cadence...', duration: 1200 },
  { id: 4, label: 'Mapping contributor network & bus-factor...', duration: 1000 },
  { id: 5, label: 'Inspecting project structure & manifests...', duration: 1300 },
  { id: 6, label: 'Building repository intelligence & health indicators...', duration: 1200 },
];

export const LoadingPipeline: React.FC<LoadingProps> = ({ repoUrl }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (currentStepIndex < PIPELINE_STEPS.length - 1) {
      const stepDuration = PIPELINE_STEPS[currentStepIndex].duration;
      timer = setTimeout(() => {
        setCurrentStepIndex((prev) => Math.min(prev + 1, PIPELINE_STEPS.length - 1));
      }, stepDuration);
    }
    return () => clearTimeout(timer);
  }, [currentStepIndex]);

  const progressPercent = Math.round(((currentStepIndex + 1) / PIPELINE_STEPS.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-fortress-950/90 backdrop-blur-xl px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg p-8 rounded-2xl glass-panel border-cyan-500/40 shadow-[0_0_60px_rgba(0,242,254,0.2)] text-center relative overflow-hidden"
      >
        {/* Glow header */}
        <div className="relative z-10 flex flex-col items-center mb-6">
          <div className="relative p-4 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 shadow-[0_0_25px_rgba(0,242,254,0.4)] mb-4">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <Sparkles className="w-4 h-4 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
          </div>

          <h3 className="text-xl font-bold text-white tracking-wide">
            Transmuting Codebase Telemetry
          </h3>
          <p className="text-xs font-mono text-cyan-400/90 mt-1 max-w-xs truncate">
            Target: {repoUrl}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative z-10 w-full bg-slate-900 rounded-full h-2 mb-6 border border-slate-700/60 overflow-hidden">
          <motion.div
            initial={{ width: '10%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 shadow-[0_0_12px_#00f2fe]"
          />
        </div>

        {/* Step-by-step Status Log */}
        <div className="relative z-10 space-y-2.5 text-left font-mono text-xs max-h-48 overflow-y-auto pr-1">
          {PIPELINE_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isPending = idx > currentStepIndex;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isPending ? 0.35 : 1, x: 0 }}
                className={`flex items-center gap-2.5 p-2 rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(0,242,254,0.1)]'
                    : isCompleted
                    ? 'text-slate-300'
                    : 'text-slate-600'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                )}
                <span className="truncate">{step.label}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="relative z-10 mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Stateless Python Pipeline</span>
          </span>
          <span className="font-mono text-cyan-400">{progressPercent}%</span>
        </div>
      </motion.div>
    </div>
  );
};
