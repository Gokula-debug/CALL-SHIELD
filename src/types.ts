export type CallStatus = 'BLOCKED' | 'SAFE' | 'SUSPICIOUS';
export type CallSource = 'ANDROID_APP' | 'WEB_SIMULATOR' | 'API_INSPECTOR';

export interface CallLog {
  id: string;
  phoneNumber: string;
  callerName?: string;
  timestamp: string;
  spamScore: number;
  status: CallStatus;
  source: CallSource;
  reasons?: string[];
}

export interface BlacklistItem {
  id: string;
  phoneNumber: string;
  reason: string;
  createdAt: string;
  addedBy?: string;
}

export interface AppSettings {
  autoReject: boolean;
  spamThreshold: number; // 0 to 100
  aiDetectionEnabled: boolean;
  notifyOnBlock: boolean;
  syncInterval: number; // in minutes
}

export interface SpamCheckRequest {
  phoneNumber: string;
  callerName?: string;
}

export interface SpamCheckResponse {
  phoneNumber: string;
  spam: boolean;
  score: number;
  riskLevel: 'SAFE' | 'SUSPICIOUS' | 'SPAM';
  reasons: string[];
  recommendation: 'REJECT' | 'ALLOW' | 'FLAG';
  matchedBlacklist: boolean;
}

export interface StatsResponse {
  totalCalls: number;
  safeCalls: number;
  spamCalls: number;
  blockedToday: number;
  avgSpamScore: number;
  recentBlocked: CallLog[];
  hourlyDistribution: { hour: string; safe: number; spam: number }[];
  scoreRanges: { range: string; count: number }[];
  topBlockedPrefixes: { prefix: string; count: number }[];
}

export interface AndroidCodeFile {
  id: string;
  path: string;
  filename: string;
  category: 'Manifest' | 'Receiver' | 'Service' | 'API' | 'Database' | 'Activity' | 'Gradle';
  description: string;
  code: string;
}
