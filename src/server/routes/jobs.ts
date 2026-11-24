import { Router } from 'express';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/index.ts';
import { adminAuditLogs, jobs, userJobTrackers } from '../../db/schema.ts';
import { optionalAuth, requireAdmin, requireAuth, type AuthRequest } from '../../middleware/auth.ts';
import { initBaselineOnce } from './public.ts';

const router = Router();

const jobTrackerSchema = z.object({
  isSaved: z.boolean().optional(),
  status: z
    .enum([
      'Interested',
      'Preparing',
      'Documents Ready',
      'Applied',
      'Under Review',
      'Selected',
      'Rejected',
      'Completed',
    ])
    .optional(),
  reminderDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
    .nullable()
    .optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

const adminJobSchema = z.object({
  title: z.string().trim().min(5).max(220),
  organization: z.string().trim().min(2).max(200),
  category: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(80).default('All India'),
  location: z.string().trim().min(2).max(160),
  qualification: z.string().trim().min(2).max(300),
  ageCriteria: z.string().trim().min(2).max(200),
  vacancyInfo: z.string().trim().min(2).max(600),
  salaryPayScale: z.string().trim().min(2).max(300),
  experienceLevel: z.string().trim().min(2).max(120).default('Freshers & Experienced'),
  deadlineText: z.string().trim().min(2).max(300),
  deadlineDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  summary: z.string().trim().min(10).max(600),
  applicationSteps: z.array(z.string().trim().min(1)).min(1),
  requiredDocuments: z.array(z.string().trim().min(1)).min(1),
  officialNotificationUrl: z.string().url(),
  officialApplyUrl: z.string().url(),
  officialSourceName: z.string().trim().min(2).max(200),
});

const workflowSchema = z.object({
  action: z.enum(['verify', 'publish', 'verify_and_publish', 'unpublish', 'reject', 'archive']),
  note: z.string().trim().max(500).optional(),
});

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

// Public Jobs List
router.get('/jobs', optionalAuth, async (req: AuthRequest, res) => {
  try {
    await initBaselineOnce();

    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const state = typeof req.query.state === 'string' ? req.query.state.trim() : '';
    const experience =
      typeof req.query.experience === 'string' ? req.query.experience.trim().toLowerCase() : '';

    const rows = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.verificationStatus, 'verified'), eq(jobs.publishStatus, 'published')))
      .orderBy(desc(jobs.lastVerifiedAt), jobs.title);

    const filtered = rows.filter((item) => {
      if (category && category !== 'All') {
        if (item.category.toLowerCase() !== category.toLowerCase()) return false;
      }
      if (state && state !== 'All') {
        if (item.state.toLowerCase() !== state.toLowerCase() && item.state !== 'All India') {
          return false;
        }
      }
      if (experience && experience !== 'all') {
        if (!item.experienceLevel.toLowerCase().includes(experience)) return false;
      }
      if (q) {
        const hay = [
          item.title,
          item.organization,
          item.category,
          item.state,
          item.location,
          item.qualification,
          item.summary,
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const trackerMap = new Map<number, typeof userJobTrackers.$inferSelect>();
    if (req.dbUser) {
      const trackers = await db
        .select()
        .from(userJobTrackers)
        .where(eq(userJobTrackers.userId, req.dbUser.id));
      trackers.forEach((t) => trackerMap.set(t.jobId, t));
    }

    res.json({
      jobs: filtered.map((item) => ({
        ...item,
        tracker: trackerMap.get(item.id) ?? null,
      })),
    });
  } catch (error) {
    console.error('List jobs error:', error);
    res.status(500).json({ error: 'Unable to load job & career pathways.' });
  }
});

// Single Job Detail
router.get('/jobs/:slug', optionalAuth, async (req: AuthRequest, res) => {
  try {
    await initBaselineOnce();

    const slug = String(req.params.slug ?? '').trim();
    const rows = await db.select().from(jobs).where(eq(jobs.slug, slug)).limit(1);
    const job = rows[0];
    if (!job) {
      res.status(404).json({ error: 'Job listing not found.' });
      return;
    }

    const isPublic = job.verificationStatus === 'verified' && job.publishStatus === 'published';
    if (!isPublic && req.dbUser?.role !== 'admin') {
      res.status(404).json({ error: 'Job listing not available.' });
      return;
    }

    let tracker = null;
    if (req.dbUser) {
      const tRows = await db
        .select()
        .from(userJobTrackers)
        .where(and(eq(userJobTrackers.userId, req.dbUser.id), eq(userJobTrackers.jobId, job.id)))
        .limit(1);
      tracker = tRows[0] ?? null;
    }

    res.json({ job, tracker });
  } catch (error) {
    console.error('Get job detail error:', error);
    res.status(500).json({ error: 'Unable to load job listing.' });
  }
});

// Student Saved & Tracked Jobs
router.get('/student/jobs/tracker', requireAuth, async (req: AuthRequest, res) => {
  try {
    const rows = await db
      .select({ tracker: userJobTrackers, job: jobs })
      .from(userJobTrackers)
      .innerJoin(jobs, eq(userJobTrackers.jobId, jobs.id))
      .where(eq(userJobTrackers.userId, req.dbUser!.id))
      .orderBy(desc(userJobTrackers.updatedAt));

    res.json({
      items: rows.map((r) => ({ ...r.tracker, job: r.job })),
    });
  } catch (error) {
    console.error('Load job trackers error:', error);
    res.status(500).json({ error: 'Unable to load saved jobs.' });
  }
});

router.put('/student/jobs/:jobId/tracker', requireAuth, async (req: AuthRequest, res) => {
  const jobId = Number(req.params.jobId);
  if (!Number.isInteger(jobId) || jobId <= 0) {
    res.status(400).json({ error: 'Invalid job ID.' });
    return;
  }

  const parsed = jobTrackerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid job tracker update.',
      issues: parsed.error.issues.map((i) => i.message),
    });
    return;
  }

  const data = parsed.data;
  try {
    const existingRows = await db
      .select()
      .from(userJobTrackers)
      .where(and(eq(userJobTrackers.userId, req.dbUser!.id), eq(userJobTrackers.jobId, jobId)))
      .limit(1);

    if (!existingRows[0]) {
      const inserted = await db
        .insert(userJobTrackers)
        .values({
          userId: req.dbUser!.id,
          jobId,
          isSaved: data.isSaved ?? true,
          status: data.status ?? 'Interested',
          reminderDate: data.reminderDate ?? null,
          notes: data.notes ?? null,
        })
        .returning();
      res.json({ tracker: inserted[0] });
      return;
    }

    const current = existingRows[0];
    const updated = await db
      .update(userJobTrackers)
      .set({
        isSaved: data.isSaved ?? current.isSaved,
        status: data.status ?? current.status,
        reminderDate: data.reminderDate !== undefined ? data.reminderDate : current.reminderDate,
        notes: data.notes !== undefined ? data.notes : current.notes,
        updatedAt: new Date(),
      })
      .where(eq(userJobTrackers.id, current.id))
      .returning();

    res.json({ tracker: updated[0] });
  } catch (error) {
    console.error('Update job tracker error:', error);
    res.status(500).json({ error: 'Failed to save job progress.' });
  }
});

router.delete('/student/jobs/:jobId/tracker', requireAuth, async (req: AuthRequest, res) => {
  const jobId = Number(req.params.jobId);
  if (!Number.isInteger(jobId) || jobId <= 0) {
    res.status(400).json({ error: 'Invalid job ID.' });
    return;
  }
  try {
    await db
      .delete(userJobTrackers)
      .where(and(eq(userJobTrackers.userId, req.dbUser!.id), eq(userJobTrackers.jobId, jobId)));
    res.json({ deleted: true });
  } catch (error) {
    console.error('Delete job tracker error:', error);
    res.status(500).json({ error: 'Failed to remove saved job.' });
  }
});

// Admin Job Management
router.get('/admin/jobs', requireAuth, requireAdmin, async (_req: AuthRequest, res) => {
  try {
    const rows = await db
      .select()
      .from(jobs)
      .orderBy(desc(jobs.updatedAt), desc(jobs.createdAt));
    res.json({ jobs: rows });
  } catch (error) {
    console.error('Admin list jobs error:', error);
    res.status(500).json({ error: 'Unable to load jobs directory.' });
  }
});

router.post('/admin/jobs', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const parsed = adminJobSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Validation failed for job listing.',
      issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    });
    return;
  }

  try {
    const data = parsed.data;
    const inserted = await db
      .insert(jobs)
      .values({
        ...data,
        slug: slugify(data.title),
        deadlineDate: data.deadlineDate ?? null,
        verificationStatus: 'pending',
        publishStatus: 'draft',
        createdByUserId: req.dbUser!.id,
      })
      .returning();

    await db.insert(adminAuditLogs).values({
      actorUserId: req.dbUser!.id,
      action: 'JOB_CREATED',
      entityType: 'job',
      entityId: String(inserted[0].id),
      details: { title: inserted[0].title },
    });

    res.status(201).json({ job: inserted[0] });
  } catch (error) {
    console.error('Admin create job error:', error);
    res.status(500).json({ error: 'Failed to create job listing.' });
  }
});

router.put('/admin/jobs/:id', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid job ID.' });
    return;
  }

  const parsed = adminJobSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Validation failed for job update.',
      issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    });
    return;
  }

  try {
    const updated = await db
      .update(jobs)
      .set({
        ...parsed.data,
        deadlineDate: parsed.data.deadlineDate ?? null,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, id))
      .returning();

    if (!updated[0]) {
      res.status(404).json({ error: 'Job listing not found.' });
      return;
    }

    await db.insert(adminAuditLogs).values({
      actorUserId: req.dbUser!.id,
      action: 'JOB_UPDATED',
      entityType: 'job',
      entityId: String(id),
      details: { title: updated[0].title },
    });

    res.json({ job: updated[0] });
  } catch (error) {
    console.error('Admin update job error:', error);
    res.status(500).json({ error: 'Failed to update job listing.' });
  }
});

router.post('/admin/jobs/:id/workflow', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid job ID.' });
    return;
  }

  const parsed = workflowSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid workflow action.' });
    return;
  }

  try {
    const existingRows = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    const existing = existingRows[0];
    if (!existing) {
      res.status(404).json({ error: 'Job listing not found.' });
      return;
    }

    const { action, note } = parsed.data;
    const patch: Partial<typeof jobs.$inferInsert> = { updatedAt: new Date() };
    const nextReview = new Date();
    nextReview.setMonth(nextReview.getMonth() + 3);

    if (action === 'verify') {
      patch.verificationStatus = 'verified';
      patch.lastVerifiedAt = new Date();
      patch.nextReviewAt = nextReview;
      patch.verifiedByUserId = req.dbUser!.id;
    } else if (action === 'publish') {
      if (existing.verificationStatus !== 'verified') {
        res.status(400).json({ error: 'Verify official notification before publishing.' });
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
    } else if (action === 'archive') {
      patch.publishStatus = 'archived';
    }

    const updated = await db.update(jobs).set(patch).where(eq(jobs.id, id)).returning();

    await db.insert(adminAuditLogs).values({
      actorUserId: req.dbUser!.id,
      action: `JOB_${action.toUpperCase()}`,
      entityType: 'job',
      entityId: String(id),
      details: { title: updated[0].title, note: note ?? null },
    });

    res.json({ job: updated[0] });
  } catch (error) {
    console.error('Admin job workflow error:', error);
    res.status(500).json({ error: 'Failed to update job workflow.' });
  }
});

export default router;
