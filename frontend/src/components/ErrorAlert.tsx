import React from 'react';
import { AlertTriangle, RefreshCw, Key, ShieldAlert } from 'lucide-react';

interface ErrorProps {
  message: string;
  onRetry: () => void;
}

export const ErrorAlert: React.FC<ErrorProps> = ({ message, onRetry }) => {
  const isRateLimit = message.toLowerCase().includes('rate limit') || message.includes('429');
  const isNotFound = message.toLowerCase().includes('not found') || message.includes('404');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-fortress-950/85 backdrop-blur-md px-4">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl glass-panel border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.2)] text-center relative">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 w-16 h-16 mx-auto flex items-center justify-center mb-4">
          {isRateLimit ? <ShieldAlert className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
        </div>

        <h3 className="text-xl font-bold text-white mb-2">
          {isRateLimit ? 'GitHub API Rate Limit Reached' : isNotFound ? 'Repository Not Found' : 'Analysis Interrupted'}
        </h3>

        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          {message}
        </p>

        {isRateLimit && (
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-700/60 text-left text-xs text-slate-400 mb-6 space-y-1">
            <div className="font-semibold text-cyan-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              <span>Pro-tip: Increase Rate Limit</span>
            </div>
            <p>
              Add a free Personal Access Token to <code className="text-cyan-300">backend/.env</code> as <code className="text-cyan-300">GITHUB_TOKEN=ghp_...</code> to raise limits from 60 to 5,000 requests/hour.
            </p>
          </div>
        )}

        <button
          onClick={onRetry}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Another Repository</span>
        </button>
      </div>
    </div>
  );
};
