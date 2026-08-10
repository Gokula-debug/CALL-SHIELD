import React, { useState } from 'react';
import { 
  Phone, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  Search, 
  TrendingUp,
  BarChart2,
  PieChart as PieChartIcon
} from 'lucide-react';
import { StatsResponse, CallLog, SpamCheckResponse } from '../types';
import { QuickDetector } from './QuickDetector';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface DashboardViewProps {
  stats: StatsResponse | null;
  callLogs: CallLog[];
  onCheckNumber: (phoneNumber: string, callerName?: string) => Promise<SpamCheckResponse>;
  onAddToBlacklist: (phoneNumber: string, reason: string) => Promise<void>;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  callLogs,
  onCheckNumber,
  onAddToBlacklist,
  onNavigateTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const recentBlockedCalls = callLogs
    .filter(log => log.status === 'BLOCKED' || log.spamScore >= 70)
    .filter(log => 
      log.phoneNumber.includes(searchQuery) || 
      (log.callerName && log.callerName.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .slice(0, 7);

  const pieColors = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CallShield Protection Overview</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time spam call telemetry, block stats, and phone risk intelligence.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab('simulator')}
            className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-sky-500/20 flex items-center space-x-2"
          >
            <Phone className="w-4 h-4" />
            <span>Launch Incoming Call Simulator</span>
          </button>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Calls */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Calls Monitored</span>
            <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
              <Phone className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">{stats?.totalCalls || 0}</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-sky-400 mr-1" />
            <span>Active monitoring across all connected endpoints</span>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Safe Calls */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Safe Calls</span>
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-emerald-400">{stats?.safeCalls || 0}</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-400/80">
            <span>{stats?.totalCalls ? Math.round(((stats?.safeCalls || 0) / stats.totalCalls) * 100) : 100}% Verified Clean</span>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Spam Calls */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Spam / Fraud Detected</span>
            <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-red-400">{stats?.spamCalls || 0}</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-red-400/80">
            <span>Avg Spam Score: {stats?.avgSpamScore || 0}/100</span>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Calls Blocked Today */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Blocked Today</span>
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-amber-400">{stats?.blockedToday || 0}</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-amber-400 mr-1" />
            <span>Auto-rejected by Shield Rules</span>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

      </div>

      {/* Live Spam Detector Engine Widget */}
      <QuickDetector onCheckNumber={onCheckNumber} onAddToBlacklist={onAddToBlacklist} />

      {/* Charts Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hourly Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-sky-400" />
              <h3 className="text-base font-semibold text-white">Call Traffic Telemetry (Hourly)</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Safe vs Spam Breakdown</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.hourlyDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="safe" name="Safe Calls" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spam" name="Spam Calls" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Ranges Pie Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <PieChartIcon className="w-5 h-5 text-sky-400" />
              <h3 className="text-base font-semibold text-white">Spam Risk Distribution</h3>
            </div>

            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.scoreRanges || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {(stats?.scoreRanges || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            {(stats?.scoreRanges || []).map((range, idx) => (
              <div key={range.range} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pieColors[idx % pieColors.length] }} />
                  <span className="text-slate-300">{range.range}</span>
                </div>
                <span className="font-bold text-white">{range.count} calls</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Blocked Calls Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-semibold text-white">Recent Blocked Activity Log</h3>
            <p className="text-xs text-slate-400">Calls automatically rejected or flagged by the CallShield engine</p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search number or name..."
                className="pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold transition"
            >
              View Full History →
            </button>
          </div>
        </div>

        {recentBlockedCalls.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
            <ShieldCheck className="w-10 h-10 text-emerald-500/50 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">No Blocked Calls Found</p>
            <p className="text-xs text-slate-500 mt-1">All incoming calls are within safe parameters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-4">Caller / Number</th>
                  <th className="pb-3 px-4">Time</th>
                  <th className="pb-3 px-4">Spam Score</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Source</th>
                  <th className="pb-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentBlockedCalls.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-mono text-white font-semibold">{log.phoneNumber}</span>
                        <p className="text-xs text-slate-400">{log.callerName || 'Unknown Identity'}</p>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              log.spamScore >= 70 ? 'bg-red-500' :
                              log.spamScore >= 31 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${log.spamScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-300">{log.spamScore}/100</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        log.status === 'BLOCKED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        log.status === 'SUSPICIOUS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {log.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-400">
                      <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                        {log.source}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onAddToBlacklist(log.phoneNumber, log.reasons?.join(', ') || 'Blocked from Recent Activity')}
                        className="text-xs px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition"
                      >
                        Blacklist
                      </button>
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
