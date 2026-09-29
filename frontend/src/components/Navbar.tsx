import React from 'react';
import { Shield, Sparkles, RefreshCw, ExternalLink, GitBranch } from 'lucide-react';
import type { RepoMetadata } from '../types';

interface NavbarProps {
  currentRepo?: RepoMetadata;
  onReset: () => void;
  rateLimitRemaining?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRepo, onReset, rateLimitRemaining }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-3.5 transition-all duration-300 border-b border-cyan-500/10 bg-fortress-950/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={onReset}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 group-hover:border-cyan-400/60 group-hover:shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-all">
            <Shield className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
            <Sparkles className="w-2.5 h-2.5 text-cyber-purple absolute top-1 right-1 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              REPOLENS
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400/80 border border-cyan-500/20">
              v1.0
            </span>
          </div>
        </div>

        {/* Center Repo Badge (if repo is loaded) */}
        {currentRepo && (
          <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/20 shadow-inner">
            <img 
              src={currentRepo.owner_avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'} 
              alt={currentRepo.owner}
              className="w-5 h-5 rounded-full ring-1 ring-cyan-500/40"
            />
            <span className="text-xs font-mono font-medium text-slate-200">
              {currentRepo.full_name}
            </span>
            <a 
              href={currentRepo.html_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors"
              title="View on GitHub"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {rateLimitRemaining !== undefined && (
            <div 
              className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-900/60 border border-slate-700/50 text-slate-300"
              title="GitHub API Remaining Requests"
            >
              <span className={`w-2 h-2 rounded-full ${rateLimitRemaining > 10 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>API Rate: <strong className="text-cyan-400">{rateLimitRemaining}</strong></span>
            </div>
          )}

          {currentRepo && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </button>
          )}

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 hover:border-cyan-500/40 transition-all"
            aria-label="GitHub"
          >
            <GitBranch className="w-4 h-4 text-cyan-400" />
          </a>
        </div>
      </div>
    </header>
  );
};
