import { Router } from 'express';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/index.ts';
import { adminAuditLogs, exams, userExamTrackers } from '../../db/schema.ts';
import { optionalAuth, requireAdmin, requireAuth, type AuthRequest } from '../../middleware/auth.ts';
import { initBaselineOnce } from './public.ts';

const router = Router();

const examTrackerSchema = z.object({
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
  checkedDocuments: z.array(z.number().int().min(0)).optional(),
  completedSteps: z.array(z.number().int().min(0)).optional(),
  reminderDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
    .nullable()
    .optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

const adminExamSchema = z.object({
  examName: z.string().trim().min(2).max(120),
  fullName: z.string().trim().min(4).max(240),
  category: z.string().trim().min(2).max(100),
  subcategory: z.string().trim().min(2).max(120),
  conductingAuthority: z.string().trim().min(2).max(200),
  jurisdiction: z.enum(['Central', 'State', 'Private / Deemed']).default('Central'),
  state: z.string().trim().min(2).max(80).default('All India'),
  examPurpose: z.string().trim().min(10).max(2000),
  whoShouldApply: z.string().trim().min(5).max(1500),
  eligibility: z.string().trim().min(5).max(2000),
  ageLimit: z.string().trim().min(2).max(500),
  qualificationRequirements: z.string().trim().min(2).max(1000),
  examPattern: z.string().trim().min(5).max(2000),
  syllabusSummary: z.string().trim().min(5).max(2000),
  importantDatesText: z.string().trim().min(5).max(1000),
  nextExamDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  registrationInfo: z.string().trim().min(5).max(1000),
  applicationFee: z.string().trim().min(2).max(600),
  requiredDocuments: z.array(z.string().trim().min(1)).min(1),
  applicationSteps: z.array(z.string().trim().min(1)).min(1),
  admitCardInfo: z.string().trim().min(5).max(1000),
  prepResources: z
    .array(
      z.object({
        title: z.string().trim().min(2),
        url: z.string().url(),
        source: z.string().trim().min(2),
      })
    )
    .default([]),
  previousPapersInfo: z.string().trim().min(5).max(1000),
  previousPapersUrl: z.string().url().nullable().optional(),
  resultsInfo: z.string().trim().min(5).max(1000),
  counsellingProcess: z.string().trim().min(5).max(1500),
  officialWebsiteUrl: z.string().url(),
  officialApplyUrl: z.string().url(),
  officialNotificationUrl: z.string().url(),
});

const workflowSchema = z.object({
  action: z.enum(['verify', 'publish', 'verify_and_publish', 'unpublish', 'reject', 'archive']),
  note: z.string().trim().max(500).optional(),
});

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

// Public Exams List
router.get('/exams', optionalAuth, async (req: AuthRequest, res) => {
  try {
    await initBaselineOnce();

    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const subcategory =
      typeof req.query.subcategory === 'string' ? req.query.subcategory.trim() : '';
    const state = typeof req.query.state === 'string' ? req.query.state.trim() : '';
    const jurisdiction =
      typeof req.query.jurisdiction === 'string' ? req.query.jurisdiction.trim() : '';

    const rows = await db
      .select()
      .from(exams)
      .where(and(eq(exams.verificationStatus, 'verified'), eq(exams.publishStatus, 'published')))
      .orderBy(desc(exams.lastVerifiedAt), exams.examName);

    const filtered = rows.filter((item) => {
      const itemTags = (item.tags ?? []).map((t) => t.toLowerCase());

      if (category && category !== 'All') {
        const catLower = category.toLowerCase();
        const catMatch =
          item.category.toLowerCase() === catLower ||
          itemTags.includes(catLower) ||
          (catLower === 'medical' &&
            (item.category.toLowerCase() === 'medical & healthcare' ||
              itemTags.includes('medical'))) ||
          (catLower === 'karnataka' &&
            (item.state.toLowerCase() === 'karnataka' || itemTags.includes('karnataka'))) ||
          (catLower === 'state exams' &&
            (item.jurisdiction === 'State' ||
              item.category.toLowerCase() === 'state examinations' ||
              itemTags.includes('state exams'))) ||
          (catLower === 'government jobs' &&
            (itemTags.includes('government jobs') ||
              ['upsc', 'ssc', 'banking', 'railway', 'defence'].includes(
                item.category.toLowerCase()
              ))) ||
          (catLower === 'professional exams' &&
            (item.category.toLowerCase() === 'professional entrances' ||
              itemTags.includes('professional exams')));
        if (!catMatch) return false;
      }

      if (subcategory && subcategory !== 'All') {
        const subLower = subcategory.toLowerCase();
        const subMatch =
          itemTags.includes(subLower) ||
          item.subcategory.toLowerCase().includes(subLower) ||
          (subLower === 'state' && item.jurisdiction === 'State') ||
          (subLower === 'aiims & ini' &&
            (itemTags.includes('aiims & ini') ||
              item.examName.toLowerCase().includes('ini') ||
              item.examName.toLowerCase().includes('aiims')));
        if (!subMatch) return false;
      }

      if (state && state !== 'All') {
        if (item.state.toLowerCase() !== state.toLowerCase() && item.state !== 'All India') {
          return false;
        }
      }
      if (jurisdiction && jurisdiction !== 'All') {
        if (item.jurisdiction.toLowerCase() !== jurisdiction.toLowerCase()) return false;
      }
      if (q) {
        const hay = [
          item.examName,
          item.fullName,
          item.category,
          item.subcategory,
          ...(item.tags ?? []),
          item.conductingAuthority,
          item.state,
          item.examPurpose,
          item.whoShouldApply,
          item.syllabusSummary,
          item.counsellingProcess,
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const trackerMap = new Map<number, typeof userExamTrackers.$inferSelect>();
    if (req.dbUser) {
      const trackers = await db
        .select()
        .from(userExamTrackers)
        .where(eq(userExamTrackers.userId, req.dbUser.id));
      trackers.forEach((t) => trackerMap.set(t.examId, t));
    }

    res.json({
      exams: filtered.map((item) => ({
        ...item,
        tracker: trackerMap.get(item.id) ?? null,
      })),
    });
  } catch (error) {
    console.error('List exams error:', error);
    res.status(500).json({ error: 'Unable to load competitive exams.' });
  }
});

// Single Exam Detail
router.get('/exams/:slug', optionalAuth, async (req: AuthRequest, res) => {
  try {
    await initBaselineOnce();

    const slug = String(req.params.slug ?? '').trim();
    const rows = await db.select().from(exams).where(eq(exams.slug, slug)).limit(1);
    const exam = rows[0];
    if (!exam) {
      res.status(404).json({ error: 'Exam guide not found.' });
      return;
    }

    const isPublic = exam.verificationStatus === 'verified' && exam.publishStatus === 'published';
    if (!isPublic && req.dbUser?.role !== 'admin') {
      res.status(404).json({ error: 'Exam guide not available.' });
      return;
    }

    let tracker = null;
    if (req.dbUser) {
      const tRows = await db
        .select()
        .from(userExamTrackers)
        .where(and(eq(userExamTrackers.userId, req.dbUser.id), eq(userExamTrackers.examId, exam.id)))
        .limit(1);
      tracker = tRows[0] ?? null;
    }

    res.json({ exam, tracker });
  } catch (error) {
    console.error('Get exam detail error:', error);
    res.status(500).json({ error: 'Unable to load exam guide.' });
  }
});

// Student Saved & Tracked Exams
router.get('/student/exams/tracker', requireAuth, async (req: AuthRequest, res) => {
  try {
    const rows = await db
      .select({ tracker: userExamTrackers, exam: exams })
      .from(userExamTrackers)
      .innerJoin(exams, eq(userExamTrackers.examId, exams.id))
      .where(eq(userExamTrackers.userId, req.dbUser!.id))
      .orderBy(desc(userExamTrackers.updatedAt));

    res.json({
      items: rows.map((r) => ({ ...r.tracker, exam: r.exam })),
    });
  } catch (error) {
    console.error('Load exam trackers error:', error);
    res.status(500).json({ error: 'Unable to load saved exams.' });
  }
});

router.put('/student/exams/:examId/tracker', requireAuth, async (req: AuthRequest, res) => {
  const examId = Number(req.params.examId);
  if (!Number.isInteger(examId) || examId <= 0) {
    res.status(400).json({ error: 'Invalid exam ID.' });
    return;
  }

  const parsed = examTrackerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid exam tracker update.',
      issues: parsed.error.issues.map((i) => i.message),
    });
    return;
  }

  const data = parsed.data;
  try {
    const existingRows = await db
      .select()
      .from(userExamTrackers)
      .where(and(eq(userExamTrackers.userId, req.dbUser!.id), eq(userExamTrackers.examId, examId)))
      .limit(1);

    if (!existingRows[0]) {
      const inserted = await db
        .insert(userExamTrackers)
        .values({
          userId: req.dbUser!.id,
          examId,
          isSaved: data.isSaved ?? true,
          status: data.status ?? 'Interested',
          checkedDocuments: data.checkedDocuments ?? [],
          completedSteps: data.completedSteps ?? [],
          reminderDate: data.reminderDate ?? null,
          notes: data.notes ?? null,
        })
        .returning();
      res.json({ tracker: inserted[0] });
      return;
    }

    const current = existingRows[0];
    const updated = await db
      .update(userExamTrackers)
      .set({
        isSaved: data.isSaved ?? current.isSaved,
        status: data.status ?? current.status,
        checkedDocuments: data.checkedDocuments ?? current.checkedDocuments,
        completedSteps: data.completedSteps ?? current.completedSteps,
        reminderDate: data.reminderDate !== undefined ? data.reminderDate : current.reminderDate,
        notes: data.notes !== undefined ? data.notes : current.notes,
        updatedAt: new Date(),
      })
      .where(eq(userExamTrackers.id, current.id))
      .returning();

    res.json({ tracker: updated[0] });
  } catch (error) {
    console.error('Update exam tracker error:', error);
    res.status(500).json({ error: 'Failed to save exam progress.' });
  }
});

router.delete('/student/exams/:examId/tracker', requireAuth, async (req: AuthRequest, res) => {
  const examId = Number(req.params.examId);
  if (!Number.isInteger(examId) || examId <= 0) {
    res.status(400).json({ error: 'Invalid exam ID.' });
    return;
  }
  try {
    await db
      .delete(userExamTrackers)
      .where(and(eq(userExamTrackers.userId, req.dbUser!.id), eq(userExamTrackers.examId, examId)));
    res.json({ deleted: true });
  } catch (error) {
    console.error('Delete exam tracker error:', error);
    res.status(500).json({ error: 'Failed to remove exam.' });
  }
});

// Admin Exam Management
router.get('/admin/exams', requireAuth, requireAdmin, async (_req: AuthRequest, res) => {
  try {
    const rows = await db
      .select()
      .from(exams)
      .orderBy(desc(exams.updatedAt), desc(exams.createdAt));
    res.json({ exams: rows });
  } catch (error) {
    console.error('Admin list exams error:', error);
    res.status(500).json({ error: 'Unable to load exams directory.' });
  }
});

router.post('/admin/exams', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const parsed = adminExamSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Validation failed for exam record.',
      issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    });
    return;
  }

  try {
    const data = parsed.data;
    const inserted = await db
      .insert(exams)
      .values({
        ...data,
        slug: slugify(data.examName),
        nextExamDate: data.nextExamDate ?? null,
        previousPapersUrl: data.previousPapersUrl ?? null,
        verificationStatus: 'pending',
        publishStatus: 'draft',
        createdByUserId: req.dbUser!.id,
      })
      .returning();

    await db.insert(adminAuditLogs).values({
      actorUserId: req.dbUser!.id,
      action: 'EXAM_CREATED',
      entityType: 'exam',
      entityId: String(inserted[0].id),
      details: { examName: inserted[0].examName, officialWebsiteUrl: inserted[0].officialWebsiteUrl },
    });

    res.status(201).json({ exam: inserted[0] });
  } catch (error) {
    console.error('Admin create exam error:', error);
    res.status(500).json({ error: 'Failed to create exam record.' });
  }
});

router.put('/admin/exams/:id', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid exam ID.' });
    return;
  }

  const parsed = adminExamSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Validation failed for exam update.',
      issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    });
    return;
  }

  try {
    const updated = await db
      .update(exams)
      .set({
        ...parsed.data,
        nextExamDate: parsed.data.nextExamDate ?? null,
        previousPapersUrl: parsed.data.previousPapersUrl ?? null,
        updatedAt: new Date(),
      })
      .where(eq(exams.id, id))
      .returning();

    if (!updated[0]) {
      res.status(404).json({ error: 'Exam not found.' });
      return;
    }

    await db.insert(adminAuditLogs).values({
      actorUserId: req.dbUser!.id,
      action: 'EXAM_UPDATED',
      entityType: 'exam',
      entityId: String(id),
      details: { examName: updated[0].examName },
    });

    res.json({ exam: updated[0] });
  } catch (error) {
    console.error('Admin update exam error:', error);
    res.status(500).json({ error: 'Failed to update exam.' });
  }
});

router.post('/admin/exams/:id/workflow', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid exam ID.' });
    return;
  }

  const parsed = workflowSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid workflow action.' });
    return;
  }

  try {
    const existingRows = await db.select().from(exams).where(eq(exams.id, id)).limit(1);
    const existing = existingRows[0];
    if (!existing) {
      res.status(404).json({ error: 'Exam not found.' });
      return;
    }

    const { action, note } = parsed.data;
    const patch: Partial<typeof exams.$inferInsert> = { updatedAt: new Date() };
    const nextReview = new Date();
    nextReview.setMonth(nextReview.getMonth() + 3);

    if (action === 'verify') {
      patch.verificationStatus = 'verified';
      patch.lastVerifiedAt = new Date();
      patch.nextReviewAt = nextReview;
      patch.verifiedByUserId = req.dbUser!.id;
    } else if (action === 'publish') {
      if (existing.verificationStatus !== 'verified') {
        res.status(400).json({ error: 'Verify official exam source before publishing.' });
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

    const updated = await db.update(exams).set(patch).where(eq(exams.id, id)).returning();

    await db.insert(adminAuditLogs).values({
      actorUserId: req.dbUser!.id,
      action: `EXAM_${action.toUpperCase()}`,
      entityType: 'exam',
      entityId: String(id),
      details: { examName: updated[0].examName, note: note ?? null },
    });

    res.json({ exam: updated[0] });
  } catch (error) {
    console.error('Admin exam workflow error:', error);
    res.status(500).json({ error: 'Failed to update exam workflow.' });
  }
});

export default router;
