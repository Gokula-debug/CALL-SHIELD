import React, { useState } from 'react';
import { Slash, Plus, Trash2, Search, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { BlacklistItem } from '../types';

interface BlacklistViewProps {
  blacklist: BlacklistItem[];
  onAddNumber: (phoneNumber: string, reason: string) => Promise<void>;
  onDeleteNumber: (id: string) => Promise<void>;
}

export const BlacklistView: React.FC<BlacklistViewProps> = ({
  blacklist,
  onAddNumber,
  onDeleteNumber
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reason, setReason] = useState('Reported Telemarketing / Spam');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const commonReasons = [
    'Reported IRS / Govt Scam Robocall',
    'Aggressive Credit Card / Loan Officer',
    'Wangiri One-Ring Premium Scam',
    'Automated Insurance Pitch',
    'Spoofed Local Area Code Spammer'
  ];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setLoading(true);
    setSuccessMsg('');
    try {
      await onAddNumber(phoneNumber, reason);
      setPhoneNumber('');
      setSuccessMsg(`Successfully added ${phoneNumber} to blacklist.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error adding to blacklist:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBlacklist = blacklist.filter(item =>
    item.phoneNumber.includes(searchQuery) ||
    item.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Slash className="w-6 h-6 text-red-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">CallShield Blacklist Manager</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">Manage blocked phone numbers. Any incoming call matching this list is instantly rejected.</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
          <ShieldAlert className="w-5 h-5" />
          <span className="text-sm font-bold">{blacklist.length} Numbers Blocked</span>
        </div>
      </div>

      {/* Add Number Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center space-x-2">
          <Plus className="w-4 h-4 text-sky-400" />
          <span>Add New Number to Blacklist</span>
        </h2>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. +1-800-555-0199 or 8005550199"
              required
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500/80"
            />
          </div>

          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-slate-400 mb-1">Blocking Reason / Notes</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Select reason below or type custom reason..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500/80"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading || !phoneNumber.trim()}
              className="w-full py-2.5 bg-red-500 hover:bg-red-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg shadow-red-500/20"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add Number</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Reason Presets */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 font-medium mr-1">Quick Reasons:</span>
          {commonReasons.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              className="text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/60 transition"
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Blacklist Table / Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-base font-semibold text-white">Active Blacklist Directory</h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blacklisted numbers or reasons..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {filteredBlacklist.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
            <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">No Matching Blacklist Entries</p>
            <p className="text-xs text-slate-500 mt-1">Add a number above to start blocking spam</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-4">Phone Number</th>
                  <th className="pb-3 px-4">Reason / Category</th>
                  <th className="pb-3 px-4">Added On</th>
                  <th className="pb-3 px-4">Added By</th>
                  <th className="pb-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBlacklist.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-white font-bold text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        <span>{item.phoneNumber}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-300">
                      <span className="px-2 py-1 bg-red-500/10 text-red-300 border border-red-500/20 rounded-md">
                        {item.reason}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-400 font-mono">
                      {item.addedBy || 'User'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDeleteNumber(item.id)}
                        className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700/60 hover:border-red-500/30 rounded-lg transition"
                        title="Remove from Blacklist"
                      >
                        <Trash2 className="w-4 h-4" />
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
