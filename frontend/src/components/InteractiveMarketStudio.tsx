import React, { useState, useMemo } from 'react';
import { ResearchReport, Competitor } from '../types';
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
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  Sliders,
  TrendingUp,
  DollarSign,
  Users,
  ShieldAlert,
  Zap,
  Target,
  BarChart3,
  Sparkles,
  RefreshCw,
  Award,
  Layers,
  PieChart as PieIcon,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Info,
  HelpCircle,
} from 'lucide-react';

interface InteractiveMarketStudioProps {
  report: ResearchReport | null;
}

// Preset Scenario Templates
const SCENARIO_PRESETS = [
  {
    id: 'base',
    name: '🎯 Report Base Case',
    desc: 'Default research parameters synthesized by AI agent',
    arpu: 499,
    cac: 1800,
    monthlyChurn: 1.8,
    monthlyOpex: 25000,
    leadGrowthPct: 12,
    conversionRatePct: 4.5,
  },
  {
    id: 'hypergrowth',
    name: '🚀 Hypergrowth Enterprise',
    desc: 'High marketing spend, premium enterprise pricing',
    arpu: 1250,
    cac: 3500,
    monthlyChurn: 1.2,
    monthlyOpex: 75000,
    leadGrowthPct: 22,
    conversionRatePct: 6.0,
  },
  {
    id: 'plg',
    name: '⚡ Product-Led Growth (PLG)',
    desc: 'Low friction friction pricing, high viral conversion',
    arpu: 149,
    cac: 450,
    monthlyChurn: 2.5,
    monthlyOpex: 18000,
    leadGrowthPct: 35,
    conversionRatePct: 8.5,
  },
  {
    id: 'bootstrap',
    name: '🛡️ Conservative Bootstrapped',
    desc: 'Lean budget, steady organic word-of-mouth growth',
    arpu: 299,
    cac: 850,
    monthlyChurn: 1.5,
    monthlyOpex: 8000,
    leadGrowthPct: 8,
    conversionRatePct: 3.5,
  },
];

export const InteractiveMarketStudio: React.FC<InteractiveMarketStudioProps> = ({ report }) => {
  // Input Sliders State initialized from report or base case
  const [selectedScenario, setSelectedScenario] = useState<string>('base');
  const [arpu, setArpu] = useState<number>(499);
  const [cac, setCac] = useState<number>(1800);
  const [monthlyChurn, setMonthlyChurn] = useState<number>(1.8);
  const [monthlyOpex, setMonthlyOpex] = useState<number>(25000);
  const [leadGrowthPct, setLeadGrowthPct] = useState<number>(12);
  const [conversionRatePct, setConversionRatePct] = useState<number>(4.5);
  const [grossMarginPct, setGrossMarginPct] = useState<number>(report?.unitEconomics.grossMarginPct || 82);

  // Active Visualization Tab inside Studio
  const [activeStudioView, setActiveStudioView] = useState<'financial' | 'positioning' | 'forces' | 'sentiment'>('financial');

  // Interactive Competitor Scatter Selection
  const [selectedScatterNode, setSelectedScatterNode] = useState<any>(null);

  // Porter's Interactive Forces Sliders State
  const [forces, setForces] = useState({
    buyerPower: report?.portersForces.buyerPower?.score || 3,
    supplierPower: report?.portersForces.supplierPower?.score || 2,
    newEntrants: report?.portersForces.threatOfNewEntrants?.score || 4,
    substitutes: report?.portersForces.threatOfSubstitutes?.score || 2,
    rivalry: report?.portersForces.competitiveRivalry?.score || 4,
  });

  // Handle Preset Change
  const applyPreset = (presetId: string) => {
    const preset = SCENARIO_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSelectedScenario(presetId);
      setArpu(preset.arpu);
      setCac(preset.cac);
      setMonthlyChurn(preset.monthlyChurn);
      setMonthlyOpex(preset.monthlyOpex);
      setLeadGrowthPct(preset.leadGrowthPct);
      setConversionRatePct(preset.conversionRatePct);
    }
  };

  // Real-Time Dynamic Financial Calculations (36 Month Projections)
  const financialProjections = useMemo(() => {
    const months = [];
    let currentUsers = 40;
    let cumulativeNetProfit = -monthlyOpex * 2;
    let breakEvenMonth: number | null = null;

    for (let m = 1; m <= 36; m++) {
      // User acquisition logic
      const organicLeads = Math.round(200 * Math.pow(1 + leadGrowthPct / 100, (m - 1) / 3));
      const paidAcquisitions = Math.floor((monthlyOpex * 0.6) / Math.max(cac, 100));
      const newUsers = Math.round(organicLeads * (conversionRatePct / 100)) + paidAcquisitions;

      const churnedUsers = Math.round(currentUsers * (monthlyChurn / 100));
      currentUsers = Math.max(5, currentUsers + newUsers - churnedUsers);

      const mrr = currentUsers * arpu;
      const arr = mrr * 12;
      const grossProfit = mrr * (grossMarginPct / 100);
      const monthlyNetProfit = grossProfit - monthlyOpex;
      cumulativeNetProfit += monthlyNetProfit;

      if (monthlyNetProfit > 0 && breakEvenMonth === null) {
        breakEvenMonth = m;
      }

      // Sample key months for clean graph rendering
      if (m % 3 === 0 || m === 1) {
        months.push({
          month: `M${m}`,
          monthNum: m,
          users: currentUsers,
          mrr: Math.round(mrr / 1000), // in $k
          arr: Math.round(arr / 1000), // in $k
          revenueMillions: Number((arr / 1000000).toFixed(2)),
          monthlyNetProfit: Math.round(monthlyNetProfit / 1000),
          cumulativeProfitK: Math.round(cumulativeNetProfit / 1000),
          newCustomers: newUsers,
        });
      }
    }
    return { months, breakEvenMonth, finalARR: months[months.length - 1]?.arr || 0 };
  }, [arpu, cac, monthlyChurn, monthlyOpex, leadGrowthPct, conversionRatePct, grossMarginPct]);

  // Derived Key Metrics
  const annualChurnPct = useMemo(() => Number((100 * (1 - Math.pow(1 - monthlyChurn / 100, 12))).toFixed(1)), [monthlyChurn]);
  const avgCustomerLifespanMonths = useMemo(() => Number((100 / Math.max(monthlyChurn, 0.1)).toFixed(1)), [monthlyChurn]);
  const ltv = useMemo(() => {
    const annualArpu = arpu * 12;
    const ltvVal = (annualArpu * (grossMarginPct / 100)) / (annualChurnPct / 100 || 0.01);
    return Math.round(ltvVal);
  }, [arpu, grossMarginPct, annualChurnPct]);

  const ltvCacRatio = useMemo(() => Number((ltv / Math.max(cac, 1)).toFixed(1)), [ltv, cac]);
  const paybackMonths = useMemo(() => {
    const monthlyGrossMargin = arpu * (grossMarginPct / 100);
    return Number((cac / Math.max(monthlyGrossMargin, 1)).toFixed(1));
  }, [cac, arpu, grossMarginPct]);

  // Health Rating logic
  const healthStatus = useMemo(() => {
    if (ltvCacRatio >= 5 && paybackMonths <= 6) return { label: '🔥 Exceptional Unicorn Unit Economics', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    if (ltvCacRatio >= 3 && paybackMonths <= 12) return { label: '✅ Strong Healthy Venture Scale', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' };
    if (ltvCacRatio >= 1.5) return { label: '⚠️ Moderate Unit Margin - Optimize CAC', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    return { label: '🚨 High Unit Risk - CAC Exceeds Value', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
  }, [ltvCacRatio, paybackMonths]);

  // Prepare Competitors Data for Scatter Plot (Quadrant)
  const competitorScatterData = useMemo(() => {
    const baseCompetitors = report?.competitors || [
      { id: 'c1', name: 'Global Incumbent', g2Rating: 4.2, startingPrice: '$650', marketSharePct: 38, type: 'Incumbent', estimatedRevenue: '$65M' },
      { id: 'c2', name: 'Cloud Flow', g2Rating: 4.5, startingPrice: '$180', marketSharePct: 24, type: 'Direct', estimatedRevenue: '$22M' },
      { id: 'c3', name: 'Apex Suite', g2Rating: 4.6, startingPrice: '$99', marketSharePct: 14, type: 'Emerging', estimatedRevenue: '$8M' },
    ];

    const parsed = baseCompetitors.map((c) => {
      const priceNum = parseInt(c.startingPrice?.replace(/[^0-9]/g, '') || '200', 10);
      return {
        id: c.id,
        name: c.name,
        price: priceNum,
        g2Rating: c.g2Rating || 4.2,
        marketShare: c.marketSharePct || 20,
        type: c.type,
        revenue: c.estimatedRevenue,
        isStartup: false,
      };
    });

    // Add current startup positioning dynamically
    parsed.push({
      id: 'my-startup',
      name: `${report?.startupInput.title || 'My Startup'} (Your Position)`,
      price: arpu,
      g2Rating: 4.8, // Target Rating
      marketShare: 15,
      type: 'Direct',
      revenue: `$${(financialProjections.finalARR / 1000).toFixed(1)}M Projected`,
      isStartup: true,
    });

    return parsed;
  }, [report, arpu, financialProjections.finalARR]);

  // Porter's Forces Radar Array
  const forcesRadarData = [
    { force: 'Buyer Power', score: forces.buyerPower },
    { force: 'Supplier Power', score: forces.supplierPower },
    { force: 'New Entrants', score: forces.newEntrants },
    { force: 'Threat of Substitutes', score: forces.substitutes },
    { force: 'Competitive Rivalry', score: forces.rivalry },
  ];

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1 z-50">
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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20 mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>INTERACTIVE FINANCIAL & MARKET SIMULATOR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Market Modeling & Unit Economics Sandbox
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Dynamically adjust pricing, customer acquisition costs, churn rates, and growth levers to project 3-year MRR trajectories, payback velocity, and competitor positioning.
          </p>
        </div>

        {/* Live Unit Health Badge */}
        <div className={`p-4 rounded-xl border ${healthStatus.bg} shrink-0 text-center md:text-right space-y-1`}>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Unit Economics Status</span>
          <span className={`text-xs font-extrabold block ${healthStatus.color}`}>{healthStatus.label}</span>
          <div className="flex items-center justify-center md:justify-end space-x-3 text-xs font-mono pt-1 text-slate-300">
            <span>LTV:CAC <strong className="text-emerald-400">{ltvCacRatio}x</strong></span>
            <span>Payback <strong className="text-cyan-400">{paybackMonths}m</strong></span>
          </div>
        </div>
      </div>

      {/* Preset Scenario Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center space-x-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Quick Scenario Presets:
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SCENARIO_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedScenario === p.id
                  ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-xs text-white mb-0.5">{p.name}</div>
              <div className="text-[10px] text-slate-400 line-clamp-1">{p.desc}</div>
              <div className="mt-2 text-[10px] font-mono text-indigo-300 flex items-center justify-between">
                <span>ARPU: ${p.arpu}/mo</span>
                <span>CAC: ${p.cac}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid: Left Controls Panel + Right Interactive Visual Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Interactive Sliders Panel */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Interactive Model Levers</span>
            </h3>
            <button
              onClick={() => applyPreset('base')}
              className="text-[10px] text-slate-400 hover:text-indigo-400 flex items-center space-x-1 font-mono"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-5 text-xs">
            {/* Lever 1: ARPU */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <label className="text-slate-300">Target Monthly Price (ARPU)</label>
                <span className="font-mono font-extrabold text-emerald-400">${arpu} / mo</span>
              </div>
              <input
                type="range"
                min="29"
                max="2500"
                step="10"
                value={arpu}
                onChange={(e) => {
                  setArpu(Number(e.target.value));
                  setSelectedScenario('custom');
                }}
                className="w-full accent-indigo-500 bg-slate-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>$29</span>
                <span>$1,250</span>
                <span>$2,500</span>
              </div>
            </div>

            {/* Lever 2: CAC */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <label className="text-slate-300">Customer Acquisition Cost (CAC)</label>
                <span className="font-mono font-extrabold text-indigo-400">${cac}</span>
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                step="50"
                value={cac}
                onChange={(e) => {
                  setCac(Number(e.target.value));
                  setSelectedScenario('custom');
                }}
                className="w-full accent-indigo-500 bg-slate-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>$100</span>
                <span>$5,000</span>
                <span>$10,000</span>
              </div>
            </div>

            {/* Lever 3: Monthly Churn Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <label className="text-slate-300">Monthly User Churn Rate</label>
                <span className="font-mono font-extrabold text-rose-400">{monthlyChurn}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.1"
                value={monthlyChurn}
                onChange={(e) => {
                  setMonthlyChurn(Number(e.target.value));
                  setSelectedScenario('custom');
                }}
                className="w-full accent-rose-500 bg-slate-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.5% (Elite)</span>
                <span>5% (Avg)</span>
                <span>10% (High)</span>
              </div>
            </div>

            {/* Lever 4: Monthly OPEX & Marketing */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <label className="text-slate-300">Monthly Marketing & OPEX</label>
                <span className="font-mono font-extrabold text-cyan-400">${monthlyOpex.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="250000"
                step="5000"
                value={monthlyOpex}
                onChange={(e) => {
                  setMonthlyOpex(Number(e.target.value));
                  setSelectedScenario('custom');
                }}
                className="w-full accent-cyan-500 bg-slate-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>$5k</span>
                <span>$100k</span>
                <span>$250k</span>
              </div>
            </div>

            {/* Lever 5: Lead Growth % */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <label className="text-slate-300">Organic Lead Growth Rate</label>
                <span className="font-mono font-extrabold text-amber-400">+{leadGrowthPct}% / mo</span>
              </div>
              <input
                type="range"
                min="2"
                max="40"
                step="1"
                value={leadGrowthPct}
                onChange={(e) => {
                  setLeadGrowthPct(Number(e.target.value));
                  setSelectedScenario('custom');
                }}
                className="w-full accent-amber-500 bg-slate-950 rounded-lg cursor-pointer"
              />
            </div>

            {/* Lever 6: Gross Margin % */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <label className="text-slate-300">Gross Margin %</label>
                <span className="font-mono font-extrabold text-indigo-300">{grossMarginPct}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                step="1"
                value={grossMarginPct}
                onChange={(e) => {
                  setGrossMarginPct(Number(e.target.value));
                  setSelectedScenario('custom');
                }}
                className="w-full accent-indigo-400 bg-slate-950 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Metrics Summary Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Calculated Metrics</div>
            <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono">
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-[9px] text-slate-500 block">LTV per Customer</span>
                <span className="font-bold text-emerald-400 text-sm">${ltv.toLocaleString()}</span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-[9px] text-slate-500 block">Annual Churn</span>
                <span className="font-bold text-amber-400 text-sm">{annualChurnPct}%</span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-[9px] text-slate-500 block">Avg Lifespan</span>
                <span className="font-bold text-cyan-400 text-sm">{avgCustomerLifespanMonths} mos</span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-[9px] text-slate-500 block">Break-even</span>
                <span className="font-bold text-indigo-300 text-sm">
                  {financialProjections.breakEvenMonth ? `Month ${financialProjections.breakEvenMonth}` : '> 36 mos'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Dynamic Visualization Workspace (Tabs + Graphs) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Studio View Nav Tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex items-center space-x-1">
            <button
              onClick={() => setActiveStudioView('financial')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                activeStudioView === 'financial'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Financial Growth</span>
            </button>
            <button
              onClick={() => setActiveStudioView('positioning')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                activeStudioView === 'positioning'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Competitor Scatter Map</span>
            </button>
            <button
              onClick={() => setActiveStudioView('forces')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                activeStudioView === 'forces'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>5 Forces Strategy</span>
            </button>
          </div>

          {/* VIEW 1: FINANCIAL & REVENUE PROJECTION GRAPH */}
          {activeStudioView === 'financial' && (
            <div className="space-y-6">
              {/* Chart A: 3-Year ARR & Net Profit Trajectory */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>36-Month Projected ARR ($k) & Cumulative Cash Flow</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Simulated trajectory based on current parameter sliders
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Month 36 ARR: ${(financialProjections.finalARR / 1000).toFixed(2)}M
                  </span>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={financialProjections.months} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorArrStudio" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorProfitStudio" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Area
                        type="monotone"
                        dataKey="arr"
                        name="ARR ($k)"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorArrStudio)"
                      />
                      <Area
                        type="monotone"
                        dataKey="cumulativeProfitK"
                        name="Cum. Net Profit ($k)"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorProfitStudio)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart B: LTV vs CAC Payback Unit Comparison */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white">Unit Economics & Customer Lifetime Value Comparison</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">CAC (Acquisition)</span>
                    <span className="text-xl font-black text-indigo-400 font-mono">${cac}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">One-time expenditure</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Payback Speed</span>
                    <span className="text-xl font-black text-cyan-400 font-mono">{paybackMonths} Months</span>
                    <span className="text-[10px] text-slate-400 block mt-1">To recover acquisition CAC</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Net LTV</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">${ltv.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Total revenue value</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: COMPETITOR POSITIONING MATRIX (SCATTER / QUADRANT) */}
          {activeStudioView === 'positioning' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Target className="w-4 h-4 text-indigo-400" />
                    <span>Competitive Quadrant: Price Point vs Customer Rating (G2)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Click node to inspect competitor. Your startup is plotted dynamically based on ARPU lever.
                  </p>
                </div>
                <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Interactive Matrix
                </span>
              </div>

              <div className="h-80 w-full relative bg-slate-950/60 rounded-xl border border-slate-800 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      type="number"
                      dataKey="price"
                      name="Starting Price ($)"
                      unit="$"
                      stroke="#64748b"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="g2Rating"
                      name="G2 Rating (/5)"
                      domain={[3.5, 5]}
                      stroke="#64748b"
                      tick={{ fontSize: 11 }}
                    />
                    <ZAxis type="number" dataKey="marketShare" range={[100, 600]} name="Market Share %" />
                    <Tooltip content={<CustomTooltip />} />
                    <Scatter
                      name="Market Competitors"
                      data={competitorScatterData}
                      onClick={(node) => setSelectedScatterNode(node.payload)}
                    >
                      {competitorScatterData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isStartup ? '#10b981' : entry.type === 'Incumbent' ? '#6366f1' : '#f59e0b'}
                          stroke={entry.isStartup ? '#34d399' : '#1e293b'}
                          strokeWidth={entry.isStartup ? 3 : 1}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* Node Inspector Card */}
              {selectedScatterNode && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      Selected Competitor Node
                    </span>
                    <h4 className="font-bold text-white text-sm">{selectedScatterNode.name}</h4>
                    <p className="text-slate-400 text-[11px]">
                      Price: <strong className="text-emerald-400 font-mono">${selectedScatterNode.price}</strong> | G2 Rating: <strong className="text-amber-400 font-mono">{selectedScatterNode.g2Rating}/5</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 text-[10px] block">Est. Revenue / Scale</span>
                    <span className="text-indigo-300 font-bold font-mono">{selectedScatterNode.revenue}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: PORTER'S 5 FORCES STRATEGY SANDBOX */}
          {activeStudioView === 'forces' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Porter's Five Forces Interactive Threat Matrix</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Adjust force intensity sliders (1 to 5) to receive real-time strategic countermeasure recommendations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Interactive Force Sliders */}
                <div className="space-y-3 text-xs">
                  {Object.entries(forces).map(([key, val]) => (
                    <div key={key} className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex justify-between font-semibold text-slate-200">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-mono text-amber-400 font-bold">{val} / 5</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={val}
                        onChange={(e) => setForces({ ...forces, [key]: Number(e.target.value) })}
                        className="w-full accent-amber-500 bg-slate-900 rounded cursor-pointer"
                      />
                    </div>
                  ))}
                </div>

                {/* Radar Display */}
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={forcesRadarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="force" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#475569" tick={{ fontSize: 8 }} />
                      <Radar name="Threat Score" dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dynamic AI Recommendation Box */}
              <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl text-xs space-y-1">
                <span className="font-bold text-indigo-300 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AI Strategic Countermeasure:</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {forces.rivalry >= 4
                    ? 'High Competitive Rivalry detected: Pivot toward niche vertical specialization and lock in annual prepay contracts with bundled compliance guarantees.'
                    : forces.newEntrants >= 4
                    ? 'High Entrant Threat: Build proprietary data network effects and deep API integration hooks to raise customer switching costs.'
                    : 'Balanced Competitive Environment: Focus on rapid customer acquisition and transparent flat-rate pricing to capitalize on incumbent friction.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
