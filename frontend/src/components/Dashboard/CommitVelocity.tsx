import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { GitCommit, Clock, ExternalLink, User } from 'lucide-react';
import type { CommitsAnalysis } from '../../types';

interface CommitProps {
  commits: CommitsAnalysis;
}

export const CommitVelocity: React.FC<CommitProps> = ({ commits }) => {
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
            <GitCommit className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Commit Activity & Cadence
            </h3>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
            {commits.commit_frequency_label}
          </span>
        </div>

        {/* Recharts Bar Timeline */}
        {commits.activity_timeline.length > 0 && (
          <div className="mb-6">
            <div className="text-xs font-mono text-slate-400 mb-2">
              Recent Commit Velocity Sample:
            </div>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commits.activity_timeline}>
                  <XAxis
                    dataKey="period"
                    stroke="#475569"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#475569"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-2 rounded-lg bg-slate-900 border border-cyan-500/30 text-xs shadow-xl">
                            <span className="text-white font-bold">{data.period}: </span>
                            <span className="text-cyan-400 font-mono">{data.count} commits</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#00f2fe"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Commits List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          <div className="text-xs font-mono text-slate-400 mb-1">
            Latest Sampled Commits ({commits.recent_commits.length}):
          </div>
          {commits.recent_commits.map((c) => (
            <div
              key={c.sha}
              className="p-2.5 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-slate-800 transition-colors flex items-start justify-between gap-3 text-xs"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <a
                    href={c.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 shrink-0"
                  >
                    <span>{c.short_sha}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                  </a>
                  <span className="text-slate-200 truncate font-medium">{c.message}</span>
                </div>

                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    {c.author_avatar ? (
                      <img src={c.author_avatar} alt="" className="w-3.5 h-3.5 rounded-full" />
                    ) : (
                      <User className="w-3 h-3 text-slate-500" />
                    )}
                    <span className="text-slate-300">{c.author_name}</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{formattedDate(c.date)}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
