import { Router } from 'express';
import { count, desc, eq, gte, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/index.ts';
import {
  adminAuditLogs,
  analyticsEvents,
  contentReports,
  users,
} from '../../db/schema.ts';
import {
  optionalAuth,
  requireAdmin,
  requireAuth,
  type AuthRequest,
} from '../../middleware/auth.ts';

const router = Router();

const createReportSchema = z.object({
  entityType: z.enum([
    'exam',
    'job',
    'service',
    'scholarship',
    'institution',
    'counselling',
    'scam',
    'general',
  ]),
  entitySlug: z.string().trim().max(180).nullable().optional(),
  entityTitle: z.string().trim().min(3).max(240),
  reportType: z.enum([
    'broken_link',
    'outdated_info',
    'incorrect_fee',
    'scam_alert',
    'other',
  ]),
  reportedUrl: z
    .string()
    .trim()
    .max(500)
    .nullable()
    .optional(),
  description: z.string().trim().min(10).max(2000),
  contactEmail: z
    .string()
    .trim()
    .email('Provide a valid email address if requesting follow-up')
    .max(160)
    .nullable()
    .optional()
    .or(z.literal('')),
});

const resolveReportSchema = z.object({
  status: z.enum(['open', 'investigating', 'resolved', 'dismissed']),
  resolutionNote: z.string().trim().max(1000).nullable().optional(),
});

const analyticsEventSchema = z.object({
  eventType: z.enum(['page_view', 'search', 'portal_click', 'guide_view']),
  path: z.string().trim().min(1).max(240),
  label: z.string().trim().max(240).nullable().optional(),
  visitorHash: z.string().trim().min(8).max(80),
});

// Public content/broken-link/scam reporting endpoint (optionalAuth so both citizens and signed-in users can report issues)
router.post('/reports/content', optionalAuth, async (req: AuthRequest, res) => {
  const parsed = createReportSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Please check the report details and provide at least 10 characters of description.',
      issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    });
    return;
  }

  const data = parsed.data;
  try {
    const inserted = await db
      .insert(contentReports)
      .values({
        userId: req.dbUser?.id ?? null,
        entityType: data.entityType,
        entitySlug: data.entitySlug ?? null,
        entityTitle: data.entityTitle,
        reportType: data.reportType,
        reportedUrl: data.reportedUrl || null,
        description: data.description,
        contactEmail: data.contactEmail ? data.contactEmail : null,
        status: 'open',
      })
      .returning();

    res.status(201).json({
      report: inserted[0],
      message: 'Thank you. Your report has been logged for verification review.',
    });
  } catch (error) {
    console.error('Content report submit error:', error);
    res.status(500).json({ error: 'Unable to submit report right now.' });
  }
});

// Privacy-conscious anonymous event logger (zero PII: no IP, no Aadhaar, no user emails)
router.post('/analytics/event', async (req, res) => {
  const parsed = analyticsEventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid analytics payload.' });
    return;
  }

  try {
    await db.insert(analyticsEvents).values({
      eventType: parsed.data.eventType,
      path: parsed.data.path.slice(0, 240),
      label: parsed.data.label ? parsed.data.label.slice(0, 240) : null,
      visitorHash: parsed.data.visitorHash.slice(0, 80),
    });
    res.status(202).json({ ok: true });
  } catch (error) {
    console.error('Analytics event insert error:', error);
    res.status(500).json({ error: 'Failed to log analytics event.' });
  }
});

// Admin: list content/scam/broken-link reports
router.get('/admin/content-reports', requireAuth, requireAdmin, async (_req: AuthRequest, res) => {
  try {
    const rows = await db
      .select()
      .from(contentReports)
      .orderBy(desc(contentReports.createdAt))
      .limit(100);
    res.json({ reports: rows });
  } catch (error) {
    console.error('List content reports error:', error);
    res.status(500).json({ error: 'Unable to load content reports.' });
  }
});

// Admin: update report status and resolution note
router.patch(
  '/admin/content-reports/:id',
  requireAuth,
  requireAdmin,
  async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid report ID.' });
      return;
    }

    const parsed = resolveReportSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid report resolution status.' });
      return;
    }

    try {
      const updated = await db
        .update(contentReports)
        .set({
          status: parsed.data.status,
          resolutionNote: parsed.data.resolutionNote ?? null,
          resolvedByUserId: req.dbUser!.id,
          updatedAt: new Date(),
        })
        .where(eq(contentReports.id, id))
        .returning();

      if (!updated[0]) {
        res.status(404).json({ error: 'Content report not found.' });
        return;
      }

      await db.insert(adminAuditLogs).values({
        actorUserId: req.dbUser!.id,
        action: `CONTENT_REPORT_${parsed.data.status.toUpperCase()}`,
        entityType: 'content_report',
        entityId: String(id),
        details: {
          entityTitle: updated[0].entityTitle,
          reportType: updated[0].reportType,
        },
      });

      res.json({ report: updated[0] });
    } catch (error) {
      console.error('Update content report error:', error);
      res.status(500).json({ error: 'Unable to update content report.' });
    }
  }
);

// Admin: Privacy-conscious real usage analytics (PostgreSQL backed, zero fabricated numbers)
router.get('/admin/analytics', requireAuth, requireAdmin, async (_req: AuthRequest, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalPageViewsRows,
      recentPageViewsRows,
      uniqueVisitorsRows,
      portalClicksRows,
      registeredUsersRows,
      topPathsRows,
      topSearchesRows,
    ] = await Promise.all([
      db
        .select({ value: count() })
        .from(analyticsEvents)
        .where(eq(analyticsEvents.eventType, 'page_view')),
      db
        .select({ value: count() })
        .from(analyticsEvents)
        .where(
          sql`${analyticsEvents.eventType} = 'page_view' AND ${analyticsEvents.createdAt} >= ${sevenDaysAgo}`
        ),
      db
        .select({ value: sql<number>`COUNT(DISTINCT ${analyticsEvents.visitorHash})` })
        .from(analyticsEvents),
      db
        .select({ value: count() })
        .from(analyticsEvents)
        .where(eq(analyticsEvents.eventType, 'portal_click')),
      db.select({ value: count() }).from(users),
      db
        .select({
          path: analyticsEvents.path,
          views: count(),
        })
        .from(analyticsEvents)
        .where(eq(analyticsEvents.eventType, 'page_view'))
        .groupBy(analyticsEvents.path)
        .orderBy(desc(count()))
        .limit(10),
      db
        .select({
          query: analyticsEvents.label,
          searches: count(),
        })
        .from(analyticsEvents)
        .where(
          sql`${analyticsEvents.eventType} = 'search' AND ${analyticsEvents.label} IS NOT NULL`
        )
        .groupBy(analyticsEvents.label)
        .orderBy(desc(count()))
        .limit(10),
    ]);

    res.json({
      analytics: {
        totalPageViews: Number(totalPageViewsRows[0]?.value ?? 0),
        last7DaysPageViews: Number(recentPageViewsRows[0]?.value ?? 0),
        uniqueAnonymousVisitors: Number(uniqueVisitorsRows[0]?.value ?? 0),
        officialPortalClicks: Number(portalClicksRows[0]?.value ?? 0),
        registeredUsers: Number(registeredUsersRows[0]?.value ?? 0),
        topPages: topPathsRows.map((r) => ({ path: r.path, views: Number(r.views) })),
        topSearches: topSearchesRows
          .filter((r) => Boolean(r.query))
          .map((r) => ({ query: r.query as string, count: Number(r.searches) })),
      },
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ error: 'Unable to load usage analytics.' });
  }
});

// Check gte import unused lint guard
void gte;

export default router;
