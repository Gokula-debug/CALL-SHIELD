import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { BlacklistView } from './components/BlacklistView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { SimulatorView } from './components/SimulatorView';
import { AndroidAppCenter } from './components/AndroidAppCenter';
import { ApiConsole } from './components/ApiConsole';
import { StatsResponse, CallLog, BlacklistItem, AppSettings, SpamCheckResponse } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [serverStatus, setServerStatus] = useState<boolean>(true);

  // Core Data States
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    autoReject: true,
    spamThreshold: 70,
    aiDetectionEnabled: true,
    notifyOnBlock: true,
    syncInterval: 15
  });

  // Fetch all initial data from REST API
  const fetchAllData = useCallback(async () => {
    try {
      const [statsRes, callsRes, blacklistRes, settingsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/calls'),
        fetch('/api/blacklist'),
        fetch('/api/settings')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (callsRes.ok) {
        const callsData = await callsRes.json();
        setCallLogs(callsData);
      }

      if (blacklistRes.ok) {
        const blacklistData = await blacklistRes.json();
        setBlacklist(blacklistData);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }

      setServerStatus(true);
    } catch (error) {
      console.error('Failed to fetch data from CallShield backend:', error);
      setServerStatus(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 10000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // API Handler: Check Spam Score
  const handleCheckNumber = async (phoneNumber: string, callerName?: string): Promise<SpamCheckResponse> => {
    const res = await fetch('/api/calls/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, callerName })
    });
    if (!res.ok) throw new Error('Spam check failed');
    return await res.json();
  };

  // API Handler: Add to Blacklist
  const handleAddToBlacklist = async (phoneNumber: string, reason: string) => {
    const res = await fetch('/api/blacklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, reason })
    });
    if (!res.ok) throw new Error('Failed to add to blacklist');
    await fetchAllData();
  };

  // API Handler: Delete from Blacklist
  const handleDeleteFromBlacklist = async (id: string) => {
    const res = await fetch(`/api/blacklist/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete from blacklist');
    await fetchAllData();
  };

  // API Handler: Log Call
  const handleLogCall = async (logData: any) => {
    await fetch('/api/calls/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    });
    await fetchAllData();
  };

  // API Handler: Save Settings
  const handleSaveSettings = async (newSettings: Partial<AppSettings>) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });
    if (!res.ok) throw new Error('Failed to save settings');
    const data = await res.json();
    setSettings(data.settings);
  };

  // API Handler: Clear Logs
  const handleClearLogs = async () => {
    if (window.confirm('Are you sure you want to clear all call logs?')) {
      await fetch('/api/calls/clear', { method: 'POST' });
      await fetchAllData();
    }
  };

  // Export System Logs handler
  const handleExportSystemLogs = () => {
    const fullLogObj = {
      system: 'CallShield Telemetry Engine',
      exportedAt: new Date().toISOString(),
      stats,
      settings,
      blacklist,
      callLogs
    };
    const blob = new Blob([JSON.stringify(fullLogObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CallShield_System_Export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        serverStatus={serverStatus}
        blockedTodayCount={stats?.blockedToday || 0}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            callLogs={callLogs}
            onCheckNumber={handleCheckNumber}
            onAddToBlacklist={handleAddToBlacklist}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'blacklist' && (
          <BlacklistView
            blacklist={blacklist}
            onAddNumber={handleAddToBlacklist}
            onDeleteNumber={handleDeleteFromBlacklist}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            callLogs={callLogs}
            onRefresh={fetchAllData}
            onClearLogs={handleClearLogs}
          />
        )}

        {activeTab === 'simulator' && (
          <SimulatorView
            onCheckNumber={handleCheckNumber}
            onLogCall={handleLogCall}
            onRefreshStats={fetchAllData}
          />
        )}

        {activeTab === 'android' && (
          <AndroidAppCenter />
        )}

        {activeTab === 'api' && (
          <ApiConsole />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onExportLogs={handleExportSystemLogs}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center sm:flex sm:items-center sm:justify-between text-xs text-slate-500">
          <p>© 2026 CallShield Security Platform. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-mono text-slate-400">
            Tagline: <span className="text-sky-400 font-semibold">"Detect. Block. Protect."</span>
          </p>
        </div>
      </footer>

    </div>
  );
}
