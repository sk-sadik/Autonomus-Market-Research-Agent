import React, { useState } from 'react';
import {
  Bot,
  Search,
  DollarSign,
  Star,
  Sparkles,
  Send,
  MessageSquare,
  TrendingUp,
  Building2,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Zap,
  ArrowRight,
  ChevronRight,
  Briefcase,
  Layers,
} from 'lucide-react';
import { ResearchReport, Competitor, ReviewSentiment } from '../types';
import { generateAgentChatResponse } from '../utils/agentChatHelper';

interface AgentConsultationViewProps {
  report: ResearchReport | null;
  onStartNewIdea: () => void;
}

export const AgentConsultationView: React.FC<AgentConsultationViewProps> = ({
  report,
  onStartNewIdea,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<'competitor' | 'pricing' | 'review'>('competitor');
  const [customQuestion, setCustomQuestion] = useState('');
  const [chatLog, setChatLog] = useState<
    { sender: 'user' | 'agent'; agentType: 'competitor' | 'pricing' | 'review'; message: string; timestamp: string }[]
  >([
    {
      sender: 'agent',
      agentType: 'competitor',
      message: `Hello! I am your 🔍 COMPETITOR AGENT. I have mapped direct & indirect rivals for "${report?.startupInput?.title || 'your startup'}". Ask me anything about incumbent market share or defensibility.`,
      timestamp: 'Just now',
    },
    {
      sender: 'agent',
      agentType: 'pricing',
      message: `I am your 💰 PRICING AGENT. I analyzed competitor pricing tiers, freemium conversion friction, and seat-based overages. What monetization questions can I answer?`,
      timestamp: 'Just now',
    },
    {
      sender: 'agent',
      agentType: 'review',
      message: `I am your ⭐ REVIEW AGENT. I mined G2 and Trustpilot reviews to uncover churn triggers and top complaints. Ask me what users hate about incumbents!`,
      timestamp: 'Just now',
    },
  ]);

  const [isConsulting, setIsConsulting] = useState(false);

  const handleAskAgent = async (e?: React.FormEvent, presetQuestion?: string) => {
    if (e) e.preventDefault();
    const query = presetQuestion || customQuestion;
    if (!query.trim() || isConsulting) return;

    const currentAgent = selectedAgent;
    const userMsg = {
      sender: 'user' as const,
      agentType: currentAgent,
      message: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatLog((prev) => [...prev, userMsg]);
    if (!presetQuestion) setCustomQuestion('');
    setIsConsulting(true);

    try {
      const reply = await generateAgentChatResponse({
        agentType: currentAgent,
        prompt: query,
        report,
      });

      setChatLog((prev) => [
        ...prev,
        {
          sender: 'agent',
          agentType: currentAgent,
          message: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'agent',
          agentType: currentAgent,
          message: `I encountered an issue analyzing your request: "${query}". Please try rephrasing your question.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsConsulting(false);
    }
  };

  const comps = report?.competitors || [
    {
      id: 'c1',
      name: 'Incumbent Alpha',
      type: 'Direct' as const,
      website: 'https://example.com',
      description: 'Market leader with legacy architecture',
      estimatedRevenue: '$40M ARR',
      marketSharePct: 35,
      pricingModel: 'Tiered Enterprise',
      startingPrice: '$750/mo',
      pricingTiers: [],
      keyStrengths: ['Brand awareness', 'Large sales team'],
      keyWeaknesses: ['High price overages', 'Clunky UI'],
      g2Rating: 4.2,
      trustpilotRating: 3.9,
      reviewCount: 540,
    },
  ];

  const sentiment = report?.reviewSentiment || {
    source: 'G2 & Trustpilot' as const,
    sampleCount: 1100,
    overallPositivePct: 65,
    overallNegativePct: 25,
    neutralPct: 10,
    topLovedFeatures: ['Core automation capabilities', 'Integration hooks'],
    topComplaintsAndPainPoints: ['Punitive price tier jumps', 'Slow support ticket response'],
    commonSwitchingTriggers: ['Unexpected annual contract price hikes'],
    unmetCustomerNeeds: ['Transparent flat pricing', 'Instant setup self-service'],
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/20 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>SPECIALIZED AGENT PANEL • 3 AGENTS ACTIVE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Consulting Multi-Agent Intelligence Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-3xl">
              When you submit a startup input, three autonomous agents execute parallel domain inquiries: <span className="text-indigo-300 font-semibold">🔍 Competitor Mapping</span>, <span className="text-emerald-300 font-semibold">💰 Pricing Benchmarking</span>, and <span className="text-amber-300 font-semibold">⭐ Review Sentiment Mining</span>.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onStartNewIdea}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold border border-slate-700 transition-colors flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Input New Idea</span>
            </button>
          </div>
        </div>

        {/* Current Idea Bar */}
        {report && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-medium">Active Idea Target:</span>
              <span className="font-bold text-indigo-300 px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20">
                "{report.startupInput.title}"
              </span>
            </div>
            <div className="flex items-center space-x-4 text-slate-400 font-mono text-[11px]">
              <span>Industry: {report.startupInput.targetIndustry}</span>
              <span>•</span>
              <span>Model: {report.startupInput.businessModel}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">Viability: {report.viabilityRating}</span>
            </div>
          </div>
        )}
      </div>

      {/* 3 Specialized Agent Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMN 1: COMPETITOR AGENT */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>

          <div>
            {/* Agent Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold text-lg">
                  🔍
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base tracking-tight">COMPETITOR AGENT</h3>
                  <span className="text-[10px] font-mono font-semibold text-indigo-400">
                    CRAWLS 40+ COMPETITOR DOMAINS
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ACTIVE
              </span>
            </div>

            <p className="text-xs text-slate-400 my-4 leading-relaxed">
              Mapped key incumbents, estimated ARR revenue, market share distribution, and domain authority.
            </p>

            {/* Findings preview */}
            <div className="space-y-3">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Top Competitors Identified</span>
                  <span className="text-[10px] text-slate-500 font-mono">{comps.length} direct rivals</span>
                </div>

                <div className="space-y-2 pt-1">
                  {comps.slice(0, 3).map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                      <div>
                        <span className="font-bold text-slate-200">{c.name}</span>
                        <span className="text-[10px] text-slate-400 block">{c.type} • {c.pricingModel}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-indigo-300">{c.marketSharePct}% share</span>
                        <span className="text-[10px] text-slate-400 block">{c.estimatedRevenue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Primary Incumbent Flaw</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  "{comps[0]?.keyWeaknesses?.[0] || 'Legacy monolith architecture & clunky user interface'}"
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedAgent('competitor');
              handleAskAgent(undefined, `What is ${comps[0]?.name || 'the top competitor'}'s main weakness?`);
            }}
            className="mt-5 w-full py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-bold text-xs border border-indigo-500/30 transition-colors flex items-center justify-center space-x-2"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Consult Competitor Agent</span>
          </button>
        </div>

        {/* COLUMN 2: PRICING AGENT */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>

          <div>
            {/* Agent Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-lg">
                  💰
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base tracking-tight">PRICING AGENT</h3>
                  <span className="text-[10px] font-mono font-semibold text-emerald-400">
                    TIER & ARPU BENCHMARKING
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ACTIVE
              </span>
            </div>

            <p className="text-xs text-slate-400 my-4 leading-relaxed">
              Analyzed competitor price points, tier limits, seat-based overage fees, and freemium friction points.
            </p>

            {/* Findings preview */}
            <div className="space-y-3">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Target Monetization Metrics</span>
                  <span className="text-[10px] text-slate-500 font-mono">Unit Economics</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Target ARPU</span>
                    <span className="font-mono font-extrabold text-emerald-400 text-sm">
                      {report?.unitEconomics?.targetARPU || '$12,000 / yr'}
                    </span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Starting Baseline</span>
                    <span className="font-mono font-extrabold text-slate-200 text-sm">
                      {comps[0]?.startingPrice || '$750/mo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Monetization Opportunity</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  "Offer transparent flat pricing without punitive seat-based overages to steal cost-sensitive buyers."
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedAgent('pricing');
              handleAskAgent(undefined, 'What pricing tier structure will give the highest ARPU?');
            }}
            className="mt-5 w-full py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs border border-emerald-500/30 transition-colors flex items-center justify-center space-x-2"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Consult Pricing Agent</span>
          </button>
        </div>

        {/* COLUMN 3: REVIEW AGENT */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>

          <div>
            {/* Agent Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-lg">
                  ⭐
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base tracking-tight">REVIEW AGENT</h3>
                  <span className="text-[10px] font-mono font-semibold text-amber-400">
                    G2 / TRUSTPILOT MINING
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ACTIVE
              </span>
            </div>

            <p className="text-xs text-slate-400 my-4 leading-relaxed">
              Parsed verified user reviews across G2 & Trustpilot to extract top complaints and churn triggers.
            </p>

            {/* Findings preview */}
            <div className="space-y-3">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Sentiment Breakdown</span>
                  <span className="text-[10px] text-slate-500 font-mono">1,100+ reviews</span>
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono font-bold py-1">
                  <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    👍 {sentiment.overallPositivePct}% Pos
                  </span>
                  <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    👎 {sentiment.overallNegativePct}% Neg
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-400">
                    😐 {sentiment.neutralPct}% Neu
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>#1 Churn Trigger Reported</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  "{sentiment.topComplaintsAndPainPoints?.[0] || 'Unannounced price increases & slow support ticket times'}"
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedAgent('review');
              handleAskAgent(undefined, 'What are the top 3 complaints users have about existing products?');
            }}
            className="mt-5 w-full py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 font-bold text-xs border border-amber-500/30 transition-colors flex items-center justify-center space-x-2"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Consult Review Agent</span>
          </button>
        </div>
      </div>

      {/* Interactive Agent Chat & Consultation Terminal */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Direct Agent Consultation Terminal</h2>
              <p className="text-xs text-slate-400">
                Ask specific questions to your choice of agent for custom tactical advice.
              </p>
            </div>
          </div>

          {/* Agent Selection Switcher */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedAgent('competitor')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                selectedAgent === 'competitor'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🔍</span>
              <span>Competitor</span>
            </button>

            <button
              onClick={() => setSelectedAgent('pricing')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                selectedAgent === 'pricing'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>💰</span>
              <span>Pricing</span>
            </button>

            <button
              onClick={() => setSelectedAgent('review')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                selectedAgent === 'review'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>⭐</span>
              <span>Review</span>
            </button>
          </div>
        </div>

        {/* Quick Suggested Prompt Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 font-semibold shrink-0">Quick Consult Prompts:</span>
          <button
            onClick={() => {
              setSelectedAgent('competitor');
              handleAskAgent(undefined, `How can "${report?.startupInput?.title || 'my startup'}" outposition incumbent leaders?`);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-indigo-300 border border-slate-800 shrink-0 font-medium transition-colors"
          >
            🔍 Outpositioning Strategy
          </button>
          <button
            onClick={() => {
              setSelectedAgent('pricing');
              handleAskAgent(undefined, 'What is the optimal freemium vs paid trial conversion model?');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-emerald-300 border border-slate-800 shrink-0 font-medium transition-colors"
          >
            💰 Optimal Pricing Model
          </button>
          <button
            onClick={() => {
              setSelectedAgent('review');
              handleAskAgent(undefined, 'What feature gap will convince customers to switch instantly?');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-300 border border-slate-800 shrink-0 font-medium transition-colors"
          >
            ⭐ #1 Switching Feature Gap
          </button>
        </div>

        {/* Chat Stream Window */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-80 overflow-y-auto space-y-4 font-sans text-xs">
          {chatLog.map((log, index) => (
            <div
              key={index}
              className={`flex ${log.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl rounded-2xl p-4 space-y-1.5 ${
                  log.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] font-mono opacity-80 pb-1 border-b border-white/10">
                  <span className="font-bold uppercase tracking-wider flex items-center space-x-1">
                    {log.sender === 'agent' && (
                      <span>
                        {log.agentType === 'competitor' && '🔍 COMPETITOR AGENT'}
                        {log.agentType === 'pricing' && '💰 PRICING AGENT'}
                        {log.agentType === 'review' && '⭐ REVIEW AGENT'}
                      </span>
                    )}
                    {log.sender === 'user' && 'YOU'}
                  </span>
                  <span>{log.timestamp}</span>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap text-xs font-medium">
                  {log.message}
                </p>
              </div>
            </div>
          ))}

          {isConsulting && (
            <div className="flex items-center space-x-2 text-indigo-400 p-3 bg-slate-900 rounded-xl border border-slate-800 w-fit">
              <Zap className="w-4 h-4 animate-spin" />
              <span className="text-xs font-semibold">Consulting active knowledge index...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleAskAgent} className="flex items-center space-x-3">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder={`Ask ${selectedAgent.toUpperCase()} AGENT a question about ${report?.startupInput?.title || 'your startup'}...`}
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 text-xs font-medium transition-all"
          />
          <button
            type="submit"
            disabled={!customQuestion.trim() || isConsulting}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 shrink-0"
          >
            <span>Consult</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
