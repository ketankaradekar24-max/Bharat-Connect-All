import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Bookmark,
  Flag,
  MessageSquare,
  Plus,
  Search,
  ThumbsUp,
} from 'lucide-react';
import { Alert } from '../components/ui/Alert.tsx';
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { apiFetch } from '../lib/api.ts';
import type { CommunityPost } from '../types/index.ts';

interface CommunityPageProps {
  navigate: (path: string) => void;
}

const COMMUNITY_CATEGORIES = [
  'All',
  'Competitive Exams',
  'Scholarships',
  'Public Services',
  'College Admissions',
  'Jobs & Careers',
  'State Services',
];

export function CommunityPage({ navigate }: CommunityPageProps) {
  const { dbUser, openAuthModal } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const [askModalOpen, setAskModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('Competitive Exams');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newTags, setNewTags] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);

  const [reportTarget, setReportTarget] = useState<{
    targetType: 'post' | 'reply';
    targetId: number;
  } | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportFeedback, setReportFeedback] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (q.trim()) query.set('q', q.trim());
      if (categoryFilter !== 'All') query.set('category', categoryFilter);
      if (bookmarkedOnly) query.set('bookmarked', 'true');
      const data = await apiFetch<{ posts: CommunityPost[] }>(
        `/api/community/posts?${query.toString()}`
      );
      setPosts(data.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load community discussions.');
    } finally {
      setLoading(false);
    }
  }, [q, categoryFilter, bookmarkedOnly, dbUser?.id]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const openThread = async (postId: number) => {
    setLoadingDetail(true);
    try {
      const data = await apiFetch<{ post: CommunityPost }>(`/api/community/posts/${postId}`);
      setSelectedPost(data.post);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to open discussion.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreatePost = async (e: FormEvent) => {
    e.preventDefault();
    if (!dbUser) {
      openAuthModal();
      return;
    }
    setSubmittingPost(true);
    setError(null);
    try {
      const tags = newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 6);
      const res = await apiFetch<{ post: CommunityPost }>('/api/community/posts', {
        method: 'POST',
        body: JSON.stringify({
          category: newCategory,
          title: newTitle.trim(),
          body: newBody.trim(),
          tags,
        }),
      });
      setPosts((prev) => [res.post, ...prev]);
      setAskModalOpen(false);
      setNewTitle('');
      setNewBody('');
      setNewTags('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to publish question.');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPost) return;
    if (!dbUser) {
      openAuthModal();
      return;
    }
    setSubmittingReply(true);
    try {
      const res = await apiFetch<{ reply: NonNullable<CommunityPost['replies']>[number] }>(
        `/api/community/posts/${selectedPost.id}/replies`,
        {
          method: 'POST',
          body: JSON.stringify({ body: replyBody.trim() }),
        }
      );
      setSelectedPost((prev) =>
        prev ? { ...prev, replies: [...(prev.replies ?? []), res.reply] } : null
      );
      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPost.id ? { ...p, replyCount: (p.replyCount ?? 0) + 1 } : p
        )
      );
      setReplyBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to post reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleVote = async (targetType: 'post' | 'reply', targetId: number) => {
    if (!dbUser) {
      openAuthModal();
      return;
    }
    try {
      const res = await apiFetch<{ voted: boolean }>('/api/community/votes', {
        method: 'POST',
        body: JSON.stringify({ targetType, targetId }),
      });

      if (targetType === 'post') {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === targetId
              ? {
                  ...p,
                  hasVoted: res.voted,
                  helpfulCount: Math.max(0, p.helpfulCount + (res.voted ? 1 : -1)),
                }
              : p
          )
        );
        if (selectedPost?.id === targetId) {
          setSelectedPost((prev) =>
            prev
              ? {
                  ...prev,
                  hasVoted: res.voted,
                  helpfulCount: Math.max(0, prev.helpfulCount + (res.voted ? 1 : -1)),
                }
              : null
          );
        }
      } else if (selectedPost) {
        setSelectedPost((prev) =>
          prev
            ? {
                ...prev,
                replies: (prev.replies ?? []).map((r) =>
                  r.id === targetId
                    ? {
                        ...r,
                        hasVoted: res.voted,
                        helpfulCount: Math.max(0, r.helpfulCount + (res.voted ? 1 : -1)),
                      }
                    : r
                ),
              }
            : null
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vote.');
    }
  };

  const handleBookmark = async (postId: number) => {
    if (!dbUser) {
      openAuthModal();
      return;
    }
    try {
      const res = await apiFetch<{ bookmarked: boolean }>(`/api/community/bookmarks/${postId}`, {
        method: 'POST',
      });
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isBookmarked: res.bookmarked } : p))
      );
      if (selectedPost?.id === postId) {
        setSelectedPost((prev) => (prev ? { ...prev, isBookmarked: res.bookmarked } : null));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bookmark.');
    }
  };

  const handleReportSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!reportTarget) return;
    try {
      await apiFetch('/api/community/reports', {
        method: 'POST',
        body: JSON.stringify({ ...reportTarget, reason: reportReason.trim() }),
      });
      setReportTarget(null);
      setReportReason('');
      setReportFeedback('Report submitted to moderators for review.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      <Breadcrumbs
        items={[{ label: 'Home', path: '/' }, { label: 'Community Q&A' }]}
        navigate={navigate}
      />

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1.5 max-w-2xl">
          <p className="text-xs font-semibold  text-[#134E7A]">
            Peer Help · Moderated Forum
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B192C]">
            Community Questions & Guidance Discussions
          </h1>
          <p className="text-sm text-slate-600">
            Ask questions about exam counselling, scholarship document checks, Karnataka Seva Sindhu,
            passports, or public portals. Vote helpful answers and bookmark useful threads.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            if (!dbUser) {
              openAuthModal();
              return;
            }
            setAskModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Ask a Question
        </Button>
      </div>

      <Alert variant="warning" title="Community Privacy & Safety Rule">
        Never post Aadhaar numbers, OTPs, bank account numbers, passport numbers, or personal phone
        numbers in public questions or replies. Always verify official deadlines on .gov.in portals.
      </Alert>

      {reportFeedback && <Alert variant="success">{reportFeedback}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      {/* Filters */}
      <Card className="p-5 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search community discussions (e.g., KCET Clause A, SSP RD number, Passport PSK)..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 focus:border-[#134E7A] focus:outline-none"
            />
          </div>

          {dbUser && (
            <button
              type="button"
              onClick={() => setBookmarkedOnly((p) => !p)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                bookmarkedOnly
                  ? 'border-[#134E7A] bg-sky-50 text-[#134E7A]'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              Bookmarked Threads
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {COMMUNITY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-lg border px-3 py-1 text-xs font-semibold transition-colors ${
                categoryFilter === cat
                  ? 'border-[#134E7A] bg-[#134E7A] text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Thread List */}
        <div className="lg:col-span-7 space-y-3">
          {loading ? (
            [1, 2, 3].map((n) => <Skeleton key={n} className="h-32" />)
          ) : posts.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="h-5 w-5" />}
              title="No discussions yet in this view"
              description="Be the first to ask a helpful question about exams, scholarships, or public services."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => (dbUser ? setAskModalOpen(true) : openAuthModal())}
                >
                  Ask a Question
                </Button>
              }
            />
          ) : (
            posts.map((post) => (
              <Card
                key={post.id}
                interactive
                className={`p-5 space-y-2.5 cursor-pointer ${
                  selectedPost?.id === post.id ? 'border-[#134E7A] ring-1 ring-[#134E7A]' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1" onClick={() => openThread(post.id)}>
                    <p className="text-xs font-medium text-slate-500">
                      <span className="font-semibold text-[#134E7A]">{post.category}</span>
                      {' · '}
                      Asked by {post.authorName}
                      {' · '}
                      <span className="font-mono">
                        {new Date(post.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </p>
                    <h2 className="font-display text-base font-bold text-[#0B192C] hover:text-[#134E7A]">
                      {post.title}
                    </h2>
                    <p className="text-sm text-slate-600 line-clamp-2">{post.body}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBookmark(post.id)}
                    aria-label="Bookmark thread"
                    className={`rounded-lg border p-2 transition-colors ${
                      post.isBookmarked
                        ? 'border-[#134E7A] bg-sky-50 text-[#134E7A]'
                        : 'border-slate-200 text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    <Bookmark className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleVote('post', post.id)}
                      className={`inline-flex items-center gap-1 font-semibold ${
                        post.hasVoted ? 'text-[#134E7A]' : 'text-slate-600 hover:text-[#0B192C]'
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      Helpful ({post.helpfulCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => openThread(post.id)}
                      className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-[#134E7A]"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      {post.replyCount ?? 0} Replies
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => openThread(post.id)}
                    className="font-semibold text-[#134E7A] hover:underline"
                  >
                    Open Thread →
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Right Selected Discussion Detail */}
        <div className="lg:col-span-5 lg:sticky lg:top-20">
          {loadingDetail ? (
            <Skeleton className="h-72" />
          ) : selectedPost ? (
            <Card className="p-5 space-y-4">
              <div className="space-y-1.5 border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#134E7A]">
                    {selectedPost.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!dbUser) {
                        openAuthModal();
                        return;
                      }
                      setReportTarget({ targetType: 'post', targetId: selectedPost.id });
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-rose-700"
                  >
                    <Flag className="h-3 w-3" />
                    Report
                  </button>
                </div>
                <h3 className="font-display text-lg font-bold text-[#0B192C]">
                  {selectedPost.title}
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedPost.body}
                </p>
                {selectedPost.tags?.length > 0 && (
                  <p className="text-xs text-slate-500 pt-1">
                    Tags: {selectedPost.tags.join(' · ')}
                  </p>
                )}
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                <p className="text-xs font-semibold  text-slate-500">
                  Replies ({selectedPost.replies?.length ?? 0})
                </p>
                {(selectedPost.replies ?? []).length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No replies yet. Share verified guidance if you have completed this process.
                  </p>
                ) : (
                  (selectedPost.replies ?? []).map((reply) => (
                    <div
                      key={reply.id}
                      className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-800">{reply.authorName}</span>
                        <span>{new Date(reply.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                        {reply.body}
                      </p>
                      <div className="flex items-center justify-between text-[11px]">
                        <button
                          type="button"
                          onClick={() => handleVote('reply', reply.id)}
                          className={`inline-flex items-center gap-1 font-semibold ${
                            reply.hasVoted ? 'text-[#134E7A]' : 'text-slate-600'
                          }`}
                        >
                          <ThumbsUp className="h-3 w-3" />
                          Helpful ({reply.helpfulCount})
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            dbUser
                              ? setReportTarget({ targetType: 'reply', targetId: reply.id })
                              : openAuthModal()
                          }
                          className="text-slate-400 hover:text-rose-700"
                        >
                          Report
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleReply} className="space-y-2 border-t border-slate-100 pt-3">
                <textarea
                  rows={3}
                  required
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder={
                    dbUser
                      ? 'Share clear, verified steps or official .gov.in portal tips...'
                      : 'Sign in to post a helpful reply...'
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[#134E7A] focus:outline-none"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="w-full"
                  disabled={submittingReply}
                >
                  {submittingReply ? 'Posting...' : dbUser ? 'Post Reply' : 'Sign In to Reply'}
                </Button>
              </form>
            </Card>
          ) : (
            <Card className="p-6 text-center py-10 space-y-2">
              <MessageSquare className="mx-auto h-7 w-7 text-slate-400" />
              <p className="font-display text-sm font-bold text-slate-900">
                Select a discussion thread
              </p>
              <p className="text-xs text-slate-500">
                Click any question on the left to read replies, upvote helpful answers, or respond.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Ask Question Modal */}
      {askModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <Card className="p-6 w-full max-w-lg space-y-4 animate-modal-enter">
            <h3 className="font-display text-lg font-bold text-[#0B192C]">Ask the Community</h3>
            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                >
                  {COMMUNITY_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Question Title
                </label>
                <input
                  type="text"
                  required
                  minLength={8}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., What documents are required for KCET Clause A study verification?"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Details (Do NOT include Aadhaar, OTP, phone or bank numbers)
                </label>
                <textarea
                  rows={4}
                  required
                  minLength={15}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Describe your question clearly..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tags (comma-separated, optional)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="kcet, karnataka, documents"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setAskModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submittingPost}>
                  {submittingPost ? 'Publishing...' : 'Publish Question'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Report Modal */}
      {reportTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <Card className="p-6 w-full max-w-md space-y-4 animate-modal-enter">
            <h3 className="font-display text-lg font-bold text-[#0B192C]">Report Content</h3>
            <form onSubmit={handleReportSubmit} className="space-y-3">
              <textarea
                rows={3}
                required
                minLength={5}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Explain why this post/reply should be reviewed by moderators..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setReportTarget(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="danger">
                  Submit Report
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
