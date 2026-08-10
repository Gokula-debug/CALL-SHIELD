import React, { useState } from 'react';
import { Search, ShieldAlert, ShieldCheck, AlertTriangle, Plus, CheckCircle2 } from 'lucide-react';
import { SpamCheckResponse } from '../types';

interface QuickDetectorProps {
  onCheckNumber: (phoneNumber: string, callerName?: string) => Promise<SpamCheckResponse>;
  onAddToBlacklist: (phoneNumber: string, reason: string) => Promise<void>;
}

export const QuickDetector: React.FC<QuickDetectorProps> = ({
  onCheckNumber,
  onAddToBlacklist
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callerName, setCallerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SpamCheckResponse | null>(null);
  const [added, setAdded] = useState(false);

  const sampleNumbers = [
    { num: '+1-800-555-0199', label: 'IRS Scam' },
    { num: '+1-888-234-5678', label: 'Loan Spammer' },
    { num: '+1-415-555-0123', label: 'Known Safe' },
    { num: '+1-900-999-1234', label: 'Premium Trap' }
  ];

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phoneNumber.trim()) return;

    setLoading(true);
    setAdded(false);
    try {
      const res = await onCheckNumber(phoneNumber, callerName);
      setResult(res);
    } catch (err) {
      console.error('Check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPreset = (num: string) => {
    setPhoneNumber(num);
    setResult(null);
  };

  const handleBlacklistAction = async () => {
    if (!result) return;
    try {
      await onAddToBlacklist(result.phoneNumber, result.reasons.join(' | ') || 'Added from Quick Detector');
      setAdded(true);
    } catch (err) {
      console.error('Blacklist error:', err);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Live Spam Detector Engine</h3>
            <p className="text-xs text-slate-400">Instantly test any incoming phone number against the CallShield AI engine</p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="hidden sm:flex items-center space-x-1.5">
          <span className="text-xs text-slate-500 font-medium mr-1">Sample Presets:</span>
          {sampleNumbers.map((sample) => (
            <button
              key={sample.num}
              onClick={() => handleQuickPreset(sample.num)}
              className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md border border-slate-700/60 transition"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleAnalyze} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter Phone Number (e.g. +1-800-555-0199)..."
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500/80 focus:ring-1 focus:ring-sky-500/80"
          />
        </div>

        <div className="sm:col-span-4">
          <input
            type="text"
            value={callerName}
            onChange={(e) => setCallerName(e.target.value)}
            placeholder="Caller Identity / Name (Optional)"
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500/80 focus:ring-1 focus:ring-sky-500/80"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading || !phoneNumber.trim()}
            className="w-full h-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm rounded-xl transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Analyze</span>
            )}
          </button>
        </div>
      </form>

      {/* Result Display */}
      {result && (
        <div className="mt-5 p-4 bg-slate-950 border border-slate-800 rounded-xl animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-start space-x-3">
              <div className={`p-3 rounded-xl ${
                result.score >= 70 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                result.score >= 31 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {result.score >= 70 ? <ShieldAlert className="w-6 h-6" /> :
                 result.score >= 31 ? <AlertTriangle className="w-6 h-6" /> :
                 <ShieldCheck className="w-6 h-6" />}
              </div>

              <div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-white">{result.phoneNumber}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    result.riskLevel === 'SPAM' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    result.riskLevel === 'SUSPICIOUS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {result.riskLevel} ({result.score}/100)
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1">
                  Recommendation: <strong className="text-slate-200 uppercase">{result.recommendation}</strong>
                  {result.matchedBlacklist && <span className="ml-2 text-red-400 font-semibold">(On Blacklist)</span>}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {result.reasons.map((reason, idx) => (
                    <span key={idx} className="text-[11px] px-2 py-0.5 bg-slate-800/80 text-slate-300 rounded border border-slate-700/50">
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Blacklist action */}
            <div className="flex items-center space-x-2">
              {!result.matchedBlacklist && !added ? (
                <button
                  onClick={handleBlacklistAction}
                  className="px-3.5 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/30 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Blacklist</span>
                </button>
              ) : (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Blacklisted</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
