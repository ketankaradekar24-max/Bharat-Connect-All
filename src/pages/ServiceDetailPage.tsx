import { useEffect, useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  CheckSquare,
  ExternalLink,
  ShieldCheck,
  Square,
} from 'lucide-react';
import { ExternalPortalModal } from '../components/ExternalPortalModal.tsx';
import { AnimatedProgressMeter } from '../components/MotionPrimitives.tsx';
import { ReportIssueButton } from '../components/ReportIssueButton.tsx';
import {
  ApplicationJourneyBar,
  TrustStrip,
  type JourneyStage,
} from '../components/SignatureElements.tsx';
import { Alert } from '../components/ui/Alert.tsx';
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { apiFetch } from '../lib/api.ts';
import type { PublicService, ServiceTrackerStatus, UserServiceTracker } from '../types/index.ts';

interface ServiceDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

const SERVICE_STATUSES: ServiceTrackerStatus[] = [
  'Saved',
  'Preparing Documents',
  'Appointment Scheduled',
  'Submitted Externally',
  'Completed',
];

export function ServiceDetailPage({ slug, navigate }: ServiceDetailPageProps) {
  const { dbUser, openAuthModal } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const [service, setService] = useState<PublicService | null>(null);
  const [tracker, setTracker] = useState<UserServiceTracker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [checkedDocs, setCheckedDocs] = useState<number[]>([]);
  const [status, setStatus] = useState<ServiceTrackerStatus>('Saved');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [notes, setNotes] = useState('');
  const [savingTracker, setSavingTracker] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const [externalTarget, setExternalTarget] = useState<{
    title: string;
    portalName: string;
    url: string;
    isThirdParty?: boolean;
  } | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<{
          service: PublicService;
          tracker: UserServiceTracker | null;
        }>(`/api/services/${encodeURIComponent(slug)}`);
        if (!active) return;
        setService(data.service);
        setTracker(data.tracker);
        if (data.tracker) {
          setCompletedSteps(data.tracker.completedSteps || []);
          setCheckedDocs(data.tracker.checkedDocuments || []);
          setStatus(data.tracker.status || 'Saved');
          setReferenceNumber(data.tracker.referenceNumber || '');
          setAppointmentDate(data.tracker.appointmentDate || '');
          setReminderDate(data.tracker.reminderDate || '');
          setNotes(data.tracker.notes || '');
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load service guide.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [slug, dbUser?.id]);

  const persistTracker = async (patch: {
    completedSteps?: number[];
    checkedDocuments?: number[];
    status?: ServiceTrackerStatus;
    referenceNumber?: string | null;
    appointmentDate?: string | null;
    reminderDate?: string | null;
    notes?: string | null;
  }) => {
    if (!dbUser || !service) {
      openAuthModal();
      return;
    }
    setSavingTracker(true);
    setSaveFeedback(null);
    try {
      const res = await apiFetch<{ tracker: UserServiceTracker }>(
        `/api/student/services/${service.id}/tracker`,
        {
          method: 'PUT',
          body: JSON.stringify({
            isSaved: true,
            completedSteps: patch.completedSteps ?? completedSteps,
            checkedDocuments: patch.checkedDocuments ?? checkedDocs,
            status: patch.status ?? status,
            referenceNumber:
              patch.referenceNumber !== undefined
                ? patch.referenceNumber
                : referenceNumber.trim() || null,
            appointmentDate:
              patch.appointmentDate !== undefined
                ? patch.appointmentDate
                : appointmentDate.trim() || null,
            reminderDate:
              patch.reminderDate !== undefined
                ? patch.reminderDate
                : reminderDate.trim() || null,
            notes: patch.notes !== undefined ? patch.notes : notes.trim() || null,
          }),
        }
      );
      setTracker(res.tracker);
      setSaveFeedback('Progress saved to your personal dashboard.');
    } catch (err) {
      setSaveFeedback(err instanceof Error ? err.message : 'Unable to save progress.');
    } finally {
      setSavingTracker(false);
    }
  };

  const toggleDoc = (idx: number) => {
    if (!dbUser) {
      openAuthModal();
      return;
    }
    const next = checkedDocs.includes(idx)
      ? checkedDocs.filter((i) => i !== idx)
      : [...checkedDocs, idx];
    setCheckedDocs(next);
    persistTracker({ checkedDocuments: next });
  };

  const toggleStep = (idx: number) => {
    if (!dbUser) {
      openAuthModal();
      return;
    }
    const next = completedSteps.includes(idx)
      ? completedSteps.filter((i) => i !== idx)
      : [...completedSteps, idx];
    setCompletedSteps(next);
    persistTracker({ completedSteps: next });
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
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <EmptyState
          title={error || 'Service guide not found'}
          description="This service guide is currently unavailable or may have been retired."
          action={
            <Button onClick={() => navigate('/services')}>Back to Explore Services</Button>
          }
        />
      </div>
    );
  }

  const localizedTitle =
    lang === 'kn'
      ? service.translations?.kn?.title || service.title
      : lang === 'hi'
        ? service.translations?.hi?.title || service.title
        : service.title;

  const localizedSummary =
    lang === 'kn'
      ? service.translations?.kn?.summary || service.summary
      : lang === 'hi'
        ? service.translations?.hi?.summary || service.summary
        : service.summary;

  const localizedOverview =
    lang === 'kn'
      ? service.translations?.kn?.overview || service.overview
      : lang === 'hi'
        ? service.translations?.hi?.overview || service.overview
        : service.overview;

  const docPercent =
    service.documentsRequired.length > 0
      ? Math.round((checkedDocs.length / service.documentsRequired.length) * 100)
      : 0;
  const stepPercent =
    service.applicationSteps.length > 0
      ? Math.round((completedSteps.length / service.applicationSteps.length) * 100)
      : 0;

  const journeyStage: JourneyStage =
    status === 'Completed'
      ? 'Complete'
      : status === 'Submitted Externally' || status === 'Appointment Scheduled'
        ? 'Track'
        : stepPercent > 0
          ? 'Apply'
          : docPercent > 0 || status === 'Preparing Documents'
            ? 'Prepare'
            : 'Discover';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumbs
          items={[
            { label: 'Home', path: '/' },
            { label: 'Explore Services', path: '/services' },
            { label: localizedTitle },
          ]}
          navigate={navigate}
        />

        {/* Language Toggle for Service Guidance */}
        <div className="inline-flex items-center gap-1 rounded-lg border border-[#E2DDD1] bg-[#F3EFE6] p-1">
          {(
            [
              { code: 'en', label: 'English' },
              { code: 'kn', label: 'ಕನ್ನಡ' },
              { code: 'hi', label: 'हिन्दी' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.code}
              type="button"
              onClick={() => setLang(opt.code)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                lang === opt.code ? 'bg-white text-[#0B192C] shadow-2xs' : 'text-[#5C6573]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Main 12-Section Guide */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 sm:p-8 space-y-4">
            <p className="text-xs font-medium text-[#5C6573]">
              <span className="font-semibold text-[#134E7A]">{service.category}</span>
              {' · '}
              {service.jurisdiction}
              {' · '}
              {service.state}
              {service.country ? ` · Country: ${service.country}` : ''}
            </p>

            <h1 className="font-display text-2xl font-bold tracking-tight text-[#0B192C] sm:text-3xl">
              {localizedTitle}
            </h1>

            <TrustStrip
              sourceName={service.departmentOrAuthority}
              verifiedAt={service.lastVerifiedAt}
            />

            <p className="text-sm leading-relaxed text-[#475467]">{localizedSummary}</p>

            {lang !== 'en' && (
              <p className="text-xs text-[#5C6573] pt-1">
                Note: Official government forms, legal eligibility rules, and immigration decisions
                are authoritative in English on the official portal.
              </p>
            )}
          </Card>

          <ApplicationJourneyBar activeStage={journeyStage} />

          <Alert variant="info" title="Independent Official Portal Guidance">
            Bharat Connect is an independent guidance platform, not a government department or visa
            agency. Never enter Aadhaar numbers, OTPs, bank credentials, or portal passwords here—you
            will always be directed to the verified official website for final submission.
          </Alert>

          <Card className="divide-y divide-[#E2DDD1]">
            <section className="p-6 space-y-2">
              <h2 className="font-display text-lg font-bold text-[#0B192C]">{t.stepOverview}</h2>
              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                {localizedOverview}
              </p>
            </section>

            <section className="p-6 space-y-2">
              <h2 className="font-display text-lg font-bold text-[#0B192C]">{t.stepWhoCanApply}</h2>
              <p className="text-sm leading-relaxed text-slate-700">{service.whoCanApply}</p>
            </section>

            <section className="p-6 space-y-2">
              <h2 className="font-display text-lg font-bold text-[#0B192C]">{t.stepEligibility}</h2>
              <p className="text-sm leading-relaxed text-slate-700">
                {service.eligibilityRequirements}
              </p>
            </section>

            {/* Interactive Document Checklist */}
            <section className="p-6 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-lg font-bold text-[#0B192C]">{t.stepDocuments}</h2>
                <span className="font-mono text-xs font-semibold text-[#134E7A] tabular-nums">
                  {checkedDocs.length}/{service.documentsRequired.length} ready
                </span>
              </div>
              <ul className="space-y-2">
                {service.documentsRequired.map((doc, idx) => {
                  const checked = checkedDocs.includes(idx);
                  return (
                    <li key={doc}>
                      <button
                        type="button"
                        onClick={() => toggleDoc(idx)}
                        className={`flex w-full items-start gap-3 rounded-lg border p-3.5 text-left text-sm transition-colors ${
                          checked
                            ? 'border-[#0E6B6E]/35 bg-[#EEF7F6] text-[#5C6573]'
                            : 'border-[#E2DDD1] bg-[#FAF8F3]/70 text-[#0B192C] hover:border-[#134E7A]/40 hover:bg-white'
                        }`}
                      >
                        {checked ? (
                          <CheckSquare className="h-4 w-4 text-[#0E6B6E] shrink-0 mt-0.5" />
                        ) : (
                          <Square className="h-4 w-4 text-[#7A828F] shrink-0 mt-0.5" />
                        )}
                        <span className={checked ? 'line-through' : ''}>{doc}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Interactive Application Steps */}
            <section className="p-6 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-lg font-bold text-[#0B192C]">{t.stepProcess}</h2>
                <span className="font-mono text-xs font-semibold text-[#134E7A] tabular-nums">
                  {completedSteps.length}/{service.applicationSteps.length} completed
                </span>
              </div>
              <ol className="space-y-2.5">
                {service.applicationSteps.map((step, idx) => {
                  const done = completedSteps.includes(idx);
                  return (
                    <li key={step}>
                      <button
                        type="button"
                        onClick={() => toggleStep(idx)}
                        className={`flex w-full items-start gap-3 rounded-lg border p-3.5 text-left text-sm transition-colors ${
                          done
                            ? 'border-[#0E6B6E]/35 bg-[#EEF7F6] text-[#5C6573]'
                            : 'border-[#E2DDD1] bg-[#FAF8F3]/70 text-[#0B192C] hover:border-[#134E7A]/40 hover:bg-white'
                        }`}
                      >
                        {done ? (
                          <CheckSquare className="h-4 w-4 text-[#0E6B6E] shrink-0 mt-0.5" />
                        ) : (
                          <Square className="h-4 w-4 text-[#7A828F] shrink-0 mt-0.5" />
                        )}
                        <span className={done ? 'line-through' : ''}>
                          <strong className="font-mono text-xs text-[#C46316] mr-2">
                            Step {idx + 1}.
                          </strong>
                          {step}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className="p-6 space-y-2">
              <h2 className="font-display text-lg font-bold text-[#0B192C]">{t.stepFees}</h2>
              <p className="text-sm leading-relaxed text-slate-700">{service.officialFees}</p>
            </section>

            <section className="p-6 space-y-2">
              <h2 className="font-display text-lg font-bold text-[#0B192C]">
                {t.stepOfficialSite}
              </h2>
              <p className="text-sm text-slate-700">
                <strong>Authority Portal:</strong>{' '}
                <button
                  type="button"
                  onClick={() =>
                    setExternalTarget({
                      title: service.title,
                      portalName: service.officialWebsiteName,
                      url: service.officialWebsiteUrl,
                      isThirdParty: service.isThirdParty,
                    })
                  }
                  className="font-semibold text-[#134E7A] underline hover:text-[#0D3B5E]"
                >
                  {service.officialWebsiteName}
                </button>
              </p>
              <p className="text-xs text-slate-500 break-all">
                Source reference: {service.sourceUrl}
              </p>
            </section>

            {service.appointmentProcess && (
              <section className="p-6 space-y-2">
                <h2 className="font-display text-lg font-bold text-[#0B192C]">
                  {t.stepAppointment}
                </h2>
                <p className="text-sm leading-relaxed text-slate-700">
                  {service.appointmentProcess}
                </p>
              </section>
            )}

            <section className="p-6 space-y-2">
              <h2 className="font-display text-lg font-bold text-[#0B192C]">{t.stepTracking}</h2>
              <p className="text-sm leading-relaxed text-slate-700">{service.trackingGuidance}</p>
            </section>

            {service.commonMistakes.length > 0 && (
              <section className="p-6 space-y-2">
                <h2 className="font-display text-lg font-bold text-[#0B192C]">{t.stepMistakes}</h2>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
                  {service.commonMistakes.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </section>
            )}

            {service.faqs.length > 0 && (
              <section className="p-6 space-y-3">
                <h2 className="font-display text-lg font-bold text-[#0B192C]">{t.stepFaqs}</h2>
                <div className="space-y-3.5">
                  {service.faqs.map((f) => (
                    <div key={f.q} className="space-y-1">
                      <p className="text-sm font-semibold text-[#0B192C]">{f.q}</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{f.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="p-6 space-y-1">
              <h2 className="font-display text-lg font-bold text-[#0B192C]">{t.stepVerified}</h2>
              <p className="text-xs text-slate-600 tabular-nums">
                Last verified:{' '}
                {service.lastVerifiedAt
                  ? new Date(service.lastVerifiedAt).toLocaleString('en-IN')
                  : 'Pending verification'}
                {service.nextReviewAt &&
                  ` · Scheduled next review: ${new Date(service.nextReviewAt).toLocaleDateString('en-IN')}`}
              </p>
            </section>
          </Card>
        </div>

        {/* Sticky Sidebar: Actions + Checklist Progress + Personal Notes */}
        <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
          <Card className="p-6 space-y-5">
            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={() =>
                  setExternalTarget({
                    title: service.title,
                    portalName: service.officialWebsiteName,
                    url: service.officialApplyUrl,
                    isThirdParty: service.isThirdParty,
                  })
                }
              >
                <span>Proceed to Official Portal</span>
                <ExternalLink className="h-4 w-4" />
              </Button>

              <Button
                variant={tracker ? 'secondary' : 'outline'}
                className="w-full"
                onClick={() => persistTracker({})}
                disabled={savingTracker}
              >
                {tracker ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 text-[#134E7A]" />
                    <span>Saved in My Services</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4 text-slate-500" />
                    <span>Save &amp; Track Progress</span>
                  </>
                )}
              </Button>
            </div>

            {/* Preparation Meters */}
            <div className="space-y-3 border-t border-[#EFECE3] pt-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-medium text-[#475467]">
                  <span>Documents Checklist</span>
                  <span className="font-mono tabular-nums text-[#0B192C]">{docPercent}%</span>
                </div>
                <AnimatedProgressMeter
                  percent={docPercent}
                  tone="teal"
                  label="Documents checklist progress"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-medium text-[#475467]">
                  <span>Application Steps</span>
                  <span className="font-mono tabular-nums text-[#0B192C]">{stepPercent}%</span>
                </div>
                <AnimatedProgressMeter
                  percent={stepPercent}
                  tone="lapis"
                  label="Application steps progress"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <ReportIssueButton
                entityType="service"
                entitySlug={service.slug}
                entityTitle={service.title}
                defaultUrl={service.officialApplyUrl}
                compact
              />
            </div>
          </Card>

          {/* Personal Notes & Manual Tracker */}
          <Card className="p-6 space-y-4">
            <div>
              <h2 className="font-display text-base font-bold text-[#0B192C]">
                Personal Service Tracker
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                Save your external reference number, appointment date, and reminders locally in
                your workspace.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block space-y-1 text-xs font-medium text-slate-700">
                <span>Progress Stage</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ServiceTrackerStatus)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  {SERVICE_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1 text-xs font-medium text-slate-700">
                <span>Reference / File # (Optional)</span>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. KA01-2026-..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 font-mono"
                />
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <label className="block space-y-1 text-xs font-medium text-slate-700">
                  <span>Appointment</span>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs text-slate-900 tabular-nums"
                  />
                </label>

                <label className="block space-y-1 text-xs font-medium text-slate-700">
                  <span>Reminder</span>
                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs text-slate-900 tabular-nums"
                  />
                </label>
              </div>

              <label className="block space-y-1 text-xs font-medium text-slate-700">
                <span>Personal Notes</span>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Office location, pending documents, remarks..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </label>
            </div>

            {saveFeedback && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>{saveFeedback}</span>
              </div>
            )}

            <Button
              className="w-full"
              onClick={() => persistTracker({})}
              disabled={savingTracker}
            >
              {savingTracker ? 'Saving...' : 'Save Service Progress'}
            </Button>
          </Card>
        </aside>
      </div>

      <ExternalPortalModal target={externalTarget} onClose={() => setExternalTarget(null)} />
    </div>
  );
}
