import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Download, Sliders, Shield, Cpu, Bell, CheckCircle2 } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  onExportLogs: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onExportLogs
}) => {
  const [form, setForm] = useState<AppSettings>({ ...settings });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast(false);
    try {
      await onSaveSettings(form);
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-6 h-6 text-sky-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">CallShield System Settings</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">Configure spam detection rules, auto-rejection thresholds, and telemetry options.</p>
        </div>

        {toast && (
          <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Core Blocking & Sensitivity */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Shield className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-semibold text-white">Blocking Rules & Sensitivity</h2>
          </div>

          {/* Auto Reject Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div>
              <h3 className="text-sm font-semibold text-white">Enable Auto Reject</h3>
              <p className="text-xs text-slate-400 mt-0.5">Automatically end calls that exceed the configured spam threshold score.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.autoReject}
                onChange={(e) => setForm({ ...form, autoReject: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
            </label>
          </div>

          {/* Spam Sensitivity Slider */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Spam Sensitivity Threshold</h3>
                <p className="text-xs text-slate-400">Score at or above which a call is classified as SPAM ({form.spamThreshold}/100)</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                form.spamThreshold <= 40 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                form.spamThreshold <= 70 ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {form.spamThreshold <= 40 ? 'Strict (Aggressive Block)' : form.spamThreshold <= 70 ? 'Balanced (Recommended)' : 'Permissive (High Risk Only)'}
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="95"
              step="5"
              value={form.spamThreshold}
              onChange={(e) => setForm({ ...form, spamThreshold: Number(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />

            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>10 (Aggressive)</span>
              <span>50 (Balanced)</span>
              <span>95 (Permissive)</span>
            </div>
          </div>
        </div>

        {/* AI & Telemetry Settings */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Cpu className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-semibold text-white">AI Pattern Intelligence & Synchronization</h2>
          </div>

          {/* Gemini AI Integration Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-white">Gemini AI Deep Pattern Analysis</h3>
                <span className="text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 px-1.5 py-0.2 rounded-full">AI Powered</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Use server-side Gemini intelligence to evaluate caller identity patterns.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.aiDetectionEnabled}
                onChange={(e) => setForm({ ...form, aiDetectionEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
            </label>
          </div>

          {/* Sync Frequency */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Android App Sync Interval</h3>
              <span className="text-xs font-mono text-sky-400">{form.syncInterval} minutes</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={form.syncInterval}
              onChange={(e) => setForm({ ...form, syncInterval: Number(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>

        {/* Data & Export Tools */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white">Backup & Telemetry Export</h3>
            <p className="text-xs text-slate-400 mt-1">Download complete CallShield system logs for security auditing.</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onExportLogs}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs uppercase tracking-wider rounded-xl border border-slate-700 transition flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export System Logs</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-sky-500/20 flex items-center space-x-2"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
