import { Router } from 'express';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/index.ts';
import {
  adminAuditLogs,
  counsellingGuides,
  exams,
  institutions,
  jobs,
  publicServices,
  scholarships,
  userServiceTracker,
} from '../../db/schema.ts';
import { initBaselineOnce } from './public.ts';
import { optionalAuth, requireAdmin, requireAuth, type AuthRequest } from '../../middleware/auth.ts';

const router = Router();

export async function initServicesBaselineOnce(): Promise<void> {
  await initBaselineOnce();
}

const trackerUpdateSchema = z.object({
  isSaved: z.boolean().optional(),
  status: z
    .enum([
      'Saved',
      'Preparing Documents',
      'Appointment Scheduled',
      'Submitted Externally',
      'Completed',
    ])
    .optional(),
  completedSteps: z.array(z.number().int().min(0)).optional(),
  checkedDocuments: z.array(z.number().int().min(0)).optional(),
  referenceNumber: z.string().trim().max(120).nullable().optional(),
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
    .nullable()
    .optional(),
  reminderDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
    .nullable()
    .optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

const adminServiceInputSchema = z.object({
  title: z.string().trim().min(5).max(200),
  category: z.string().trim().min(2).max(100),
  subcategory: z.string().trim().min(2).max(120),
  departmentOrAuthority: z.string().trim().min(2).max(200),
  jurisdiction: z.enum(['Central', 'State']).default('Central'),
  state: z.string().trim().min(2).max(80).default('All India'),
  country: z.string().trim().max(80).nullable().optional(),
  summary: z.string().trim().min(10).max(500),
  overview: z.string().trim().min(10).max(4000),
  whoCanApply: z.string().trim().min(5).max(2000),
  eligibilityRequirements: z.string().trim().min(5).max(3000),
  documentsRequired: z.array(z.string().trim().min(1)).min(1),
  applicationSteps: z.array(z.string().trim().min(1)).min(1),
  officialFees: z.string().trim().min(2).max(500),
  appointmentProcess: z.string().trim().max(1500).nullable().optional(),
  trackingGuidance: z.string().trim().min(5).max(1500),
  commonMistakes: z.array(z.string().trim().min(1)).default([]),
  faqs: z
    .array(
      z.object({
        q: z.string().trim().min(3),
        a: z.string().trim().min(3),
      })
    )
    .default([]),
  officialWebsiteName: z.string().trim().min(2).max(200),
  officialWebsiteUrl: z.string().url(),
  officialApplyUrl: z.string().url(),
  sourceUrl: z.string().url(),
  isThirdParty: z.boolean().default(false),
});

const workflowActionSchema = z.object({
  action: z.enum(['verify', 'publish', 'verify_and_publish', 'unpublish', 'reject', 'retire']),
  note: z.string().trim().max(500).optional(),
});

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

// Public Unified Search across Scholarships + Public Services + Competitive Exams + Jobs
router.get('/search/unified', optionalAuth, async (req: AuthRequest, res) => {
  try {
    await initServicesBaselineOnce();

    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const stateFilter = typeof req.query.state === 'string' ? req.query.state.trim() : '';

    const [serviceRows, scholarshipRows, examRows, jobRows, institutionRows, counsellingRows] =
      await Promise.all([
        db
          .select()
          .from(publicServices)
          .where(
            and(
              eq(publicServices.verificationStatus, 'verified'),
              eq(publicServices.publishStatus, 'published')
            )
          )
          .orderBy(desc(publicServices.lastVerifiedAt)),
        db
          .select()
          .from(scholarships)
          .where(
            and(
              eq(scholarships.verificationStatus, 'verified'),
              eq(scholarships.publishStatus, 'published')
            )
          )
          .orderBy(desc(scholarships.lastVerifiedAt)),
        db
          .select()
          .from(exams)
          .where(and(eq(exams.verificationStatus, 'verified'), eq(exams.publishStatus, 'published')))
          .orderBy(desc(exams.lastVerifiedAt)),
        db
          .select()
          .from(jobs)
          .where(and(eq(jobs.verificationStatus, 'verified'), eq(jobs.publishStatus, 'published')))
          .orderBy(desc(jobs.lastVerifiedAt)),
        db
          .select()
          .from(institutions)
          .where(
            and(
              eq(institutions.verificationStatus, 'verified'),
              eq(institutions.publishStatus, 'published')
            )
          ),
        db
          .select()
          .from(counsellingGuides)
          .where(
            and(
              eq(counsellingGuides.verificationStatus, 'verified'),
              eq(counsellingGuides.publishStatus, 'published')
            )
          ),
      ]);

    const tokens = q
      .split(/\s+/)
      .map((t) => t.replace(/[^a-z0-9]/g, ''))
      .filter((t) => t.length >= 2 && !['how', 'for', 'the', 'and', 'what', 'are', 'get', 'apply', 'requirements'].includes(t));

    const matchScore = (text: string): number => {
      if (!q) return 1;
      const lower = text.toLowerCase();
      if (lower.includes(q)) return 10;
      if (tokens.length === 0) return lower.includes(q) ? 5 : 0;
      return tokens.reduce((acc, tok) => (lower.includes(tok) ? acc + 1 : acc), 0);
    };

    const filterByState = (itemState: string) => {
      if (!stateFilter || stateFilter === 'All') return true;
      return itemState.toLowerCase() === stateFilter.toLowerCase() || itemState === 'All India';
    };

    const matchedServices = serviceRows
      .filter((s) => filterByState(s.state))
      .map((s) => ({
        item: s,
        score: matchScore(
          [
            s.title,
            s.category,
            s.subcategory,
            s.departmentOrAuthority,
            s.state,
            s.country ?? '',
            s.summary,
            s.overview,
          ].join(' ')
        ),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);

    const matchedScholarships = scholarshipRows
      .filter((s) => filterByState(s.state))
      .map((s) => ({
        item: s,
        score: matchScore(
          [
            s.title,
            s.providerName,
            s.category,
            s.state,
            s.summary,
            ...(s.educationLevels ?? []),
            ...(s.eligibleCourses ?? []),
          ].join(' ')
        ),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);

    const matchedExams = examRows
      .filter((e) => filterByState(e.state))
      .map((e) => ({
        item: e,
        score: matchScore(
          [
            e.examName,
            e.fullName,
            e.category,
            e.subcategory,
            e.conductingAuthority,
            e.state,
            e.examPurpose,
          ].join(' ')
        ),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);

    const matchedJobs = jobRows
      .filter((j) => filterByState(j.state))
      .map((j) => ({
        item: j,
        score: matchScore(
          [j.title, j.organization, j.category, j.state, j.location, j.qualification, j.summary].join(' ')
        ),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);

    const matchedInstitutions = institutionRows
      .filter((inst) => filterByState(inst.state))
      .map((inst) => ({
        item: inst,
        score: matchScore(
          [
            inst.name,
            inst.shortName,
            inst.category,
            inst.institutionType,
            inst.primaryStream,
            ...(inst.streams ?? []),
            inst.state,
            inst.city,
            ...(inst.entranceExamsAccepted ?? []),
            inst.overview,
          ].join(' ')
        ),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);

    const matchedCounselling = counsellingRows
      .filter((cg) => filterByState(cg.state))
      .map((cg) => ({
        item: cg,
        score: matchScore(
          [cg.authorityCode, cg.title, cg.stream, cg.state, cg.conductingBody, cg.overview].join(' ')
        ),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);

    res.json({
      query: q,
      services: matchedServices,
      scholarships: matchedScholarships,
      exams: matchedExams,
      jobs: matchedJobs,
      institutions: matchedInstitutions,
      counsellingGuides: matchedCounselling,
    });
  } catch (error) {
    console.error('Unified search error:', error);
    res.status(500).json({ error: 'Unable to perform unified service search.' });
  }
});

// Public Services List
router.get('/services', optionalAuth, async (req: AuthRequest, res) => {
  try {
    await initServicesBaselineOnce();

    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const categoryFilter =
      typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const stateFilter = typeof req.query.state === 'string' ? req.query.state.trim() : '';
    const jurisdictionFilter =
      typeof req.query.jurisdiction === 'string' ? req.query.jurisdiction.trim() : '';
    const countryFilter = typeof req.query.country === 'string' ? req.query.country.trim() : '';

    const rows = await db
      .select()
      .from(publicServices)
      .where(
        and(
          eq(publicServices.verificationStatus, 'verified'),
          eq(publicServices.publishStatus, 'published')
        )
      )
      .orderBy(desc(publicServices.lastVerifiedAt), desc(publicServices.createdAt));

    const filtered = rows.filter((item) => {
      if (categoryFilter && categoryFilter !== 'All') {
        if (item.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      }
      if (stateFilter && stateFilter !== 'All') {
        if (item.state.toLowerCase() !== stateFilter.toLowerCase() && item.state !== 'All India') {
          return false;
        }
      }
      if (jurisdictionFilter && jurisdictionFilter !== 'All') {
        if (item.jurisdiction.toLowerCase() !== jurisdictionFilter.toLowerCase()) return false;
      }
      if (countryFilter && countryFilter !== 'All') {
        if ((item.country ?? '').toLowerCase() !== countryFilter.toLowerCase()) return false;
      }
      if (q) {
        const hay = [
          item.title,
          item.category,
          item.subcategory,
          item.departmentOrAuthority,
          item.state,
          item.country ?? '',
          item.summary,
          item.overview,
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const trackerMap = new Map<number, typeof userServiceTracker.$inferSelect>();
    if (req.dbUser) {
      const trackers = await db
        .select()
        .from(userServiceTracker)
        .where(eq(userServiceTracker.userId, req.dbUser.id));
      trackers.forEach((t) => trackerMap.set(t.serviceId, t));
    }

    res.json({
      services: filtered.map((item) => ({
        ...item,
        tracker: trackerMap.get(item.id) ?? null,
      })),
    });
  } catch (error) {
    console.error('List services error:', error);
    res.status(500).json({ error: 'Unable to load public services.' });
  }
});

// Single Public Service Detail
router.get('/services/:slug', optionalAuth, async (req: AuthRequest, res) => {
  try {
    await initServicesBaselineOnce();

    const slug = String(req.params.slug ?? '').trim();
    const rows = await db
      .select()
      .from(publicServices)
      .where(eq(publicServices.slug, slug))
      .limit(1);

    const service = rows[0];
    if (!service) {
      res.status(404).json({ error: 'Service guide not found.' });
      return;
    }

    const isPublic =
      service.verificationStatus === 'verified' && service.publishStatus === 'published';
    if (!isPublic && req.dbUser?.role !== 'admin') {
      res.status(404).json({ error: 'Service guide not available.' });
      return;
    }

    let tracker = null;
    if (req.dbUser) {
      const tRows = await db
        .select()
        .from(userServiceTracker)
        .where(
          and(
            eq(userServiceTracker.userId, req.dbUser.id),
            eq(userServiceTracker.serviceId, service.id)
          )
        )
        .limit(1);
      tracker = tRows[0] ?? null;
    }

    res.json({ service, tracker });
  } catch (error) {
    console.error('Get service detail error:', error);
    res.status(500).json({ error: 'Unable to load service guide.' });
  }
});

// Authenticated User Service Progress & Checklists
router.get('/student/services/tracker', requireAuth, async (req: AuthRequest, res) => {
  try {
    const rows = await db
      .select({
        tracker: userServiceTracker,
        service: publicServices,
      })
      .from(userServiceTracker)
      .innerJoin(publicServices, eq(userServiceTracker.serviceId, publicServices.id))
      .where(eq(userServiceTracker.userId, req.dbUser!.id))
      .orderBy(desc(userServiceTracker.updatedAt));

    res.json({
      items: rows.map((r) => ({ ...r.tracker, service: r.service })),
    });
  } catch (error) {
    console.error('Load service tracker error:', error);
    res.status(500).json({ error: 'Unable to load saved services.' });
  }
});

router.put('/student/services/:serviceId/tracker', requireAuth, async (req: AuthRequest, res) => {
  const serviceId = Number(req.params.serviceId);
  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    res.status(400).json({ error: 'Invalid service ID.' });
    return;
  }

  const parsed = trackerUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid service tracker update.',
      issues: parsed.error.issues.map((i) => i.message),
    });
    return;
  }

  const data = parsed.data;
  try {
    const existingRows = await db
      .select()
      .from(userServiceTracker)
      .where(
        and(
          eq(userServiceTracker.userId, req.dbUser!.id),
          eq(userServiceTracker.serviceId, serviceId)
        )
      )
      .limit(1);

    if (!existingRows[0]) {
      const inserted = await db
        .insert(userServiceTracker)
        .values({
          userId: req.dbUser!.id,
          serviceId,
          isSaved: data.isSaved ?? true,
          status: data.status ?? 'Saved',
          completedSteps: data.completedSteps ?? [],
          checkedDocuments: data.checkedDocuments ?? [],
          referenceNumber: data.referenceNumber ?? null,
          appointmentDate: data.appointmentDate ?? null,
          reminderDate: data.reminderDate ?? null,
          notes: data.notes ?? null,
        })
        .returning();
      res.json({ tracker: inserted[0] });
      return;
    }

    const current = existingRows[0];
    const updated = await db
      .update(userServiceTracker)
      .set({
        isSaved: data.isSaved ?? current.isSaved,
        status: data.status ?? current.status,
        completedSteps: data.completedSteps ?? current.completedSteps,
        checkedDocuments: data.checkedDocuments ?? current.checkedDocuments,
        referenceNumber:
          data.referenceNumber !== undefined ? data.referenceNumber : current.referenceNumber,
        appointmentDate:
          data.appointmentDate !== undefined ? data.appointmentDate : current.appointmentDate,
        reminderDate:
          data.reminderDate !== undefined ? data.reminderDate : current.reminderDate,
        notes: data.notes !== undefined ? data.notes : current.notes,
        updatedAt: new Date(),
      })
      .where(eq(userServiceTracker.id, current.id))
      .returning();

    res.json({ tracker: updated[0] });
  } catch (error) {
    console.error('Update service tracker error:', error);
    res.status(500).json({ error: 'Failed to save service progress.' });
  }
});

router.delete('/student/services/:serviceId/tracker', requireAuth, async (req: AuthRequest, res) => {
  const serviceId = Number(req.params.serviceId);
  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    res.status(400).json({ error: 'Invalid service ID.' });
    return;
  }

  try {
    await db
      .delete(userServiceTracker)
      .where(
        and(
          eq(userServiceTracker.userId, req.dbUser!.id),
          eq(userServiceTracker.serviceId, serviceId)
        )
      );
    res.json({ deleted: true });
  } catch (error) {
    console.error('Delete service tracker error:', error);
    res.status(500).json({ error: 'Failed to remove service.' });
  }
});

// Admin Service Management
router.get('/admin/services', requireAuth, requireAdmin, async (_req: AuthRequest, res) => {
  try {
    const rows = await db
      .select()
      .from(publicServices)
      .orderBy(desc(publicServices.updatedAt), desc(publicServices.createdAt));
    res.json({ services: rows });
  } catch (error) {
    console.error('Admin list services error:', error);
    res.status(500).json({ error: 'Unable to load services directory.' });
  }
});

router.post('/admin/services', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const parsed = adminServiceInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Validation failed for service record.',
      issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    });
    return;
  }

  const data = parsed.data;
  try {
    const inserted = await db
      .insert(publicServices)
      .values({
        ...data,
        slug: slugify(data.title),
        country: data.country ?? null,
        appointmentProcess: data.appointmentProcess ?? null,
        verificationStatus: 'pending',
        publishStatus: 'draft',
        createdByUserId: req.dbUser!.id,
      })
      .returning();

    const record = inserted[0];
    await db.insert(adminAuditLogs).values({
      actorUserId: req.dbUser!.id,
      action: 'SERVICE_CREATED',
      entityType: 'public_service',
      entityId: String(record.id),
      details: { title: record.title, officialApplyUrl: record.officialApplyUrl },
    });

    res.status(201).json({ service: record });
  } catch (error) {
    console.error('Admin create service error:', error);
    res.status(500).json({ error: 'Failed to create public service.' });
  }
});

router.put('/admin/services/:id', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid service ID.' });
    return;
  }

  const parsed = adminServiceInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Validation failed for service update.',
      issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    });
    return;
  }

  try {
    const updated = await db
      .update(publicServices)
      .set({
        ...parsed.data,
        country: parsed.data.country ?? null,
        appointmentProcess: parsed.data.appointmentProcess ?? null,
        updatedAt: new Date(),
      })
      .where(eq(publicServices.id, id))
      .returning();

    if (!updated[0]) {
      res.status(404).json({ error: 'Service not found.' });
      return;
    }

    await db.insert(adminAuditLogs).values({
      actorUserId: req.dbUser!.id,
      action: 'SERVICE_UPDATED',
      entityType: 'public_service',
      entityId: String(id),
      details: { title: updated[0].title },
    });

    res.json({ service: updated[0] });
  } catch (error) {
    console.error('Admin update service error:', error);
    res.status(500).json({ error: 'Failed to update service.' });
  }
});

router.post(
  '/admin/services/:id/workflow',
  requireAuth,
  requireAdmin,
  async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid service ID.' });
      return;
    }

    const parsed = workflowActionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid workflow action.' });
      return;
    }

    try {
      const existingRows = await db
        .select()
        .from(publicServices)
        .where(eq(publicServices.id, id))
        .limit(1);

      const existing = existingRows[0];
      if (!existing) {
        res.status(404).json({ error: 'Service not found.' });
        return;
      }

      const { action, note } = parsed.data;
      const patch: Partial<typeof publicServices.$inferInsert> = {
        updatedAt: new Date(),
      };

      const nextReview = new Date();
      nextReview.setMonth(nextReview.getMonth() + 3);

      if (action === 'verify') {
        patch.verificationStatus = 'verified';
        patch.lastVerifiedAt = new Date();
        patch.nextReviewAt = nextReview;
        patch.verifiedByUserId = req.dbUser!.id;
      } else if (action === 'publish') {
        if (existing.verificationStatus !== 'verified') {
          res.status(400).json({ error: 'Verify official URLs before publishing.' });
          return;
        }
        patch.publishStatus = 'published';
      } else if (action === 'verify_and_publish') {
        patch.verificationStatus = 'verified';
        patch.publishStatus = 'published';
        patch.lastVerifiedAt = new Date();
        patch.nextReviewAt = nextReview;
        patch.verifiedByUserId = req.dbUser!.id;
      } else if (action === 'unpublish') {
        patch.publishStatus = 'unpublished';
      } else if (action === 'reject') {
        patch.verificationStatus = 'rejected';
        patch.publishStatus = 'unpublished';
      } else if (action === 'retire') {
        patch.publishStatus = 'retired';
      }

      const updated = await db
        .update(publicServices)
        .set(patch)
        .where(eq(publicServices.id, id))
        .returning();

      await db.insert(adminAuditLogs).values({
        actorUserId: req.dbUser!.id,
        action: `SERVICE_${action.toUpperCase()}`,
        entityType: 'public_service',
        entityId: String(id),
        details: { title: updated[0].title, note: note ?? null },
      });

      res.json({ service: updated[0] });
    } catch (error) {
      console.error('Admin service workflow error:', error);
      res.status(500).json({ error: 'Failed to update service workflow state.' });
    }
  }
);

export default router;
