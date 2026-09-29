import React, { useState } from 'react';
import { Folder, FolderOpen, CheckCircle2, XCircle, ChevronRight, ChevronDown, Sparkles, Box, FileCode } from 'lucide-react';
import type { StructureAnalysis, FileNode } from '../../types';

interface StructureProps {
  structure: StructureAnalysis;
}

const FileTreeNode: React.FC<{ node: FileNode; depth?: number }> = ({ node, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(depth < 1);

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'ci':
        return <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">CI/CD</span>;
      case 'docker':
        return <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-500/30">Docker</span>;
      case 'manifest':
        return <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">Manifest</span>;
      case 'test':
        return <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">Test</span>;
      case 'doc':
        return <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-500/30">Doc</span>;
      case 'config':
        return <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">Config</span>;
      default:
        return null;
    }
  };

  if (node.type === 'dir') {
    return (
      <div className="font-mono text-xs">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 py-1 px-2 rounded hover:bg-slate-900/80 cursor-pointer text-slate-300 hover:text-white transition-colors select-none"
          style={{ paddingLeft: `${depth * 14 + 6}px` }}
        >
          {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
          {isOpen ? <FolderOpen className="w-4 h-4 text-cyan-400 shrink-0" /> : <Folder className="w-4 h-4 text-cyan-500/70 shrink-0" />}
          <span className="font-semibold text-slate-200">{node.name}/</span>
        </div>

        {isOpen && node.children && (
          <div>
            {node.children.map((child) => (
              <FileTreeNode key={child.path} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-between py-0.5 px-2 rounded hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 transition-colors font-mono text-xs"
      style={{ paddingLeft: `${depth * 14 + 20}px` }}
    >
      <div className="flex items-center gap-1.5 truncate">
        <FileCode className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span className="truncate">{node.name}</span>
      </div>
      <div>{getCategoryBadge(node.category)}</div>
    </div>
  );
};

export const StructureVisualizer: React.FC<StructureProps> = ({ structure }) => {
  const keyFiles = [
    { name: 'README', status: structure.has_readme },
    { name: 'Tests Directory', status: structure.has_tests },
    { name: 'CI/CD Workflows', status: structure.has_ci_cd },
    { name: 'Docker / Compose', status: structure.has_docker },
    { name: 'Contributing Guide', status: structure.has_contributing_guide },
    { name: 'License File', status: structure.has_license },
    { name: 'Security Policy', status: structure.has_security_policy },
    { name: '.env.example', status: structure.has_env_example },
  ];

  return (
    <div className="p-6 sm:p-8 rounded-2xl glass-panel border-cyan-500/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Repository Architecture & File Hierarchy
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Detected Pattern: <strong className="text-cyan-400 font-mono">{structure.architecture_pattern_hint}</strong>
          </p>
        </div>

        <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-slate-800 self-start sm:self-auto">
          {structure.total_files_sampled} Files Sampled
        </span>
      </div>

      {/* Important Files Readiness Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        {keyFiles.map((f) => (
          <div
            key={f.name}
            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
              f.status
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <span className="font-medium truncate">{f.name}</span>
            {f.status ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Interactive File Tree Visualizer */}
      <div className="p-4 rounded-xl bg-fortress-950/90 border border-slate-800">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
          <span className="font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Project Root Tree</span>
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            {structure.root_directories.length} Root Directories
          </span>
        </div>

        {structure.tree.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-mono text-xs">
            No files available in git tree.
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-0.5 pr-1">
            {structure.tree.map((node) => (
              <FileTreeNode key={node.path} node={node} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
