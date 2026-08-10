import React, { useState } from 'react';
import { Terminal, Send, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

export const ApiConsole: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<'check' | 'logCall' | 'getCalls' | 'getBlacklist' | 'addBlacklist' | 'getStats' | 'getSettings'>('check');
  const [phoneNumber, setPhoneNumber] = useState('+1-800-555-0199');
  const [callerName, setCallerName] = useState('IRS Debt Scam');
  const [reason, setReason] = useState('Reported Robocall');
  const [loading, setLoading] = useState(false);
  const [responseJson, setResponseJson] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const endpoints = [
    { id: 'check', name: 'POST /api/calls/check', method: 'POST', desc: 'Checks if a phone number is spam and returns risk score.' },
    { id: 'logCall', name: 'POST /api/calls/log', method: 'POST', desc: 'Logs a call record into the database.' },
    { id: 'getCalls', name: 'GET /api/calls', method: 'GET', desc: 'Fetches all call log history.' },
    { id: 'getBlacklist', name: 'GET /api/blacklist', method: 'GET', desc: 'Fetches active blacklisted numbers.' },
    { id: 'addBlacklist', name: 'POST /api/blacklist', method: 'POST', desc: 'Adds a phone number to the blacklist.' },
    { id: 'getStats', name: 'GET /api/stats', method: 'GET', desc: 'Returns system-wide dashboard statistics.' },
    { id: 'getSettings', name: 'GET /api/settings', method: 'GET', desc: 'Fetches current system configuration.' },
  ];

  const handleExecute = async () => {
    setLoading(true);
    setResponseJson(null);
    setResponseStatus(null);

    try {
      let url = '/api/calls/check';
      let method = 'GET';
      let body: any = null;

      if (selectedEndpoint === 'check') {
        url = '/api/calls/check';
        method = 'POST';
        body = { phoneNumber, callerName };
      } else if (selectedEndpoint === 'logCall') {
        url = '/api/calls/log';
        method = 'POST';
        body = { phoneNumber, callerName, spamScore: 95, status: 'BLOCKED', source: 'API_INSPECTOR', reasons: ['API Test Trigger'] };
      } else if (selectedEndpoint === 'getCalls') {
        url = '/api/calls';
        method = 'GET';
      } else if (selectedEndpoint === 'getBlacklist') {
        url = '/api/blacklist';
        method = 'GET';
      } else if (selectedEndpoint === 'addBlacklist') {
        url = '/api/blacklist';
        method = 'POST';
        body = { phoneNumber, reason, addedBy: 'API Console' };
      } else if (selectedEndpoint === 'getStats') {
        url = '/api/stats';
        method = 'GET';
      } else if (selectedEndpoint === 'getSettings') {
        url = '/api/settings';
        method = 'GET';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {})
      });

      setResponseStatus(res.status);
      const data = await res.json();
      setResponseJson(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResponseStatus(500);
      setResponseJson(JSON.stringify({ error: err.message || 'API Request Failed' }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    if (responseJson) {
      navigator.clipboard.writeText(responseJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Terminal className="w-6 h-6 text-sky-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Interactive REST API Console</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">Test CallShield backend endpoints live in your browser and inspect response payloads.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Endpoint Selector Sidebar */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 block mb-2">Available Endpoints</span>
          
          {endpoints.map((ep) => (
            <button
              key={ep.id}
              onClick={() => {
                setSelectedEndpoint(ep.id as any);
                setResponseJson(null);
              }}
              className={`w-full text-left p-3 rounded-xl transition flex flex-col space-y-1 ${
                selectedEndpoint === ep.id
                  ? 'bg-sky-500/20 border border-sky-500/40 text-white'
                  : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800/80'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                  ep.method === 'POST' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {ep.method}
                </span>
                <span className="text-xs font-bold font-mono">{ep.name.split(' ')[1]}</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">{ep.desc}</p>
            </button>
          ))}
        </div>

        {/* Playground Execution Panel */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-sm font-bold text-white font-mono">
              {endpoints.find(e => e.id === selectedEndpoint)?.name}
            </span>

            <button
              onClick={handleExecute}
              disabled={loading}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-sky-500/20 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Request</span>
                </>
              )}
            </button>
          </div>

          {/* Request Payload Builder for POST requests */}
          {(selectedEndpoint === 'check' || selectedEndpoint === 'addBlacklist' || selectedEndpoint === 'logCall') && (
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400">Request Body Parameters</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">phoneNumber</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono"
                  />
                </div>

                {selectedEndpoint === 'check' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">callerName</label>
                    <input
                      type="text"
                      value={callerName}
                      onChange={(e) => setCallerName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                )}

                {selectedEndpoint === 'addBlacklist' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">reason</label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Response Output Viewer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-400">Response Payload</span>
                {responseStatus && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    responseStatus >= 200 && responseStatus < 300 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    HTTP {responseStatus}
                  </span>
                )}
              </div>

              {responseJson && (
                <button
                  onClick={copyResponse}
                  className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 overflow-x-auto min-h-[220px]">
              {responseJson ? (
                <pre>{responseJson}</pre>
              ) : (
                <span className="text-slate-600 italic">Click "Execute Request" above to test the API endpoint...</span>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
