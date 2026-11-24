import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Bell,
  Bookmark,
  Briefcase,
  CalendarClock,
  Check,
  CheckSquare,
  ExternalLink,
  MapPin,
  ShieldCheck,
  Square,
  Users,
} from 'lucide-react';
import { ExternalPortalModal } from '../components/ExternalPortalModal.tsx';
import { ReportIssueButton } from '../components/ReportIssueButton.tsx';
import { Alert } from '../components/ui/Alert.tsx';
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { apiFetch } from '../lib/api.ts';
import type { JobListing, UserJobTracker } from '../types/index.ts';

interface JobDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

const JOB_STATUSES = [
  'Interested',
  'Preparing',
  'Documents Ready',
  'Applied',
  'Under Review',
  'Selected',
  'Completed',
];

function formatStepNumber(idx: number): string {
  return String(idx + 1).padStart(2, '0');
}

export function JobDetailPage({ slug, navigate }: JobDetailPageProps) {
  const { dbUser, openAuthModal } = useAuth();
  const [job, setJob] = useState<JobListing | null>(null);
  const [tracker, setTracker] = useState<UserJobTracker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [checkedDocs, setCheckedDocs] = useState<number[]>([]);
  const [status, setStatus] = useState('Interested');
  const [reminderDate, setReminderDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [externalTarget, setExternalTarget] = useState<{
    title: string;
    portalName: string;
    url: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<{ job: JobListing; tracker: UserJobTracker | null }>(
          `/api/jobs/${encodeURIComponent(slug)}`
        );
        if (!active) return;
        setJob(data.job);
        setTracker(data.tracker);
        if (data.tracker) {
          setStatus(data.tracker.status || 'Interested');
          setReminderDate(data.tracker.reminderDate || '');
          setNotes(data.tracker.notes || '');
        } else {
          setStatus('Interested');
          setReminderDate('');
          setNotes('');
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load job & career guide.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [slug, dbUser?.id]);

  const persistTracker = async (patch: Record<string, unknown>, message?: string) => {
    if (!job) return;
    if (!dbUser) {
      openAuthModal();
      return;
    }
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await apiFetch<{ tracker: UserJobTracker }>(
        `/api/student/jobs/${job.id}/tracker`,
        {
          method: 'PUT',
          body: JSON.stringify(patch),
        }
      );
      setTracker(res.tracker);
      if (message) setSaveMessage(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save job progress.');
    } finally {
      setSaving(false);
    }
  };

  const toggleDoc = (idx: number) => {
    setCheckedDocs((prev) =>
      prev.includes(idx) ? prev.filter((item) => item !== idx) : [...prev, idx]
    );
  };

  const handleSaveForm = (e: FormEvent) => {
    e.preventDefault();
    persistTracker(
      {
        isSaved: true,
        status,
        reminderDate: reminderDate || null,
        notes: notes.trim() || null,
      },
      'Job progress & reminder saved to your Personal Dashboard.'
    );
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="h-44" />
            <Skeleton className="h-64" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-4">
        <Alert variant="error" title="Job guide unavailable">
          {error || 'The requested recruitment & career pathway could not be found.'}
        </Alert>
        <Button variant="outline" onClick={() => navigate('/jobs')}>
          Back to Jobs &amp; Careers
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', path: '/' },
          { label: 'Jobs & Careers', path: '/jobs' },
          {
            label: job.category,
            path: `/jobs?category=${encodeURIComponent(job.category)}`,
          },
          { label: job.title },
        ]}
        navigate={navigate}
      />

      {/* Top Banner */}
      <Card className="p-6 space-y-4 border-[#E2DDD1] bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <p className="text-xs font-medium text-[#5C6573]">
              <span className="font-semibold text-[#134E7A]">{job.category}</span>
              {' · '}
              {job.state}
              {' · '}
              {job.experienceLevel}
              {' · '}
              <span className="text-[#0E6B6E] font-semibold">Verified Official Portal</span>
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B192C]">
              {job.title}
            </h1>
            <p className="text-sm font-medium text-[#4B5565] flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>{job.organization}</span>
              <span className="inline-flex items-center gap-1 text-xs text-[#5C6573]">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                persistTracker(
                  { isSaved: !(tracker?.isSaved ?? false) },
                  tracker?.isSaved ? 'Removed from saved jobs.' : 'Job saved to dashboard.'
                )
              }
            >
              {tracker?.isSaved ? (
                <Check className="h-4 w-4 text-[#0E6B6E]" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
              {tracker?.isSaved ? 'Saved Job' : 'Save Job'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setExternalTarget({
                  title: `${job.title} — Official Apply Portal`,
                  portalName: job.officialSourceName,
                  url: job.officialApplyUrl,
                })
              }
            >
              <span>Official Apply Portal</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-[#4B5565] border-t border-[#EFECE3] pt-4">
          {job.summary}
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left 8 Columns */}
        <div className="lg:col-span-8 space-y-5">
          <Card className="p-5 sm:p-6 space-y-4 border-[#E2DDD1] bg-white">
            <h2 className="font-display text-lg font-bold text-[#0B192C] flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#134E7A]" />
              01. Eligibility, Vacancies &amp; Pay Scale
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-3.5">
                <p className="text-xs font-semibold text-[#5C6573]">Qualification Required</p>
                <p className="mt-1 text-sm text-[#0B192C]">{job.qualification}</p>
              </div>
              <div className="rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-3.5">
                <p className="text-xs font-semibold text-[#5C6573]">Age Criteria</p>
                <p className="mt-1 text-sm text-[#0B192C]">{job.ageCriteria}</p>
              </div>
              <div className="rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-3.5">
                <p className="text-xs font-semibold text-[#5C6573]">Pay Scale / Stipend</p>
                <p className="mt-1 text-sm text-[#0B192C] tabular-nums">{job.salaryPayScale}</p>
              </div>
              <div className="rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-3.5">
                <p className="text-xs font-semibold text-[#5C6573] flex items-center gap-1">
                  <CalendarClock className="h-3.5 w-3.5 text-[#134E7A]" />
                  <span>Recruitment Cycle &amp; Deadline</span>
                </p>
                <p className="mt-1 text-sm text-[#0B192C]">{job.deadlineText}</p>
              </div>
            </div>

            <div className="rounded-lg border border-[#E2DDD1] bg-white p-3.5 text-sm text-[#4B5565] flex items-start gap-2.5">
              <Users className="h-4 w-4 shrink-0 text-[#134E7A] mt-0.5" />
              <div>
                <strong className="text-[#0B192C]">Vacancies &amp; Openings: </strong>
                <span>{job.vacancyInfo}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 sm:p-6 space-y-3 border-[#E2DDD1] bg-white">
            <h2 className="font-display text-lg font-bold text-[#0B192C]">
              02. Step-by-Step Application Process
            </h2>
            <div className="space-y-2">
              {job.applicationSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] px-3.5 py-3 text-sm text-[#0B192C]"
                >
                  <span className="mt-0.5 font-mono text-xs font-bold text-[#C46316] tabular-nums">
                    {formatStepNumber(idx)}.
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 sm:p-6 space-y-3 border-[#E2DDD1] bg-white">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[#0B192C]">
                03. Required Documents Checklist
              </h2>
              <span className="font-mono text-xs font-semibold text-[#5C6573] tabular-nums">
                {checkedDocs.length}/{job.requiredDocuments.length} ready
              </span>
            </div>
            <div className="space-y-2">
              {job.requiredDocuments.map((doc, idx) => {
                const checked = checkedDocs.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleDoc(idx)}
                    className={`flex w-full items-start gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors ${
                      checked
                        ? 'border-[#0E6B6E]/35 bg-[#EEF7F6] text-[#0B192C]'
                        : 'border-[#E2DDD1] bg-white text-[#4B5565] hover:bg-[#FAF8F3]'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#0E6B6E]" />
                    ) : (
                      <Square className="mt-0.5 h-4 w-4 shrink-0 text-[#9AA2AE]" />
                    )}
                    <span>{doc}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 border-[#E2DDD1] bg-[#FAF8F3]">
            <div>
              <h3 className="text-sm font-bold text-[#0B192C]">
                Preparing for Government &amp; Recruitment Exams?
              </h3>
              <p className="text-xs text-[#4B5565] mt-0.5">
                Explore syllabus, exam patterns, and official notification guides for UPSC, SSC,
                IBPS, Railways, GATE, and KPSC.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/exams')}>
              <span>Browse Competitive Exams</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Card>
        </div>

        {/* Right 4 Columns */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
          <Card className="p-5 space-y-4 border-[#E2DDD1] bg-white">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[#0E6B6E] mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#0B192C]">Official Recruitment Portals</p>
                <p className="text-xs text-[#5C6573]">
                  Source: <span className="font-semibold text-[#0B192C]">{job.officialSourceName}</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="primary"
                className="w-full justify-between"
                onClick={() =>
                  setExternalTarget({
                    title: `${job.title} — Official Apply Portal`,
                    portalName: job.officialSourceName,
                    url: job.officialApplyUrl,
                  })
                }
              >
                <span>Open Official Apply Portal</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() =>
                  setExternalTarget({
                    title: `${job.title} — Official Notifications`,
                    portalName: job.officialSourceName,
                    url: job.officialNotificationUrl,
                  })
                }
              >
                <span>Official Notifications &amp; PDFs</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-[11px] leading-relaxed text-[#5C6573]">
              Bharat Connect never charges placement fees or collects Aadhaar/OTP credentials.
              Always submit recruitment forms directly on the official portal.
            </p>
            <div className="border-t border-[#EFECE3] pt-3">
              <ReportIssueButton
                entityType="job"
                entitySlug={job.slug}
                entityTitle={job.title}
                defaultUrl={job.officialApplyUrl}
                compact
              />
            </div>
          </Card>

          <Card className="p-5 border-[#E2DDD1] bg-white">
            <form onSubmit={handleSaveForm} className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-[#0B192C] flex items-center gap-1.5">
                  <Bell className="h-4 w-4 text-[#134E7A]" />
                  Job Tracker &amp; Reminder
                </h3>
                {!dbUser && <span className="text-[11px] text-[#5C6573]">Sign in to save</span>}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4B5565] mb-1">
                  Application Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C] focus:border-[#134E7A] focus:outline-none"
                >
                  {JOB_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4B5565] mb-1">
                  Deadline / Reminder Date
                </label>
                <input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C] focus:border-[#134E7A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4B5565] mb-1">
                  Personal Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Advertisement number, post code, or exam centre notes..."
                  className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C] focus:border-[#134E7A] focus:outline-none"
                />
              </div>

              {saveMessage && <Alert variant="success">{saveMessage}</Alert>}

              <Button type="submit" variant="navy" className="w-full" disabled={saving}>
                {saving ? 'Saving...' : 'Save Progress & Set Reminder'}
              </Button>
            </form>
          </Card>
        </div>
      </div>

      <ExternalPortalModal target={externalTarget} onClose={() => setExternalTarget(null)} />
    </div>
  );
}
