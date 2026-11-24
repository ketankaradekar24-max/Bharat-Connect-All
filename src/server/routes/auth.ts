import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../../middleware/auth.ts';
import { bootstrapFirstAdmin, getUserSessionData } from '../../db/users.ts';
import { computeProfileCompletion } from '../../services/eligibility.ts';

const router = Router();

router.post('/auth/session', requireAuth, async (req: AuthRequest, res) => {
  try {
    const session = await getUserSessionData(req.dbUser!.id);
    const profileCompletion = computeProfileCompletion(session.profile);
    res.json({
      ...session,
      profileCompletion,
    });
  } catch (error) {
    console.error('Session sync failed:', error);
    res.status(500).json({ error: 'Unable to load session.' });
  }
});

router.post('/admin/bootstrap', requireAuth, async (req: AuthRequest, res) => {
  try {
    const result = await bootstrapFirstAdmin(req.dbUser!.id);
    if (!result.promoted && result.user.role !== 'admin') {
      res.status(403).json({
        error: 'An administrator already exists for this platform. Ask an existing admin for access.',
      });
      return;
    }

    const session = await getUserSessionData(req.dbUser!.id);
    const profileCompletion = computeProfileCompletion(session.profile);
    res.json({
      promoted: result.promoted,
      ...session,
      profileCompletion,
    });
  } catch (error) {
    console.error('Admin bootstrap error:', error);
    res.status(500).json({ error: 'Failed to initialize administrator account.' });
  }
});

export default router;
