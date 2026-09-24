import React from 'react';
import { ResearchReport } from '../types';
import {
  Bookmark,
  Trash2,
  ExternalLink,
  Calendar,
  Sparkles,
  BarChart2,
  Check,
} from 'lucide-react';

interface SavedReportsModalProps {
  reports: ResearchReport[];
  onSelectReport: (report: ResearchReport) => void;
  onDeleteReport: (reportId: string) => void;
}

export const SavedReportsModal: React.FC<SavedReportsModalProps> = ({
  reports,
  onSelectReport,
  onDeleteReport,
}) => {
  if (reports.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="p-4 rounded-full bg-slate-900 text-slate-500 inline-block mb-4 border border-slate-800">
          <Bookmark className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-200">No Saved Research Reports</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          When you analyze startup ideas, your completed 20-page research reports will appear here for instant reference.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Bookmark className="w-5 h-5 text-indigo-400" />
            <span>Saved Research Library</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {reports.length} Market Research Dossiers stored locally
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r) => (
          <div
            key={r.id}
            className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 transition-all flex flex-col justify-between shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SCORE: {r.opportunityScore} / 100
                </span>
                <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                </span>
              </div>

              <h3 className="font-bold text-white text-base mb-2">{r.startupInput.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                {r.executiveSummary}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => onSelectReport(r)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center space-x-2 transition-all"
              >
                <span>View 20-Page Report</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onDeleteReport(r.id)}
                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Delete Report"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
