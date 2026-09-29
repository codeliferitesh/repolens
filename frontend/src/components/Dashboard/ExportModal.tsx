import React, { useState } from 'react';
import { X, Copy, Check, Download, FileText, Code, Sparkles } from 'lucide-react';
import type { RepoAnalysisResponse } from '../../types';

interface ExportModalProps {
  data: RepoAnalysisResponse;
  onClose: () => void;
  defaultTab?: 'report' | 'json';
}

export const ExportModal: React.FC<ExportModalProps> = ({ data, onClose, defaultTab = 'report' }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'json'>(defaultTab);
  const [copied, setCopied] = useState(false);

  // Generate clean Markdown Report
  const generateMarkdownReport = (): string => {
    const { repository, health, languages, contributors, commits, structure, dependencies } = data;
    return `# RepoLens Intelligence Report: ${repository.full_name}
Generated: ${new Date(data.analyzed_at).toUTCString()}
URL: ${repository.html_url}

---

## 1. Executive Summary
- **Overall Health Score:** ${health.overall_score}/100 (Grade ${health.grade})
- **Status:** ${health.status_label}
- **Assessment:** ${health.summary_verdict}
- **Architecture Pattern:** ${structure.architecture_pattern_hint}

## 2. Telemetry Overview
- **Stars:** ${repository.stars.toLocaleString()}
- **Forks:** ${repository.forks.toLocaleString()}
- **Watchers:** ${repository.watchers.toLocaleString()}
- **Open Issues:** ${repository.open_issues.toLocaleString()}
- **Default Branch:** ${repository.default_branch}
- **License:** ${repository.license || 'None'}
- **Size:** ${(repository.size_kb / 1024).toFixed(2)} MB

## 3. Health Indicator Dimensions
${health.dimensions.map((d) => `### ${d.name} (${d.score}/100 - Weight: ${Math.round(d.weight * 100)}%)
${d.description}
- Positive Signals: ${d.positive_signals.join(', ')}
- Improvement Areas: ${d.improvement_areas.join(', ')}
`).join('\n')}

## 4. Languages & Frameworks
- **Primary Language:** ${languages.primary_language || 'N/A'}
${languages.languages.map((l) => `- ${l.name}: ${l.percentage}% (${(l.bytes / 1024).toFixed(1)} KB)`).join('\n')}

**Highlighted Frameworks:** ${dependencies.highlighted_frameworks.join(', ') || 'Standard library runtime'}

## 5. Contributors & Bus Factor
- **Sampled Contributors:** ${contributors.total_contributors_sampled}
- **Bus Factor Risk:** ${contributors.bus_factor_risk}
- **Velocity Category:** ${contributors.contributor_velocity}
- **Top Maintainers:**
${contributors.top_contributors.slice(0, 5).map((c) => `  - ${c.login}: ${c.contributions} contributions (~${c.percentage}%)`).join('\n')}

## 6. Commit Cadence
- **Freshness Label:** ${commits.commit_frequency_label}
- **Last Commit Date:** ${commits.last_commit_date || 'Unknown'}
- **Recent Authors Count:** ${commits.unique_recent_authors_count}

---
*Report generated stateless by RepoLens - GitHub Repository Intelligence Platform*
`;
  };

  const reportText = activeTab === 'report' ? generateMarkdownReport() : JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `${data.repository.name}-repolens-${activeTab === 'report' ? 'report.md' : 'telemetry.json'}`;
    const blob = new Blob([reportText], {
      type: activeTab === 'report' ? 'text/markdown;charset=utf-8' : 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-fortress-950/85 backdrop-blur-md px-4 py-8">
      <div className="w-full max-w-3xl max-h-[90vh] p-6 rounded-2xl glass-panel border-cyan-500/30 flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Export Repository Intelligence
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex items-center justify-between gap-3 pt-4 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('report')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'report'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Markdown Report</span>
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'json'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/50'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Full Raw JSON</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Text Area Content */}
        <div className="flex-1 overflow-hidden mt-2 rounded-xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-slate-300 overflow-y-auto">
          <pre className="whitespace-pre-wrap leading-relaxed">{reportText}</pre>
        </div>
      </div>
    </div>
  );
};
