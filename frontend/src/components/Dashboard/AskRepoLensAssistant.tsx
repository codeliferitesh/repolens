import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, Send, CheckCircle, HelpCircle, Terminal } from 'lucide-react';
import type { AssistantAnswer } from '../../types';
import { askRepoLens } from '../../services/api';

interface AssistantProps {
  initialPreviews: AssistantAnswer[];
  repoUrl: string;
}

export const AskRepoLensAssistant: React.FC<AssistantProps> = ({ initialPreviews, repoUrl }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<string>(
    initialPreviews[0]?.question || 'What technologies and frameworks does this project use?'
  );
  const [activeAnswer, setActiveAnswer] = useState<AssistantAnswer>(initialPreviews[0]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  const handleSelectPreset = (preview: AssistantAnswer) => {
    setSelectedQuestion(preview.question);
    setActiveAnswer(preview);
    setQueryError(null);
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    setIsQuerying(true);
    setQueryError(null);

    try {
      const ans = await askRepoLens(repoUrl, customQuestion.trim());
      setSelectedQuestion(customQuestion.trim());
      setActiveAnswer(ans);
      setCustomQuestion('');
    } catch (err: any) {
      setQueryError(err.message || 'Failed to evaluate query.');
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-2xl glass-panel border-cyan-500/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">
              Ask RepoLens Analytical Terminal
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Zero-hallucination factual intelligence generated strictly from verified repository telemetry.
          </p>
        </div>

        <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-900 text-cyan-300 border border-slate-800 flex items-center gap-1.5 self-start sm:self-auto">
          <Terminal className="w-3 h-3 text-cyan-400" />
          <span>Stateless Inference Engine</span>
        </span>
      </div>

      {/* Preset Questions Chips Strip */}
      <div className="mb-6">
        <div className="text-xs font-mono text-slate-400 mb-2">
          Preset Intelligence Inquiries:
        </div>
        <div className="flex flex-wrap gap-2">
          {initialPreviews.map((preview) => {
            const isSelected = selectedQuestion === preview.question;
            return (
              <button
                key={preview.question}
                onClick={() => handleSelectPreset(preview)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all text-left flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,242,254,0.15)] font-semibold'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}
              >
                <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>{preview.question}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Question Form */}
      <form onSubmit={handleCustomSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="Ask about dependencies, bus factor, commit frequency, or governance..."
            className="flex-1 px-4 py-2.5 rounded-xl glass-input text-white text-xs font-mono placeholder-slate-500 focus:ring-1 focus:ring-cyan-400"
          />
          <button
            type="submit"
            disabled={isQuerying || !customQuestion.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isQuerying ? 'Evaluating...' : 'Query'}</span>
          </button>
        </div>
        {queryError && (
          <p className="text-rose-400 text-xs mt-1.5 font-mono">{queryError}</p>
        )}
      </form>

      {/* Active Answer Terminal Display */}
      {activeAnswer && (
        <motion.div
          key={activeAnswer.question}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl bg-fortress-950/90 border border-cyan-500/30 font-mono text-xs space-y-4"
        >
          {/* Question Title */}
          <div className="flex items-center gap-2 text-cyan-300 font-bold border-b border-slate-800 pb-2.5">
            <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{activeAnswer.question}</span>
          </div>

          {/* Response Text */}
          <div className="text-slate-300 leading-relaxed whitespace-pre-line text-xs font-sans sm:text-sm">
            {activeAnswer.answer}
          </div>

          {/* Key Takeaways */}
          {activeAnswer.key_takeaways && activeAnswer.key_takeaways.length > 0 && (
            <div className="pt-3 border-t border-slate-800/80">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                Executive Takeaways:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {activeAnswer.key_takeaways.map((takeaway, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-cyan-300 flex items-start gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
