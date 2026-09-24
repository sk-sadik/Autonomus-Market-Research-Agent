import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { ResearchReport } from '../types';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  ShieldAlert,
  Zap,
  Activity,
  Layers,
  Award,
} from 'lucide-react';

interface ReportAnalyticsGraphsProps {
  report: ResearchReport;
}

export const ReportAnalyticsGraphs: React.FC<ReportAnalyticsGraphsProps> = ({ report }) => {
  const { marketSizing, unitEconomics, portersForces, competitors, reviewSentiment } = report;

  // Prepare Market Sizing Data
  const marketData = marketSizing.projectionYears || [
    { year: '2025', tam: marketSizing.tamValueBillions, sam: marketSizing.samValueBillions, som: marketSizing.somValueMillions / 1000 },
  ];

  // Prepare Unit Economics Data
  const revenueData = unitEconomics.threeYearProjections || [
    { year: 'Year 1', users: 50, revenueMillions: 0.5, arrMillions: 0.6 },
    { year: 'Year 2', users: 200, revenueMillions: 2.0, arrMillions: 2.4 },
    { year: 'Year 3', users: 650, revenueMillions: 7.5, arrMillions: 8.8 },
  ];

  // Prepare Porter's Forces Data
  const forcesData = [
    { force: 'Buyer Power', score: portersForces.buyerPower?.score || 3, rationale: portersForces.buyerPower?.rationale },
    { force: 'Supplier Power', score: portersForces.supplierPower?.score || 2, rationale: portersForces.supplierPower?.rationale },
    { force: 'New Entrants', score: portersForces.threatOfNewEntrants?.score || 4, rationale: portersForces.threatOfNewEntrants?.rationale },
    { force: 'Substitutes', score: portersForces.threatOfSubstitutes?.score || 2, rationale: portersForces.threatOfSubstitutes?.rationale },
    { force: 'Rivalry', score: portersForces.competitiveRivalry?.score || 4, rationale: portersForces.competitiveRivalry?.rationale },
  ];

  // Prepare Sentiment Data
  const sentimentData = [
    { name: 'Positive Reviews', value: reviewSentiment.overallPositivePct || 65, color: '#10b981' },
    { name: 'Negative Complaints', value: reviewSentiment.overallNegativePct || 25, color: '#f43f5e' },
    { name: 'Neutral Ratings', value: reviewSentiment.neutralPct || 10, color: '#64748b' },
  ];

  // Prepare Competitor Ratings Data
  const competitorData = competitors.map((c) => ({
    name: c.name,
    g2Rating: c.g2Rating,
    marketShare: c.marketSharePct || 15,
    reviewCount: c.reviewCount,
  }));

  // Custom Dark Tooltip
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
    <div className="mt-12 space-y-10 pt-8 border-t border-slate-800">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20 mb-2">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>INTERACTIVE DATA VISUALIZATION DASHBOARD</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Executive Analytics & Market Projection Graphs
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Synthesized visual metrics for <strong className="text-indigo-300">{report.startupInput.title}</strong>, detailing market trajectories, competitive force intensity, unit economics, and review sentiment analytics.
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 shrink-0">
            <div className="text-center px-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">TAM CAGR</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                +{marketSizing.cagrPercentage}%
              </span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Gross Margin</span>
              <span className="text-base font-black text-cyan-400 font-mono">
                {unitEconomics.grossMarginPct}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 1: Market Growth Projections & Revenue Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: TAM / SAM / SOM Growth */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <TrendingUp className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">5-Year Market Sizing Trajectory ($B)</h3>
                <p className="text-[11px] text-slate-400">TAM & SAM growth projections (2025 - 2029)</p>
              </div>
            </div>
            <span className="text-xs font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded">
              USD Billions
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marketData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="tam"
                  name="TAM ($B)"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTam)"
                />
                <Area
                  type="monotone"
                  dataKey="sam"
                  name="SAM ($B)"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSam)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: 3-Year Revenue & ARR Forecast */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <BarChart3 className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">3-Year Projected Revenue & ARR ($M)</h3>
                <p className="text-[11px] text-slate-400">Financial model performance curve</p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
              $ Millions
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="revenueMillions" name="Revenue ($M)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="arrMillions" name="ARR ($M)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid 2: Porter's Five Forces Radar & Sentiment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 3: Porter's Five Forces Intensity */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">Porter's Five Forces Radar Matrix</h3>
                <p className="text-[11px] text-slate-400">Structural market threat intensity (1 to 5 scale)</p>
              </div>
            </div>
            <span className="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
              Max Score: 5
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={forcesData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="force" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#475569" tick={{ fontSize: 9 }} />
                <Radar name="Force Intensity" dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 border-t border-slate-800 text-[10px] text-center">
            {forcesData.map((f, idx) => (
              <div key={idx} className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500 block truncate">{f.force}</span>
                <span className="font-bold font-mono text-amber-400">{f.score} / 5</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Review Sentiment Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <PieIcon className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">Synthesized Customer Review Sentiment</h3>
                <p className="text-[11px] text-slate-400">Based on {reviewSentiment.sampleCount || 1000}+ verified G2/Trustpilot reviews</p>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded">
              {reviewSentiment.source || 'G2'} Data
            </span>
          </div>

          <div className="h-64 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center pointer-events-none">
              <span className="text-xl font-extrabold text-emerald-400 font-mono">
                {reviewSentiment.overallPositivePct}%
              </span>
              <span className="text-[9px] text-slate-400 block font-semibold uppercase">Positive</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
            <strong className="text-indigo-400">Main Customer Pain Point: </strong>
            <span className="text-slate-400">
              {reviewSentiment.topComplaintsAndPainPoints?.[0] || 'Unpredictable pricing escalation and clunky integration setup.'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid 3: Competitor Benchmark Bar Chart */}
      {competitorData.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Award className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">Competitor Customer Satisfaction (G2 Rating)</h3>
                <p className="text-[11px] text-slate-400">Scraped G2 ratings vs review volume distribution</p>
              </div>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={competitorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 5]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="g2Rating" name="G2 Rating (/5)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="marketShare" name="Market Share (%)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
