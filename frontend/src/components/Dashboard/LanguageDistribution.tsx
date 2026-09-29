import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Code2 } from 'lucide-react';
import type { LanguageBreakdown } from '../../types';

interface LangProps {
  languages: LanguageBreakdown;
}

export const LanguageDistribution: React.FC<LangProps> = ({ languages }) => {
  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${bytes} B`;
  };

  const chartData = languages.languages.map((l) => ({
    name: l.name,
    value: l.bytes,
    percentage: l.percentage,
    color: l.color || '#6366f1',
  }));

  return (
    <div className="p-6 sm:p-8 rounded-2xl glass-panel border-cyan-500/20 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Language Distribution
            </h3>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 text-cyan-400 border border-slate-800">
            {formatBytes(languages.total_bytes)} Total
          </span>
        </div>

        {languages.languages.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            No source code language bytes recorded.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Donut Chart */}
            <div className="h-56 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#030712"
                    strokeWidth={2}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-2.5 rounded-lg bg-slate-900/95 border border-cyan-500/30 text-xs shadow-xl backdrop-blur-md">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: data.color }}
                              />
                              {data.name}
                            </div>
                            <div className="text-slate-300 font-mono mt-1">
                              {data.percentage}% ({formatBytes(data.value)})
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center text inside donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] font-mono text-slate-400">Primary</span>
                <span className="text-sm font-extrabold text-white truncate max-w-[90px]">
                  {languages.primary_language || 'Code'}
                </span>
              </div>
            </div>

            {/* Language Breakdown List */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {languages.languages.map((lang) => (
                <div
                  key={lang.name}
                  className="p-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 transition-colors flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: lang.color || '#6366f1' }}
                    />
                    <span className="font-medium text-slate-200 truncate">{lang.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 font-mono text-slate-400 text-[11px]">
                    <span className="text-white font-bold">{lang.percentage}%</span>
                    <span className="text-slate-500">{formatBytes(lang.bytes)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
