import React, { useState } from 'react';
import { Layers, Package, Cpu, Check } from 'lucide-react';
import type { DependenciesAnalysis } from '../../types';

interface DepProps {
  dependencies: DependenciesAnalysis;
}

export const DependenciesExplorer: React.FC<DepProps> = ({ dependencies }) => {
  const [selectedManifestIndex, setSelectedManifestIndex] = useState(0);
  const [filterType, setFilterType] = useState<'all' | 'production' | 'development'>('all');

  const activeManifest = dependencies.manifest_details[selectedManifestIndex];

  const filteredDeps = activeManifest
    ? activeManifest.dependencies.filter((d) => {
        if (filterType === 'all') return true;
        return d.category === filterType;
      })
    : [];

  return (
    <div className="p-6 sm:p-8 rounded-2xl glass-panel border-cyan-500/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Dependencies & Manifest Intelligence
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Scanned {dependencies.manifests_found.length} manifest file(s) across{' '}
            {dependencies.ecosystems_detected.join(', ') || 'native ecosystems'}.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-slate-900 text-cyan-400 border border-slate-800">
            {dependencies.total_dependencies_count} Total Packages
          </span>
        </div>
      </div>

      {/* Highlighted Frameworks Pill Strip */}
      {dependencies.highlighted_frameworks.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            <span>Detected High-Profile Frameworks & Toolchains:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {dependencies.highlighted_frameworks.map((fw) => (
              <span
                key={fw}
                className="px-3 py-1 rounded-lg bg-cyan-950/80 text-cyan-300 text-xs font-bold border border-cyan-500/40 shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-3 h-3 text-cyan-400" />
                <span>{fw}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Manifest Selector Tabs */}
      {dependencies.manifest_details.length === 0 ? (
        <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-slate-500 text-xs font-mono">
          No package manifest files (e.g. package.json, requirements.txt, Cargo.toml, go.mod) identified in repository.
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800">
            {/* Manifest tabs */}
            <div className="flex flex-wrap gap-2">
              {dependencies.manifest_details.map((m, idx) => (
                <button
                  key={m.filename}
                  onClick={() => {
                    setSelectedManifestIndex(idx);
                    setFilterType('all');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    selectedManifestIndex === idx
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Package className="w-3.5 h-3.5 inline mr-1.5" />
                  <span>{m.filename}</span>
                  <span className="ml-1.5 text-[10px] text-slate-500">({m.dependencies.length})</span>
                </button>
              ))}
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2 py-0.5 rounded ${filterType === 'all' ? 'bg-cyan-950 text-cyan-300' : 'text-slate-400'}`}
              >
                All ({activeManifest?.dependencies.length || 0})
              </button>
              <button
                onClick={() => setFilterType('production')}
                className={`px-2 py-0.5 rounded ${filterType === 'production' ? 'bg-cyan-950 text-cyan-300' : 'text-slate-400'}`}
              >
                Prod ({activeManifest?.dependencies_count || 0})
              </button>
              {activeManifest?.dev_dependencies_count > 0 && (
                <button
                  onClick={() => setFilterType('development')}
                  className={`px-2 py-0.5 rounded ${filterType === 'development' ? 'bg-cyan-950 text-cyan-300' : 'text-slate-400'}`}
                >
                  Dev ({activeManifest.dev_dependencies_count})
                </button>
              )}
            </div>
          </div>

          {/* Dependencies Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {filteredDeps.map((dep, i) => (
              <div
                key={`${dep.name}-${i}`}
                className="p-2.5 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 transition-colors flex items-center justify-between gap-2 text-xs"
              >
                <div className="truncate">
                  <span className="font-semibold text-slate-200 truncate">{dep.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                  {dep.version && (
                    <span className="text-cyan-400/90 truncate max-w-[90px]">{dep.version}</span>
                  )}
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.2 rounded ${
                      dep.category === 'development'
                        ? 'bg-purple-950 text-purple-300 border border-purple-500/30'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {dep.category === 'development' ? 'Dev' : 'Prod'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
