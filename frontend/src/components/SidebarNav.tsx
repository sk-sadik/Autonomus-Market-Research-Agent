import React, { useState } from 'react';
import {
  Bot,
  FileText,
  BarChart3,
  Sparkles,
  Bookmark,
  Zap,
  Users,
  DollarSign,
  Star,
  ChevronRight,
  Menu,
  X,
  Search,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

export type TabType = 'new_idea' | 'agents' | 'pipeline' | 'report' | 'competitors' | 'simulator' | 'saved';

interface SidebarNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  hasActiveReport: boolean;
  savedCount: number;
  isAnalyzing: boolean;
  onQuickPresetSelect?: (presetId: string) => void;
  currentIdeaTitle?: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  setActiveTab,
  hasActiveReport,
  savedCount,
  isAnalyzing,
  currentIdeaTitle,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden sticky top-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between text-slate-100">
        <div className="flex items-center space-x-2" onClick={() => handleTabClick('new_idea')}>
          <div className="p-1.5 bg-gradient-to-tr from-indigo-600 to-emerald-500 rounded-lg shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            RESEARCH AGENTS
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/80 text-slate-100 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="p-5 border-b border-slate-800/80">
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => handleTabClick('new_idea')}
          >
            <div className="relative p-2 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-500 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Bot className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                  RESEARCH AGENT
                </span>
              </div>
              <p className="text-[10px] font-mono font-medium text-emerald-400 flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>3 AGENTS CONSULTING</span>
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Action Nav */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Core Navigation
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleTabClick('new_idea')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'new_idea'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>New Research Idea</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>

              <button
                onClick={() => handleTabClick('agents')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'agents'
                    ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="flex -space-x-1">
                    <span className="w-4 h-4 rounded-full bg-indigo-500/80 text-[9px] flex items-center justify-center font-bold">🔍</span>
                    <span className="w-4 h-4 rounded-full bg-emerald-500/80 text-[9px] flex items-center justify-center font-bold">💰</span>
                    <span className="w-4 h-4 rounded-full bg-amber-500/80 text-[9px] flex items-center justify-center font-bold">⭐</span>
                  </div>
                  <span className="font-bold">3 Specialized Agents</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LIVE
                </span>
              </button>

              {isAnalyzing && (
                <button
                  onClick={() => handleTabClick('pipeline')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'pipeline'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'text-emerald-400 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Zap className="w-4 h-4 text-emerald-400 animate-spin" />
                    <span>Agent Execution Logs</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </button>
              )}
            </nav>
          </div>

          {/* Research Dossiers & Analytics */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Intelligence Outputs
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => handleTabClick('report')}
                disabled={!hasActiveReport}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  !hasActiveReport
                    ? 'text-slate-600 cursor-not-allowed'
                    : activeTab === 'report'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>20-Page Report</span>
                </div>
                {hasActiveReport && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                )}
              </button>

              <button
                onClick={() => handleTabClick('competitors')}
                disabled={!hasActiveReport}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  !hasActiveReport
                    ? 'text-slate-600 cursor-not-allowed'
                    : activeTab === 'competitors'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span>Competitor Matrix</span>
                </div>
              </button>

              <button
                onClick={() => handleTabClick('simulator')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'simulator'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">Interactive Studio</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  SANDBOX
                </span>
              </button>

              <button
                onClick={() => handleTabClick('saved')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'saved'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  <span>Saved Dossiers</span>
                </div>
                {savedCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200">
                    {savedCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Specialized Agents Quick Overview Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="text-[11px] font-bold text-slate-300 flex items-center space-x-1.5">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span>Agents Roster</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-slate-400 p-1.5 rounded bg-slate-900/60 hover:text-indigo-300 cursor-pointer" onClick={() => handleTabClick('agents')}>
                <span className="flex items-center space-x-1.5">
                  <span>🔍</span>
                  <span className="font-semibold text-slate-200">Competitor Agent</span>
                </span>
                <span className="text-[9px] text-emerald-400 font-mono">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 p-1.5 rounded bg-slate-900/60 hover:text-emerald-300 cursor-pointer" onClick={() => handleTabClick('agents')}>
                <span className="flex items-center space-x-1.5">
                  <span>💰</span>
                  <span className="font-semibold text-slate-200">Pricing Agent</span>
                </span>
                <span className="text-[9px] text-emerald-400 font-mono">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 p-1.5 rounded bg-slate-900/60 hover:text-amber-300 cursor-pointer" onClick={() => handleTabClick('agents')}>
                <span className="flex items-center space-x-1.5">
                  <span>⭐</span>
                  <span className="font-semibold text-slate-200">Review Agent</span>
                </span>
                <span className="text-[9px] text-emerald-400 font-mono">ACTIVE</span>
              </div>
            </div>
          </div>


        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Engine v3.2</span>
          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono text-[9px]">
            Gemini 3.6
          </span>
        </div>
      </aside>
    </>
  );
};
