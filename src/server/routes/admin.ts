import { Router } from 'express';
import { count, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/index.ts';
import {
  adminAuditLogs,
  notifications,
  scholarshipApplications,
  scholarships,
  userNotificationPreferences,
  users,
} from '../../db/schema.ts';
import { requireAdmin, requireAuth, type AuthRequest } from '../../middleware/auth.ts';

const router = Router();

const scholarshipInputSchema = z.object({
  title: z.string().trim().min(5).max(200),
  providerName: z.string().trim().min(2).max(200),
  providerType: z.enum([
    'Government - Central',
    'Government - State',
    'Private / Foundation',
    'Institutional',
  ]),
  department: z.string().trim().max(180).nullable().optional(),
  category: z.enum([
    'Government',
    'State',
    'Central',
    'Private',
    'Merit-based',
    'Need-based',
    'Minority',
    'Disability',
  ]),
  state: z.string().trim().min(2).max(80).default('All India'),
  district: z.string().trim().max(80).nullable().optional(),
  educationLevels: z.array(z.string().trim().min(1)).min(1),
  eligibleCourses: z.array(z.string().trim().min(1)).min(1),
  minMarksPercentage: z.number().min(0).max(100).nullable().optional(),
  maxFamilyIncome: z.number().int().min(0).nullable().optional(),
  eligibleCategories: z.array(z.string().trim().min(1)).min(1),
  requiresDisability: z.boolean().default(false),
  summary: z.string().trim().min(10).max(500),
  overview: z.string().trim().min(10).max(4000),
  whoCanApply: z.string().trim().min(10).max(2000),
  eligibilityDetails: z.string().trim().min(10).max(3000),
  benefitsSummary: z.string().trim().min(5).max(1500),
  requiredDocuments: z.array(z.string().trim().min(1)).min(1),
  applicationProcedure: z.string().trim().min(10).max(4000),
  importantDatesText: z.string().trim().max(500).nullable().optional(),
  deadlineDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Deadline must use YYYY-MM-DD format')
    .nullable()
    .optional(),
  officialSourceName: z.string().trim().min(2).max(200),
  officialSourceUrl: z.string().url('Official source URL must be valid'),
  officialApplyUrl: z.string().url('Official application URL must be valid'),
});

const workflowActionSchema = z.object({
  action: z.enum(['verify', 'publish', 'verify_and_publish', 'unpublish', 'reject', 'archive']),
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

router.use('/admin', requireAuth, requireAdmin);

router.get('/admin/overview', async (_req: AuthRequest, res) => {
  try {
    const [
      totalScholarshipsRows,
      publishedRows,
      pendingRows,
      totalStudentsRows,
      totalAppsRows,
      recentLogs,
      recentUsers,
    ] = await Promise.all([
      db.select({ value: count() }).from(scholarships),
      db
        .select({ value: count() })
        .from(scholarships)
        .where(eq(scholarships.publishStatus, 'published')),
      db
        .select({ value: count() })
        .from(scholarships)
        .where(eq(scholarships.verificationStatus, 'pending')),
      db.select({ value: count() }).from(users).where(eq(users.role, 'student')),
      db.select({ value: count() }).from(scholarshipApplications),
      db
        .select({
          log: adminAuditLogs,
          actorName: users.displayName,
          actorEmail: users.email,
        })
        .from(adminAuditLogs)
        .innerJoin(users, eq(adminAuditLogs.actorUserId, users.id))
        .orderBy(desc(adminAuditLogs.createdAt))
        .limit(25),
      db
        .select({
          id: users.id,
          displayName: users.displayName,
          email: users.email,
          role: users.role,
          onboardingCompleted: users.onboardingCompleted,
          isSuspended: users.isSuspended,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(20),
    ]);

    res.json({
      stats: {
        totalScholarships: Number(totalScholarshipsRows[0]?.value ?? 0),
        publishedScholarships: Number(publishedRows[0]?.value ?? 0),
        pendingVerification: Number(pendingRows[0]?.value ?? 0),
        registeredStudents: Number(totalStudentsRows[0]?.value ?? 0),
        trackedApplications: Number(totalAppsRows[0]?.value ?? 0),
      },
      auditLogs: recentLogs.map((r) => ({
        ...r.log,
        actorName: r.actorName,
        actorEmail: r.actorEmail,
      })),
      users: recentUsers,
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ error: 'Unable to load admin overview.' });
  }
});

router.get('/admin/scholarships', async (_req: AuthRequest, res) => {
  try {
    const rows = await db
      .select()
      .from(scholarships)
      .orderBy(desc(scholarships.updatedAt), desc(scholarships.createdAt));
    res.json({ scholarships: rows });
  } catch (error) {
    console.error('Admin list scholarships error:', error);
    res.status(500).json({ error: 'Unable to load admin scholarships.' });
  }
});

router.post('/admin/scholarships', async (req: AuthRequest, res) => {
  const parsed = scholarshipInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Validation failed for scholarship record.',
      issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    });
    return;
  }

  const data = parsed.data;
  try {
    const inserted = await db
      .insert(scholarships)
      .values({
        ...data,
        slug: slugify(data.title),
        department: data.department ?? null,
        district: data.district ?? null,
        minMarksPercentage: data.minMarksPercentage ?? null,
        maxFamilyIncome: data.maxFamilyIncome ?? null,
        importantDatesText: data.importantDatesText ?? null,
        deadlineDate: data.deadlineDate ?? null,
        verificationStatus: 'pending',
        publishStatus: 'draft',
        createdByUserId: req.dbUser!.id,
      })
      .returning();

    const record = inserted[0];

    await db.insert(adminAuditLogs).values({
      actorUserId: req.dbUser!.id,
      action: 'SCHOLARSHIP_CREATED',
      entityType: 'scholarship',
      entityId: String(record.id),
      details: { title: record.title, officialSourceUrl: record.officialSourceUrl },
    });

    res.status(201).json({ scholarship: record });
  } catch (error) {
    console.error('Admin create scholarship error:', error);
    res.status(500).json({ error: 'Failed to create scholarship record.' });
  }
});

router.put('/admin/scholarships/:id', async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid scholarship ID.' });
    return;
  }

  const parsed = scholarshipInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Validation failed for scholarship update.',
      issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    });
    return;
  }

  try {
    const updated = await db
      .update(scholarships)
      .set({
        ...parsed.data,
        department: parsed.data.department ?? null,
        district: parsed.data.district ?? null,
        minMarksPercentage: parsed.data.minMarksPercentage ?? null,
        maxFamilyIncome: parsed.data.maxFamilyIncome ?? null,
        importantDatesText: parsed.data.importantDatesText ?? null,
        deadlineDate: parsed.data.deadlineDate ?? null,
        updatedAt: new Date(),
      })
      .where(eq(scholarships.id, id))
      .returning();

    if (!updated[0]) {
      res.status(404).json({ error: 'Scholarship not found.' });
      return;
    }

    await db.insert(adminAuditLogs).values({
      actorUserId: req.dbUser!.id,
      action: 'SCHOLARSHIP_UPDATED',
      entityType: 'scholarship',
      entityId: String(id),
      details: { title: updated[0].title },
    });

    res.json({ scholarship: updated[0] });
  } catch (error) {
    console.error('Admin update scholarship error:', error);
    res.status(500).json({ error: 'Failed to update scholarship.' });
  }
});

router.post('/admin/scholarships/:id/workflow', async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid scholarship ID.' });
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
      .from(scholarships)
      .where(eq(scholarships.id, id))
      .limit(1);

    const existing = existingRows[0];
    if (!existing) {
      res.status(404).json({ error: 'Scholarship not found.' });
      return;
    }

    const { action, note } = parsed.data;
    const patch: Partial<typeof scholarships.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (action === 'verify') {
      patch.verificationStatus = 'verified';
      patch.lastVerifiedAt = new Date();
      patch.verifiedByUserId = req.dbUser!.id;
    } else if (action === 'publish') {
      if (existing.verificationStatus !== 'verified') {
        res.status(400).json({
          error: 'Verify the official source before publishing this scholarship.',
        });
        return;
      }
      patch.publishStatus = 'published';
    } else if (action === 'verify_and_publish') {
      patch.verificationStatus = 'verified';
      patch.publishStatus = 'published';
      patch.lastVerifiedAt = new Date();
      patch.verifiedByUserId = req.dbUser!.id;
    } else if (action === 'unpublish') {
      patch.publishStatus = 'unpublished';
    } else if (action === 'reject') {
      patch.verificationStatus = 'rejected';
      patch.publishStatus = 'unpublished';
    } else if (action === 'archive') {
      patch.publishStatus = 'archived';
    }

    const updated = await db
      .update(scholarships)
      .set(patch)
      .where(eq(scholarships.id, id))
      .returning();

    const result = updated[0];

    await db.insert(adminAuditLogs).values({
      actorUserId: req.dbUser!.id,
      action: `SCHOLARSHIP_${action.toUpperCase()}`,
      entityType: 'scholarship',
      entityId: String(id),
      details: { title: result.title, note: note ?? null },
    });

    if (action === 'publish' || action === 'verify_and_publish') {
      const recipients = await db
        .select({ userId: users.id })
        .from(users)
        .leftJoin(userNotificationPreferences, eq(users.id, userNotificationPreferences.userId))
        .where(eq(users.role, 'student'));

      if (recipients.length > 0) {
        await db.insert(notifications).values(
          recipients.map((r) => ({
            userId: r.userId,
            type: 'scholarship_published',
            title: 'New Verified Scholarship Published',
            message: `${result.title} (${result.state}) has been verified and added to Bharat Connect.`,
            linkUrl: `/scholarships/${result.slug}`,
          }))
        );
      }
    }

    res.json({ scholarship: result });
  } catch (error) {
    console.error('Admin workflow action error:', error);
    res.status(500).json({ error: 'Failed to execute scholarship workflow transition.' });
  }
});

export default router;
