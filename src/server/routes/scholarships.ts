import { Router } from 'express';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../db/index.ts';
import {
  savedScholarships,
  scholarshipApplications,
  scholarships,
  studentProfiles,
} from '../../db/schema.ts';
import { optionalAuth, type AuthRequest } from '../../middleware/auth.ts';
import { evaluateEligibility } from '../../services/eligibility.ts';
import { initBaselineOnce } from './public.ts';

const router = Router();

router.get('/scholarships', optionalAuth, async (req: AuthRequest, res) => {
  try {
    await initBaselineOnce();

    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const stateFilter = typeof req.query.state === 'string' ? req.query.state.trim() : '';
    const levelFilter =
      typeof req.query.educationLevel === 'string' ? req.query.educationLevel.trim() : '';
    const categoryFilter =
      typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const providerTypeFilter =
      typeof req.query.providerType === 'string' ? req.query.providerType.trim() : '';
    const eligibleCategoryFilter =
      typeof req.query.eligibleCategory === 'string' ? req.query.eligibleCategory.trim() : '';
    const genderFilter = typeof req.query.gender === 'string' ? req.query.gender.trim() : '';
    const maxIncomeFilter = req.query.maxIncome ? Number(req.query.maxIncome) : null;

    const rows = await db
      .select()
      .from(scholarships)
      .where(
        and(
          eq(scholarships.verificationStatus, 'verified'),
          eq(scholarships.publishStatus, 'published')
        )
      )
      .orderBy(desc(scholarships.lastVerifiedAt), desc(scholarships.createdAt));

    const filtered = rows.filter((item) => {
      if (stateFilter && stateFilter !== 'All') {
        if (
          item.state.toLowerCase() !== stateFilter.toLowerCase() &&
          item.state !== 'All India'
        ) {
          return false;
        }
      }
      if (categoryFilter && categoryFilter !== 'All') {
        if (item.category.toLowerCase() !== categoryFilter.toLowerCase()) {
          return false;
        }
      }
      if (providerTypeFilter && providerTypeFilter !== 'All') {
        if (item.providerType.toLowerCase() !== providerTypeFilter.toLowerCase()) {
          return false;
        }
      }
      if (levelFilter && levelFilter !== 'All') {
        const levels = item.educationLevels ?? [];
        if (!levels.includes('All') && !levels.some((l) => l.toLowerCase() === levelFilter.toLowerCase())) {
          return false;
        }
      }
      if (eligibleCategoryFilter && eligibleCategoryFilter !== 'All') {
        const cats = item.eligibleCategories ?? [];
        if (!cats.some((c) => c.toLowerCase() === eligibleCategoryFilter.toLowerCase())) {
          return false;
        }
      }
      if (genderFilter && genderFilter !== 'All') {
        const g = (item.genderEligibility ?? 'All').toLowerCase();
        if (g !== 'all' && g !== genderFilter.toLowerCase()) {
          return false;
        }
      }
      if (maxIncomeFilter && Number.isFinite(maxIncomeFilter) && item.maxFamilyIncome) {
        if (maxIncomeFilter > item.maxFamilyIncome) {
          return false;
        }
      }
      if (q) {
        const haystack = [
          item.title,
          item.providerName,
          item.department ?? '',
          item.state,
          item.category,
          item.summary,
          ...(item.educationLevels ?? []),
          ...(item.eligibleCourses ?? []),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    let profile: typeof studentProfiles.$inferSelect | null = null;
    const savedSet = new Set<number>();
    const appMap = new Map<number, string>();

    if (req.dbUser) {
      const [profileRows, savedRows, appRows] = await Promise.all([
        db
          .select()
          .from(studentProfiles)
          .where(eq(studentProfiles.userId, req.dbUser.id))
          .limit(1),
        db
          .select()
          .from(savedScholarships)
          .where(eq(savedScholarships.userId, req.dbUser.id)),
        db
          .select()
          .from(scholarshipApplications)
          .where(eq(scholarshipApplications.userId, req.dbUser.id)),
      ]);
      profile = profileRows[0] ?? null;
      savedRows.forEach((s) => savedSet.add(s.scholarshipId));
      appRows.forEach((a) => appMap.set(a.scholarshipId, a.status));
    }

    const enriched = filtered.map((item) => ({
      ...item,
      eligibility: req.dbUser ? evaluateEligibility(profile, item) : null,
      isSaved: savedSet.has(item.id),
      applicationStatus: appMap.get(item.id) ?? null,
    }));

    res.json({ scholarships: enriched });
  } catch (error) {
    console.error('List scholarships error:', error);
    res.status(500).json({ error: 'Unable to load scholarships.' });
  }
});

router.get('/scholarships/:slug', optionalAuth, async (req: AuthRequest, res) => {
  try {
    await initBaselineOnce();

    const slug = String(req.params.slug ?? '').trim();
    const rows = await db
      .select()
      .from(scholarships)
      .where(eq(scholarships.slug, slug))
      .limit(1);

    const item = rows[0];
    if (!item) {
      res.status(404).json({ error: 'Scholarship not found.' });
      return;
    }

    const isPublic =
      item.verificationStatus === 'verified' && item.publishStatus === 'published';
    if (!isPublic && req.dbUser?.role !== 'admin') {
      res.status(404).json({ error: 'Scholarship not available.' });
      return;
    }

    let eligibility = null;
    let isSaved = false;
    let application = null;

    if (req.dbUser) {
      const [profileRows, savedRows, appRows] = await Promise.all([
        db
          .select()
          .from(studentProfiles)
          .where(eq(studentProfiles.userId, req.dbUser.id))
          .limit(1),
        db
          .select()
          .from(savedScholarships)
          .where(
            and(
              eq(savedScholarships.userId, req.dbUser.id),
              eq(savedScholarships.scholarshipId, item.id)
            )
          )
          .limit(1),
        db
          .select()
          .from(scholarshipApplications)
          .where(
            and(
              eq(scholarshipApplications.userId, req.dbUser.id),
              eq(scholarshipApplications.scholarshipId, item.id)
            )
          )
          .limit(1),
      ]);
      eligibility = evaluateEligibility(profileRows[0] ?? null, item);
      isSaved = Boolean(savedRows[0]);
      application = appRows[0] ?? null;
    }

    res.json({
      scholarship: item,
      eligibility,
      isSaved,
      application,
    });
  } catch (error) {
    console.error('Get scholarship detail error:', error);
    res.status(500).json({ error: 'Unable to load scholarship details.' });
  }
});

export default router;
