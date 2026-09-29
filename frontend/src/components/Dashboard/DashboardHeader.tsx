import React from 'react';
import { Star, GitFork, Eye, AlertCircle, Scale, GitBranch, HardDrive, Calendar, ExternalLink, Download, Code } from 'lucide-react';
import type { RepoMetadata } from '../../types';

interface HeaderProps {
  repo: RepoMetadata;
  onExport: () => void;
  onViewJson: () => void;
}

export const DashboardHeader: React.FC<HeaderProps> = ({ repo, onExport, onViewJson }) => {
  const formattedDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-2xl glass-panel border-cyan-500/20 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Main Info Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="flex items-start gap-4">
          <img
            src={repo.owner_avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}
            alt={repo.owner}
            className="w-16 h-16 rounded-2xl ring-2 ring-cyan-500/40 p-0.5 bg-slate-900 shrink-0 shadow-lg"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-slate-400 font-mono text-sm">{repo.owner} /</span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {repo.name}
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                {repo.visibility}
              </span>
              {repo.is_fork && (
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-500/30">
                  Fork
                </span>
              )}
              {repo.is_archived && (
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-400 border border-rose-500/30">
                  Archived
                </span>
              )}
            </div>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {repo.description || 'No description provided for this repository.'}
            </p>

            {repo.homepage && (
              <a
                href={repo.homepage.startsWith('http') ? repo.homepage : `https://${repo.homepage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono mt-2 transition-colors"
              >
                <span>{repo.homepage}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/60 hover:border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          <button
            onClick={onViewJson}
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/60 hover:border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Code className="w-3.5 h-3.5 text-indigo-400" />
            <span>Raw JSON</span>
          </button>

          <button
            onClick={onExport}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Topics row */}
      {repo.topics && repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-800/80 relative z-10">
          {repo.topics.map((topic) => (
            <span
              key={topic}
              className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-slate-900/80 text-cyan-300 border border-cyan-500/20"
            >
              #{topic}
            </span>
          ))}
        </div>
      )}

      {/* Telemetry Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 mt-6 pt-6 border-t border-slate-800/80 relative z-10">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 mb-1">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>Stars</span>
          </div>
          <div className="text-lg font-bold text-white">{repo.stars.toLocaleString()}</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 mb-1">
            <GitFork className="w-3.5 h-3.5" />
            <span>Forks</span>
          </div>
          <div className="text-lg font-bold text-white">{repo.forks.toLocaleString()}</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-sky-400 mb-1">
            <Eye className="w-3.5 h-3.5" />
            <span>Watchers</span>
          </div>
          <div className="text-lg font-bold text-white">{repo.watchers.toLocaleString()}</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Open Issues</span>
          </div>
          <div className="text-lg font-bold text-white">{repo.open_issues.toLocaleString()}</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mb-1">
            <Scale className="w-3.5 h-3.5" />
            <span>License</span>
          </div>
          <div className="text-sm font-bold text-white truncate" title={repo.license || 'None'}>
            {repo.license_spdx || repo.license || 'Unlicensed'}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 mb-1">
            <GitBranch className="w-3.5 h-3.5" />
            <span>Default</span>
          </div>
          <div className="text-sm font-bold text-white truncate font-mono">{repo.default_branch}</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-purple-400 mb-1">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Size</span>
          </div>
          <div className="text-sm font-bold text-white font-mono">
            {repo.size_kb > 1024 ? `${(repo.size_kb / 1024).toFixed(1)} MB` : `${repo.size_kb} KB`}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-teal-400 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Created</span>
          </div>
          <div className="text-xs font-bold text-white">{formattedDate(repo.created_at)}</div>
        </div>
      </div>
    </div>
  );
};
