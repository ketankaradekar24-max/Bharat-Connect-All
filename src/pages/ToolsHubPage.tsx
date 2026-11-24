import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Calculator,
  ExternalLink,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { ExternalPortalModal } from '../components/ExternalPortalModal.tsx';
import { AnimatedProgressMeter } from '../components/MotionPrimitives.tsx';
import { DeadlineUrgency } from '../components/SignatureElements.tsx';
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { Tabs } from '../components/ui/Tabs.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { apiFetch } from '../lib/api.ts';
import type {
  Exam,
  JobListing,
  Scholarship,
  UserExamTracker,
  UserJobTracker,
  UserServiceTracker,
} from '../types/index.ts';

interface ToolsHubPageProps {
  navigate: (path: string) => void;
  initialTab?: 'calendar' | 'cost';
}

interface CalendarItem {
  id: string;
  kind: 'Scholarship' | 'Exam' | 'Job' | 'Personal Reminder';
  title: string;
  authority: string;
  dateText: string;
  fixedDate: string | null;
  targetPath: string;
  officialUrl: string;
}

export function ToolsHubPage({ navigate, initialTab = 'calendar' }: ToolsHubPageProps) {
  const { dbUser } = useAuth();
  const [tab, setTab] = useState<'calendar' | 'cost'>(initialTab);
  const [filterKind, setFilterKind] = useState<'All' | 'Scholarship' | 'Exam' | 'Job' | 'Personal Reminder'>('All');
  const [loading, setLoading] = useState(true);

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [myExamTrackers, setMyExamTrackers] = useState<UserExamTracker[]>([]);
  const [myJobTrackers, setMyJobTrackers] = useState<UserJobTracker[]>([]);
  const [myServiceTrackers, setMyServiceTrackers] = useState<UserServiceTracker[]>([]);

  // Cost Planner State
  const [years, setYears] = useState(4);
  const [tuitionAnnual, setTuitionAnnual] = useState(110000);
  const [hostelAnnual, setHostelAnnual] = useState(65000);
  const [booksMiscAnnual, setBooksMiscAnnual] = useState(25000);
  const [scholarshipAnnual, setScholarshipAnnual] = useState(30000);
  const [familyAnnual, setFamilyAnnual] = useState(60000);

  const [externalTarget, setExternalTarget] = useState<{
    title: string;
    portalName: string;
    url: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [schRes, exRes, jbRes] = await Promise.all([
          apiFetch<{ scholarships: Scholarship[] }>('/api/scholarships'),
          apiFetch<{ exams: Exam[] }>('/api/exams'),
          apiFetch<{ jobs: JobListing[] }>('/api/jobs'),
        ]);
        if (!active) return;
        setScholarships(schRes.scholarships);
        setExams(exRes.exams);
        setJobs(jbRes.jobs);

        if (dbUser) {
          const [exTr, jbTr, svTr] = await Promise.all([
            apiFetch<{ items: UserExamTracker[] }>('/api/student/exams/tracker'),
            apiFetch<{ items: UserJobTracker[] }>('/api/student/jobs/tracker'),
            apiFetch<{ items: UserServiceTracker[] }>('/api/student/services/tracker'),
          ]);
          if (!active) return;
          setMyExamTrackers(exTr.items);
          setMyJobTrackers(jbTr.items);
          setMyServiceTrackers(svTr.items);
        }
      } catch (err) {
        console.error('Tools Hub load error:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [dbUser]);

  const calendarItems = useMemo<CalendarItem[]>(() => {
    const list: CalendarItem[] = [];

    for (const exTr of myExamTrackers) {
      if (exTr.reminderDate && exTr.exam) {
        list.push({
          id: `rem-ex-${exTr.id}`,
          kind: 'Personal Reminder',
          title: `Exam Reminder: ${exTr.exam.examName}`,
          authority: exTr.exam.conductingAuthority,
          dateText: `Personal reminder: ${exTr.reminderDate}`,
          fixedDate: exTr.reminderDate,
          targetPath: `/exams/${exTr.exam.slug}`,
          officialUrl: exTr.exam.officialWebsiteUrl,
        });
      }
    }

    for (const jbTr of myJobTrackers) {
      if (jbTr.reminderDate && jbTr.job) {
        list.push({
          id: `rem-jb-${jbTr.id}`,
          kind: 'Personal Reminder',
          title: `Job Reminder: ${jbTr.job.title}`,
          authority: jbTr.job.organization,
          dateText: `Personal reminder: ${jbTr.reminderDate}`,
          fixedDate: jbTr.reminderDate,
          targetPath: `/jobs/${jbTr.job.slug}`,
          officialUrl: jbTr.job.officialApplyUrl,
        });
      }
    }

    for (const svTr of myServiceTrackers) {
      const d = svTr.appointmentDate || svTr.reminderDate;
      if (d && svTr.service) {
        list.push({
          id: `rem-sv-${svTr.id}`,
          kind: 'Personal Reminder',
          title: svTr.appointmentDate
            ? `Service Appointment: ${svTr.service.title}`
            : `Service Reminder: ${svTr.service.title}`,
          authority: svTr.service.departmentOrAuthority,
          dateText: `${svTr.appointmentDate ? 'Appointment' : 'Reminder'}: ${d}`,
          fixedDate: d,
          targetPath: `/services/${svTr.service.slug}`,
          officialUrl: svTr.service.officialApplyUrl,
        });
      }
    }

    for (const s of scholarships) {
      list.push({
        id: `sch-${s.id}`,
        kind: 'Scholarship',
        title: s.title,
        authority: s.providerName,
        dateText: s.deadlineDate || s.importantDatesText || 'Check official scholarship cycle',
        fixedDate: s.deadlineDate ?? null,
        targetPath: `/scholarships/${s.slug}`,
        officialUrl: s.officialApplyUrl,
      });
    }

    for (const ex of exams) {
      list.push({
        id: `ex-${ex.id}`,
        kind: 'Exam',
        title: `${ex.examName} — ${ex.fullName}`,
        authority: ex.conductingAuthority,
        dateText: ex.nextExamDate || ex.importantDatesText,
        fixedDate: ex.nextExamDate ?? null,
        targetPath: `/exams/${ex.slug}`,
        officialUrl: ex.officialWebsiteUrl,
      });
    }

    for (const jb of jobs) {
      list.push({
        id: `jb-${jb.id}`,
        kind: 'Job',
        title: jb.title,
        authority: jb.organization,
        dateText: jb.deadlineDate || jb.deadlineText,
        fixedDate: jb.deadlineDate ?? null,
        targetPath: `/jobs/${jb.slug}`,
        officialUrl: jb.officialApplyUrl,
      });
    }

    return list
      .filter((item) => filterKind === 'All' || item.kind === filterKind)
      .sort((a, b) => {
        if (a.kind === 'Personal Reminder' && b.kind !== 'Personal Reminder') return -1;
        if (b.kind === 'Personal Reminder' && a.kind !== 'Personal Reminder') return 1;
        if (a.fixedDate && b.fixedDate) return a.fixedDate.localeCompare(b.fixedDate);
        if (a.fixedDate) return -1;
        if (b.fixedDate) return 1;
        return a.title.localeCompare(b.title);
      });
  }, [scholarships, exams, jobs, myExamTrackers, myJobTrackers, myServiceTrackers, filterKind]);

  // Financial Estimator
  const annualGross = Math.max(0, tuitionAnnual) + Math.max(0, hostelAnnual) + Math.max(0, booksMiscAnnual);
  const annualCovered = Math.max(0, scholarshipAnnual) + Math.max(0, familyAnnual);
  const annualGap = Math.max(0, annualGross - annualCovered);
  const totalProgramCost = annualGross * Math.max(1, years);
  const totalEstimatedGap = annualGap * Math.max(1, years);

  const fmtInr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      <Breadcrumbs
        items={[{ label: 'Home', path: '/' }, { label: 'Deadlines & Financial Planner' }]}
        navigate={navigate}
      />

      <div className="space-y-2 border-b border-[#E2DDD1] pb-5">
        <p className="text-xs font-semibold text-[#134E7A]">Planning &amp; Decision Tools</p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B192C]">
          Deadline Calendar &amp; Education Cost Planner
        </h1>
        <p className="text-sm text-[#4B5565] max-w-2xl leading-relaxed">
          Track verified exam cycles, scholarship deadlines, and your personal reminders in one
          place—or model annual college expenses before applying for scholarships and education
          loans.
        </p>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        ariaLabel="Planning tools"
        options={[
          { id: 'calendar', label: 'Unified Deadline Calendar' },
          { id: 'cost', label: 'Education Cost & Aid Estimator' },
        ]}
      />

      {tab === 'calendar' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {(['All', 'Personal Reminder', 'Scholarship', 'Exam', 'Job'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFilterKind(k)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    filterKind === k
                      ? 'bg-[#0B192C] text-white'
                      : 'border border-[#D6CFC2] bg-white text-[#4B5565] hover:bg-[#FAF8F3]'
                  }`}
                >
                  {k === 'All' ? 'All Schedules' : k}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#5C6573] tabular-nums">
              Showing {Math.min(calendarItems.length, 45)} of {calendarItems.length} schedules
            </p>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-[#E2DDD1] rounded-lg border border-[#E2DDD1] bg-white">
              {calendarItems.slice(0, 45).map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:px-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`font-semibold ${
                          item.kind === 'Personal Reminder'
                            ? 'text-[#0E6B6E]'
                            : item.kind === 'Scholarship'
                              ? 'text-[#C46316]'
                              : 'text-[#134E7A]'
                        }`}
                      >
                        {item.kind}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#5C6573] truncate">{item.authority}</span>
                    </div>
                    <h2 className="font-display text-base font-bold text-[#0B192C]">
                      <button
                        type="button"
                        onClick={() => navigate(item.targetPath)}
                        className="text-left hover:text-[#134E7A]"
                      >
                        {item.title}
                      </button>
                    </h2>
                    <div className="pt-0.5">
                      <DeadlineUrgency
                        dateStr={item.fixedDate}
                        fallbackText={item.dateText}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => navigate(item.targetPath)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#134E7A] hover:underline"
                    >
                      <span>Open Guide</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setExternalTarget({
                          title: item.title,
                          portalName: item.authority,
                          url: item.officialUrl,
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-[#D6CFC2] bg-[#FAF8F3] px-3 py-1.5 text-xs font-medium text-[#0B192C] hover:border-[#134E7A]"
                    >
                      <span>Portal</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'cost' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          <Card className="lg:col-span-7 p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-[#EFECE3] pb-3">
              <Calculator className="h-5 w-5 text-[#134E7A]" />
              <h2 className="font-display text-lg font-bold text-[#0B192C]">
                Annual Education Budget Inputs (INR)
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-xs font-medium text-[#4B5565]">
                <span>Program Duration (Years)</span>
                <select
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C]"
                >
                  {[1, 2, 3, 4, 5].map((y) => (
                    <option key={y} value={y}>
                      {y} {y === 1 ? 'Year' : 'Years'}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-xs font-medium text-[#4B5565]">
                <span>Annual Tuition &amp; Academic Fees (₹)</span>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={tuitionAnnual}
                  onChange={(e) => setTuitionAnnual(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C] font-mono tabular-nums"
                />
              </label>

              <label className="space-y-1 text-xs font-medium text-[#4B5565]">
                <span>Annual Hostel / PG &amp; Food (₹)</span>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={hostelAnnual}
                  onChange={(e) => setHostelAnnual(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C] font-mono tabular-nums"
                />
              </label>

              <label className="space-y-1 text-xs font-medium text-[#4B5565]">
                <span>Annual Books, Travel &amp; Misc (₹)</span>
                <input
                  type="number"
                  min={0}
                  step={2000}
                  value={booksMiscAnnual}
                  onChange={(e) => setBooksMiscAnnual(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C] font-mono tabular-nums"
                />
              </label>

              <label className="space-y-1 text-xs font-medium text-[#0E6B6E]">
                <span>Expected Scholarship / Fee Waiver / Yr (₹)</span>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={scholarshipAnnual}
                  onChange={(e) => setScholarshipAnnual(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-[#0E6B6E]/40 bg-[#EEF7F6] px-3 py-2.5 text-sm text-[#0B192C] font-mono tabular-nums"
                />
              </label>

              <label className="space-y-1 text-xs font-medium text-[#134E7A]">
                <span>Expected Family / Savings Support / Yr (₹)</span>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={familyAnnual}
                  onChange={(e) => setFamilyAnnual(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-[#134E7A]/40 bg-[#F1F6FA] px-3 py-2.5 text-sm text-[#0B192C] font-mono tabular-nums"
                />
              </label>
            </div>

            <div className="rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-4 flex items-start gap-2.5 text-xs text-[#4B5565]">
              <Info className="h-4 w-4 text-[#C46316] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Planning Estimate Only:</strong> Official college tuition, KEA/JoSAA hostel
                charges, and bank interest subvention rules vary by university and income bracket.
                Always confirm figures on official admission bulletins.
              </p>
            </div>
          </Card>

          <div className="lg:col-span-5 space-y-5">
            <Card className="p-6 space-y-4 bg-[#0B192C] text-white border-[#0B192C]">
              <p className="text-xs font-semibold text-amber-300">Estimated Financial Summary</p>
              <div className="space-y-3 border-b border-slate-700 pb-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Estimated Annual Cost</span>
                  <span className="font-mono font-bold tabular-nums">{fmtInr(annualGross)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Scholarship + Family Support / Yr</span>
                  <span className="font-mono font-semibold text-teal-300 tabular-nums">
                    − {fmtInr(annualCovered)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-700 pt-2.5">
                  <span className="font-semibold">Estimated Annual Funding Gap</span>
                  <span className="font-mono text-lg font-bold text-amber-300 tabular-nums">
                    {fmtInr(annualGap)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Total {years}-Year Estimated Cost</span>
                  <span className="font-mono font-bold tabular-nums">{fmtInr(totalProgramCost)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">
                    Total {years}-Year Education Loan Need (Est.)
                  </span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {fmtInr(totalEstimatedGap)}
                  </span>
                </div>
                <div className="pt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span>Covered by Aid &amp; Family Support</span>
                    <span className="font-mono tabular-nums text-teal-300">
                      {annualGross > 0
                        ? Math.min(100, Math.round((annualCovered / annualGross) * 100))
                        : 100}
                      %
                    </span>
                  </div>
                  <AnimatedProgressMeter
                    percent={
                      annualGross > 0
                        ? Math.min(100, Math.round((annualCovered / annualGross) * 100))
                        : 100
                    }
                    tone="teal"
                    label="Annual funding coverage"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0B192C]">
                <ShieldCheck className="h-4 w-4 text-[#0E6B6E]" />
                <span>Next Official Steps to Reduce Your Gap</span>
              </div>
              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => navigate('/opportunities')}
                >
                  <span>Check Eligible Scholarships</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => navigate('/services/pm-vidyalaxmi-education-loan-portal')}
                >
                  <span>PM-Vidyalaxmi Education Loan Guide</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      <ExternalPortalModal target={externalTarget} onClose={() => setExternalTarget(null)} />
    </div>
  );
}
