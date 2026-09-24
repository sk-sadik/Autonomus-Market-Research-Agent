import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Globe,
  DollarSign,
  Briefcase,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { StartupIdeaInput } from '../types';

interface IdeaInputFormProps {
  onSubmit: (input: StartupIdeaInput) => void;
  isAnalyzing: boolean;
}

export const IdeaInputForm: React.FC<IdeaInputFormProps> = ({
  onSubmit,
  isAnalyzing,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('Enterprise B2B SaaS & Automation');
  const [targetRegion, setTargetRegion] = useState('North America & Europe');
  const [targetPriceRange, setTargetPriceRange] = useState('$299 - $1,499 / month');
  const [businessModel, setBusinessModel] = useState<
    'B2B' | 'B2C' | 'B2B2C' | 'Marketplace' | 'Hardware/SaaS'
  >('B2B');
  const [depthLevel, setDepthLevel] = useState<'standard' | 'deep_dive' | 'exhaustive_20_page'>(
    'exhaustive_20_page'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onSubmit({
      title,
      description,
      targetIndustry,
      targetRegion,
      targetPriceRange,
      businessModel,
      depthLevel,
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20 mb-4">
          <Bot className="w-4 h-4 text-indigo-400" />
          <span>Autonomous Multi-Step AI Research Agent</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Enter Your Startup Idea. <br className="hidden sm:inline" />
          Get a Full <span className="bg-gradient-to-r from-indigo-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">20-Page Market Research PDF</span>
        </h1>
        <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          The agent autonomously simulates web scraping, extracts competitor pricing matrices, synthesizes G2/Trustpilot review pain points, builds TAM/SAM models, and outputs a downloadable 20-page research dossier.
        </p>
      </div>



      {/* Main Form Box */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-6">
          {/* Startup Name & Headline */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Startup Name & Headline <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., ReconcileAI - Autonomous B2B Invoice & Tax Compliance Engine"
              required
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 text-sm font-medium transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Detailed Product Concept & Value Proposition <span className="text-indigo-400">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your startup does, core technology, key problem solved, and target users..."
              required
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 text-sm font-medium transition-all"
            />
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                <span>Industry Sector</span>
              </label>
              <input
                type="text"
                value={targetIndustry}
                onChange={(e) => setTargetIndustry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Target Geography</span>
              </label>
              <input
                type="text"
                value={targetRegion}
                onChange={(e) => setTargetRegion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                <span>Target Price Tier</span>
              </label>
              <input
                type="text"
                value={targetPriceRange}
                onChange={(e) => setTargetPriceRange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Business Model</span>
              </label>
              <select
                value={businessModel}
                onChange={(e) => setBusinessModel(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
              >
                <option value="B2B">B2B SaaS / Enterprise</option>
                <option value="B2C">B2C Consumer App</option>
                <option value="B2B2C">B2B2C Hybrid</option>
                <option value="Marketplace">Two-Sided Marketplace</option>
                <option value="Hardware/SaaS">Hardware + SaaS</option>
              </select>
            </div>
          </div>

          {/* Depth Mode Bar */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <Bot className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Agent Analysis Mode</h4>
                <p className="text-[11px] text-slate-400">
                  Compiles a full 20-Page corporate research dossier with charts & PDF export.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setDepthLevel('exhaustive_20_page')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  depthLevel === 'exhaustive_20_page'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Exhaustive (20-Page PDF)
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isAnalyzing || !title.trim() || !description.trim()}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transition-all"
          >
            {isAnalyzing ? (
              <>
                <Bot className="w-5 h-5 animate-spin text-white" />
                <span>AGENT RUNNING: SCRAPING WEB & GENERATING 20-PAGE REPORT...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>LAUNCH AUTONOMOUS RESEARCH AGENT</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
