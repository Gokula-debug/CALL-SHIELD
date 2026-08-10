import { CallLog, BlacklistItem, AppSettings, StatsResponse } from '../types';

// Initial pre-populated data store for instant out-of-the-box operation
export const mockBlacklist: BlacklistItem[] = [
  {
    id: 'bl-1',
    phoneNumber: '+1-800-555-0199',
    reason: 'Reported IRS Scam Robocall',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    addedBy: 'Community Report'
  },
  {
    id: 'bl-2',
    phoneNumber: '+1-888-234-5678',
    reason: 'Aggressive Telemarketing Loan Officer',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    addedBy: 'Admin'
  },
  {
    id: 'bl-3',
    phoneNumber: '+1-900-999-1234',
    reason: 'Premium Rate Scam - High Cost Trap',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    addedBy: 'Auto Shield Engine'
  },
  {
    id: 'bl-4',
    phoneNumber: '+1-800-432-1000',
    reason: 'Spoofed Credit Card Rate Reduction Scam',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    addedBy: 'User Flag'
  }
];

export const mockSettings: AppSettings = {
  autoReject: true,
  spamThreshold: 70,
  aiDetectionEnabled: true,
  notifyOnBlock: true,
  syncInterval: 15
};

// Generate realistic call logs over past few days
function generateInitialCallLogs(): CallLog[] {
  const logs: CallLog[] = [
    {
      id: 'log-101',
      phoneNumber: '+1-800-555-0199',
      callerName: 'IRS Fake Helpline',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      spamScore: 98,
      status: 'BLOCKED',
      source: 'ANDROID_APP',
      reasons: ['On Blacklist', 'Known IRS Scam Pattern', 'High Call Volume']
    },
    {
      id: 'log-102',
      phoneNumber: '+1-415-555-0123',
      callerName: 'Sarah Jenkins',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      spamScore: 12,
      status: 'SAFE',
      source: 'ANDROID_APP',
      reasons: ['Verified Contact', 'Normal Calling Pattern']
    },
    {
      id: 'log-103',
      phoneNumber: '+1-888-234-5678',
      callerName: 'Fast Loans Telemarketing',
      timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
      spamScore: 88,
      status: 'BLOCKED',
      source: 'ANDROID_APP',
      reasons: ['On Blacklist', 'Robo Dialing Pattern']
    },
    {
      id: 'log-104',
      phoneNumber: '+1-650-555-9876',
      callerName: 'Bay Area Health Clinic',
      timestamp: new Date(Date.now() - 1000 * 60 * 230).toISOString(),
      spamScore: 5,
      status: 'SAFE',
      source: 'WEB_SIMULATOR',
      reasons: ['Verified Organization Number']
    },
    {
      id: 'log-105',
      phoneNumber: '+1-800-999-4321',
      callerName: 'Automated Lottery Notice',
      timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      spamScore: 92,
      status: 'BLOCKED',
      source: 'ANDROID_APP',
      reasons: ['Toll-Free Spam Spammer', 'Pre-recorded Message Spike']
    },
    {
      id: 'log-106',
      phoneNumber: '+1-212-555-8833',
      callerName: 'Unknown Caller',
      timestamp: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
      spamScore: 55,
      status: 'SUSPICIOUS',
      source: 'ANDROID_APP',
      reasons: ['Unrecognized Region', 'High Burst Rate']
    },
    {
      id: 'log-107',
      phoneNumber: '+1-900-999-1234',
      callerName: 'High Premium Call Trap',
      timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
      spamScore: 99,
      status: 'BLOCKED',
      source: 'ANDROID_APP',
      reasons: ['On Blacklist', 'Premium Rate Scam Number']
    },
    {
      id: 'log-108',
      phoneNumber: '+1-408-555-7711',
      callerName: 'Tech Support Help Desk',
      timestamp: new Date(Date.now() - 1000 * 60 * 950).toISOString(),
      spamScore: 18,
      status: 'SAFE',
      source: 'ANDROID_APP',
      reasons: ['Normal Repetition Rate']
    }
  ];
  return logs;
}

export class DataStore {
  private callLogs: CallLog[] = generateInitialCallLogs();
  private blacklist: BlacklistItem[] = [...mockBlacklist];
  private settings: AppSettings = { ...mockSettings };

  // Call Logs methods
  getCallLogs(): CallLog[] {
    return [...this.callLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  addCallLog(log: Omit<CallLog, 'id'>): CallLog {
    const newLog: CallLog = {
      ...log,
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000)
    };
    this.callLogs.unshift(newLog);
    return newLog;
  }

  // Blacklist methods
  getBlacklist(): BlacklistItem[] {
    return [...this.blacklist];
  }

  isBlacklisted(phoneNumber: string): BlacklistItem | undefined {
    const normalized = phoneNumber.replace(/[\s\-\(\)]/g, '');
    return this.blacklist.find(item => {
      const itemNormalized = item.phoneNumber.replace(/[\s\-\(\)]/g, '');
      return itemNormalized === normalized;
    });
  }

  addBlacklist(phoneNumber: string, reason: string, addedBy: string = 'User Dashboard'): BlacklistItem {
    const existing = this.isBlacklisted(phoneNumber);
    if (existing) {
      return existing;
    }
    const newItem: BlacklistItem = {
      id: 'bl-' + Date.now(),
      phoneNumber,
      reason: reason || 'Manually added to blacklist',
      createdAt: new Date().toISOString(),
      addedBy
    };
    this.blacklist.unshift(newItem);
    return newItem;
  }

  removeBlacklist(id: string): boolean {
    const initialLen = this.blacklist.length;
    this.blacklist = this.blacklist.filter(item => item.id !== id);
    return this.blacklist.length < initialLen;
  }

  // Settings methods
  getSettings(): AppSettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<AppSettings>): AppSettings {
    this.settings = { ...this.settings, ...newSettings };
    return { ...this.settings };
  }

  // Statistics calculation
  getStats(): StatsResponse {
    const totalCalls = this.callLogs.length;
    const spamCalls = this.callLogs.filter(c => c.status === 'BLOCKED' || c.spamScore >= this.settings.spamThreshold).length;
    const safeCalls = totalCalls - spamCalls;

    // Blocked today count
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const blockedToday = this.callLogs.filter(c => {
      const isToday = new Date(c.timestamp).getTime() >= startOfToday.getTime();
      return isToday && c.status === 'BLOCKED';
    }).length;

    const avgSpamScore = totalCalls > 0 
      ? Math.round(this.callLogs.reduce((acc, curr) => acc + curr.spamScore, 0) / totalCalls)
      : 0;

    const recentBlocked = this.callLogs
      .filter(c => c.status === 'BLOCKED')
      .slice(0, 5);

    // Score distribution ranges
    const scoreRanges = [
      { range: 'Safe (0-30)', count: this.callLogs.filter(c => c.spamScore <= 30).length },
      { range: 'Suspicious (31-70)', count: this.callLogs.filter(c => c.spamScore > 30 && c.spamScore < 70).length },
      { range: 'Spam (71-100)', count: this.callLogs.filter(c => c.spamScore >= 70).length }
    ];

    // Hourly breakdown
    const hourlyMap: Record<string, { safe: number; spam: number }> = {
      '00:00': { safe: 1, spam: 0 },
      '04:00': { safe: 0, spam: 2 },
      '08:00': { safe: 4, spam: 5 },
      '12:00': { safe: 8, spam: 12 },
      '16:00': { safe: 6, spam: 8 },
      '20:00': { safe: 3, spam: 1 }
    };

    // Calculate actual hourly if possible
    this.callLogs.forEach(log => {
      const date = new Date(log.timestamp);
      const hour = date.getHours();
      let key = '12:00';
      if (hour < 4) key = '00:00';
      else if (hour < 8) key = '04:00';
      else if (hour < 12) key = '08:00';
      else if (hour < 16) key = '12:00';
      else if (hour < 20) key = '16:00';
      else key = '20:00';

      if (log.status === 'BLOCKED') {
        hourlyMap[key].spam++;
      } else {
        hourlyMap[key].safe++;
      }
    });

    const hourlyDistribution = Object.entries(hourlyMap).map(([hour, val]) => ({
      hour,
      safe: val.safe,
      spam: val.spam
    }));

    // Top blocked prefixes
    const prefixCounts: Record<string, number> = {};
    this.callLogs
      .filter(c => c.status === 'BLOCKED')
      .forEach(c => {
        const clean = c.phoneNumber.replace(/[\s\-\(\)]/g, '');
        const prefix = clean.substring(0, 5) || 'Unknown';
        prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
      });

    const topBlockedPrefixes = Object.entries(prefixCounts)
      .map(([prefix, count]) => ({ prefix, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    if (topBlockedPrefixes.length === 0) {
      topBlockedPrefixes.push({ prefix: '+1-800', count: 4 }, { prefix: '+1-888', count: 2 });
    }

    return {
      totalCalls,
      safeCalls,
      spamCalls,
      blockedToday,
      avgSpamScore,
      recentBlocked,
      hourlyDistribution,
      scoreRanges,
      topBlockedPrefixes
    };
  }

  clearLogs(): void {
    this.callLogs = [];
  }
}

export const dbStore = new DataStore();
