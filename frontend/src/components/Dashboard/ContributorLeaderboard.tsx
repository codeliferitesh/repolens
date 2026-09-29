import React from 'react';
import { Users, ExternalLink, ShieldAlert, Award } from 'lucide-react';
import type { ContributorsSummary } from '../../types';

interface ContributorProps {
  contributors: ContributorsSummary;
}

export const ContributorLeaderboard: React.FC<ContributorProps> = ({ contributors }) => {
  return (
    <div className="p-6 sm:p-8 rounded-2xl glass-panel border-cyan-500/20 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Contributor Network
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-slate-900 text-cyan-400 border border-slate-800">
              {contributors.total_contributors_sampled} Sampled
            </span>
          </div>
        </div>

        {/* Bus factor alert strip */}
        <div className="mb-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5 text-xs">
          <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-slate-300">
            <span className="font-semibold text-white">Bus Factor:</span> {contributors.bus_factor_risk}
          </div>
        </div>

        {/* Contributor List */}
        {contributors.top_contributors.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            No public contributors accessible via API.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {contributors.top_contributors.map((c, idx) => (
              <div
                key={c.login}
                className="p-3 rounded-xl bg-slate-900/50 hover:bg-slate-900/90 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={c.avatar_url}
                      alt={c.login}
                      className="w-8 h-8 rounded-lg ring-1 ring-cyan-500/30 object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute -top-1 -right-1 p-0.5 bg-amber-400 rounded-full text-slate-950">
                        <Award className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <a
                      href={c.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-white hover:text-cyan-400 transition-colors flex items-center gap-1 truncate"
                    >
                      <span>{c.login}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {c.contributions.toLocaleString()} contributions (~{c.percentage}%)
                    </div>
                  </div>
                </div>

                {/* Contribution bar */}
                <div className="w-24 shrink-0">
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(8, c.percentage))}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
