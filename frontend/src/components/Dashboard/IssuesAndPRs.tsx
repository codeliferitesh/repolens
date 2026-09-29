import React from 'react';
import { GitPullRequest, AlertCircle, ExternalLink, User } from 'lucide-react';
import type { IssuesAndPRsAnalysis, RepoMetadata } from '../../types';

interface IssuesProps {
  issuesAndPrs: IssuesAndPRsAnalysis;
  repo: RepoMetadata;
}

export const IssuesAndPRs: React.FC<IssuesProps> = ({ issuesAndPrs, repo }) => {
  const formattedDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-2xl glass-panel border-cyan-500/20 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Issues & Pull Requests
            </h3>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 text-cyan-400 border border-slate-800">
            {issuesAndPrs.collaboration_health}
          </span>
        </div>

        {/* Counts summary row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Open Issues</span>
            </div>
            <div className="text-xl font-bold text-white">
              {repo.open_issues.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 mb-1">
              <GitPullRequest className="w-3.5 h-3.5" />
              <span>Open Pull Requests</span>
            </div>
            <div className="text-xl font-bold text-white">
              {issuesAndPrs.open_prs_count.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Recent Pull Requests Sample */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          <div className="text-xs font-mono text-slate-400 mb-1">
            Recent Pull Requests Sample ({issuesAndPrs.recent_prs.length}):
          </div>
          {issuesAndPrs.recent_prs.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs font-mono">
              No recent pull requests recorded in sample window.
            </div>
          ) : (
            issuesAndPrs.recent_prs.map((pr) => (
              <div
                key={pr.id}
                className="p-2.5 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-slate-800 transition-colors flex items-start justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <a
                      href={pr.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 shrink-0"
                    >
                      <span>#{pr.number}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                    </a>
                    <span className="text-slate-200 truncate font-medium">{pr.title}</span>
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      {pr.user_avatar ? (
                        <img src={pr.user_avatar} alt="" className="w-3.5 h-3.5 rounded-full" />
                      ) : (
                        <User className="w-3 h-3 text-slate-500" />
                      )}
                      <span className="text-slate-300">{pr.user}</span>
                    </span>
                    <span>{formattedDate(pr.created_at)}</span>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono ${
                        pr.state === 'open'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : 'bg-purple-950 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {pr.state}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
