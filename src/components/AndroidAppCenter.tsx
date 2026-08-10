import React, { useState } from 'react';
import { Smartphone, Copy, Check, Download, FileCode, Folder, ShieldCheck, Terminal, HelpCircle } from 'lucide-react';
import { ANDROID_FILES } from '../data/androidFiles';
import { AndroidCodeFile } from '../types';

export const AndroidAppCenter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidCodeFile>(ANDROID_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadFile = () => {
    const element = document.createElement('a');
    const file = new Blob([selectedFile.code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = selectedFile.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Smartphone className="w-6 h-6 text-sky-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Android Application Source Explorer</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">Complete Kotlin Android Studio codebase including Call Receiver, Foreground Service, Room DB, and Retrofit client.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadFile}
            className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-sky-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Download {selectedFile.filename}</span>
          </button>
        </div>
      </div>

      {/* Code Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left File Tree Sidebar */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-2 pb-2 border-b border-slate-800">
            <Folder className="w-4 h-4 text-sky-400" />
            <span>CallShield Android Project Files</span>
          </div>

          <div className="space-y-1">
            {ANDROID_FILES.map((f) => {
              const isSelected = selectedFile.id === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileCode className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{f.filename}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                    {f.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Code Viewer & Details */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-white font-mono">{selectedFile.filename}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 font-semibold">
                  {selectedFile.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedFile.description}</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 font-mono">
            Path: <span className="text-slate-300">{selectedFile.path}</span>
          </p>

          {/* Syntax Highlighted Container */}
          <div className="relative bg-slate-950 border border-slate-800/80 rounded-xl p-4 overflow-x-auto max-h-[500px]">
            <pre className="text-xs font-mono text-slate-200 leading-relaxed whitespace-pre">
              {selectedFile.code}
            </pre>
          </div>

        </div>

      </div>

      {/* Android Studio Setup Guide Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-white">
          <HelpCircle className="w-5 h-5 text-sky-400" />
          <h2 className="text-base font-semibold">Android Studio Setup & Compilation Guide</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <span className="font-bold text-sky-400 font-mono">Step 1: Open Project</span>
            <p className="text-slate-400">Launch Android Studio, select "New Project" with "Empty Views Activity", namespace set to <code className="text-sky-300">com.callshield.app</code>.</p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <span className="font-bold text-sky-400 font-mono">Step 2: Copy Files</span>
            <p className="text-slate-400">Copy the Kotlin files above into your app module structure under <code className="text-sky-300">app/src/main/java/com/callshield/app/</code>.</p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <span className="font-bold text-sky-400 font-mono">Step 3: Point API Base URL</span>
            <p className="text-slate-400">Update <code className="text-sky-300">BASE_URL</code> in <code className="text-sky-300">CallShieldApi.kt</code> to match your Node.js backend domain.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
