import React, { useState } from 'react';
import { FileText, Download, Search, Filter, ShieldAlert, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import { CallLog } from '../types';

interface ReportsViewProps {
  callLogs: CallLog[];
  onRefresh: () => void;
  onClearLogs: () => Promise<void>;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  callLogs,
  onRefresh,
  onClearLogs
}) => {
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'BLOCKED' | 'SAFE' | 'SUSPICIOUS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logs according to time & status
  const filteredLogs = callLogs.filter(log => {
    const logDate = new Date(log.timestamp);
    const now = new Date();

    // Time filter
    if (timeFilter === 'TODAY') {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      if (logDate < startOfToday) return false;
    } else if (timeFilter === 'WEEK') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (logDate < oneWeekAgo) return false;
    } else if (timeFilter === 'MONTH') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      if (logDate < oneMonthAgo) return false;
    }

    // Status filter
    if (statusFilter !== 'ALL' && log.status !== statusFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const numMatch = log.phoneNumber.toLowerCase().includes(query);
      const nameMatch = log.callerName?.toLowerCase().includes(query);
      if (!numMatch && !nameMatch) return false;
    }

    return true;
  });

  // Export CSV generator
  const exportCSV = () => {
    const headers = ['ID', 'Phone Number', 'Caller Name', 'Timestamp', 'Spam Score', 'Status', 'Source', 'Reasons'];
    const rows = filteredLogs.map(log => [
      log.id,
      `"${log.phoneNumber}"`,
      `"${log.callerName || ''}"`,
      `"${log.timestamp}"`,
      log.spamScore,
      log.status,
      log.source,
      `"${(log.reasons || []).join('; ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CallShield_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON generator
  const exportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredLogs, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `CallShield_Report_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-sky-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">CallShield Call Reports</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">Audit trail, spam analytics, and downloadable call history logs.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
            title="Refresh Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-sky-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={exportJSON}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Time Range Tabs */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['ALL', 'TODAY', 'WEEK', 'MONTH'] as const).map((time) => (
              <button
                key={time}
                onClick={() => setTimeFilter(time)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  timeFilter === time
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {time === 'ALL' ? 'All Time' : time === 'TODAY' ? 'Today' : time === 'WEEK' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['ALL', 'BLOCKED', 'SAFE', 'SUSPICIOUS'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  statusFilter === st
                    ? 'bg-slate-800 text-sky-400 border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by caller number or name..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-400">
            Showing {filteredLogs.length} call record(s)
          </span>

          <button
            onClick={onClearLogs}
            className="text-xs text-red-400 hover:text-red-300 font-semibold"
          >
            Clear All History
          </button>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
            <Filter className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">No Call Records Found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or time range</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-4">Date & Time</th>
                  <th className="pb-3 px-4">Caller Number</th>
                  <th className="pb-3 px-4">Identity</th>
                  <th className="pb-3 px-4">Spam Score</th>
                  <th className="pb-3 px-4">Action Taken</th>
                  <th className="pb-3 px-4">Source</th>
                  <th className="pb-3 px-4">Detection Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-xs text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>

                    <td className="py-3 px-4 font-mono text-white font-semibold text-sm">
                      {log.phoneNumber}
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-300">
                      {log.callerName || 'Unknown'}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-bold ${
                          log.spamScore >= 70 ? 'text-red-400' :
                          log.spamScore >= 31 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {log.spamScore}/100
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        log.status === 'BLOCKED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        log.status === 'SUSPICIOUS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {log.status === 'BLOCKED' ? 'Auto Rejected' : log.status === 'SUSPICIOUS' ? 'Flagged Warning' : 'Allowed Through'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-xs">
                      <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-300">
                        {log.source}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-400 max-w-xs truncate">
                      {(log.reasons || []).join(' | ') || 'Standard Inspection'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
