import { GoogleGenAI } from '@google/genai';
import { dbStore } from '../db';
import { SpamCheckResponse } from '../../types';

export class SpamDetectionService {

  public async evaluateNumber(phoneNumber: string, callerName?: string): Promise<SpamCheckResponse> {
    const cleanNumber = phoneNumber.trim().replace(/[\s\-\(\)]/g, '');
    const reasons: string[] = [];
    let score = 0;
    let matchedBlacklist = false;

    // 1. Check Blacklist Match (Immediate Score 100)
    const blacklistMatch = dbStore.isBlacklisted(phoneNumber);
    if (blacklistMatch) {
      score = 100;
      matchedBlacklist = true;
      reasons.push(`Blacklisted Number (${blacklistMatch.reason})`);
    } else {
      // 2. Known Spam Pattern Matching
      // Toll-free scam ranges (+1-800, +1-888, +1-877, +1-866, +1-855)
      if (/^\+?1(800|888|877|866|855)/.test(cleanNumber)) {
        score += 35;
        reasons.push('Toll-Free High Volume Telemarketing Range');
      }

      // Premium Rate Scam (+1-900, +900)
      if (/^\+?1?900/.test(cleanNumber)) {
        score += 85;
        reasons.push('High-Cost Premium Rate Trap Number');
      }

      // International High Risk Prefixes (+881, +882, +247, +239, +252)
      if (/^\+?(881|882|247|239|252|371|269)/.test(cleanNumber)) {
        score += 80;
        reasons.push('High-Risk International One-Ring Scam (Wangiri)');
      }

      // Suspicious Caller Name Keywords
      if (callerName) {
        const lowerName = callerName.toLowerCase();
        if (lowerName.includes('irs') || lowerName.includes('grant') || lowerName.includes('lottery') || 
            lowerName.includes('scam') || lowerName.includes('loan') || lowerName.includes('free') ||
            lowerName.includes('support') || lowerName.includes('sweepstake')) {
          score += 45;
          reasons.push(`Suspicious Caller Identity Tag ("${callerName}")`);
        }
      }

      // Pattern Analysis: Repetitive or sequential numbers (e.g. 555-5555, 123-4567, 000-0000)
      if (/(.)\1{4,}/.test(cleanNumber) || /123456|000000|999999/.test(cleanNumber)) {
        score += 50;
        reasons.push('Spoofed Number Pattern (Sequential / Repeated Digits)');
      }

      // Frequency Analysis: Check recent calls in DB from this number
      const recentLogs = dbStore.getCallLogs().filter(log => {
        const logClean = log.phoneNumber.replace(/[\s\-\(\)]/g, '');
        return logClean === cleanNumber;
      });

      if (recentLogs.length >= 3) {
        score += 30;
        reasons.push(`High Call Frequency (${recentLogs.length} calls logged recently)`);
      }

      // 3. Optional Gemini AI Smart Pattern Check if configured
      const settings = dbStore.getSettings();
      if (settings.aiDetectionEnabled && process.env.GEMINI_API_KEY && score > 0 && score < 70) {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const prompt = `Analyze this phone number for potential robocall/spam likelihood: Phone: "${phoneNumber}", Name: "${callerName || 'Unknown'}". Reply with a JSON object containing {"aiScoreBoost": number (0-20), "aiReason": string}`;
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
          });
          const text = response.text || '';
          if (text.includes('aiScoreBoost')) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const aiParsed = JSON.parse(jsonMatch[0]);
              if (aiParsed.aiScoreBoost) {
                score += Number(aiParsed.aiScoreBoost);
                reasons.push(`AI Analysis: ${aiParsed.aiReason || 'Flagged pattern'}`);
              }
            }
          }
        } catch (err) {
          // Fallback silently if AI fails
        }
      }
    }

    // Cap score strictly at 100
    score = Math.min(100, Math.max(0, score));

    // Default safe reason if 0
    if (reasons.length === 0) {
      reasons.push('Verified Standard Contact Pattern');
    }

    // Determine Risk Level according to requirement:
    // 0-30 = Safe
    // 31-70 = Suspicious
    // 71-100 = Spam
    let riskLevel: 'SAFE' | 'SUSPICIOUS' | 'SPAM' = 'SAFE';
    let recommendation: 'REJECT' | 'ALLOW' | 'FLAG' = 'ALLOW';
    let isSpam = false;

    const settings = dbStore.getSettings();
    if (score >= settings.spamThreshold) {
      riskLevel = 'SPAM';
      recommendation = 'REJECT';
      isSpam = true;
    } else if (score >= 31) {
      riskLevel = 'SUSPICIOUS';
      recommendation = 'FLAG';
      isSpam = false;
    } else {
      riskLevel = 'SAFE';
      recommendation = 'ALLOW';
      isSpam = false;
    }

    return {
      phoneNumber,
      spam: isSpam,
      score,
      riskLevel,
      reasons,
      recommendation,
      matchedBlacklist
    };
  }
}

export const spamService = new SpamDetectionService();
