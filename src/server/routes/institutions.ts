import { Router } from 'express';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../db/index.ts';
import { institutions } from '../../db/schema.ts';
import { optionalAuth, type AuthRequest } from '../../middleware/auth.ts';
import { initBaselineOnce } from './public.ts';

const router = Router();

// Public Institutions / Colleges / Universities List
router.get('/institutions', optionalAuth, async (req: AuthRequest, res) => {
  try {
    await initBaselineOnce();

    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const state = typeof req.query.state === 'string' ? req.query.state.trim() : '';
    const city = typeof req.query.city === 'string' ? req.query.city.trim().toLowerCase() : '';
    const stream = typeof req.query.stream === 'string' ? req.query.stream.trim() : '';
    const institutionType =
      typeof req.query.institutionType === 'string' ? req.query.institutionType.trim() : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const entranceExam =
      typeof req.query.entranceExam === 'string' ? req.query.entranceExam.trim().toLowerCase() : '';
    const privateOnly = req.query.privateOnly === 'true';

    const rows = await db
      .select()
      .from(institutions)
      .where(
        and(
          eq(institutions.verificationStatus, 'verified'),
          eq(institutions.publishStatus, 'published')
        )
      )
      .orderBy(institutions.name);

    const filtered = rows.filter((item) => {
      if (state && state !== 'All') {
        const itemState = item.state.toLowerCase();
        const campusStr = (item.campuses ?? []).join(' ').toLowerCase();
        if (
          itemState !== state.toLowerCase() &&
          itemState !== 'all india' &&
          !campusStr.includes(state.toLowerCase())
        ) {
          return false;
        }
      }

      if (city && city !== 'all') {
        const hayCity = `${item.city} ${(item.campuses ?? []).join(' ')}`.toLowerCase();
        if (!hayCity.includes(city)) return false;
      }

      if (stream && stream !== 'All') {
        const sLower = stream.toLowerCase();
        const matchPrimary = item.primaryStream.toLowerCase() === sLower;
        const matchList = (item.streams ?? []).some((s) => s.toLowerCase() === sLower);
        if (!matchPrimary && !matchList) return false;
      }

      if (institutionType && institutionType !== 'All') {
        if (institutionType.toLowerCase() === 'university') {
          if (
            !item.category.toLowerCase().includes('university') &&
            !item.name.toLowerCase().includes('university')
          ) {
            return false;
          }
        } else if (item.institutionType.toLowerCase() !== institutionType.toLowerCase()) {
          return false;
        }
      }

      if (category && category !== 'All') {
        if (item.category.toLowerCase() !== category.toLowerCase()) return false;
      }

      if (privateOnly) {
        const isPriv =
          item.category === 'Private University' ||
          item.institutionType === 'Private' ||
          item.institutionType === 'Deemed';
        if (!isPriv) return false;
      }

      if (entranceExam && entranceExam !== 'all') {
        const examsHay = (item.entranceExamsAccepted ?? []).join(' ').toLowerCase();
        const routesHay = (item.admissionRoutes ?? [])
          .map((r) => `${r.routeName} ${r.examOrBasis} ${r.counsellingAuthority}`)
          .join(' ')
          .toLowerCase();
        if (!examsHay.includes(entranceExam) && !routesHay.includes(entranceExam)) return false;
      }

      if (q) {
        const hay = [
          item.name,
          item.shortName,
          item.category,
          item.institutionType,
          item.primaryStream,
          ...(item.streams ?? []),
          item.state,
          item.city,
          ...(item.campuses ?? []),
          ...(item.coursesOffered ?? []),
          ...(item.entranceExamsAccepted ?? []),
          item.overview,
          item.affiliatedCollegesInfo ?? '',
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });

    res.json({ institutions: filtered });
  } catch (error) {
    console.error('List institutions error:', error);
    res.status(500).json({ error: 'Unable to load universities and colleges.' });
  }
});

// Single Institution / University Detail
router.get('/institutions/:slug', optionalAuth, async (req: AuthRequest, res) => {
  try {
    await initBaselineOnce();

    const slug = String(req.params.slug ?? '').trim();
    const rows = await db
      .select()
      .from(institutions)
      .where(eq(institutions.slug, slug))
      .limit(1);
    const institution = rows[0];
    if (!institution) {
      res.status(404).json({ error: 'Institution guide not found.' });
      return;
    }

    const isPublic =
      institution.verificationStatus === 'verified' && institution.publishStatus === 'published';
    if (!isPublic && req.dbUser?.role !== 'admin') {
      res.status(404).json({ error: 'Institution guide not available.' });
      return;
    }

    res.json({ institution });
  } catch (error) {
    console.error('Get institution detail error:', error);
    res.status(500).json({ error: 'Unable to load institution details.' });
  }
});

// Admin preview list (read-only/verified check)
router.get('/admin/institutions', optionalAuth, async (req: AuthRequest, res) => {
  if (!req.dbUser || req.dbUser.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }
  try {
    const rows = await db.select().from(institutions).orderBy(desc(institutions.updatedAt));
    res.json({ institutions: rows });
  } catch (error) {
    console.error('Admin institutions error:', error);
    res.status(500).json({ error: 'Unable to load institutions.' });
  }
});

export default router;
