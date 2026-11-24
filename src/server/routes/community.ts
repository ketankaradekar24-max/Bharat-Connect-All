import { Router } from 'express';
import { and, desc, eq, ne, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/index.ts';
import {
  adminAuditLogs,
  communityBookmarks,
  communityPosts,
  communityReplies,
  communityReports,
  communityVotes,
} from '../../db/schema.ts';
import { optionalAuth, requireAdmin, requireAuth, type AuthRequest } from '../../middleware/auth.ts';

const router = Router();

const createPostSchema = z.object({
  category: z.string().trim().min(2).max(80),
  title: z.string().trim().min(8).max(180),
  body: z.string().trim().min(15).max(4000),
  tags: z.array(z.string().trim().min(1).max(40)).max(6).default([]),
});

const createReplySchema = z.object({
  body: z.string().trim().min(4).max(2500),
});

const voteSchema = z.object({
  targetType: z.enum(['post', 'reply']),
  targetId: z.number().int().positive(),
});

const reportSchema = z.object({
  targetType: z.enum(['post', 'reply']),
  targetId: z.number().int().positive(),
  reason: z.string().trim().min(5).max(500),
});

const moderateSchema = z.object({
  reportId: z.number().int().positive().optional(),
  targetType: z.enum(['post', 'reply']).optional(),
  targetId: z.number().int().positive().optional(),
  decision: z.enum(['hide', 'restore', 'dismiss_report', 'resolve_report']),
});

// Public List of Community Questions & Discussions
router.get('/community/posts', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const bookmarkedOnly = req.query.bookmarked === 'true';

    const rows = await db
      .select()
      .from(communityPosts)
      .where(ne(communityPosts.status, 'hidden'))
      .orderBy(desc(communityPosts.createdAt))
      .limit(100);

    const replyRows = await db
      .select({ postId: communityReplies.postId })
      .from(communityReplies)
      .where(ne(communityReplies.status, 'hidden'));

    const replyCountMap = new Map<number, number>();
    replyRows.forEach((r) => {
      replyCountMap.set(r.postId, (replyCountMap.get(r.postId) ?? 0) + 1);
    });

    const votedSet = new Set<number>();
    const bookmarkedSet = new Set<number>();
    if (req.dbUser) {
      const [votes, bookmarks] = await Promise.all([
        db
          .select()
          .from(communityVotes)
          .where(
            and(
              eq(communityVotes.userId, req.dbUser.id),
              eq(communityVotes.targetType, 'post')
            )
          ),
        db
          .select()
          .from(communityBookmarks)
          .where(eq(communityBookmarks.userId, req.dbUser.id)),
      ]);
      votes.forEach((v) => votedSet.add(v.targetId));
      bookmarks.forEach((b) => bookmarkedSet.add(b.postId));
    }

    const filtered = rows
      .filter((p) => {
        if (category && category !== 'All' && p.category.toLowerCase() !== category.toLowerCase()) {
          return false;
        }
        if (bookmarkedOnly && !bookmarkedSet.has(p.id)) {
          return false;
        }
        if (q) {
          const hay = [p.title, p.body, p.category, ...(p.tags ?? [])].join(' ').toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .map((p) => ({
        ...p,
        replyCount: replyCountMap.get(p.id) ?? 0,
        hasVoted: votedSet.has(p.id),
        isBookmarked: bookmarkedSet.has(p.id),
      }));

    res.json({ posts: filtered });
  } catch (error) {
    console.error('List community posts error:', error);
    res.status(500).json({ error: 'Unable to load community discussions.' });
  }
});

// Single Discussion Thread with Replies
router.get('/community/posts/:id', optionalAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid post ID.' });
    return;
  }

  try {
    const postRows = await db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.id, id))
      .limit(1);

    const post = postRows[0];
    if (!post || (post.status === 'hidden' && req.dbUser?.role !== 'admin')) {
      res.status(404).json({ error: 'Discussion not found.' });
      return;
    }

    const replyRows = await db
      .select()
      .from(communityReplies)
      .where(and(eq(communityReplies.postId, id), ne(communityReplies.status, 'hidden')))
      .orderBy(communityReplies.createdAt);

    let hasVotedPost = false;
    let isBookmarked = false;
    const votedReplies = new Set<number>();

    if (req.dbUser) {
      const [votes, bookmarks] = await Promise.all([
        db
          .select()
          .from(communityVotes)
          .where(eq(communityVotes.userId, req.dbUser.id)),
        db
          .select()
          .from(communityBookmarks)
          .where(and(eq(communityBookmarks.userId, req.dbUser.id), eq(communityBookmarks.postId, id))),
      ]);
      votes.forEach((v) => {
        if (v.targetType === 'post' && v.targetId === id) hasVotedPost = true;
        if (v.targetType === 'reply') votedReplies.add(v.targetId);
      });
      isBookmarked = bookmarks.length > 0;
    }

    res.json({
      post: {
        ...post,
        hasVoted: hasVotedPost,
        isBookmarked,
        replies: replyRows.map((r) => ({
          ...r,
          hasVoted: votedReplies.has(r.id),
        })),
      },
    });
  } catch (error) {
    console.error('Get community post error:', error);
    res.status(500).json({ error: 'Unable to load discussion.' });
  }
});

// Create Discussion Question
router.post('/community/posts', requireAuth, async (req: AuthRequest, res) => {
  const parsed = createPostSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Please check your question title and details.',
      issues: parsed.error.issues.map((i) => i.message),
    });
    return;
  }

  try {
    const inserted = await db
      .insert(communityPosts)
      .values({
        userId: req.dbUser!.id,
        authorName: req.dbUser!.displayName,
        category: parsed.data.category,
        title: parsed.data.title,
        body: parsed.data.body,
        tags: parsed.data.tags,
      })
      .returning();

    res.status(201).json({
      post: { ...inserted[0], replyCount: 0, hasVoted: false, isBookmarked: false },
    });
  } catch (error) {
    console.error('Create community post error:', error);
    res.status(500).json({ error: 'Failed to publish question.' });
  }
});

// Post Reply
router.post('/community/posts/:id/replies', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid post ID.' });
    return;
  }

  const parsed = createReplySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Reply must be between 4 and 2500 characters.' });
    return;
  }

  try {
    const inserted = await db
      .insert(communityReplies)
      .values({
        postId: id,
        userId: req.dbUser!.id,
        authorName: req.dbUser!.displayName,
        body: parsed.data.body,
      })
      .returning();

    res.status(201).json({ reply: { ...inserted[0], hasVoted: false } });
  } catch (error) {
    console.error('Create community reply error:', error);
    res.status(500).json({ error: 'Failed to post reply.' });
  }
});

// Toggle Helpful Vote
router.post('/community/votes', requireAuth, async (req: AuthRequest, res) => {
  const parsed = voteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid vote payload.' });
    return;
  }

  const { targetType, targetId } = parsed.data;
  try {
    const existing = await db
      .select()
      .from(communityVotes)
      .where(
        and(
          eq(communityVotes.userId, req.dbUser!.id),
          eq(communityVotes.targetType, targetType),
          eq(communityVotes.targetId, targetId)
        )
      )
      .limit(1);

    let voted = false;
    if (existing[0]) {
      await db.delete(communityVotes).where(eq(communityVotes.id, existing[0].id));
      if (targetType === 'post') {
        await db
          .update(communityPosts)
          .set({ helpfulCount: sql`GREATEST(0, ${communityPosts.helpfulCount} - 1)` })
          .where(eq(communityPosts.id, targetId));
      } else {
        await db
          .update(communityReplies)
          .set({ helpfulCount: sql`GREATEST(0, ${communityReplies.helpfulCount} - 1)` })
          .where(eq(communityReplies.id, targetId));
      }
      voted = false;
    } else {
      await db.insert(communityVotes).values({
        userId: req.dbUser!.id,
        targetType,
        targetId,
      });
      if (targetType === 'post') {
        await db
          .update(communityPosts)
          .set({ helpfulCount: sql`${communityPosts.helpfulCount} + 1` })
          .where(eq(communityPosts.id, targetId));
      } else {
        await db
          .update(communityReplies)
          .set({ helpfulCount: sql`${communityReplies.helpfulCount} + 1` })
          .where(eq(communityReplies.id, targetId));
      }
      voted = true;
    }

    res.json({ voted });
  } catch (error) {
    console.error('Toggle helpful vote error:', error);
    res.status(500).json({ error: 'Failed to update vote.' });
  }
});

// Toggle Bookmark
router.post('/community/bookmarks/:postId', requireAuth, async (req: AuthRequest, res) => {
  const postId = Number(req.params.postId);
  if (!Number.isInteger(postId) || postId <= 0) {
    res.status(400).json({ error: 'Invalid post ID.' });
    return;
  }

  try {
    const existing = await db
      .select()
      .from(communityBookmarks)
      .where(
        and(eq(communityBookmarks.userId, req.dbUser!.id), eq(communityBookmarks.postId, postId))
      )
      .limit(1);

    if (existing[0]) {
      await db.delete(communityBookmarks).where(eq(communityBookmarks.id, existing[0].id));
      res.json({ bookmarked: false });
    } else {
      await db.insert(communityBookmarks).values({ userId: req.dbUser!.id, postId });
      res.json({ bookmarked: true });
    }
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    res.status(500).json({ error: 'Failed to update bookmark.' });
  }
});

// Report Content
router.post('/community/reports', requireAuth, async (req: AuthRequest, res) => {
  const parsed = reportSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Please provide a clear moderation reason.' });
    return;
  }

  try {
    const inserted = await db
      .insert(communityReports)
      .values({
        userId: req.dbUser!.id,
        targetType: parsed.data.targetType,
        targetId: parsed.data.targetId,
        reason: parsed.data.reason,
      })
      .returning();

    res.status(201).json({ report: inserted[0] });
  } catch (error) {
    console.error('Report content error:', error);
    res.status(500).json({ error: 'Failed to submit report.' });
  }
});

// Admin Moderation Queue
router.get('/admin/community/reports', requireAuth, requireAdmin, async (_req: AuthRequest, res) => {
  try {
    const reports = await db
      .select()
      .from(communityReports)
      .orderBy(desc(communityReports.createdAt))
      .limit(50);

    res.json({ reports });
  } catch (error) {
    console.error('Load community reports error:', error);
    res.status(500).json({ error: 'Unable to load moderation queue.' });
  }
});

router.post('/admin/community/moderate', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const parsed = moderateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid moderation action.' });
    return;
  }

  const { reportId, targetType, targetId, decision } = parsed.data;
  try {
    if (decision === 'hide' || decision === 'restore') {
      const nextStatus = decision === 'hide' ? 'hidden' : 'active';
      if (targetType === 'post' && targetId) {
        await db.update(communityPosts).set({ status: nextStatus }).where(eq(communityPosts.id, targetId));
      } else if (targetType === 'reply' && targetId) {
        await db.update(communityReplies).set({ status: nextStatus }).where(eq(communityReplies.id, targetId));
      }
    }

    if (reportId) {
      await db
        .update(communityReports)
        .set({ status: decision === 'dismiss_report' ? 'dismissed' : 'resolved' })
        .where(eq(communityReports.id, reportId));
    }

    await db.insert(adminAuditLogs).values({
      actorUserId: req.dbUser!.id,
      action: `COMMUNITY_${decision.toUpperCase()}`,
      entityType: targetType ?? 'community_report',
      entityId: String(targetId ?? reportId ?? '0'),
      details: { decision },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error('Moderation action error:', error);
    res.status(500).json({ error: 'Failed to execute moderation action.' });
  }
});

export default router;
