import { useEffect, useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  CheckSquare,
  ExternalLink,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { EligibilityIndicator } from '../components/EligibilityIndicator.tsx';
import { ExternalPortalModal } from '../components/ExternalPortalModal.tsx';
import { ReportIssueButton } from '../components/ReportIssueButton.tsx';
import { Alert } from '../components/ui/Alert.tsx';
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { apiFetch } from '../lib/api.ts';
import type {
  ApplicationStatus,
  EligibilityAssessment,
  Scholarship,
  ScholarshipApplication,
} from '../types/index.ts';

interface ScholarshipDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

const APPLICATION_STATUSES: ApplicationStatus[] = [
  'Interested',
  'Preparing Documents',
  'Ready to Apply',
  'Applied',
  'Under Review',
  'Approved',
  'Rejected',
  'Closed',
];

export function ScholarshipDetailPage({ slug, navigate }: ScholarshipDetailPageProps) {
  const { dbUser, openAuthModal } = useAuth();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityAssessment | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [application, setApplication] = useState<ScholarshipApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [trackerMessage, setTrackerMessage] = useState<string | null>(null);
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
        const data = await apiFetch<{
          scholarship: Scholarship;
          eligibility: EligibilityAssessment | null;
          isSaved: boolean;
          application: ScholarshipApplication | null;
        }>(`/api/scholarships/${encodeURIComponent(slug)}`);
        if (!active) return;
        setScholarship(data.scholarship);
        setEligibility(data.eligibility);
        setIsSaved(data.isSaved);
        setApplication(data.application);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load scholarship.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [slug, dbUser?.id]);

  const handleToggleSave = async () => {
    if (!dbUser || !scholarship) {
      openAuthModal();
      return;
    }
    if (isSaved) {
      await apiFetch(`/api/student/saved/${scholarship.id}`, { method: 'DELETE' });
      setIsSaved(false);
    } else {
      await apiFetch(`/api/student/saved/${scholarship.id}`, { method: 'POST' });
      setIsSaved(true);
    }
  };

  const handleTrackApplication = async (status: ApplicationStatus = 'Interested') => {
    if (!dbUser || !scholarship) {
      openAuthModal();
      return;
    }
    setTrackerMessage(null);
    if (!application) {
      const res = await apiFetch<{ application: ScholarshipApplication }>(
        '/api/student/applications',
        {
          method: 'POST',
          body: JSON.stringify({ scholarshipId: scholarship.id, status }),
        }
      );
      setApplication(res.application);
      setTrackerMessage('Added to your Application Tracker.');
    } else {
      const res = await apiFetch<{ application: ScholarshipApplication }>(
        `/api/student/applications/${application.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        }
      );
      setApplication(res.application);
      setTrackerMessage(`Application status updated to "${status}".`);
    }
  };

  const handleCopyShare = async () => {
    const shareUrl = window.location.href;
    await navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
        <Skeleton className="h-6 w-52" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="h-56" />
            <Skeleton className="h-96" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-72" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !scholarship) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <EmptyState
          title={error || 'Scholarship not found'}
          description="The requested scholarship guide could not be loaded or may have been archived."
          action={
            <Button onClick={() => navigate('/scholarships')}>Back to Scholarships</Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', path: '/' },
          { label: 'Scholarships', path: '/scholarships' },
          { label: scholarship.title },
        ]}
        navigate={navigate}
      />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 sm:p-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{scholarship.providerType}</span>
              <span aria-hidden="true">·</span>
              <span>{scholarship.state}</span>
              <span aria-hidden="true">·</span>
              <span>{scholarship.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-emerald-700">
                {scholarship.verificationStatus === 'verified' && scholarship.lastVerifiedAt
                  ? `Verified ${new Date(scholarship.lastVerifiedAt).toLocaleDateString('en-IN')}`
                  : 'Verification incomplete'}
              </span>
            </div>

            <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#0B192C] sm:text-3xl">
              {scholarship.title}
            </h1>
            <p className="text-sm font-medium text-slate-600">{scholarship.providerName}</p>
            <p className="text-sm leading-relaxed text-slate-700">{scholarship.summary}</p>
          </Card>

          {/* Rule-based Eligibility Check */}
          <Card className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-[#0B192C]">
                Rule-Based Eligibility Pre-Check
              </h2>
              {eligibility && <EligibilityIndicator assessment={eligibility} />}
            </div>

            {!dbUser ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">
                  Sign in and complete your student profile to check how your details match these
                  eligibility rules.
                </p>
                <Button size="sm" onClick={openAuthModal}>
                  Sign In to Check
                </Button>
              </div>
            ) : (
              eligibility && (
                <div className="space-y-3 text-sm">
                  {eligibility.matchedReasons.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-emerald-800">Matched criteria</p>
                      <ul className="mt-1.5 list-disc pl-5 space-y-1 text-slate-700">
                        {eligibility.matchedReasons.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {eligibility.failedReasons.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-700">Criteria not met</p>
                      <ul className="mt-1.5 list-disc pl-5 space-y-1 text-slate-700">
                        {eligibility.failedReasons.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {eligibility.missingFields.length > 0 && (
                    <Alert
                      variant="warning"
                      action={
                        <button
                          type="button"
                          onClick={() => navigate('/profile')}
                          className="text-xs font-semibold text-[#134E7A] underline hover:text-[#0D3B5E]"
                        >
                          Update Profile
                        </button>
                      }
                    >
                      Missing profile information: {eligibility.missingFields.join(', ')}
                    </Alert>
                  )}
                  <p className="text-xs text-slate-500">{eligibility.disclaimer}</p>
                </div>
              )
            )}
          </Card>

          {/* Plain-language Detail Sections */}
          <Card className="divide-y divide-slate-200">
            <section className="p-6 space-y-2">
              <h2 className="font-display text-lg font-bold text-[#0B192C]">01. Overview</h2>
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {scholarship.overview}
              </p>
            </section>

            <section className="p-6 space-y-2">
              <h2 className="font-display text-lg font-bold text-[#0B192C]">02. Who Can Apply</h2>
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {scholarship.whoCanApply}
              </p>
              <p className="text-xs text-slate-500 pt-1">
                Education Levels: {scholarship.educationLevels.join(', ')} · Eligible Courses:{' '}
                {scholarship.eligibleCourses.join(', ')}
              </p>
            </section>

            <section className="p-6 space-y-2">
              <h2 className="font-display text-lg font-bold text-[#0B192C]">
                03. Eligibility Details
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {scholarship.eligibilityDetails}
              </p>
            </section>

            <section className="p-6 space-y-2">
              <h2 className="font-display text-lg font-bold text-[#0B192C]">
                04. Financial Benefits
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {scholarship.benefitsSummary}
              </p>
            </section>

            <section className="p-6 space-y-2">
              <h2 className="font-display text-lg font-bold text-[#0B192C]">
                05. Required Documents
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
                {scholarship.requiredDocuments.map((doc) => (
                  <li key={doc}>{doc}</li>
                ))}
              </ul>
            </section>

            <section className="p-6 space-y-2">
              <h2 className="font-display text-lg font-bold text-[#0B192C]">
                06. Application Steps
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {scholarship.applicationProcedure}
              </p>
            </section>

            <section className="p-6 space-y-2">
              <h2 className="font-display text-lg font-bold text-[#0B192C]">
                07. Important Dates &amp; Official Source
              </h2>
              <p className="text-sm text-slate-700">
                <strong>Deadline:</strong>{' '}
                <span className="tabular-nums">
                  {scholarship.deadlineDate
                    ? scholarship.deadlineDate
                    : scholarship.importantDatesText ||
                      'Not fixed — check the official portal for current cycle dates.'}
                </span>
              </p>
              <p className="text-sm text-slate-700">
                <strong>Official Source:</strong>{' '}
                <a
                  href={scholarship.officialSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#134E7A] underline hover:text-[#0D3B5E]"
                >
                  {scholarship.officialSourceName}
                </a>
              </p>
              <p className="text-xs text-slate-500 tabular-nums">
                Last verified:{' '}
                {scholarship.lastVerifiedAt
                  ? new Date(scholarship.lastVerifiedAt).toLocaleString('en-IN')
                  : 'Unverified'}
              </p>
            </section>
          </Card>
        </div>

        {/* Sticky Sidebar Actions & Summary */}
        <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
          <Card className="p-6 space-y-5">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#134E7A]">Action &amp; Tracking</p>
              <h2 className="font-display text-lg font-bold text-[#0B192C]">
                Apply &amp; Track Progress
              </h2>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 border-t border-b border-slate-100 py-4">
              <div>
                <p className="font-semibold text-slate-900">Deadline</p>
                <p className="mt-0.5 tabular-nums">
                  {scholarship.deadlineDate ||
                    scholarship.importantDatesText ||
                    'Check official portal'}
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Benefits</p>
                <p className="mt-0.5">{scholarship.benefitsSummary}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Official Authority</p>
                <p className="mt-0.5">{scholarship.officialSourceName}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <Button
                className="w-full"
                size="lg"
                onClick={() =>
                  setExternalTarget({
                    title: scholarship.title,
                    portalName: scholarship.officialSourceName,
                    url: scholarship.officialApplyUrl,
                  })
                }
              >
                <span>Apply on Official Portal</span>
                <ExternalLink className="h-4 w-4" />
              </Button>

              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  variant={isSaved ? 'secondary' : 'outline'}
                  size="md"
                  onClick={handleToggleSave}
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="h-4 w-4 text-[#134E7A]" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4 text-slate-500" />
                      <span>Save</span>
                    </>
                  )}
                </Button>

                <Button variant="outline" size="md" onClick={handleCopyShare}>
                  <Share2 className="h-4 w-4 text-slate-500" />
                  <span>{copied ? 'Copied' : 'Share'}</span>
                </Button>
              </div>

              {!application ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleTrackApplication('Interested')}
                >
                  <CheckSquare className="h-4 w-4 text-slate-500" />
                  <span>Add to Application Tracker</span>
                </Button>
              ) : (
                <label className="block space-y-1.5 text-xs font-medium text-slate-700 pt-1">
                  <span>Application Tracker Stage</span>
                  <select
                    value={application.status}
                    onChange={(e) => handleTrackApplication(e.target.value as ApplicationStatus)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-[#134E7A]"
                  >
                    {APPLICATION_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {trackerMessage && (
                <p className="text-xs font-semibold text-emerald-700">{trackerMessage}</p>
              )}
            </div>
          </Card>

          <Card className="p-5 bg-slate-50/80 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>Independent Guidance Notice</span>
            </div>
            <p className="leading-relaxed">
              Bharat Connect never submits applications on your behalf or guarantees selection.
              Always verify final criteria on the official website.
            </p>
            <div className="border-t border-slate-200 pt-3">
              <ReportIssueButton
                entityType="scholarship"
                entitySlug={scholarship.slug}
                entityTitle={scholarship.title}
                defaultUrl={scholarship.officialApplyUrl}
                compact
              />
            </div>
          </Card>
        </aside>
      </div>

      <ExternalPortalModal target={externalTarget} onClose={() => setExternalTarget(null)} />
    </div>
  );
}
