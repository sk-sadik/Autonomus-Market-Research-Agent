import React from 'react';
import {
  ResearchPageContent,
  Competitor,
  MarketSizing,
  SWOTItem,
  PortersFiveForces,
  FinancialUnitEconomics,
  ReviewSentiment,
} from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Info,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Award,
  TrendingUp,
  ShieldAlert,
  Users,
} from 'lucide-react';

interface ReportPageProps {
  page: ResearchPageContent;
  competitors: Competitor[];
  marketSizing: MarketSizing;
  swot: SWOTItem;
  portersForces: PortersFiveForces;
  unitEconomics: FinancialUnitEconomics;
  reviewSentiment: ReviewSentiment;
}

const COLORS = ['#6366f1', '#10b981', '#06b6d4', '#f59e0b', '#ec4899'];

export const ReportPage: React.FC<ReportPageProps> = ({
  page,
  competitors,
  marketSizing,
  swot,
  portersForces,
  unitEconomics,
  reviewSentiment,
}) => {
  return (
    <div
      id={`report-page-${page.pageNumber}`}
      className="bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 p-8 sm:p-12 mb-8 relative overflow-hidden transition-all min-h-[900px] flex flex-col justify-between"
    >
      {/* Top Header Bar */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 font-mono text-xs font-bold uppercase tracking-wider border border-indigo-200">
              {page.sectionCategory}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Confidential Market Research Dossier
            </span>
          </div>
          <div className="text-xs font-mono font-bold text-slate-400">
            PAGE {page.pageNumber} OF 20
          </div>
        </div>

        {/* Page Title & Subheading */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {page.title}
          </h2>
          <p className="text-sm font-semibold text-indigo-600 mt-1">
            {page.subheading}
          </p>
        </div>

        {/* Key Metrics Callout Badges */}
        {page.keyMetrics && page.keyMetrics.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {page.keyMetrics.map((m, i) => (
              <div
                key={i}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between"
              >
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  {m.label}
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-black text-slate-900 font-mono">
                    {m.value}
                  </span>
                  {m.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                      {m.badge}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Text Paragraphs */}
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed mb-6">
          {page.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {/* Callout Box */}
        {page.calloutBox && (
          <div
            className={`p-4 rounded-xl border mb-6 text-xs sm:text-sm ${
              page.calloutBox.type === 'opportunity'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : page.calloutBox.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}
          >
            <div className="flex items-center space-x-2 font-bold mb-1">
              {page.calloutBox.type === 'opportunity' && <Sparkles className="w-4 h-4 text-emerald-600" />}
              {page.calloutBox.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
              {page.calloutBox.type === 'info' && <Info className="w-4 h-4 text-indigo-600" />}
              <span>{page.calloutBox.title}</span>
            </div>
            <p className="leading-relaxed">{page.calloutBox.content}</p>
          </div>
        )}

        {/* Bullet Points */}
        {page.bulletPoints && page.bulletPoints.length > 0 && (
          <ul className="space-y-2 mb-6">
            {page.bulletPoints.map((bp, i) => (
              <li key={i} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>{bp}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Custom Renderers based on Chart / Section Type */}
        {page.chartType === 'bar_tam' && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>5-Year Market Sizing Growth Projection (TAM / SAM / SOM)</span>
            </h4>
            <div className="h-64 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={marketSizing?.projectionYears || [
                  { year: '2025', tam: marketSizing?.tamValueBillions || 12.5, sam: marketSizing?.samValueBillions || 3.2, som: (marketSizing?.somValueMillions || 85) / 1000 },
                  { year: '2026', tam: (marketSizing?.tamValueBillions || 12.5) * 1.15, sam: (marketSizing?.samValueBillions || 3.2) * 1.15, som: ((marketSizing?.somValueMillions || 85) * 1.25) / 1000 },
                  { year: '2027', tam: (marketSizing?.tamValueBillions || 12.5) * 1.32, sam: (marketSizing?.samValueBillions || 3.2) * 1.32, som: ((marketSizing?.somValueMillions || 85) * 1.6) / 1000 },
                  { year: '2028', tam: (marketSizing?.tamValueBillions || 12.5) * 1.55, sam: (marketSizing?.samValueBillions || 3.2) * 1.55, som: ((marketSizing?.somValueMillions || 85) * 2.1) / 1000 },
                  { year: '2029', tam: (marketSizing?.tamValueBillions || 12.5) * 1.82, sam: (marketSizing?.samValueBillions || 3.2) * 1.82, som: ((marketSizing?.somValueMillions || 85) * 2.8) / 1000 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} unit="B" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="tam" name="TAM ($B)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sam" name="SAM ($B)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {page.chartType === 'line_growth' && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>3-Year ARR & User Growth Trajectory</span>
            </h4>
            <div className="h-64 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={unitEconomics?.threeYearProjections || [
                  { year: 'Year 1', arrMillions: 0.8, revenueMillions: 0.6 },
                  { year: 'Year 2', arrMillions: 3.5, revenueMillions: 2.8 },
                  { year: 'Year 3', arrMillions: 11.2, revenueMillions: 9.4 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} unit="M" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="arrMillions" name="ARR ($M)" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="revenueMillions" name="Revenue ($M)" stroke="#6366f1" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {page.chartType === 'pie_sentiment' && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                User Review Sentiment Distribution
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Synthesized from {reviewSentiment?.sampleCount || 1000}+ verified G2 and Trustpilot customer reviews.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-white p-2 rounded border">
                  <span className="font-semibold text-emerald-700">Positive Sentiment:</span>
                  <span className="font-mono font-bold text-emerald-700">{reviewSentiment?.overallPositivePct || 68}%</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2 rounded border">
                  <span className="font-semibold text-rose-700">Negative / Dissatisfied:</span>
                  <span className="font-mono font-bold text-rose-700">{reviewSentiment?.overallNegativePct || 22}%</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2 rounded border">
                  <span className="font-semibold text-slate-600">Neutral:</span>
                  <span className="font-mono font-bold text-slate-600">{reviewSentiment?.neutralPct || 10}%</span>
                </div>
              </div>
            </div>

            <div className="h-52 w-full min-h-[200px]">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Positive', value: reviewSentiment?.overallPositivePct || 68 },
                      { name: 'Negative', value: reviewSentiment?.overallNegativePct || 22 },
                      { name: 'Neutral', value: reviewSentiment?.neutralPct || 10 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                    <Cell fill="#94a3b8" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Data Table Rendering */}
        {page.tableData && (
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    {page.tableData.headers.map((h, i) => (
                      <th key={i} className="py-3 px-4 uppercase tracking-wider text-[11px]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {page.tableData.rows.map((row, rIdx) => (
                    <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-3 px-4 font-medium text-slate-800">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SWOT Grid View for Page 11 */}
        {page.sectionCategory === 'SWOT Analysis' && swot.strengths && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 mb-2 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Strengths (Internal)</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-emerald-950">
                {swot.strengths.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800 mb-2 flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Weaknesses (Internal)</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-amber-950">
                {swot.weaknesses.map((w, i) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-800 mb-2 flex items-center space-x-1">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Opportunities (External)</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-indigo-950">
                {swot.opportunities.map((o, i) => (
                  <li key={i}>• {o}</li>
                ))}
              </ul>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-rose-800 mb-2 flex items-center space-x-1">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Threats (External)</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-rose-950">
                {swot.threats.map((t, i) => (
                  <li key={i}>• {t}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Porter's Five Forces View for Page 12 */}
        {page.sectionCategory === 'Porters Five Forces' && portersForces.buyerPower && (
          <div className="space-y-3 mb-6 bg-slate-50 border border-slate-200 rounded-xl p-5">
            <ForceBar name="Buyer Bargaining Power" force={portersForces.buyerPower} />
            <ForceBar name="Supplier Power" force={portersForces.supplierPower} />
            <ForceBar name="Threat of New Entrants" force={portersForces.threatOfNewEntrants} />
            <ForceBar name="Threat of Substitutes" force={portersForces.threatOfSubstitutes} />
            <ForceBar name="Competitive Rivalry" force={portersForces.competitiveRivalry} />
          </div>
        )}
      </div>

      {/* Footer Branding Bar */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-mono mt-8">
        <span>Autonomus Market Research Agent</span>
        <span>Gemini Powered</span>
        <span>Page {page.pageNumber}</span>
      </div>
    </div>
  );
};

const ForceBar: React.FC<{ name: string; force: { score: number; rationale: string } }> = ({
  name,
  force,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center text-xs font-semibold text-slate-800 mb-1">
        <span>{name}</span>
        <span className="font-mono font-bold text-indigo-700">{force.score} / 5</span>
      </div>
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-1">
        <div
          className={`h-full rounded-full ${
            force.score >= 4 ? 'bg-rose-500' : force.score === 3 ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${(force.score / 5) * 100}%` }}
        ></div>
      </div>
      <p className="text-[11px] text-slate-500">{force.rationale}</p>
    </div>
  );
};
