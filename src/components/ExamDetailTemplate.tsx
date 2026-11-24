import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Bell,
  Bookmark,
  BookOpen,
  CalendarClock,
  Check,
  CheckSquare,
  ExternalLink,
  FileText,
  GraduationCap,
  ShieldCheck,
  Square,
} from 'lucide-react';
import { ExternalPortalModal } from './ExternalPortalModal.tsx';
import { AnimatedProgressMeter } from './MotionPrimitives.tsx';
import { ReportIssueButton } from './ReportIssueButton.tsx';
import {
  ApplicationJourneyBar,
  DeadlineUrgency,
  TrustStrip,
  type JourneyStage,
} from './SignatureElements.tsx';
import { Alert } from './ui/Alert.tsx';
import { Breadcrumbs } from './ui/Breadcrumbs.tsx';
import { Button } from './ui/Button.tsx';
import { Card } from './ui/Card.tsx';
import { Skeleton } from './ui/Skeleton.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { apiFetch } from '../lib/api.ts';
import type { Exam, UserExamTracker } from '../types/index.ts';

export interface ExamDetailTemplateProps {
  slug?: string;
  initialExam?: Exam | null;
  initialTracker?: UserExamTracker | null;
  navigate: (path: string) => void;
  showBreadcrumbs?: boolean;
  compact?: boolean;
  onExamLoaded?: (exam: Exam) => void;
}

const EXAM_STATUSES = [
  'Interested',
  'Preparing',
  'Documents Ready',
  'Applied',
  'Under Review',
  'Selected',
  'Completed',
];

function formatStepNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}

export function ExamDetailTemplate({
  slug,
  initialExam = null,
  initialTracker = null,
  navigate,
  showBreadcrumbs = true,
  compact = false,
  onExamLoaded,
}: ExamDetailTemplateProps) {
  const { dbUser, openAuthModal } = useAuth();
  const [exam, setExam] = useState<Exam | null>(initialExam);
  const [tracker, setTracker] = useState<UserExamTracker | null>(initialTracker);
  const [loading, setLoading] = useState<boolean>(() => Boolean(slug && !initialExam));
  const [error, setError] = useState<string | null>(null);

  const [checkedDocs, setCheckedDocs] = useState<number[]>(
    () => initialTracker?.checkedDocuments ?? []
  );
  const [completedSteps, setCompletedSteps] = useState<number[]>(
    () => initialTracker?.completedSteps ?? []
  );
  const [status, setStatus] = useState(() => initialTracker?.status || 'Interested');
  const [reminderDate, setReminderDate] = useState(() => initialTracker?.reminderDate || '');
  const [notes, setNotes] = useState(() => initialTracker?.notes || '');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [externalTarget, setExternalTarget] = useState<{
    title: string;
    portalName: string;
    url: string;
  } | null>(null);

  useEffect(() => {
    if (initialExam) {
      setExam(initialExam);
    }
    if (initialTracker) {
      setTracker(initialTracker);
      setCheckedDocs(initialTracker.checkedDocuments ?? []);
      setCompletedSteps(initialTracker.completedSteps ?? []);
      setStatus(initialTracker.status || 'Interested');
      setReminderDate(initialTracker.reminderDate || '');
      setNotes(initialTracker.notes || '');
    }
  }, [initialExam, initialTracker]);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const targetSlug = slug;
    let active = true;
    async function load() {
      if (!initialExam) {
        setLoading(true);
      }
      setError(null);
      try {
        const data = await apiFetch<{ exam: Exam; tracker: UserExamTracker | null }>(
          `/api/exams/${encodeURIComponent(targetSlug)}`
        );
        if (!active) return;
        setExam(data.exam);
        setTracker(data.tracker);
        if (data.tracker) {
          setCheckedDocs(data.tracker.checkedDocuments ?? []);
          setCompletedSteps(data.tracker.completedSteps ?? []);
          setStatus(data.tracker.status || 'Interested');
          setReminderDate(data.tracker.reminderDate || '');
          setNotes(data.tracker.notes || '');
        } else {
          setCheckedDocs([]);
          setCompletedSteps([]);
          setStatus('Interested');
          setReminderDate('');
          setNotes('');
        }
        onExamLoaded?.(data.exam);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load exam guide.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [slug, dbUser?.id, initialExam, onExamLoaded]);

  const persistTracker = async (patch: Record<string, unknown>, message?: string) => {
    if (!exam) return;
    if (!dbUser) {
      openAuthModal();
      return;
    }
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await apiFetch<{ tracker: UserExamTracker }>(
        `/api/student/exams/${exam.id}/tracker`,
        {
          method: 'PUT',
          body: JSON.stringify(patch),
        }
      );
      setTracker(res.tracker);
      if (message) setSaveMessage(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save exam progress.');
    } finally {
      setSaving(false);
    }
  };

  const toggleDoc = (idx: number) => {
    const next = checkedDocs.includes(idx)
      ? checkedDocs.filter((i) => i !== idx)
      : [...checkedDocs, idx];
    setCheckedDocs(next);
    if (dbUser) {
      persistTracker({ checkedDocuments: next });
    }
  };

  const toggleStep = (idx: number) => {
    const next = completedSteps.includes(idx)
      ? completedSteps.filter((i) => i !== idx)
      : [...completedSteps, idx];
    setCompletedSteps(next);
    if (dbUser) {
      persistTracker({ completedSteps: next });
    }
  };

  const handleSaveForm = (e: FormEvent) => {
    e.preventDefault();
    persistTracker(
      {
        isSaved: true,
        status,
        checkedDocuments: checkedDocs,
        completedSteps,
        reminderDate: reminderDate || null,
        notes: notes.trim() || null,
      },
      'Exam progress & reminder saved to your Personal Dashboard.'
    );
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  if (error || !exam) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-4">
        <Alert variant="error" title="Exam guide unavailable">
          {error || 'The requested exam guide could not be found.'}
        </Alert>
        <Button variant="outline" onClick={() => navigate('/exams')}>
          Back to Competitive Exams
        </Button>
      </div>
    );
  }

  const docPercent =
    exam.requiredDocuments.length > 0
      ? Math.round((checkedDocs.length / exam.requiredDocuments.length) * 100)
      : 0;
  const stepPercent =
    exam.applicationSteps.length > 0
      ? Math.round((completedSteps.length / exam.applicationSteps.length) * 100)
      : 0;
  const journeyStage: JourneyStage =
    status === 'Completed' || status === 'Selected'
      ? 'Complete'
      : status === 'Applied' || status === 'Under Review'
        ? 'Track'
        : stepPercent > 0
          ? 'Apply'
          : docPercent > 0 || status === 'Preparing' || status === 'Documents Ready'
            ? 'Prepare'
            : 'Discover';

  return (
    <div className={compact ? 'space-y-6' : 'mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6'}>
      {showBreadcrumbs && (
        <Breadcrumbs
          items={[
            { label: 'Home', path: '/' },
            { label: 'Competitive Exams', path: '/exams' },
            {
              label: exam.category,
              path: `/exams?category=${encodeURIComponent(exam.category)}`,
            },
            { label: exam.examName },
          ]}
          navigate={navigate}
        />
      )}

      {/* Top Exam Banner & Quick Jump Actions */}
      <Card className="p-6 space-y-4 border-[#E2DDD1] bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <p className="text-xs font-medium text-[#5C6573]">
              <span className="font-semibold text-[#134E7A]">{exam.category}</span>
              {' · '}
              {exam.subcategory}
              {' · '}
              {exam.state}
              {exam.jurisdiction && exam.jurisdiction !== exam.state
                ? ` · ${exam.jurisdiction}`
                : ''}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B192C]">
              {exam.examName} — {exam.fullName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <TrustStrip
                sourceName={exam.conductingAuthority}
                verifiedAt={exam.lastVerifiedAt}
              />
              <DeadlineUrgency
                dateStr={exam.nextExamDate}
                fallbackText={exam.importantDatesText}
              />
            </div>
            {exam.tags && exam.tags.length > 0 && (
              <p className="text-xs text-[#5C6573] pt-0.5">
                Focus Areas: {exam.tags.join(' · ')}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                persistTracker(
                  { isSaved: !(tracker?.isSaved ?? false) },
                  tracker?.isSaved ? 'Removed from saved exams.' : 'Exam saved to dashboard.'
                )
              }
            >
              {tracker?.isSaved ? (
                <Check className="h-4 w-4 text-[#0E6B6E]" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
              {tracker?.isSaved ? 'Saved Exam' : 'Save Exam'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setExternalTarget({
                  title: `${exam.examName} Official Application Portal`,
                  portalName: exam.conductingAuthority,
                  url: exam.officialApplyUrl,
                })
              }
            >
              Apply on Official Website
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-[#EFECE3] pt-4">
          <Button variant="secondary" size="sm" onClick={() => scrollToSection('eligibility-sec')}>
            Eligibility
          </Button>
          <Button variant="secondary" size="sm" onClick={() => scrollToSection('syllabus-sec')}>
            Syllabus &amp; Links
          </Button>
          <Button variant="secondary" size="sm" onClick={() => scrollToSection('dates-sec')}>
            Dates &amp; Fees
          </Button>
          <Button variant="secondary" size="sm" onClick={() => scrollToSection('docs-sec')}>
            Document Checklist
          </Button>
          <Button variant="secondary" size="sm" onClick={() => scrollToSection('steps-sec')}>
            Registration Steps
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setExternalTarget({
                title: `${exam.examName} Official Notification & Syllabus`,
                portalName: exam.conductingAuthority,
                url: exam.officialNotificationUrl,
              })
            }
          >
            Official Notification
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Card>

      {!compact && <ApplicationJourneyBar activeStage={journeyStage} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left 8 Columns: Full Structured Exam Guide */}
        <div className={compact ? 'lg:col-span-12 space-y-5' : 'lg:col-span-8 space-y-5'}>
          <Card className="p-5 sm:p-6 space-y-3 border-[#E2DDD1] bg-white">
            <h2 className="font-display text-lg font-bold text-[#0B192C]">
              01. Exam Purpose &amp; Who Should Apply
            </h2>
            <p className="text-sm leading-relaxed text-[#4B5565]">{exam.examPurpose}</p>
            <div className="rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-3.5 text-sm text-[#4B5565]">
              <strong className="text-[#0B192C]">Who should apply: </strong>
              {exam.whoShouldApply}
            </div>
          </Card>

          <div id="eligibility-sec">
            <Card className="p-5 sm:p-6 space-y-3 border-[#E2DDD1] bg-white">
              <h2 className="font-display text-lg font-bold text-[#0B192C]">
                02. Eligibility, Age Limit &amp; Qualification
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-3.5">
                  <p className="text-xs font-semibold text-[#5C6573]">
                    Qualification Requirements
                  </p>
                  <p className="mt-1 text-sm text-[#0B192C]">{exam.qualificationRequirements}</p>
                </div>
                <div className="rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-3.5">
                  <p className="text-xs font-semibold text-[#5C6573]">Age Limit</p>
                  <p className="mt-1 text-sm text-[#0B192C]">{exam.ageLimit}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-[#4B5565]">{exam.eligibility}</p>
            </Card>
          </div>

          <div id="syllabus-sec">
            <Card className="p-5 sm:p-6 space-y-4 border-[#E2DDD1] bg-white">
              <h2 className="font-display text-lg font-bold text-[#0B192C] flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#134E7A]" />
                03. Exam Pattern, Syllabus &amp; Official Syllabus Links
              </h2>
              <div className="space-y-2.5 text-sm text-[#4B5565]">
                <p>
                  <strong className="text-[#0B192C]">Exam Pattern: </strong>
                  {exam.examPattern}
                </p>
                <p>
                  <strong className="text-[#0B192C]">Syllabus Summary: </strong>
                  {exam.syllabusSummary}
                </p>
              </div>

              <div className="border-t border-[#EFECE3] pt-3.5 space-y-2.5">
                <p className="text-xs font-semibold text-[#5C6573]">
                  Official Syllabus, Notification &amp; Preparation Links
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setExternalTarget({
                        title: `${exam.examName} Official Notification & Syllabus`,
                        portalName: exam.conductingAuthority,
                        url: exam.officialNotificationUrl,
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D6CFC2] bg-[#FAF8F3] px-3 py-1.5 text-xs font-semibold text-[#134E7A] hover:border-[#134E7A] hover:bg-white transition-colors"
                  >
                    <span>Official Syllabus &amp; Information Bulletin</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>

                  {exam.prepResources.map((res, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        setExternalTarget({
                          title: res.title,
                          portalName: res.source,
                          url: res.url,
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#D6CFC2] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B192C] hover:border-[#134E7A] hover:text-[#134E7A] transition-colors"
                    >
                      <span>
                        {res.title} ({res.source})
                      </span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  ))}

                  {exam.previousPapersUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setExternalTarget({
                          title: `${exam.examName} Previous Question Papers`,
                          portalName: exam.conductingAuthority,
                          url: exam.previousPapersUrl!,
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#D6CFC2] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B192C] hover:border-[#134E7A] hover:text-[#134E7A] transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5 text-[#134E7A]" />
                      <span>Previous Question Papers</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div id="dates-sec">
            <Card className="p-5 sm:p-6 space-y-3 border-[#E2DDD1] bg-white">
              <h2 className="font-display text-lg font-bold text-[#0B192C] flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-[#134E7A]" />
                04. Important Dates, Registration &amp; Application Fee
              </h2>
              <div className="space-y-2.5 text-sm text-[#4B5565]">
                <p>
                  <strong className="text-[#0B192C]">Important Dates: </strong>
                  <span className="tabular-nums">{exam.importantDatesText}</span>
                </p>
                <p>
                  <strong className="text-[#0B192C]">Registration Window: </strong>
                  {exam.registrationInfo}
                </p>
                <p>
                  <strong className="text-[#0B192C]">Application Fee: </strong>
                  <span className="tabular-nums">{exam.applicationFee}</span>
                </p>
              </div>
            </Card>
          </div>

          <div id="docs-sec">
            <Card className="p-5 sm:p-6 space-y-3 border-[#E2DDD1] bg-white">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-[#0B192C]">
                  05. Required Documents Checklist
                </h2>
                <span className="font-mono text-xs font-semibold text-[#5C6573] tabular-nums">
                  {checkedDocs.length}/{exam.requiredDocuments.length} ready
                </span>
              </div>
              <div className="space-y-2">
                {exam.requiredDocuments.map((doc, idx) => {
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
          </div>

          <div id="steps-sec">
            <Card className="p-5 sm:p-6 space-y-3 border-[#E2DDD1] bg-white">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-[#0B192C]">
                  06. Step-by-Step Registration &amp; Application Steps
                </h2>
                <span className="font-mono text-xs font-semibold text-[#5C6573] tabular-nums">
                  {completedSteps.length}/{exam.applicationSteps.length} done
                </span>
              </div>
              <div className="space-y-2">
                {exam.applicationSteps.map((step, idx) => {
                  const done = completedSteps.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleStep(idx)}
                      className={`flex w-full items-start gap-3 rounded-lg border px-3.5 py-3 text-left text-sm transition-colors ${
                        done
                          ? 'border-[#134E7A]/35 bg-[#F1F6FA] text-[#0B192C]'
                          : 'border-[#E2DDD1] bg-white text-[#4B5565] hover:bg-[#FAF8F3]'
                      }`}
                    >
                      <span className="mt-0.5 font-mono text-xs font-bold text-[#C46316] tabular-nums">
                        {formatStepNumber(idx)}.
                      </span>
                      <span className="flex-1">{step}</span>
                      {done ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#134E7A]" />
                      ) : (
                        <Square className="mt-0.5 h-4 w-4 shrink-0 text-[#CFC8B8]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          <Card className="p-5 sm:p-6 space-y-4 border-[#E2DDD1] bg-white">
            <h2 className="font-display text-lg font-bold text-[#0B192C] flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[#134E7A]" />
              07. Admit Card, Results, Previous Papers &amp; Counselling
            </h2>
            <div className="space-y-3 text-sm text-[#4B5565]">
              <p>
                <strong className="text-[#0B192C]">Admit Card: </strong>
                {exam.admitCardInfo}
              </p>
              <p>
                <strong className="text-[#0B192C]">Previous Question Papers: </strong>
                {exam.previousPapersInfo}
              </p>
              <p>
                <strong className="text-[#0B192C]">Results &amp; Scorecard: </strong>
                {exam.resultsInfo}
              </p>
              <p>
                <strong className="text-[#0B192C]">Counselling / Selection Process: </strong>
                {exam.counsellingProcess}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EFECE3] pt-3">
              <button
                type="button"
                onClick={() => navigate('/counselling')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#134E7A] hover:underline"
              >
                <span>Explore Counselling &amp; Seat Allotment Playbooks</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/colleges')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B192C] hover:text-[#134E7A]"
              >
                <span>Find Accepting Colleges &amp; Universities</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </Card>
        </div>

        {/* Right 4 Columns: Official Portal Buttons & Personal Exam Tracker */}
        {!compact && (
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
            <Card className="p-5 space-y-4 border-[#E2DDD1] bg-white">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-5 w-5 shrink-0 text-[#0E6B6E] mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#0B192C]">Official Portal Links</p>
                  <p className="text-xs text-[#5C6573]">
                    Last Verified:{' '}
                    <span className="font-mono tabular-nums">
                      {exam.lastVerifiedAt
                        ? new Date(exam.lastVerifiedAt).toLocaleDateString('en-IN')
                        : 'Verified'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="primary"
                  className="w-full justify-between"
                  onClick={() =>
                    setExternalTarget({
                      title: `${exam.examName} Application Portal`,
                      portalName: exam.conductingAuthority,
                      url: exam.officialApplyUrl,
                    })
                  }
                >
                  <span>Apply on Official Website</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() =>
                    setExternalTarget({
                      title: `${exam.examName} Official Website`,
                      portalName: exam.conductingAuthority,
                      url: exam.officialWebsiteUrl,
                    })
                  }
                >
                  <span>Official Exam Website</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() =>
                    setExternalTarget({
                      title: `${exam.examName} Official Notification & Syllabus`,
                      portalName: exam.conductingAuthority,
                      url: exam.officialNotificationUrl,
                    })
                  }
                >
                  <span>Official Notification &amp; Syllabus</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
                {exam.previousPapersUrl && (
                  <Button
                    variant="secondary"
                    className="w-full justify-between"
                    onClick={() =>
                      setExternalTarget({
                        title: `${exam.examName} Previous Question Papers`,
                        portalName: exam.conductingAuthority,
                        url: exam.previousPapersUrl!,
                      })
                    }
                  >
                    <span>Official Question Papers</span>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <p className="text-[11px] leading-relaxed text-[#5C6573]">
                Bharat Connect is an independent guidance platform. All registrations, fees, and
                admit cards occur strictly on the conducting authority’s official domain.
              </p>
              <div className="space-y-3 border-t border-[#EFECE3] pt-3.5 text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-medium text-[#475467]">
                    <span>Documents Checklist</span>
                    <span className="font-mono tabular-nums text-[#0B192C]">{docPercent}%</span>
                  </div>
                  <AnimatedProgressMeter
                    percent={docPercent}
                    tone="teal"
                    label="Exam documents readiness"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-medium text-[#475467]">
                    <span>Registration Steps</span>
                    <span className="font-mono tabular-nums text-[#0B192C]">{stepPercent}%</span>
                  </div>
                  <AnimatedProgressMeter
                    percent={stepPercent}
                    tone="lapis"
                    label="Exam registration steps"
                  />
                </div>
              </div>

              <div className="border-t border-[#EFECE3] pt-3">
                <ReportIssueButton
                  entityType="exam"
                  entitySlug={exam.slug}
                  entityTitle={`${exam.examName} — ${exam.fullName}`}
                  defaultUrl={exam.officialWebsiteUrl}
                  compact
                />
              </div>
            </Card>

            <Card className="p-5 border-[#E2DDD1] bg-white">
              <form onSubmit={handleSaveForm} className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-[#0B192C] flex items-center gap-1.5">
                    <Bell className="h-4 w-4 text-[#134E7A]" />
                    Exam Tracker &amp; Reminder
                  </h3>
                  {!dbUser && (
                    <span className="text-[11px] text-[#5C6573]">Sign in to save</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4B5565] mb-1">
                    Preparation / Application Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C] focus:border-[#134E7A] focus:outline-none"
                  >
                    {EXAM_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4B5565] mb-1">
                    Set Personal Reminder Date
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
                    Personal Notes (Exam City / Target Score / Registration ID)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Avoid storing portal passwords here..."
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
        )}
      </div>

      <ExternalPortalModal target={externalTarget} onClose={() => setExternalTarget(null)} />
    </div>
  );
}
