import React from 'react';
import {
  Bot,
  FileText,
  BarChart3,
  Search,
  Sparkles,
  Bookmark,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'new_idea' | 'pipeline' | 'report' | 'competitors' | 'saved';
  setActiveTab: (tab: 'new_idea' | 'pipeline' | 'report' | 'competitors' | 'saved') => void;
  hasActiveReport: boolean;
  savedCount: number;
  isAnalyzing: boolean;
  onQuickPresetSelect: (presetId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hasActiveReport,
  savedCount,
  isAnalyzing,
  onQuickPresetSelect,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Agent Badge */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('new_idea')}>
            <div className="relative p-2 bg-gradient-to-tr from-indigo-600 to-emerald-500 rounded-xl shadow-lg shadow-indigo-500/20">
              <Bot className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  RESEARCH AGENT
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v3.2 AUTONOMOUS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Web Scraping • Pricing Matrix • Review Mining • 20-Page PDF Report
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('new_idea')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'new_idea'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Idea</span>
            </button>

            {isAnalyzing && (
              <button
                onClick={() => setActiveTab('pipeline')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'pipeline'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-emerald-400 hover:bg-emerald-950/40'
                }`}
              >
                <Zap className="w-3.5 h-3.5 animate-spin" />
                <span>Agent Terminal</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('report')}
              disabled={!hasActiveReport}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !hasActiveReport
                  ? 'text-slate-600 cursor-not-allowed'
                  : activeTab === 'report'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>20-Page Report</span>
              {hasActiveReport && (
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('competitors')}
              disabled={!hasActiveReport}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !hasActiveReport
                  ? 'text-slate-600 cursor-not-allowed'
                  : activeTab === 'competitors'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Competitor Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'saved'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Reports</span>
              {savedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/30 text-indigo-200">
                  {savedCount}
                </span>
              )}
            </button>
          </nav>

          {/* Quick Preset Selector dropdown */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 text-xs">
              <span className="text-slate-400">Quick Test:</span>
              <button
                onClick={() => onQuickPresetSelect('ai-compliance-saas')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-medium transition-colors border border-slate-700"
              >
                B2B FinTech
              </button>
              <button
                onClick={() => onQuickPresetSelect('eco-packaging-marketplace')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 font-medium transition-colors border border-slate-700"
              >
                Packaging Exch.
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
