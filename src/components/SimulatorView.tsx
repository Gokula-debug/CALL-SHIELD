import React, { useState } from 'react';
import { Phone, PhoneCall, PhoneOff, ShieldAlert, ShieldCheck, AlertTriangle, RefreshCw, Volume2 } from 'lucide-react';
import { SpamCheckResponse } from '../types';

interface SimulatorViewProps {
  onCheckNumber: (phoneNumber: string, callerName?: string) => Promise<SpamCheckResponse>;
  onLogCall: (logData: any) => Promise<void>;
  onRefreshStats: () => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  onCheckNumber,
  onLogCall,
  onRefreshStats
}) => {
  const [phoneNumber, setPhoneNumber] = useState('+1-800-555-0199');
  const [callerName, setCallerName] = useState('IRS Tax Penalty Agent');
  const [isRinging, setIsRinging] = useState(false);
  const [callState, setCallState] = useState<'IDLE' | 'CHECKING' | 'REJECTED' | 'ACCEPTED'>('IDLE');
  const [lastResult, setLastResult] = useState<SpamCheckResponse | null>(null);

  const presetCalls = [
    { num: '+1-800-555-0199', name: 'IRS Debt Collection Scam', type: 'High Risk' },
    { num: '+1-888-234-5678', name: 'Fast Loan Telemarketing', type: 'Spam' },
    { num: '+1-415-555-0123', name: 'Sarah Jenkins (Contact)', type: 'Safe' },
    { num: '+1-900-999-1234', name: 'Wangiri Premium Trap', type: 'High Risk' }
  ];

  const triggerCallSimulation = async () => {
    if (!phoneNumber.trim()) return;

    setIsRinging(true);
    setCallState('CHECKING');
    setLastResult(null);

    try {
      // Simulate 1.5s network delay of incoming phone call
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Call backend REST API /api/calls/check
      const res = await onCheckNumber(phoneNumber, callerName);
      setLastResult(res);

      if (res.spam || res.recommendation === 'REJECT') {
        setCallState('REJECTED');
        await onLogCall({
          phoneNumber,
          callerName,
          spamScore: res.score,
          status: 'BLOCKED',
          source: 'WEB_SIMULATOR',
          reasons: res.reasons
        });
      } else {
        setCallState('ACCEPTED');
        await onLogCall({
          phoneNumber,
          callerName,
          spamScore: res.score,
          status: res.score >= 31 ? 'SUSPICIOUS' : 'SAFE',
          source: 'WEB_SIMULATOR',
          reasons: res.reasons
        });
      }

      onRefreshStats();
    } catch (err) {
      console.error('Simulation error:', err);
      setCallState('IDLE');
    } finally {
      setIsRinging(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <PhoneCall className="w-6 h-6 text-sky-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Android Call Interceptor Simulator</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">Test real-time phone call ringing events and watch the CallShield auto-reject service in action.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Control Panel */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h2 className="text-base font-semibold text-white">Configure Incoming Call Event</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Incoming Caller Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1-800-555-0199"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Caller Name / CNAM Identity</label>
              <input
                type="text"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                placeholder="IRS Tax Penalty Agent"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Select Test Number Preset</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presetCalls.map((preset) => (
                  <button
                    key={preset.num}
                    onClick={() => {
                      setPhoneNumber(preset.num);
                      setCallerName(preset.name);
                      setCallState('IDLE');
                    }}
                    className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white group-hover:text-sky-400">{preset.num}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        preset.type === 'High Risk' ? 'bg-red-500/20 text-red-400' :
                        preset.type === 'Spam' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {preset.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 truncate">{preset.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={triggerCallSimulation}
              disabled={isRinging || !phoneNumber.trim()}
              className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm uppercase tracking-wider rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/20 disabled:opacity-50"
            >
              {isRinging ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Intercepting Phone Call...</span>
                </>
              ) : (
                <>
                  <PhoneCall className="w-5 h-5 animate-bounce" />
                  <span>Simulate Incoming Call</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* Right Phone Mockup Canvas */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-sm bg-slate-950 border-4 border-slate-800 rounded-[40px] p-6 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col justify-between">
            
            {/* Phone Top Speaker Notch */}
            <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-6 flex items-center justify-center">
              <div className="w-8 h-1 bg-slate-600 rounded-full" />
            </div>

            {/* Screen Content */}
            <div className="text-center my-auto space-y-6">
              
              {/* Ringing Animation or Result Icon */}
              <div className="relative inline-block">
                {isRinging ? (
                  <div className="relative p-6 bg-sky-500/20 text-sky-400 rounded-full border border-sky-500/40 animate-pulse">
                    <Volume2 className="w-12 h-12 animate-ping" />
                  </div>
                ) : callState === 'REJECTED' ? (
                  <div className="p-6 bg-red-500/20 text-red-400 rounded-full border border-red-500/40">
                    <PhoneOff className="w-12 h-12" />
                  </div>
                ) : callState === 'ACCEPTED' ? (
                  <div className="p-6 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/40">
                    <ShieldCheck className="w-12 h-12" />
                  </div>
                ) : (
                  <div className="p-6 bg-slate-900 text-slate-600 rounded-full border border-slate-800">
                    <Phone className="w-12 h-12" />
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-white font-mono">{phoneNumber}</h3>
                <p className="text-sm text-slate-400 mt-1">{callerName || 'Incoming Caller'}</p>
              </div>

              {/* Status Banner */}
              {callState === 'CHECKING' && (
                <div className="px-4 py-2 bg-sky-500/20 text-sky-400 rounded-xl text-xs font-semibold animate-pulse border border-sky-500/30">
                  CallShield Intercepting Telephony State...
                </div>
              )}

              {callState === 'REJECTED' && lastResult && (
                <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-left space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-red-400 uppercase tracking-wider flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4" />
                      CALL AUTO-REJECTED
                    </span>
                    <span className="text-xs font-bold text-red-300">{lastResult.score}/100</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Action: Rejection signal sent to Android Telephony Manager.
                  </p>
                  <div className="text-[11px] text-red-300/80 font-mono">
                    Reasons: {lastResult.reasons.join(', ')}
                  </div>
                </div>
              )}

              {callState === 'ACCEPTED' && lastResult && (
                <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-left space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      SAFE CALL ALLOWED
                    </span>
                    <span className="text-xs font-bold text-emerald-300">{lastResult.score}/100</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Passed CallShield security verification. Ringer allowed to proceed.
                  </p>
                </div>
              )}

            </div>

            {/* Phone Bottom Pill */}
            <div className="w-28 h-1 bg-slate-700 rounded-full mx-auto mt-6" />

          </div>
        </div>

      </div>

    </div>
  );
};
