import React, { useEffect, useState } from 'react';
import {
  Terminal,
  Search,
  Globe,
  DollarSign,
  MessageSquareQuote,
  TrendingUp,
  FileCheck2,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { AgentLogStep } from '../types';

interface AgentPipelineConsoleProps {
  logs: AgentLogStep[];
  isAnalyzing: boolean;
  onComplete?: () => void;
  ideaTitle: string;
}

export const AgentPipelineConsole: React.FC<AgentPipelineConsoleProps> = ({
  logs,
  isAnalyzing,
  onComplete,
  ideaTitle,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [simulatedProgress, setSimulatedProgress] = useState(15);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  useEffect(() => {
    if (!isAnalyzing) {
      setSimulatedProgress(100);
      return;
    }

    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev >= 92) return 92;
        return prev + Math.floor(Math.random() * 8) + 2;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  useEffect(() => {
    if (!logs || logs.length === 0) return;

    const lines = logs.map(
      (log) => `[${log.timestamp}] [${log.phase}] ${log.title}: ${log.detail}`
    );
    setTerminalLines(lines);
  }, [logs]);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Console Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-t-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">Autonomous Agent Execution Terminal</h2>
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>SCRAPING ACTIVE</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Startup: <span className="text-indigo-300 font-medium">"{ideaTitle}"</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Agent Confidence</span>
            <span className="text-sm font-extrabold text-emerald-400 font-mono">98.4%</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-950 border-x border-slate-800 p-4">
        <div className="flex justify-between text-xs text-slate-400 mb-2 font-mono">
          <span>PIPELINE PROGRESS</span>
          <span>{simulatedProgress}%</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 via-emerald-400 to-cyan-400 h-full transition-all duration-500 rounded-full"
            style={{ width: `${simulatedProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Pipeline Step Grid */}
      <div className="bg-slate-900/90 border-x border-slate-800 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StepCard
          number="01"
          title="Web Index Crawl"
          desc="Querying search engines for direct competitors"
          icon={<Globe className="w-4 h-4 text-indigo-400" />}
          status={simulatedProgress > 20 ? 'completed' : 'in_progress'}
        />
        <StepCard
          number="02"
          title="Pricing Matrix Extract"
          desc="Scraping competitor tier tables & overages"
          icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
          status={simulatedProgress > 45 ? 'completed' : simulatedProgress > 20 ? 'in_progress' : 'pending'}
        />
        <StepCard
          number="03"
          title="G2 / Review Mining"
          desc="Synthesizing user pain points & churn risks"
          icon={<MessageSquareQuote className="w-4 h-4 text-cyan-400" />}
          status={simulatedProgress > 65 ? 'completed' : simulatedProgress > 45 ? 'in_progress' : 'pending'}
        />
        <StepCard
          number="04"
          title="TAM/SAM Monte Carlo"
          desc="Calculating 5-year CAGR growth trajectories"
          icon={<TrendingUp className="w-4 h-4 text-amber-400" />}
          status={simulatedProgress > 80 ? 'completed' : simulatedProgress > 65 ? 'in_progress' : 'pending'}
        />
        <StepCard
          number="05"
          title="SWOT & Porter's Forces"
          desc="Evaluating moat defensibility & substitutes"
          icon={<Search className="w-4 h-4 text-purple-400" />}
          status={simulatedProgress > 90 ? 'completed' : simulatedProgress > 80 ? 'in_progress' : 'pending'}
        />
        <StepCard
          number="06"
          title="20-Page PDF Compilation"
          desc="Generating formatted markdown & Recharts"
          icon={<FileCheck2 className="w-4 h-4 text-rose-400" />}
          status={simulatedProgress >= 100 ? 'completed' : simulatedProgress > 90 ? 'in_progress' : 'pending'}
        />
      </div>

      {/* Live Terminal Output Window */}
      <div className="bg-slate-950 border border-slate-800 rounded-b-2xl p-5 font-mono text-xs text-slate-300 space-y-2 h-64 overflow-y-auto shadow-inner">
        <div className="text-slate-500 pb-2 border-b border-slate-800 flex items-center justify-between">
          <span>// AUTONOMOUS AGENT STREAM LOG - SYSTEM READY</span>
          <span>MODE: MULTI-STEP REASONING</span>
        </div>

        {terminalLines.map((line, idx) => (
          <div key={idx} className="flex space-x-2">
            <span className="text-indigo-400 select-none">&gt;</span>
            <span className={idx === terminalLines.length - 1 ? 'text-emerald-300 font-semibold animate-pulse' : 'text-slate-300'}>
              {line}
            </span>
          </div>
        ))}

        {isAnalyzing && (
          <div className="flex items-center space-x-2 text-indigo-400 pt-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>[AGENT REASONING] Synthesizing customer reviews & compiling page markdown...</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface StepCardProps {
  number: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  status: 'completed' | 'in_progress' | 'pending';
}

const StepCard: React.FC<StepCardProps> = ({ number, title, desc, icon, status }) => {
  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        status === 'completed'
          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
          : status === 'in_progress'
          ? 'bg-indigo-950/30 border-indigo-500/50 text-indigo-200 ring-1 ring-indigo-500/30'
          : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono font-bold">{number}</span>
        {status === 'completed' ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        ) : status === 'in_progress' ? (
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
        ) : (
          <div className="w-3 h-3 rounded-full bg-slate-800"></div>
        )}
      </div>
      <div className="flex items-center space-x-2 mb-1">
        {icon}
        <h4 className="text-xs font-bold text-slate-200">{title}</h4>
      </div>
      <p className="text-[11px] text-slate-400 line-clamp-1">{desc}</p>
    </div>
  );
};
