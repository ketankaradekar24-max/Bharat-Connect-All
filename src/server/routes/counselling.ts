import { Router } from 'express';
import { and, eq } from 'drizzle-orm';
import { db } from '../../db/index.ts';
import { counsellingGuides } from '../../db/schema.ts';
import { optionalAuth, type AuthRequest } from '../../middleware/auth.ts';
import { initBaselineOnce } from './public.ts';

const router = Router();

// Public Counselling Guides List
router.get('/counselling', optionalAuth, async (req: AuthRequest, res) => {
  try {
    await initBaselineOnce();

    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const stream = typeof req.query.stream === 'string' ? req.query.stream.trim() : '';
    const scope = typeof req.query.scope === 'string' ? req.query.scope.trim() : '';
    const state = typeof req.query.state === 'string' ? req.query.state.trim() : '';

    const rows = await db
      .select()
      .from(counsellingGuides)
      .where(
        and(
          eq(counsellingGuides.verificationStatus, 'verified'),
          eq(counsellingGuides.publishStatus, 'published')
        )
      )
      .orderBy(counsellingGuides.authorityCode);

    const filtered = rows.filter((item) => {
      if (stream && stream !== 'All') {
        if (!item.stream.toLowerCase().includes(stream.toLowerCase())) return false;
      }
      if (scope && scope !== 'All') {
        if (item.scope.toLowerCase() !== scope.toLowerCase()) return false;
      }
      if (state && state !== 'All') {
        const sLower = item.state.toLowerCase();
        if (sLower !== state.toLowerCase() && !sLower.includes(state.toLowerCase()) && sLower !== 'all india') {
          return false;
        }
      }
      if (q) {
        const hay = [
          item.authorityCode,
          item.title,
          item.stream,
          item.scope,
          item.state,
          item.conductingBody,
          item.overview,
          item.whoIsEligible,
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    res.json({ guides: filtered });
  } catch (error) {
    console.error('List counselling guides error:', error);
    res.status(500).json({ error: 'Unable to load counselling guides.' });
  }
});

// Single Counselling Guide Detail
router.get('/counselling/:slug', optionalAuth, async (req: AuthRequest, res) => {
  try {
    await initBaselineOnce();

    const slug = String(req.params.slug ?? '').trim();
    const rows = await db
      .select()
      .from(counsellingGuides)
      .where(eq(counsellingGuides.slug, slug))
      .limit(1);
    const guide = rows[0];
    if (!guide) {
      res.status(404).json({ error: 'Counselling guide not found.' });
      return;
    }

    const isPublic =
      guide.verificationStatus === 'verified' && guide.publishStatus === 'published';
    if (!isPublic && req.dbUser?.role !== 'admin') {
      res.status(404).json({ error: 'Counselling guide not available.' });
      return;
    }

    res.json({ guide });
  } catch (error) {
    console.error('Get counselling guide detail error:', error);
    res.status(500).json({ error: 'Unable to load counselling guide.' });
  }
});

export default router;
