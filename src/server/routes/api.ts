import { Router, Request, Response } from 'express';
import { dbStore } from '../db';
import { spamService } from '../services/spamService';

const router = Router();

/**
 * POST /api/calls/check
 * Checks if a phone number is spam.
 * Returns: { "spam": true, "score": 95, "riskLevel": "SPAM", "reasons": [...], "recommendation": "REJECT" }
 */
router.post('/calls/check', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, callerName } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'phoneNumber is required' });
    }

    const result = await spamService.evaluateNumber(phoneNumber, callerName);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error checking spam score' });
  }
});

/**
 * POST /api/calls/log
 * Stores call logs into DB
 */
router.post('/calls/log', (req: Request, res: Response) => {
  try {
    const { phoneNumber, callerName, spamScore, status, source, reasons } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'phoneNumber is required' });
    }

    const score = typeof spamScore === 'number' ? spamScore : 0;
    const settings = dbStore.getSettings();
    const finalStatus = status || (score >= settings.spamThreshold ? 'BLOCKED' : score >= 31 ? 'SUSPICIOUS' : 'SAFE');

    const newLog = dbStore.addCallLog({
      phoneNumber,
      callerName: callerName || 'Unknown Caller',
      timestamp: new Date().toISOString(),
      spamScore: score,
      status: finalStatus,
      source: source || 'ANDROID_APP',
      reasons: Array.isArray(reasons) ? reasons : ['Logged via CallShield API']
    });

    return res.status(201).json({ success: true, log: newLog });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error logging call' });
  }
});

/**
 * GET /api/calls
 * Returns all call logs
 */
router.get('/calls', (req: Request, res: Response) => {
  try {
    const logs = dbStore.getCallLogs();
    return res.json(logs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error fetching calls' });
  }
});

/**
 * POST /api/calls/clear
 * Resets call logs
 */
router.post('/calls/clear', (req: Request, res: Response) => {
  try {
    dbStore.clearLogs();
    return res.json({ success: true, message: 'All call logs cleared' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error clearing logs' });
  }
});

/**
 * GET /api/blacklist
 * Returns blacklist
 */
router.get('/blacklist', (req: Request, res: Response) => {
  try {
    const blacklist = dbStore.getBlacklist();
    return res.json(blacklist);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error fetching blacklist' });
  }
});

/**
 * POST /api/blacklist
 * Add number to blacklist
 */
router.post('/blacklist', (req: Request, res: Response) => {
  try {
    const { phoneNumber, reason, addedBy } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'phoneNumber is required' });
    }

    const item = dbStore.addBlacklist(phoneNumber, reason, addedBy);
    return res.status(201).json({ success: true, blacklist: item });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error adding to blacklist' });
  }
});

/**
 * DELETE /api/blacklist/:id
 * Remove number from blacklist
 */
router.delete('/blacklist/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const removed = dbStore.removeBlacklist(id);
    if (!removed) {
      return res.status(404).json({ error: 'Blacklist item not found' });
    }
    return res.json({ success: true, message: 'Removed from blacklist' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error removing from blacklist' });
  }
});

/**
 * GET /api/stats
 * Return dashboard statistics
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = dbStore.getStats();
    return res.json(stats);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error fetching statistics' });
  }
});

/**
 * GET /api/settings
 * Return current settings
 */
router.get('/settings', (req: Request, res: Response) => {
  try {
    const settings = dbStore.getSettings();
    return res.json(settings);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error fetching settings' });
  }
});

/**
 * POST /api/settings
 * Update settings
 */
router.post('/settings', (req: Request, res: Response) => {
  try {
    const updated = dbStore.updateSettings(req.body);
    return res.json({ success: true, settings: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error updating settings' });
  }
});

export default router;
