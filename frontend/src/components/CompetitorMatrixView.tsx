import React, { useState } from 'react';
import { Competitor, ReviewSentiment } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  BarChart3,
  DollarSign,
  Star,
  ExternalLink,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Sparkles,
  Filter,
  Layers,
} from 'lucide-react';

interface CompetitorMatrixViewProps {
  competitors: Competitor[];
  reviewSentiment: ReviewSentiment;
}

export const CompetitorMatrixView: React.FC<CompetitorMatrixViewProps> = ({
  competitors,
  reviewSentiment,
}) => {
  const [pricingFilter, setPricingFilter] = useState<'All' | 'Tiered' | 'Quote' | 'Flat'>('All');
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(
    competitors[0] || null
  );

  const filteredCompetitors = competitors.filter((c) => {
    if (pricingFilter === 'All') return true;
    return c.pricingModel.toLowerCase().includes(pricingFilter.toLowerCase());
  });

  // Prepare Chart Data
  const chartData = filteredCompetitors.map((c) => {
    const priceVal = parseInt(c.startingPrice?.replace(/[^0-9]/g, '') || '0', 10);
    return {
      name: c.name,
      g2Rating: c.g2Rating,
      marketShare: c.marketSharePct || 15,
      price: priceVal,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <p className="font-bold text-slate-200">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color || entry.fill }} className="font-mono">
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-white">Competitor Pricing & Sentiment Matrix</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deep benchmark across pricing tiers, G2 customer reviews, and market share positioning.
          </p>
        </div>

        {/* Pricing Filter Pills */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-2" />
          {['All', 'Tiered', 'Quote', 'Flat'].map((f) => (
            <button
              key={f}
              onClick={() => setPricingFilter(f as any)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                pricingFilter === f
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Visual Comparison Bar Chart */}
      {chartData.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Layers className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-white">Interactive Market Share & Rating Benchmark</h3>
            </div>
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
              Recharts Interactive
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="marketShare" name="Market Share (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="price" name="Starting Price ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Competitor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredCompetitors.map((comp) => (
          <div
            key={comp.id}
            onClick={() => setSelectedCompetitor(comp)}
            className={`bg-slate-900 border rounded-2xl p-6 cursor-pointer transition-all ${
              selectedCompetitor?.id === comp.id
                ? 'border-indigo-500 ring-1 ring-indigo-500/50 shadow-xl'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {comp.type}
              </span>
              <a
                href={comp.website}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-indigo-400 text-xs flex items-center space-x-1"
                onClick={(e) => e.stopPropagation()}
              >
                <span>Visit</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">{comp.name}</h3>
            <p className="text-xs text-slate-400 mb-4 line-clamp-2">{comp.description}</p>

            <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[10px] block">Est. Revenue</span>
                <span className="text-slate-200 font-bold">{comp.estimatedRevenue}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Starting Price</span>
                <span className="text-emerald-400 font-bold">{comp.startingPrice}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800">
              <div className="flex items-center space-x-1 text-amber-400 font-bold font-mono">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{comp.g2Rating} / 5</span>
                <span className="text-slate-500 text-[10px]">({comp.reviewCount})</span>
              </div>
              <span className="text-indigo-400 font-semibold text-xs">View Tiers &rarr;</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Tier Breakdown Panel for Selected Competitor */}
      {selectedCompetitor && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 mb-6 gap-2">
            <div>
              <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
                Selected Competitor Deep Dive
              </span>
              <h3 className="text-2xl font-black text-white">{selectedCompetitor.name}</h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Pricing Model</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {selectedCompetitor.pricingModel}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pricing Tiers Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Published Pricing Tiers</span>
              </h4>

              <div className="space-y-3">
                {selectedCompetitor.pricingTiers?.map((tier, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-200 text-sm">{tier.name}</span>
                      <span className="font-mono font-extrabold text-emerald-400 text-sm">
                        {tier.price} <span className="text-[10px] text-slate-500">/{tier.billingPeriod}</span>
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {tier.keyFeatures.map((f, fIdx) => (
                        <li key={fIdx} className="text-xs text-slate-400 flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
                  Key Competitive Strengths
                </h4>
                <div className="space-y-2">
                  {selectedCompetitor.keyStrengths?.map((s, idx) => (
                    <div key={idx} className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-200 flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3">
                  Key Competitive Weaknesses (Customer Complaints)
                </h4>
                <div className="space-y-2">
                  {selectedCompetitor.keyWeaknesses?.map((w, idx) => (
                    <div key={idx} className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-200 flex items-start space-x-2">
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
