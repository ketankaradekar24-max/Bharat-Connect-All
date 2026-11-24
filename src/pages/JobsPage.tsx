import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Bell,
  Bookmark,
  Briefcase,
  Check,
  ExternalLink,
  LayoutGrid,
  MapPin,
  RotateCcw,
  Search,
  Table2,
} from 'lucide-react';
import { ExternalPortalModal } from '../components/ExternalPortalModal.tsx';
import { DeadlineUrgency, TrustStrip } from '../components/SignatureElements.tsx';
import { Alert } from '../components/ui/Alert.tsx';
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { apiFetch } from '../lib/api.ts';
import type { JobListing } from '../types/index.ts';

interface JobsPageProps {
  navigate: (path: string) => void;
  initialSearch?: string;
}

const JOB_CATEGORIES = [
  'All',
  'Central Government Jobs',
  'Karnataka Government Jobs',
  'Banking',
  'Railway',
  'Defence',
  'PSU',
  'Internships & Apprenticeships',
  'Private & Freshers',
];

const JOB_STATUSES = [
  'Interested',
  'Preparing',
  'Documents Ready',
  'Applied',
  'Under Review',
  'Selected',
  'Completed',
];

export function JobsPage({ navigate, initialSearch = '' }: JobsPageProps) {
  const { dbUser, openAuthModal } = useAuth();
  const params = new URLSearchParams(initialSearch);

  const [q, setQ] = useState(params.get('q') || '');
  const [categoryFilter, setCategoryFilter] = useState(params.get('category') || 'All');
  const [stateFilter, setStateFilter] = useState(params.get('state') || 'All');
  const [experienceFilter, setExperienceFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<JobListing | null>(null);
  const [trackerStatus, setTrackerStatus] = useState('Interested');
  const [reminderDate, setReminderDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const [externalTarget, setExternalTarget] = useState<{
    title: string;
    portalName: string;
    url: string;
  } | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (q.trim()) query.set('q', q.trim());
      if (categoryFilter !== 'All') query.set('category', categoryFilter);
      if (stateFilter !== 'All') query.set('state', stateFilter);
      if (experienceFilter !== 'All') query.set('experience', experienceFilter);

      const data = await apiFetch<{ jobs: JobListing[] }>(`/api/jobs?${query.toString()}`);
      setJobs(data.jobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load job & career pathways.');
    } finally {
      setLoading(false);
    }
  }, [q, categoryFilter, stateFilter, experienceFilter, dbUser?.id]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const openTrackerModal = (job: JobListing) => {
    if (!dbUser) {
      openAuthModal();
      return;
    }
    setActiveJob(job);
    setTrackerStatus(job.tracker?.status || 'Interested');
    setReminderDate(job.tracker?.reminderDate || '');
    setNotes(job.tracker?.notes || '');
  };

  const handleToggleSave = async (job: JobListing) => {
    if (!dbUser) {
      openAuthModal();
      return;
    }
    try {
      if (job.tracker?.isSaved) {
        await apiFetch(`/api/student/jobs/${job.id}/tracker`, { method: 'DELETE' });
        setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, tracker: null } : j)));
      } else {
        const res = await apiFetch<{ tracker: JobListing['tracker'] }>(
          `/api/student/jobs/${job.id}/tracker`,
          {
            method: 'PUT',
            body: JSON.stringify({ isSaved: true, status: 'Interested' }),
          }
        );
        setJobs((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, tracker: res.tracker } : j))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save job.');
    }
  };

  const handleSaveTracker = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeJob) return;
    setSaving(true);
    try {
      const res = await apiFetch<{ tracker: JobListing['tracker'] }>(
        `/api/student/jobs/${activeJob.id}/tracker`,
        {
          method: 'PUT',
          body: JSON.stringify({
            isSaved: true,
            status: trackerStatus,
            reminderDate: reminderDate || null,
            notes: notes.trim() || null,
          }),
        }
      );
      setJobs((prev) =>
        prev.map((j) => (j.id === activeJob.id ? { ...j, tracker: res.tracker } : j))
      );
      setActiveJob(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update job tracker.');
    } finally {
      setSaving(false);
    }
  };

  const resetFilters = () => {
    setQ('');
    setCategoryFilter('All');
    setStateFilter('All');
    setExperienceFilter('All');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      <Breadcrumbs
        items={[{ label: 'Home', path: '/' }, { label: 'Jobs & Careers' }]}
        navigate={navigate}
      />

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E2DDD1] pb-6">
        <div className="space-y-1.5 max-w-2xl">
          <p className="text-xs font-semibold text-[#134E7A]">
            Verified Recruitment &amp; Career Portals · Zero Placement Fees
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B192C]">
            Jobs, Apprenticeships &amp; Recruitment Pathways
          </h1>
          <p className="text-sm text-[#475467]">
            Official portals for Central &amp; Karnataka Government recruitment, Banking, Railway,
            Defence, PSUs, Internships, Apprenticeships, Freshers, and Private/WFH careers.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => navigate('/exams')}>
          Browse Recruitment Exams (UPSC / SSC / IBPS)
        </Button>
      </div>

      {/* Category Filter Row */}
      <div className="flex flex-wrap gap-1.5">
        {JOB_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`min-h-[36px] rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              categoryFilter === cat
                ? 'border-[#0B192C] bg-[#0B192C] text-white'
                : 'border-[#E2DDD1] bg-white text-[#475467] hover:border-[#CFC8B8] hover:bg-[#FAF8F3]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <Card className="p-5 grid grid-cols-1 gap-3 md:grid-cols-12 border-[#E2DDD1] bg-white">
        <div className="relative md:col-span-6">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A828F]" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search KPSC, SSC, Banking, Railway, Internship, NCS, Freshers..."
            aria-label="Search jobs and recruitment pathways"
            className="w-full rounded-lg border border-[#CFC8B8] bg-[#FAF8F3] pl-10 pr-4 py-2.5 text-sm text-[#0B192C] placeholder:text-[#7A828F] focus:border-[#134E7A] focus:bg-white focus:outline-none"
          />
        </div>
        <div className="md:col-span-3">
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            aria-label="Filter by state"
            className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C] focus:border-[#134E7A] focus:outline-none"
          >
            <option value="All">All India &amp; States</option>
            <option value="All India">All India</option>
            <option value="Karnataka">Karnataka</option>
          </select>
        </div>
        <div className="md:col-span-3 flex gap-2">
          <select
            value={experienceFilter}
            onChange={(e) => setExperienceFilter(e.target.value)}
            aria-label="Filter by experience level"
            className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C] focus:border-[#134E7A] focus:outline-none"
          >
            <option value="All">All Experience Levels</option>
            <option value="Fresher">Students &amp; Freshers</option>
            <option value="Experienced">Experienced</option>
          </select>
          {(q || categoryFilter !== 'All' || stateFilter !== 'All' || experienceFilter !== 'All') && (
            <Button variant="ghost" size="sm" onClick={resetFilters} aria-label="Reset filters">
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>

      {error && <Alert variant="error" title="Error loading jobs">{error}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5C6573]">
        <span>
          Showing <strong className="font-mono text-[#0B192C] tabular-nums">{jobs.length}</strong>{' '}
          verified recruitment &amp; career pathway{jobs.length === 1 ? '' : 's'}
        </span>

        <div className="inline-flex items-center rounded-lg border border-[#E2DDD1] bg-[#F3EFE6] p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            aria-label="Card view"
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              viewMode === 'cards'
                ? 'bg-white text-[#0B192C] shadow-2xs'
                : 'text-[#5C6573] hover:text-[#0B192C]'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            aria-label="Ledger table view"
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-[#0B192C] shadow-2xs'
                : 'text-[#5C6573] hover:text-[#0B192C]'
            }`}
          >
            <Table2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ledger</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-60" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-5 w-5" />}
          title="No matching job pathways found"
          description="Clear filters to explore verified central, state, internship, apprenticeship, and private career portals."
          action={
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset Filters
            </Button>
          }
        />
      ) : viewMode === 'table' ? (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2DDD1] bg-[#F3EFE6] text-[#475467]">
                <th className="p-3.5 font-semibold">Role / Drive</th>
                <th className="p-3.5 font-semibold">Category &amp; Scope</th>
                <th className="p-3.5 font-semibold">Qualification</th>
                <th className="p-3.5 font-semibold">Pay / Stipend</th>
                <th className="p-3.5 font-semibold">Cycle / Deadline</th>
                <th className="p-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE3]">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-[#FAF8F3]/80 transition-colors">
                  <td className="p-3.5">
                    <button
                      type="button"
                      onClick={() => navigate(`/jobs/${job.slug}`)}
                      className="font-semibold text-[#0B192C] hover:text-[#134E7A] text-left"
                    >
                      {job.title}
                    </button>
                    <p className="text-[11px] text-[#5C6573]">{job.organization}</p>
                  </td>
                  <td className="p-3.5 text-[#475467]">
                    <span className="font-medium text-[#134E7A]">{job.category}</span>
                    {' · '}
                    {job.state}
                  </td>
                  <td className="p-3.5 text-[#475467] max-w-[180px]">
                    <span className="line-clamp-2">{job.qualification}</span>
                  </td>
                  <td className="p-3.5 font-mono text-[#0B192C] tabular-nums max-w-[150px]">
                    <span className="line-clamp-2">{job.salaryPayScale}</span>
                  </td>
                  <td className="p-3.5">
                    <DeadlineUrgency
                      dateStr={job.deadlineDate}
                      fallbackText={job.deadlineText}
                    />
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap space-x-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/jobs/${job.slug}`)}
                      className="font-semibold text-[#134E7A] hover:underline"
                    >
                      Guide →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {jobs.map((job) => {
            const isSaved = Boolean(job.tracker?.isSaved);
            return (
              <Card
                key={job.id}
                interactive
                className="p-5 flex flex-col justify-between gap-4 border-[#E2DDD1] bg-white"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-[#5C6573]">
                        <span className="font-semibold text-[#134E7A]">{job.category}</span>
                        {' · '}
                        {job.state}
                      </p>
                      <h2 className="font-display text-lg font-bold text-[#0B192C] leading-snug">
                        <button
                          type="button"
                          onClick={() => navigate(`/jobs/${job.slug}`)}
                          className="text-left hover:text-[#134E7A] transition-colors"
                        >
                          {job.title}
                        </button>
                      </h2>
                      <TrustStrip
                        sourceName={job.organization}
                        verifiedAt={job.lastVerifiedAt}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleSave(job)}
                      aria-label={isSaved ? 'Remove saved job' : 'Save job'}
                      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                        isSaved
                          ? 'border-[#134E7A] bg-[#F1F6FA] text-[#134E7A]'
                          : 'border-[#E2DDD1] bg-white text-[#5C6573] hover:border-[#CFC8B8] hover:text-[#0B192C]'
                      }`}
                    >
                      {isSaved ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    </button>
                  </div>

                  <p className="text-sm text-[#475467] leading-relaxed">{job.summary}</p>

                  <div className="grid grid-cols-1 gap-2 rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-3 text-xs text-[#475467] sm:grid-cols-2">
                    <div>
                      <span className="text-[#5C6573]">Qualification: </span>
                      <span className="font-medium text-[#0B192C]">{job.qualification}</span>
                    </div>
                    <div>
                      <DeadlineUrgency
                        dateStr={job.deadlineDate}
                        fallbackText={job.deadlineText}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#5C6573] shrink-0" />
                      <span>{job.location}</span>
                    </div>
                    <div>
                      <span className="text-[#5C6573]">Pay / Stipend: </span>
                      <span className="font-mono font-medium text-[#0B192C] tabular-nums">
                        {job.salaryPayScale}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EFECE3] pt-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/jobs/${job.slug}`)}
                    >
                      <span>View Guide &amp; Steps</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setExternalTarget({
                          title: `${job.title} — Official Apply Portal`,
                          portalName: job.officialSourceName,
                          url: job.officialApplyUrl,
                        })
                      }
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <Button variant="ghost" size="sm" onClick={() => openTrackerModal(job)}>
                    <Bell className="h-3.5 w-3.5" />
                    <span>{job.tracker?.status ? job.tracker.status : 'Track & Remind'}</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Personal Job Tracker & Reminder Modal */}
      {activeJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B192C]/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <Card className="p-6 w-full max-w-md space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#134E7A]">Personal Job Tracker</p>
              <h3 className="font-display text-lg font-bold text-[#0B192C]">{activeJob.title}</h3>
            </div>

            <form onSubmit={handleSaveTracker} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#475467] mb-1">
                  Application Status
                </label>
                <select
                  value={trackerStatus}
                  onChange={(e) => setTrackerStatus(e.target.value)}
                  className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C]"
                >
                  {JOB_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475467] mb-1">
                  Deadline / Reminder Date
                </label>
                <input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#475467] mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Advertisement number, post code, or exam centre notes..."
                  className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setActiveJob(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save to Dashboard'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <ExternalPortalModal target={externalTarget} onClose={() => setExternalTarget(null)} />
    </div>
  );
}
