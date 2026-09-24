import React, { useState } from 'react';
import { ResearchReport } from '../types';
import { ReportPage } from './ReportPage';
import { ReportAnalyticsGraphs } from './ReportAnalyticsGraphs';
import { exportReportToPDF } from '../utils/pdfExport';
import { ensure20ReportPages } from '../utils/reportHelper';
import {
  Download,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search,
  Bot,
  MessageSquare,
  Sparkles,
  CheckCircle,
  FileSpreadsheet,
  Share2,
  Printer,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface ReportViewerProps {
  report: ResearchReport;
  onAskAI?: (question: string) => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ report }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');
  const [exportError, setExportError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswers, setAiAnswers] = useState<{ q: string; a: string }[]>([]);

  const handleExportPDF = async () => {
    setExportError(null);
    setIsExportingPDF(true);
    const safeTitle = (report.startupInput.title || 'Market_Research').replace(/[^a-z0-9]/gi, '_');
    const fileName = `${safeTitle}_20Page_Dossier.pdf`;

    // 1. If backend server PDF exists, verify non-empty blob and download directly
    if (report.pdfDownloadUrl) {
      try {
        setPdfProgress('Fetching server PDF report...');
        const res = await fetch(report.pdfDownloadUrl);
        if (res.ok) {
          const blob = await res.blob();
          if (blob.size > 1000) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }, 1000);
            setIsExportingPDF(false);
            setPdfProgress('');
            return;
          }
        }
      } catch (e) {
        console.warn('Server PDF download check failed, using client PDF generator:', e);
      }
    }

    // 2. Client-side PDF generation with inlined computed styles
    try {
      await exportReportToPDF('full-20-page-report-container', fileName, (status) => {
        setPdfProgress(status);
      });
    } catch (err: any) {
      console.error('PDF Export failed:', err);
      setExportError(
        err?.message || 'Failed to auto-generate PDF. Click "Print Report" to save as PDF via system dialog.'
      );
    } finally {
      setIsExportingPDF(false);
      setPdfProgress('');
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleAskFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    const q = aiQuestion;
    setAiQuestion('');

    // Generate response based on current report context
    let answer = `Based on the autonomous research conducted for "${report.startupInput.title}":\n`;
    if (q.toLowerCase().includes('competitor') || q.toLowerCase().includes('price')) {
      answer += `Competitors analyzed (${report.competitors.map((c) => c.name).join(', ')}) average a starting price of ${report.competitors[0]?.startingPrice || '$600/mo'}. The main customer complaint is unexpected volume tier price hikes.`;
    } else if (q.toLowerCase().includes('tam') || q.toLowerCase().includes('market')) {
      answer += `The Total Addressable Market (TAM) is $${report.marketSizing.tamValueBillions}B growing at a CAGR of ${report.marketSizing.cagrPercentage}% per year. Our target SOM for Year 1 is $${report.marketSizing.somValueMillions}M.`;
    } else if (q.toLowerCase().includes('swot') || q.toLowerCase().includes('moat')) {
      answer += `Key moat: ${report.swot.strengths?.[0] || 'Proprietary AI engine'}. Primary external risk: ${report.swot.threats?.[0] || 'Incumbent reaction'}.`;
    } else {
      answer += `The research report evaluates an opportunity score of ${report.opportunityScore}/100. Target ARPU is ${report.unitEconomics.targetARPU} with a CAC payback of ${report.unitEconomics.paybackPeriodMonths} months.`;
    }

    setAiAnswers((prev) => [...prev, { q, a: answer }]);
  };

  const all20Pages = ensure20ReportPages(report);

  const filteredPages = all20Pages.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.subheading.toLowerCase().includes(q) ||
      p.paragraphs.some((para) => para.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Controls Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-20 z-30 backdrop-blur-md bg-slate-900/95">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
              20-PAGE REPORT COMPLETE
            </span>
            <span className="text-xs text-slate-400">
              Score: <strong className="text-emerald-400 font-mono">{report.opportunityScore}/100</strong>
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1 line-clamp-1">
            {report.startupInput.title}
          </h2>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search in report..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>

          {/* System Print Button */}
          <button
            onClick={handlePrintReport}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors flex items-center space-x-1.5 border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Export Error Alert Banner */}
      {exportError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{exportError}</span>
          </div>
          <button
            onClick={handlePrintReport}
            className="ml-4 px-3 py-1 rounded bg-rose-600 text-white font-bold hover:bg-rose-500 transition-colors"
          >
            Use System Print
          </button>
        </div>
      )}

      {/* Main Grid: Left TOC Drawer + Right Document Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Table of Contents */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sticky top-44">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Table of Contents (20 Pages)</span>
            </h3>

            <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
              {all20Pages.map((p) => (
                <button
                  key={p.pageNumber}
                  onClick={() => {
                    setCurrentPage(p.pageNumber);
                    const el = document.getElementById(`report-page-${p.pageNumber}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                    currentPage === p.pageNumber
                      ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="truncate pr-2">
                    {p.pageNumber}. {p.sectionCategory}
                  </span>
                  <span className="text-[10px] font-mono opacity-60">P.{p.pageNumber}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Follow-up Assistant */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-2">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Ask Agent Follow-up</span>
            </h3>
            <p className="text-[11px] text-slate-400 mb-3">
              Ask any question regarding pricing, TAM calculation, or competitor weaknesses.
            </p>

            <form onSubmit={handleAskFollowUp} className="space-y-2">
              <input
                type="text"
                placeholder="e.g. Why is CAC estimated at $3.8k?"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
              >
                Ask Agent
              </button>
            </form>

            {aiAnswers.length > 0 && (
              <div className="mt-4 space-y-3 max-h-48 overflow-y-auto pt-2 border-t border-slate-800">
                {aiAnswers.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                    <p className="font-bold text-indigo-300 mb-1">Q: {item.q}</p>
                    <p className="text-slate-300 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 20-Page Document Rendering Container */}
        <div className="lg:col-span-3 space-y-8">
          <div id="full-20-page-report-container" className="space-y-8">
            {filteredPages.map((page) => (
              <ReportPage
                key={page.pageNumber}
                page={page}
                competitors={report.competitors}
                marketSizing={report.marketSizing}
                swot={report.swot}
                portersForces={report.portersForces}
                unitEconomics={report.unitEconomics}
                reviewSentiment={report.reviewSentiment}
              />
            ))}
          </div>

          {/* Related Info Visual Analytics Dashboard under the generated PDF */}
          <ReportAnalyticsGraphs report={report} />
        </div>
      </div>
    </div>
  );
};
