import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Bell,
  Bookmark,
  Calendar,
  Check,
  CheckCircle2,
  Compass,
  ExternalLink,
  FileWarning,
  Trash2,
} from 'lucide-react';
import { EligibilityIndicator } from '../components/EligibilityIndicator.tsx';
import { ExternalPortalModal } from '../components/ExternalPortalModal.tsx';
import { AnimatedProgressMeter } from '../components/MotionPrimitives.tsx';
import { ApplicationJourneyBar, DeadlineUrgency } from '../components/SignatureElements.tsx';
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { Tabs } from '../components/ui/Tabs.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { apiFetch } from '../lib/api.ts';
import type {
  ApplicationStatus,
  ItemTrackerStatus,
  NotificationItem,
  ProfileCompletion,
  Scholarship,
  ScholarshipApplication,
  UserExamTracker,
  UserJobTracker,
  UserServiceTracker,
} from '../types/index.ts';

interface StudentDashboardPageProps {
  navigate: (path: string) => void;
}

interface DashboardPayload {
  profileCompletion: ProfileCompletion;
  recommended: Scholarship[];
  recentOpportunities: Scholarship[];
  saved: Scholarship[];
  applications: ScholarshipApplication[];
  upcomingDeadlines: Scholarship[];
  notifications: NotificationItem[];
  unreadCount: number;
  nextSteps: Array<{ title: string; description: string; actionTab: string }>;
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

const TRACKER_STATUSES: ItemTrackerStatus[] = [
  'Interested',
  'Preparing',
  'Documents Ready',
  'Applied',
  'Under Review',
  'Selected',
  'Rejected',
  'Completed',
];

export function StudentDashboardPage({ navigate }: StudentDashboardPageProps) {
  const { dbUser, openAuthModal } = useAuth();
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [trackedServices, setTrackedServices] = useState<UserServiceTracker[]>([]);
  const [trackedExams, setTrackedExams] = useState<UserExamTracker[]>([]);
  const [trackedJobs, setTrackedJobs] = useState<UserJobTracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'services' | 'exams' | 'jobs' | 'applications' | 'saved' | 'notifications'
  >('overview');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [externalTarget, setExternalTarget] = useState<{
    title: string;
    portalName: string;
    url: string;
    isThirdParty?: boolean;
  } | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!dbUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [payload, svcPayload, examPayload, jobPayload] = await Promise.all([
        apiFetch<DashboardPayload>('/api/student/dashboard'),
        apiFetch<{ items: UserServiceTracker[] }>('/api/student/services/tracker'),
        apiFetch<{ items: UserExamTracker[] }>('/api/student/exams/tracker'),
        apiFetch<{ items: UserJobTracker[] }>('/api/student/jobs/tracker'),
      ]);
      setData(payload);
      setTrackedServices(svcPayload.items);
      setTrackedExams(examPayload.items);
      setTrackedJobs(jobPayload.items);
    } catch (error) {
      console.error('Load dashboard error:', error);
    } finally {
      setLoading(false);
    }
  }, [dbUser]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const missingDocSummary = useMemo(() => {
    const missing: Array<{ title: string; docName: string; targetPath: string }> = [];
    for (const st of trackedServices) {
      if (!st.service) continue;
      st.service.documentsRequired.forEach((doc, idx) => {
        if (!st.checkedDocuments.includes(idx) && missing.length < 4) {
          missing.push({
            title: st.service!.title,
            docName: doc,
            targetPath: `/services/${st.service!.slug}`,
          });
        }
      });
    }
    for (const ex of trackedExams) {
      if (!ex.exam) continue;
      ex.exam.requiredDocuments.forEach((doc, idx) => {
        if (!ex.checkedDocuments.includes(idx) && missing.length < 6) {
          missing.push({
            title: ex.exam!.examName,
            docName: doc,
            targetPath: `/exams/${ex.exam!.slug}`,
          });
        }
      });
    }
    return missing;
  }, [trackedServices, trackedExams]);

  if (!dbUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="Sign in to access your Personal Workspace"
          description="Save service checklists, view rule-based scholarship eligibility matches, track missing documents, and manage exam reminders in one place."
          action={<Button onClick={openAuthModal}>Sign In with Google</Button>}
        />
      </div>
    );
  }

  const updateApplicationStatus = async (appId: number, status: ApplicationStatus) => {
    await apiFetch(`/api/student/applications/${appId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    await loadDashboard();
  };

  const saveApplicationNote = async (appId: number) => {
    await apiFetch(`/api/student/applications/${appId}`, {
      method: 'PATCH',
      body: JSON.stringify({ notes: noteDraft }),
    });
    setEditingNoteId(null);
    await loadDashboard();
  };

  const removeApplication = async (appId: number) => {
    await apiFetch(`/api/student/applications/${appId}`, { method: 'DELETE' });
    await loadDashboard();
  };

  const removeTrackedService = async (serviceId: number) => {
    await apiFetch(`/api/student/services/${serviceId}/tracker`, { method: 'DELETE' });
    await loadDashboard();
  };

  const updateTrackedExamStatus = async (examId: number, status: ItemTrackerStatus) => {
    await apiFetch(`/api/student/exams/${examId}/tracker`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    await loadDashboard();
  };

  const removeTrackedExam = async (examId: number) => {
    await apiFetch(`/api/student/exams/${examId}/tracker`, { method: 'DELETE' });
    await loadDashboard();
  };

  const updateTrackedJobStatus = async (jobId: number, status: ItemTrackerStatus) => {
    await apiFetch(`/api/student/jobs/${jobId}/tracker`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    await loadDashboard();
  };

  const removeTrackedJob = async (jobId: number) => {
    await apiFetch(`/api/student/jobs/${jobId}/tracker`, { method: 'DELETE' });
    await loadDashboard();
  };

  const removeSaved = async (scholarshipId: number) => {
    await apiFetch(`/api/student/saved/${scholarshipId}`, { method: 'DELETE' });
    await loadDashboard();
  };

  const markNotificationRead = async (id: number) => {
    await apiFetch(`/api/student/notifications/${id}/read`, { method: 'PATCH' });
    await loadDashboard();
  };

  const markAllRead = async () => {
    await apiFetch('/api/student/notifications/read-all', { method: 'PATCH' });
    await loadDashboard();
  };

  const serviceReminders = trackedServices.filter(
    (s) => s.appointmentDate || s.reminderDate
  );
  const examReminders = trackedExams.filter((e) => e.reminderDate);
  const jobReminders = trackedJobs.filter((j) => j.reminderDate);

  const activeJourneyStage =
    (data?.applications.some((a) => a.status === 'Applied' || a.status === 'Under Review') ||
      trackedExams.some((e) => e.status === 'Applied'))
      ? 'Track'
      : trackedServices.length > 0 || trackedExams.length > 0 || (data?.applications.length ?? 0) > 0
        ? 'Prepare'
        : 'Discover';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      <Breadcrumbs
        items={[{ label: 'Home', path: '/' }, { label: 'Personal Workspace' }]}
        navigate={navigate}
      />

      {/* Editorial Workspace Header */}
      <div className="rounded-lg border border-[#E2DDD1] bg-white p-6 sm:p-8 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#C46316]">Personal Guidance Workspace</p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0B192C]">
              Welcome back, {dbUser.displayName}
            </h1>
            <p className="text-sm text-[#475467]">
              Focus on upcoming deadlines, missing documents, and active checklists across exams,
              scholarships, jobs, and citizen services.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="navy" size="sm" onClick={() => navigate('/opportunities')}>
              <Compass className="h-3.5 w-3.5" />
              <span>Opportunity Finder</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/tools')}>
              <Calendar className="h-3.5 w-3.5" />
              <span>Deadlines &amp; Cost Planner</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/learning')}>
              <span>Career Studio</span>
            </Button>
          </div>
        </div>

        {/* Readiness & Application Journey */}
        {data && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-center border-t border-[#EFECE3] pt-5">
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#0B192C]">
                  Eligibility Profile Readiness
                </span>
                <span className="font-mono font-semibold text-[#134E7A] tabular-nums">
                  {data.profileCompletion.percentage}%
                </span>
              </div>
              <AnimatedProgressMeter
                percent={data.profileCompletion.percentage}
                tone="lapis"
                label="Profile completion percentage"
              />
              <div className="flex items-center justify-between text-[11px] text-[#5C6573]">
                <span>
                  {data.profileCompletion.percentage < 100
                    ? 'Complete profile fields to unlock accurate scholarship matching.'
                    : 'All key eligibility criteria fields completed.'}
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="font-semibold text-[#134E7A] hover:underline whitespace-nowrap ml-2"
                >
                  Update →
                </button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <ApplicationJourneyBar activeStage={activeJourneyStage} compact />
            </div>
          </div>
        )}
      </div>

      {/* Segmented Navigation */}
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        ariaLabel="Workspace sections"
        options={[
          { id: 'overview', label: 'What Next' },
          { id: 'services', label: 'Services', count: trackedServices.length },
          { id: 'exams', label: 'Exams', count: trackedExams.length },
          { id: 'jobs', label: 'Jobs', count: trackedJobs.length },
          {
            id: 'applications',
            label: 'Scholarships',
            count: data?.applications.length ?? 0,
          },
          { id: 'saved', label: 'Bookmarks', count: data?.saved.length ?? 0 },
          { id: 'notifications', label: 'Alerts', count: data?.unreadCount ?? 0 },
        ]}
      />

      {loading || !data ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Primary Action Split: What should I do next? + Deadlines Timeline */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
                {/* Left: What should I do next? + Active Progress */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="rounded-lg border border-[#E2DDD1] bg-white p-6 space-y-4">
                    <div className="flex items-center justify-between gap-2 border-b border-[#EFECE3] pb-3">
                      <div>
                        <p className="text-[11px] font-semibold text-[#C46316]">Priority Queue</p>
                        <h2 className="text-xl font-bold text-[#0B192C]">
                          What should I do next?
                        </h2>
                      </div>
                      <span className="font-mono text-xs text-[#5C6573] tabular-nums">
                        {data.nextSteps.length + missingDocSummary.length} action item
                        {data.nextSteps.length + missingDocSummary.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    {data.nextSteps.length === 0 && missingDocSummary.length === 0 ? (
                      <div className="py-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#0E6B6E]">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Your active checklists and profile are up to date.</span>
                        </div>
                        <p className="text-xs text-[#475467]">
                          Explore upcoming entrance exams, scholarships, or public services to start
                          a new checklist.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button size="sm" onClick={() => navigate('/opportunities')}>
                            Find Matching Opportunities
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => navigate('/services')}>
                            Browse Citizen Services
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#EFECE3]">
                        {data.nextSteps.map((step, idx) => (
                          <div
                            key={step.title}
                            className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-start gap-3">
                              <span className="font-mono text-xs font-semibold text-[#C46316] tabular-nums pt-0.5">
                                {String(idx + 1).padStart(2, '0')}
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-[#0B192C]">{step.title}</p>
                                <p className="text-xs text-[#475467]">{step.description}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (step.actionTab === 'profile') navigate('/profile');
                                else if (step.actionTab === 'scholarships') navigate('/scholarships');
                                else setActiveTab('applications');
                              }}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#134E7A] hover:underline whitespace-nowrap shrink-0"
                            >
                              <span>Take action</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}

                        {missingDocSummary.map((doc, idx) => (
                          <div
                            key={`${doc.title}-${doc.docName}-${idx}`}
                            className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-start gap-3">
                              <FileWarning className="h-4 w-4 text-[#C46316] shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-[#0B192C]">
                                  Missing Document: {doc.docName}
                                </p>
                                <p className="text-[11px] text-[#5C6573]">
                                  Required for {doc.title}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => navigate(doc.targetPath)}
                              className="text-xs font-semibold text-[#134E7A] hover:underline whitespace-nowrap shrink-0"
                            >
                              Check off →
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Active Applications & Checklists Progress */}
                  {(trackedServices.length > 0 ||
                    trackedExams.length > 0 ||
                    trackedJobs.length > 0 ||
                    data.applications.length > 0) && (
                    <div className="rounded-lg border border-[#E2DDD1] bg-white p-6 space-y-4">
                      <h2 className="text-lg font-bold text-[#0B192C]">
                        Active Preparation &amp; Applications in Progress
                      </h2>

                      <div className="divide-y divide-[#EFECE3]">
                        {trackedExams.slice(0, 3).map((ex) => {
                          if (!ex.exam) return null;
                          const total = ex.exam.requiredDocuments.length || 1;
                          const pct = Math.round((ex.checkedDocuments.length / total) * 100);
                          return (
                            <div key={`prog-ex-${ex.id}`} className="py-3.5 space-y-2">
                              <div className="flex items-center justify-between gap-2 text-xs">
                                <button
                                  type="button"
                                  onClick={() => navigate(`/exams/${ex.exam!.slug}`)}
                                  className="font-bold text-[#0B192C] hover:text-[#134E7A] text-left"
                                >
                                  Exam · {ex.exam.examName}
                                </button>
                                <span className="font-mono text-[11px] text-[#0E6B6E] font-semibold tabular-nums">
                                  {ex.status} · {ex.checkedDocuments.length}/
                                  {ex.exam.requiredDocuments.length} docs
                                </span>
                              </div>
                              <AnimatedProgressMeter percent={pct} tone="teal" />
                            </div>
                          );
                        })}

                        {trackedServices.slice(0, 3).map((sv) => {
                          if (!sv.service) return null;
                          const total = sv.service.documentsRequired.length || 1;
                          const pct = Math.round((sv.checkedDocuments.length / total) * 100);
                          return (
                            <div key={`prog-sv-${sv.id}`} className="py-3.5 space-y-2">
                              <div className="flex items-center justify-between gap-2 text-xs">
                                <button
                                  type="button"
                                  onClick={() => navigate(`/services/${sv.service!.slug}`)}
                                  className="font-bold text-[#0B192C] hover:text-[#134E7A] text-left"
                                >
                                  Service · {sv.service.title}
                                </button>
                                <span className="font-mono text-[11px] text-[#134E7A] font-semibold tabular-nums">
                                  {sv.status} · {sv.checkedDocuments.length}/
                                  {sv.service.documentsRequired.length} docs
                                </span>
                              </div>
                              <AnimatedProgressMeter percent={pct} tone="lapis" />
                            </div>
                          );
                        })}

                        {data.applications.slice(0, 3).map((app) => (
                          <div
                            key={`prog-app-${app.id}`}
                            className="py-3.5 flex items-center justify-between gap-3 text-xs"
                          >
                            <button
                              type="button"
                              onClick={() => navigate(`/scholarships/${app.scholarship.slug}`)}
                              className="font-bold text-[#0B192C] hover:text-[#134E7A] text-left"
                            >
                              Scholarship · {app.scholarship.title}
                            </button>
                            <span className="font-semibold text-[#C46316] shrink-0">
                              {app.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Deadlines & Reminders Timeline */}
                <div className="lg:col-span-5 rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E2DDD1] pb-3">
                    <div>
                      <p className="text-[11px] font-semibold text-[#0E6B6E]">Schedule</p>
                      <h2 className="text-lg font-bold text-[#0B192C]">
                        Upcoming Deadlines &amp; Reminders
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/tools')}
                      className="text-xs font-semibold text-[#134E7A] hover:underline whitespace-nowrap"
                    >
                      Calendar →
                    </button>
                  </div>

                  {data.upcomingDeadlines.length === 0 &&
                  serviceReminders.length === 0 &&
                  examReminders.length === 0 &&
                  jobReminders.length === 0 ? (
                    <p className="text-xs text-[#5C6573] leading-relaxed">
                      No fixed reminders yet. Set reminder dates inside any exam, job, or service
                      guide—or open the Unified Deadline Calendar to track upcoming windows.
                    </p>
                  ) : (
                    <div className="space-y-3 text-xs">
                      {examReminders.map((er) => (
                        <div
                          key={`exam-rem-${er.id}`}
                          className="rounded-md border border-[#E2DDD1] bg-white p-3 space-y-1"
                        >
                          <button
                            type="button"
                            onClick={() => er.exam && navigate(`/exams/${er.exam.slug}`)}
                            className="font-bold text-[#0B192C] hover:text-[#134E7A] text-left"
                          >
                            Exam: {er.exam?.examName}
                          </button>
                          <DeadlineUrgency dateStr={er.reminderDate} />
                        </div>
                      ))}

                      {jobReminders.map((jr) => (
                        <div
                          key={`job-rem-${jr.id}`}
                          className="rounded-md border border-[#E2DDD1] bg-white p-3 space-y-1"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              jr.job ? navigate(`/jobs/${jr.job.slug}`) : navigate('/jobs')
                            }
                            className="font-bold text-[#0B192C] hover:text-[#134E7A] text-left"
                          >
                            Job: {jr.job?.title}
                          </button>
                          <DeadlineUrgency dateStr={jr.reminderDate} />
                        </div>
                      ))}

                      {serviceReminders.map((sr) => (
                        <div
                          key={sr.id}
                          className="rounded-md border border-[#E2DDD1] bg-white p-3 space-y-1"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              sr.service && navigate(`/services/${sr.service.slug}`)
                            }
                            className="font-bold text-[#0B192C] hover:text-[#134E7A] text-left"
                          >
                            {sr.service?.title}
                          </button>
                          <DeadlineUrgency
                            dateStr={sr.appointmentDate || sr.reminderDate}
                            fallbackText={
                              sr.appointmentDate
                                ? `Appointment: ${sr.appointmentDate}`
                                : `Reminder: ${sr.reminderDate}`
                            }
                          />
                        </div>
                      ))}

                      {data.upcomingDeadlines.slice(0, 4).map((sch) => (
                        <div
                          key={sch.id}
                          className="rounded-md border border-[#E2DDD1] bg-white p-3 space-y-1"
                        >
                          <button
                            type="button"
                            onClick={() => navigate(`/scholarships/${sch.slug}`)}
                            className="font-bold text-[#0B192C] hover:text-[#134E7A] text-left"
                          >
                            {sch.title}
                          </button>
                          <DeadlineUrgency dateStr={sch.deadlineDate} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Scholarships */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#0B192C]">
                    Recommended Scholarships for Your Profile
                  </h2>
                  <button
                    type="button"
                    onClick={() => navigate('/scholarships')}
                    className="text-xs font-semibold text-[#134E7A] hover:underline"
                  >
                    Browse all scholarships →
                  </button>
                </div>

                {data.recommended.length === 0 ? (
                  <EmptyState
                    title="No matching scholarships yet"
                    description="Complete your domicile state, education level, and income range to see rule-based recommendations."
                    action={
                      <Button variant="outline" onClick={() => navigate('/profile')}>
                        Complete Profile
                      </Button>
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {data.recommended.map((item) => (
                      <Card
                        key={item.id}
                        interactive
                        className="p-5 flex flex-col justify-between gap-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-[#5C6573]">
                              {item.state} · {item.category}
                            </span>
                            {item.eligibility && (
                              <EligibilityIndicator assessment={item.eligibility} />
                            )}
                          </div>
                          <h3 className="text-base font-bold text-[#0B192C]">
                            <button
                              type="button"
                              onClick={() => navigate(`/scholarships/${item.slug}`)}
                              className="text-left hover:text-[#134E7A] transition-colors"
                            >
                              {item.title}
                            </button>
                          </h3>
                          <p className="text-xs text-[#475467] leading-relaxed">{item.summary}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-[#EFECE3] pt-3">
                          <button
                            type="button"
                            onClick={() => navigate(`/scholarships/${item.slug}`)}
                            className="text-xs font-semibold text-[#134E7A] hover:text-[#0D3B5E]"
                          >
                            View Eligibility &amp; Details →
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setExternalTarget({
                                title: item.title,
                                portalName: item.officialSourceName,
                                url: item.officialApplyUrl,
                              })
                            }
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#475467] hover:text-[#0B192C]"
                          >
                            <span>Official Portal</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === 'services' && (
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-[#0B192C]">
                  Saved Public Services &amp; Checklists
                </h2>
                <p className="text-xs text-[#475467] mt-0.5">
                  Track your document checklists, preparation steps, appointment dates, and manual
                  application references.
                </p>
              </div>

              {trackedServices.length === 0 ? (
                <EmptyState
                  title="No saved public services yet"
                  description="Open any public service guide to save your document checklist, appointment date, or reference ID."
                  action={
                    <Button onClick={() => navigate('/services')}>
                      Explore Driving Licence, Passport, Certificates &amp; More
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {trackedServices.map((item) => {
                    const svc = item.service;
                    if (!svc) return null;
                    return (
                      <Card key={item.id} className="p-6 space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs text-[#5C6573]">
                              {svc.category} · {svc.state} · Stage:{' '}
                              <strong className="text-[#134E7A]">{item.status}</strong>
                            </p>
                            <button
                              type="button"
                              onClick={() => navigate(`/services/${svc.slug}`)}
                              className="mt-1 text-lg font-bold text-[#0B192C] hover:text-[#134E7A] text-left"
                            >
                              {svc.title}
                            </button>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              onClick={() => navigate(`/services/${svc.slug}`)}
                            >
                              Open Checklist
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => removeTrackedService(svc.id)}
                              aria-label="Remove saved service"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-[#475467] border-t border-[#EFECE3] pt-3">
                          <span className="tabular-nums">
                            <strong className="text-[#0B192C]">Documents ready:</strong>{' '}
                            {item.checkedDocuments.length}/{svc.documentsRequired.length}
                          </span>
                          <span className="tabular-nums">
                            <strong className="text-[#0B192C]">Steps completed:</strong>{' '}
                            {item.completedSteps.length}/{svc.applicationSteps.length}
                          </span>
                          {item.referenceNumber && (
                            <span className="font-mono">
                              <strong className="font-sans text-[#0B192C]">Ref #:</strong>{' '}
                              {item.referenceNumber}
                            </span>
                          )}
                          {item.appointmentDate && (
                            <span className="tabular-nums">
                              <strong className="text-[#0B192C]">Appointment:</strong>{' '}
                              {item.appointmentDate}
                            </span>
                          )}
                          {item.reminderDate && (
                            <span className="tabular-nums">
                              <strong className="text-[#0B192C]">Reminder:</strong>{' '}
                              {item.reminderDate}
                            </span>
                          )}
                        </div>

                        {item.notes && (
                          <p className="text-xs text-[#475467] rounded-lg bg-[#FAF8F3] px-3 py-2 border border-[#E2DDD1]">
                            <strong className="text-[#0B192C]">Notes:</strong> {item.notes}
                          </p>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activeTab === 'exams' && (
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-[#0B192C]">
                  Saved Competitive Exams &amp; Preparation Progress
                </h2>
                <p className="text-xs text-[#475467] mt-0.5">
                  Track your stage, document readiness, preparation steps, and personal reminders.
                </p>
              </div>

              {trackedExams.length === 0 ? (
                <EmptyState
                  title="No saved competitive exams yet"
                  description="Save KCET, JEE Main, NEET UG, CUET, UPSC, SSC, Banking, or GATE from the Competitive Exams directory."
                  action={<Button onClick={() => navigate('/exams')}>Explore Competitive Exams</Button>}
                />
              ) : (
                <div className="space-y-4">
                  {trackedExams.map((item) => {
                    const ex = item.exam;
                    if (!ex) return null;
                    return (
                      <Card key={item.id} className="p-6 space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs text-[#5C6573]">
                              {ex.category} · {ex.state} · {ex.conductingAuthority}
                            </p>
                            <button
                              type="button"
                              onClick={() => navigate(`/exams/${ex.slug}`)}
                              className="mt-1 text-lg font-bold text-[#0B192C] hover:text-[#134E7A] text-left"
                            >
                              {ex.examName} — {ex.fullName}
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <select
                              aria-label={`Stage for ${ex.examName}`}
                              value={item.status}
                              onChange={(e) =>
                                updateTrackedExamStatus(ex.id, e.target.value as ItemTrackerStatus)
                              }
                              className="rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-xs font-semibold text-[#0B192C]"
                            >
                              {TRACKER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                            <Button size="sm" onClick={() => navigate(`/exams/${ex.slug}`)}>
                              Open Guide
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => removeTrackedExam(ex.id)}
                              aria-label="Remove saved exam"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-[#475467] border-t border-[#EFECE3] pt-3">
                          <span className="tabular-nums">
                            <strong className="text-[#0B192C]">Documents ready:</strong>{' '}
                            {item.checkedDocuments.length}/{ex.requiredDocuments.length}
                          </span>
                          <span className="tabular-nums">
                            <strong className="text-[#0B192C]">Steps completed:</strong>{' '}
                            {item.completedSteps.length}/{ex.applicationSteps.length}
                          </span>
                          {item.reminderDate && (
                            <span className="tabular-nums text-[#134E7A] font-medium">
                              <strong>Reminder:</strong> {item.reminderDate}
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-xs text-[#475467] rounded-lg bg-[#FAF8F3] px-3 py-2 border border-[#E2DDD1]">
                            <strong className="text-[#0B192C]">Notes:</strong> {item.notes}
                          </p>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activeTab === 'jobs' && (
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-[#0B192C]">
                  Saved Jobs, Apprenticeships &amp; Career Pathways
                </h2>
                <p className="text-xs text-[#475467] mt-0.5">
                  Track your recruitment applications, interview prep notes, and official links.
                </p>
              </div>

              {trackedJobs.length === 0 ? (
                <EmptyState
                  title="No saved jobs or career pathways yet"
                  description="Bookmark NCS, SSC, UPSC, KPSC, Banking, Railway, PSU, or PM Internship tracks from the Jobs & Careers page."
                  action={<Button onClick={() => navigate('/jobs')}>Explore Jobs &amp; Careers</Button>}
                />
              ) : (
                <div className="space-y-4">
                  {trackedJobs.map((item) => {
                    const job = item.job;
                    if (!job) return null;
                    return (
                      <Card key={item.id} className="p-6 space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs text-[#5C6573]">
                              {job.category} · {job.state} · {job.organization}
                            </p>
                            <h3 className="mt-1 text-lg font-bold text-[#0B192C]">
                              {job.title}
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <select
                              aria-label={`Stage for ${job.title}`}
                              value={item.status}
                              onChange={(e) =>
                                updateTrackedJobStatus(job.id, e.target.value as ItemTrackerStatus)
                              }
                              className="rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-xs font-semibold text-[#0B192C]"
                            >
                              {TRACKER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setExternalTarget({
                                  title: job.title,
                                  portalName: job.officialSourceName,
                                  url: job.officialApplyUrl,
                                })
                              }
                            >
                              <span>Official Portal</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" onClick={() => navigate(`/jobs/${job.slug}`)}>
                              Open Guide
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => removeTrackedJob(job.id)}
                              aria-label="Remove saved job"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-[#475467] border-t border-[#EFECE3] pt-3">
                          <span>
                            <strong className="text-[#0B192C]">Deadline / Cycle:</strong>{' '}
                            {job.deadlineText}
                          </span>
                          {item.reminderDate && (
                            <span className="tabular-nums text-[#134E7A] font-medium">
                              <strong>Reminder:</strong> {item.reminderDate}
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-xs text-[#475467] rounded-lg bg-[#FAF8F3] px-3 py-2 border border-[#E2DDD1]">
                            <strong className="text-[#0B192C]">Notes:</strong> {item.notes}
                          </p>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activeTab === 'applications' && (
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-[#0B192C]">
                  Scholarship Application Tracker
                </h2>
                <p className="text-xs text-[#475467] mt-0.5">
                  Manual tracking workspace. External portals do not sync status automatically—update
                  your stage and personal notes as you progress.
                </p>
              </div>

              {data.applications.length === 0 ? (
                <EmptyState
                  title="No tracked scholarship applications yet"
                  description="Open any scholarship guide and select 'Add to Application Tracker' to record your stages and notes."
                  action={
                    <Button onClick={() => navigate('/scholarships')}>
                      Discover Scholarships to Track
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {data.applications.map((app) => (
                    <Card key={app.id} className="p-6 space-y-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <button
                            type="button"
                            onClick={() => navigate(`/scholarships/${app.scholarship.slug}`)}
                            className="text-lg font-bold text-[#0B192C] hover:text-[#134E7A] text-left"
                          >
                            {app.scholarship.title}
                          </button>
                          <p className="mt-1 text-xs text-[#5C6573] tabular-nums">
                            {app.scholarship.providerName} · Deadline:{' '}
                            {app.scholarship.deadlineDate ||
                              app.scholarship.importantDatesText ||
                              'Check official portal'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            aria-label={`Status for ${app.scholarship.title}`}
                            value={app.status}
                            onChange={(e) =>
                              updateApplicationStatus(app.id, e.target.value as ApplicationStatus)
                            }
                            className="rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-xs font-semibold text-[#0B192C]"
                          >
                            {APPLICATION_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removeApplication(app.id)}
                            aria-label="Remove tracked application"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="border-t border-[#EFECE3] pt-3">
                        {editingNoteId === app.id ? (
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              placeholder="Add reference ID, missing certificate reminder, or date submitted..."
                              className="w-full rounded-lg border border-[#CFC8B8] p-2.5 text-xs text-[#0B192C]"
                            />
                            <div className="flex items-center gap-2">
                              <Button size="sm" onClick={() => saveApplicationNote(app.id)}>
                                Save Note
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingNoteId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-4">
                            <p className="text-xs text-[#475467]">
                              <strong className="text-[#0B192C]">Notes:</strong>{' '}
                              {app.notes || 'No personal notes added.'}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingNoteId(app.id);
                                setNoteDraft(app.notes || '');
                              }}
                              className="text-xs font-semibold text-[#134E7A] hover:underline whitespace-nowrap shrink-0"
                            >
                              Edit Note
                            </button>
                          </div>
                        )}
                      </div>

                      {app.statusHistory && app.statusHistory.length > 0 && (
                        <div className="border-t border-[#EFECE3] pt-3">
                          <p className="text-xs font-semibold text-[#0B192C]">Status History</p>
                          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#5C6573] tabular-nums">
                            {app.statusHistory.map((h, idx) => (
                              <span key={`${h.changedAt}-${idx}`}>
                                {h.status} ({new Date(h.changedAt).toLocaleDateString('en-IN')})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'saved' && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-[#0B192C]">Saved Scholarships</h2>
              {data.saved.length === 0 ? (
                <EmptyState
                  icon={<Bookmark className="h-5 w-5" />}
                  title="No saved scholarships yet"
                  description="Bookmark scholarships while browsing so you can review deadlines and official portals later."
                  action={
                    <Button onClick={() => navigate('/scholarships')}>
                      Explore Scholarships
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {data.saved.map((item) => (
                    <Card
                      key={item.id}
                      className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <button
                          type="button"
                          onClick={() => navigate(`/scholarships/${item.slug}`)}
                          className="text-base font-bold text-[#0B192C] hover:text-[#134E7A] text-left"
                        >
                          {item.title}
                        </button>
                        <p className="mt-0.5 text-xs text-[#5C6573]">
                          {item.providerName} · {item.state}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setExternalTarget({
                              title: item.title,
                              portalName: item.officialSourceName,
                              url: item.officialApplyUrl,
                            })
                          }
                        >
                          <span>Official Portal</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => removeSaved(item.id)}>
                          Remove
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'notifications' && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0B192C]">Notifications</h2>
                {data.unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#134E7A] hover:underline"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {data.notifications.length === 0 ? (
                <EmptyState
                  icon={<Bell className="h-5 w-5" />}
                  title="You're all caught up"
                  description="New scholarship announcements and deadline alerts will appear here."
                />
              ) : (
                <Card className="divide-y divide-[#E2DDD1] overflow-hidden">
                  {data.notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between ${
                        n.isRead ? 'bg-white' : 'bg-[#FAF8F3]'
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[#0B192C]">{n.title}</p>
                        <p className="text-xs text-[#475467]">{n.message}</p>
                        <p className="text-xs text-[#5C6573] tabular-nums">
                          {new Date(n.createdAt).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {n.linkUrl && (
                          <button
                            type="button"
                            onClick={() => navigate(n.linkUrl!)}
                            className="text-xs font-semibold text-[#134E7A] hover:underline"
                          >
                            Open
                          </button>
                        )}
                        {!n.isRead && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markNotificationRead(n.id)}
                          >
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </section>
          )}
        </>
      )}

      <ExternalPortalModal target={externalTarget} onClose={() => setExternalTarget(null)} />
    </div>
  );
}
