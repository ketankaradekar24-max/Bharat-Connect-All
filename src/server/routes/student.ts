import { Router } from 'express';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/index.ts';
import {
  notifications,
  savedScholarships,
  scholarshipApplications,
  scholarships,
  studentProfiles,
  userNotificationPreferences,
} from '../../db/schema.ts';
import { requireAuth, type AuthRequest } from '../../middleware/auth.ts';
import { computeProfileCompletion, evaluateEligibility } from '../../services/eligibility.ts';

const router = Router();

const APPLICATION_STATUSES = [
  'Interested',
  'Preparing Documents',
  'Ready to Apply',
  'Applied',
  'Under Review',
  'Approved',
  'Rejected',
  'Closed',
] as const;

const createApplicationSchema = z.object({
  scholarshipId: z.number().int().positive(),
  status: z.enum(APPLICATION_STATUSES).default('Interested'),
  notes: z.string().trim().max(2000).optional(),
});

const updateApplicationSchema = z.object({
  status: z.enum(APPLICATION_STATUSES).optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

const notificationPrefsSchema = z.object({
  inAppNewScholarships: z.boolean(),
  inAppDeadlineReminders: z.boolean(),
  inAppAnnouncements: z.boolean(),
});

router.use('/student', requireAuth);

router.get('/student/dashboard', async (req: AuthRequest, res) => {
  try {
    const userId = req.dbUser!.id;

    const [profileRows, publishedScholarships, savedRows, appRows, notifRows] = await Promise.all([
      db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId)).limit(1),
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
        .select({
          saved: savedScholarships,
          scholarship: scholarships,
        })
        .from(savedScholarships)
        .innerJoin(scholarships, eq(savedScholarships.scholarshipId, scholarships.id))
        .where(eq(savedScholarships.userId, userId))
        .orderBy(desc(savedScholarships.createdAt)),
      db
        .select({
          application: scholarshipApplications,
          scholarship: scholarships,
        })
        .from(scholarshipApplications)
        .innerJoin(scholarships, eq(scholarshipApplications.scholarshipId, scholarships.id))
        .where(eq(scholarshipApplications.userId, userId))
        .orderBy(desc(scholarshipApplications.updatedAt)),
      db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(20),
    ]);

    const profile = profileRows[0] ?? null;
    const profileCompletion = computeProfileCompletion(profile);

    const evaluated = publishedScholarships.map((item) => ({
      ...item,
      eligibility: evaluateEligibility(profile, item),
    }));

    const recommended = evaluated.filter(
      (s) => s.eligibility.outcome !== 'Not Eligible'
    );

    const upcomingDeadlines = publishedScholarships
      .filter((s) => Boolean(s.deadlineDate))
      .sort((a, b) => (a.deadlineDate ?? '').localeCompare(b.deadlineDate ?? ''))
      .slice(0, 5);

    const nextSteps: Array<{ title: string; description: string; actionTab: string }> = [];
    if (profileCompletion.percentage < 100) {
      nextSteps.push({
        title: 'Complete your student profile',
        description: `Missing: ${profileCompletion.missingFields.slice(0, 4).join(', ')}`,
        actionTab: 'profile',
      });
    }
    if (appRows.length === 0) {
      nextSteps.push({
        title: 'Start tracking an eligible scholarship',
        description: 'Explore verified portals and save or track applications you plan to submit.',
        actionTab: 'scholarships',
      });
    }
    const preparing = appRows.filter(
      (a) => a.application.status === 'Preparing Documents' || a.application.status === 'Interested'
    );
    if (preparing.length > 0) {
      nextSteps.push({
        title: `Review documents for ${preparing[0].scholarship.title}`,
        description: 'Confirm certificates and apply directly on the official portal before cutoff.',
        actionTab: 'applications',
      });
    }

    res.json({
      profile,
      profileCompletion,
      recommended: recommended.slice(0, 6),
      recentOpportunities: evaluated.slice(0, 4),
      saved: savedRows.map((r) => ({ ...r.scholarship, savedAt: r.saved.createdAt })),
      applications: appRows.map((r) => ({ ...r.application, scholarship: r.scholarship })),
      upcomingDeadlines,
      notifications: notifRows,
      unreadCount: notifRows.filter((n) => !n.isRead).length,
      nextSteps,
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ error: 'Unable to load student dashboard.' });
  }
});

router.post('/student/saved/:scholarshipId', async (req: AuthRequest, res) => {
  const scholarshipId = Number(req.params.scholarshipId);
  if (!Number.isInteger(scholarshipId) || scholarshipId <= 0) {
    res.status(400).json({ error: 'Invalid scholarship ID.' });
    return;
  }

  try {
    await db
      .insert(savedScholarships)
      .values({ userId: req.dbUser!.id, scholarshipId })
      .onConflictDoNothing();
    res.json({ saved: true });
  } catch (error) {
    console.error('Save scholarship error:', error);
    res.status(500).json({ error: 'Failed to save scholarship.' });
  }
});

router.delete('/student/saved/:scholarshipId', async (req: AuthRequest, res) => {
  const scholarshipId = Number(req.params.scholarshipId);
  if (!Number.isInteger(scholarshipId) || scholarshipId <= 0) {
    res.status(400).json({ error: 'Invalid scholarship ID.' });
    return;
  }

  try {
    await db
      .delete(savedScholarships)
      .where(
        and(
          eq(savedScholarships.userId, req.dbUser!.id),
          eq(savedScholarships.scholarshipId, scholarshipId)
        )
      );
    res.json({ saved: false });
  } catch (error) {
    console.error('Unsave scholarship error:', error);
    res.status(500).json({ error: 'Failed to remove saved scholarship.' });
  }
});

router.get('/student/applications', async (req: AuthRequest, res) => {
  try {
    const rows = await db
      .select({
        application: scholarshipApplications,
        scholarship: scholarships,
      })
      .from(scholarshipApplications)
      .innerJoin(scholarships, eq(scholarshipApplications.scholarshipId, scholarships.id))
      .where(eq(scholarshipApplications.userId, req.dbUser!.id))
      .orderBy(desc(scholarshipApplications.updatedAt));

    res.json({
      applications: rows.map((r) => ({ ...r.application, scholarship: r.scholarship })),
    });
  } catch (error) {
    console.error('List applications error:', error);
    res.status(500).json({ error: 'Unable to load applications.' });
  }
});

router.post('/student/applications', async (req: AuthRequest, res) => {
  const parsed = createApplicationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid application payload.' });
    return;
  }

  const { scholarshipId, status, notes } = parsed.data;
  const nowIso = new Date().toISOString();

  try {
    const existing = await db
      .select()
      .from(scholarshipApplications)
      .where(
        and(
          eq(scholarshipApplications.userId, req.dbUser!.id),
          eq(scholarshipApplications.scholarshipId, scholarshipId)
        )
      )
      .limit(1);

    if (existing[0]) {
      res.json({ application: existing[0] });
      return;
    }

    const inserted = await db
      .insert(scholarshipApplications)
      .values({
        userId: req.dbUser!.id,
        scholarshipId,
        status,
        notes: notes ?? null,
        statusHistory: [{ status, note: notes, changedAt: nowIso }],
      })
      .returning();

    res.status(201).json({ application: inserted[0] });
  } catch (error) {
    console.error('Create tracked application error:', error);
    res.status(500).json({ error: 'Failed to track application.' });
  }
});

router.patch('/student/applications/:id', async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid application ID.' });
    return;
  }

  const parsed = updateApplicationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid application update.' });
    return;
  }

  try {
    const existingRows = await db
      .select()
      .from(scholarshipApplications)
      .where(
        and(
          eq(scholarshipApplications.id, id),
          eq(scholarshipApplications.userId, req.dbUser!.id)
        )
      )
      .limit(1);

    const current = existingRows[0];
    if (!current) {
      res.status(404).json({ error: 'Tracked application not found.' });
      return;
    }

    const nextStatus = parsed.data.status ?? current.status;
    const nextNotes =
      parsed.data.notes !== undefined ? parsed.data.notes : current.notes;

    const history = [...(current.statusHistory ?? [])];
    if (parsed.data.status && parsed.data.status !== current.status) {
      history.push({
        status: nextStatus,
        note: parsed.data.notes ?? undefined,
        changedAt: new Date().toISOString(),
      });
    }

    const updated = await db
      .update(scholarshipApplications)
      .set({
        status: nextStatus,
        notes: nextNotes,
        statusHistory: history,
        updatedAt: new Date(),
      })
      .where(eq(scholarshipApplications.id, id))
      .returning();

    res.json({ application: updated[0] });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ error: 'Failed to update tracked application.' });
  }
});

router.delete('/student/applications/:id', async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid application ID.' });
    return;
  }

  try {
    await db
      .delete(scholarshipApplications)
      .where(
        and(
          eq(scholarshipApplications.id, id),
          eq(scholarshipApplications.userId, req.dbUser!.id)
        )
      );
    res.json({ deleted: true });
  } catch (error) {
    console.error('Delete tracked application error:', error);
    res.status(500).json({ error: 'Failed to remove tracked application.' });
  }
});

router.get('/student/notifications', async (req: AuthRequest, res) => {
  try {
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, req.dbUser!.id))
      .orderBy(desc(notifications.createdAt))
      .limit(30);
    res.json({ notifications: rows });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ error: 'Unable to load notifications.' });
  }
});

router.patch('/student/notifications/:id/read', async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid notification ID.' });
    return;
  }

  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, req.dbUser!.id)));
    res.json({ read: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to update notification.' });
  }
});

router.patch('/student/notifications/read-all', async (req: AuthRequest, res) => {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, req.dbUser!.id));
    res.json({ readAll: true });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Failed to update notifications.' });
  }
});

router.get('/student/notification-preferences', async (req: AuthRequest, res) => {
  try {
    const rows = await db
      .select()
      .from(userNotificationPreferences)
      .where(eq(userNotificationPreferences.userId, req.dbUser!.id))
      .limit(1);
    res.json({ preferences: rows[0] ?? null });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ error: 'Unable to load notification preferences.' });
  }
});

router.put('/student/notification-preferences', async (req: AuthRequest, res) => {
  const parsed = notificationPrefsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid notification preference payload.' });
    return;
  }

  try {
    const updated = await db
      .update(userNotificationPreferences)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(userNotificationPreferences.userId, req.dbUser!.id))
      .returning();
    res.json({ preferences: updated[0] });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ error: 'Failed to update notification preferences.' });
  }
});

export default router;
