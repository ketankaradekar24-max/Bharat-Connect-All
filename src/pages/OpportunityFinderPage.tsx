import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  HelpCircle,
  RotateCcw,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import { Alert } from '../components/ui/Alert.tsx';
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { apiFetch } from '../lib/api.ts';
import type {
  Exam,
  Institution,
  JobListing,
  PublicService,
  Scholarship,
  StudentProfile,
} from '../types/index.ts';

interface OpportunityFinderPageProps {
  navigate: (path: string) => void;
}

const EDUCATION_LEVELS = [
  'Class 10 / SSLC',
  'PUC / Class 12',
  'Diploma / ITI',
  'Undergraduate',
  'Postgraduate',
  'PhD / Research',
  'Working Professional / Citizen',
];

const STREAM_OPTIONS = [
  'All / Undecided',
  'Engineering & Technology',
  'Medical & Healthcare',
  'Management & Commerce',
  'Law & Public Policy',
  'Government & Civil Services',
  'Agriculture & Sciences',
  'Skill Development & Vocational',
];

const STATES = [
  'Karnataka',
  'Maharashtra',
  'Tamil Nadu',
  'Kerala',
  'Andhra Pradesh',
  'Telangana',
  'Delhi',
  'Gujarat',
  'Uttar Pradesh',
  'West Bengal',
  'Rajasthan',
  'Other State / UT',
];

const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'];

const GOALS = [
  { id: 'all', label: 'All Verified Opportunities' },
  { id: 'scholarships', label: 'Scholarships & Aid' },
  { id: 'exams', label: 'Entrance & Competitive Exams' },
  { id: 'colleges', label: 'Colleges & Admissions' },
  { id: 'jobs', label: 'Jobs & Internships' },
  { id: 'services', label: 'Citizen Services & Certificates' },
] as const;

type MatchStatus =
  | 'Appears eligible'
  | 'May be eligible'
  | 'More information required'
  | 'Does not appear eligible';

interface EvaluatedScholarship {
  item: Scholarship;
  status: MatchStatus;
  reasons: string[];
}

export function OpportunityFinderPage({ navigate }: OpportunityFinderPageProps) {
  const { dbUser } = useAuth();

  const [educationLevel, setEducationLevel] = useState('Undergraduate');
  const [stream, setStream] = useState('Engineering & Technology');
  const [state, setState] = useState('Karnataka');
  const [category, setCategory] = useState('General');
  const [annualIncome, setAnnualIncome] = useState<string>('350000');
  const [marksPct, setMarksPct] = useState<string>('75');
  const [disability, setDisability] = useState(false);
  const [goal, setGoal] = useState<(typeof GOALS)[number]['id']>('all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [services, setServices] = useState<PublicService[]>([]);
  const [prefilledFromProfile, setPrefilledFromProfile] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [schRes, exRes, instRes, jobRes, svcRes] = await Promise.all([
          apiFetch<{ scholarships: Scholarship[] }>('/api/scholarships'),
          apiFetch<{ exams: Exam[] }>('/api/exams'),
          apiFetch<{ institutions: Institution[] }>('/api/institutions'),
          apiFetch<{ jobs: JobListing[] }>('/api/jobs'),
          apiFetch<{ services: PublicService[] }>('/api/services'),
        ]);
        if (!active) return;
        setScholarships(schRes.scholarships);
        setExams(exRes.exams);
        setInstitutions(instRes.institutions);
        setJobs(jobRes.jobs);
        setServices(svcRes.services);

        if (dbUser) {
          try {
            const profRes = await apiFetch<{ profile: StudentProfile | null }>('/api/student/profile');
            if (active && profRes.profile) {
              const p = profRes.profile;
              if (p.state) setState(p.state);
              if (p.educationLevel) setEducationLevel(p.educationLevel);
              if (p.category) setCategory(p.category);
              if (p.annualFamilyIncome !== null && p.annualFamilyIncome !== undefined) {
                setAnnualIncome(String(p.annualFamilyIncome));
              }
              if (p.marksPercentage !== null && p.marksPercentage !== undefined) {
                setMarksPct(String(p.marksPercentage));
              }
              setDisability(Boolean(p.disabilityStatus));
              setPrefilledFromProfile(true);
            }
          } catch {
            // Optional profile prefill
          }
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load opportunity data.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [dbUser]);

  const evaluatedScholarships = useMemo<EvaluatedScholarship[]>(() => {
    const parsedIncome = annualIncome.trim() ? Number(annualIncome) : null;
    const parsedMarks = marksPct.trim() ? Number(marksPct) : null;

    return scholarships
      .map((s) => {
        const reasons: string[] = [];
        let hardFail = false;
        let missingInfo = false;

        // State check
        if (s.state !== 'All India' && s.state.toLowerCase() !== state.toLowerCase()) {
          hardFail = true;
          reasons.push(`Domicile limited to ${s.state}`);
        } else {
          reasons.push(`Open to ${s.state === 'All India' ? 'All India' : state} residents`);
        }

        // Education check
        const eduMatch =
          s.educationLevels.includes('All') ||
          s.educationLevels.some(
            (lvl) =>
              educationLevel.toLowerCase().includes(lvl.toLowerCase()) ||
              lvl.toLowerCase().includes(educationLevel.toLowerCase()) ||
              (educationLevel.includes('Class 12') && lvl.toLowerCase().includes('puc'))
          );
        if (!eduMatch) {
          hardFail = true;
          reasons.push(`For ${s.educationLevels.join(', ')}`);
        } else {
          reasons.push(`Covers ${educationLevel}`);
        }

        // Disability check
        if (s.requiresDisability && !disability) {
          hardFail = true;
          reasons.push('Requires benchmark disability certification');
        }

        // Income check
        if (s.maxFamilyIncome !== null && s.maxFamilyIncome !== undefined) {
          if (parsedIncome === null || Number.isNaN(parsedIncome)) {
            missingInfo = true;
            reasons.push(`Requires family income ≤ ₹${s.maxFamilyIncome.toLocaleString('en-IN')}`);
          } else if (parsedIncome > s.maxFamilyIncome) {
            hardFail = true;
            reasons.push(
              `Entered income ₹${parsedIncome.toLocaleString('en-IN')} exceeds limit ₹${s.maxFamilyIncome.toLocaleString('en-IN')}`
            );
          } else {
            reasons.push(
              `Within income limit (≤ ₹${s.maxFamilyIncome.toLocaleString('en-IN')})`
            );
          }
        }

        // Marks check
        if (s.minMarksPercentage !== null && s.minMarksPercentage !== undefined) {
          if (parsedMarks === null || Number.isNaN(parsedMarks)) {
            missingInfo = true;
            reasons.push(`Requires minimum ${s.minMarksPercentage}% marks`);
          } else if (parsedMarks < s.minMarksPercentage) {
            hardFail = true;
            reasons.push(`Marks ${parsedMarks}% below ${s.minMarksPercentage}% cutoff`);
          } else {
            reasons.push(`Meets ${s.minMarksPercentage}% academic requirement`);
          }
        }

        // Category check
        if (
          !s.eligibleCategories.includes('All') &&
          !s.eligibleCategories.some((c) => c.toLowerCase() === category.toLowerCase())
        ) {
          hardFail = true;
          reasons.push(`Specified for ${s.eligibleCategories.join(', ')} category`);
        }

        const status: MatchStatus = hardFail
          ? 'Does not appear eligible'
          : missingInfo
            ? 'More information required'
            : s.maxFamilyIncome || s.minMarksPercentage || !s.eligibleCategories.includes('All')
              ? 'Appears eligible'
              : 'May be eligible';

        return { item: s, status, reasons };
      })
      .sort((a, b) => {
        const rank: Record<MatchStatus, number> = {
          'Appears eligible': 0,
          'May be eligible': 1,
          'More information required': 2,
          'Does not appear eligible': 3,
        };
        return rank[a.status] - rank[b.status];
      });
  }, [scholarships, state, educationLevel, category, annualIncome, marksPct, disability]);

  const matchedExams = useMemo(() => {
    const streamKey = stream.split(' ')[0].toLowerCase();
    return exams
      .filter((ex) => {
        const stateMatch = ex.state === 'All India' || ex.state.toLowerCase() === state.toLowerCase();
        if (!stateMatch) return false;
        if (stream === 'All / Undecided') return true;
        const hay = `${ex.category} ${ex.subcategory} ${ex.examPurpose} ${ex.eligibility}`.toLowerCase();
        if (stream.includes('Government')) {
          return (
            hay.includes('upsc') ||
            hay.includes('ssc') ||
            hay.includes('banking') ||
            hay.includes('railway') ||
            hay.includes('state')
          );
        }
        return hay.includes(streamKey);
      })
      .slice(0, 8);
  }, [exams, state, stream]);

  const matchedColleges = useMemo(() => {
    const streamKey = stream.split(' ')[0].toLowerCase();
    return institutions
      .filter((inst) => {
        const stateMatch =
          inst.state === 'All India' || inst.state.toLowerCase() === state.toLowerCase();
        const streamMatch =
          stream === 'All / Undecided' ||
          `${inst.primaryStream} ${inst.streams.join(' ')}`.toLowerCase().includes(streamKey);
        return stateMatch || streamMatch;
      })
      .sort((a, b) => {
        const aLocal = a.state.toLowerCase() === state.toLowerCase() ? 0 : 1;
        const bLocal = b.state.toLowerCase() === state.toLowerCase() ? 0 : 1;
        return aLocal - bLocal;
      })
      .slice(0, 6);
  }, [institutions, state, stream]);

  const matchedJobs = useMemo(() => {
    return jobs
      .filter((jb) => {
        const stateOk = jb.state === 'All India' || jb.state.toLowerCase() === state.toLowerCase();
        return stateOk;
      })
      .slice(0, 6);
  }, [jobs, state]);

  const matchedServices = useMemo(() => {
    return services
      .filter((svc) => {
        const stateOk =
          svc.state === 'All India' || svc.state.toLowerCase() === state.toLowerCase();
        if (!stateOk) return false;
        if (educationLevel.includes('PUC') || educationLevel.includes('Undergraduate')) {
          return (
            svc.category === 'Government Documents' ||
            svc.category === 'Education & Scholarships' ||
            svc.category === 'College Admissions & Counselling' ||
            svc.category === 'Passport & Visa'
          );
        }
        return true;
      })
      .slice(0, 6);
  }, [services, state, educationLevel]);

  const statusBadge = (status: MatchStatus) => {
    if (status === 'Appears eligible') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0E6B6E]">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {status}
        </span>
      );
    }
    if (status === 'May be eligible') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#134E7A]">
          <Compass className="h-3.5 w-3.5" />
          {status}
        </span>
      );
    }
    if (status === 'More information required') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#C46316]">
          <HelpCircle className="h-3.5 w-3.5" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#5C6573]">
        <XCircle className="h-3.5 w-3.5" />
        {status}
      </span>
    );
  };

  const resetInputs = () => {
    setEducationLevel('Undergraduate');
    setStream('All / Undecided');
    setState('Karnataka');
    setCategory('General');
    setAnnualIncome('');
    setMarksPct('');
    setDisability(false);
    setGoal('all');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      <Breadcrumbs
        items={[{ label: 'Home', path: '/' }, { label: 'Personal Opportunity Finder' }]}
        navigate={navigate}
      />

      <div className="space-y-2 border-b border-[#E2DDD1] pb-6">
        <p className="text-xs font-semibold text-[#C46316]">Rule-Based Personalization</p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B192C]">
          Personal Opportunity &amp; Eligibility Finder
        </h1>
        <p className="text-sm text-[#4B5565] max-w-2xl leading-relaxed">
          Enter your education stage, domicile state, stream, and household bracket to see matching
          verified scholarships, entrance exams, colleges, jobs, and citizen document guides with
          transparent reasons—no sensitive Aadhaar or bank data needed.
        </p>
      </div>

      {prefilledFromProfile && (
        <Alert variant="info" title="Pre-filled from your Bharat Connect profile">
          Adjust any parameter below to test different streams, income slabs, or states without
          changing your saved account profile.
        </Alert>
      )}

      {/* Situation Profiler Form */}
      <Card className="p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFECE3] pb-3">
          <h2 className="font-display text-lg font-bold text-[#0B192C]">Your Situation Profile</h2>
          <button
            type="button"
            onClick={resetInputs}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#134E7A] hover:underline"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset inputs</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-xs font-medium text-[#4B5565]">
            <span>Education / Career Stage</span>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C]"
            >
              {EDUCATION_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs font-medium text-[#4B5565]">
            <span>Stream or Interest</span>
            <select
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C]"
            >
              {STREAM_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs font-medium text-[#4B5565]">
            <span>Domicile State / UT</span>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C]"
            >
              {STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs font-medium text-[#4B5565]">
            <span>Reservation / Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs font-medium text-[#4B5565]">
            <span>Annual Family Income (₹ Optional)</span>
            <input
              type="number"
              min={0}
              step={10000}
              value={annualIncome}
              onChange={(e) => setAnnualIncome(e.target.value)}
              placeholder="e.g. 250000"
              className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C] font-mono tabular-nums"
            />
          </label>

          <label className="space-y-1 text-xs font-medium text-[#4B5565]">
            <span>Latest Marks % (Optional)</span>
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={marksPct}
              onChange={(e) => setMarksPct(e.target.value)}
              placeholder="e.g. 78"
              className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C] font-mono tabular-nums"
            />
          </label>

          <label className="space-y-1 text-xs font-medium text-[#4B5565]">
            <span>Primary Focus</span>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as (typeof GOALS)[number]['id'])}
              className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C]"
            >
              {GOALS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end pb-1">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-[#0B192C] cursor-pointer">
              <input
                type="checkbox"
                checked={disability}
                onChange={(e) => setDisability(e.target.checked)}
                className="h-4 w-4 rounded border-[#CFC8B8] text-[#134E7A]"
              />
              <span>Benchmark Disability (UDID / PwD)</span>
            </label>
          </div>
        </div>
      </Card>

      {error && (
        <Alert variant="error" title="Could not evaluate opportunities">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {/* Clean Tabular Match Ledger */}
          <div className="grid grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E2DDD1] rounded-lg border border-[#E2DDD1] bg-[#F3EFE6] sm:grid-cols-4">
            <div className="p-4">
              <p className="text-[11px] font-semibold text-[#5C6573]">Eligible Scholarships</p>
              <p className="mt-1 font-mono text-2xl font-bold text-[#0E6B6E] tabular-nums">
                {
                  evaluatedScholarships.filter(
                    (s) => s.status === 'Appears eligible' || s.status === 'May be eligible'
                  ).length
                }
              </p>
            </div>
            <div className="p-4">
              <p className="text-[11px] font-semibold text-[#5C6573]">Matching Exams</p>
              <p className="mt-1 font-mono text-2xl font-bold text-[#134E7A] tabular-nums">
                {matchedExams.length}
              </p>
            </div>
            <div className="p-4">
              <p className="text-[11px] font-semibold text-[#5C6573]">Relevant Colleges</p>
              <p className="mt-1 font-mono text-2xl font-bold text-[#0B192C] tabular-nums">
                {matchedColleges.length}
              </p>
            </div>
            <div className="p-4">
              <p className="text-[11px] font-semibold text-[#5C6573]">Jobs &amp; Services</p>
              <p className="mt-1 font-mono text-2xl font-bold text-[#C46316] tabular-nums">
                {matchedJobs.length + matchedServices.length}
              </p>
            </div>
          </div>

          {/* Scholarships Evaluation */}
          {(goal === 'all' || goal === 'scholarships') && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#0B192C] tabular-nums">
                    Scholarship Eligibility Check ({evaluatedScholarships.length})
                  </h2>
                  <p className="text-xs text-[#5C6573]">
                    Pre-check results are advisory based on published rules. Final sanction lies with
                    the official scholarship authority.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/scholarships')}>
                  Open Scholarships Directory →
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {evaluatedScholarships.slice(0, 8).map(({ item, status, reasons }) => (
                  <Card key={item.id} className="p-5 flex flex-col justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-[#5C6573]">
                          {item.state} · {item.category}
                        </span>
                        {statusBadge(status)}
                      </div>
                      <h3 className="font-display text-base font-bold text-[#0B192C]">
                        <button
                          type="button"
                          onClick={() => navigate(`/scholarships/${item.slug}`)}
                          className="text-left hover:text-[#134E7A] transition-colors"
                        >
                          {item.title}
                        </button>
                      </h3>
                      <ul className="space-y-1 text-xs text-[#4B5565]">
                        {reasons.map((r) => (
                          <li key={r}>· {r}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#EFECE3] pt-3 text-xs">
                      <span className="font-medium text-[#0B192C]">
                        {item.amountDisplay || item.benefitsSummary}
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate(`/scholarships/${item.slug}`)}
                        className="inline-flex items-center gap-1 font-semibold text-[#134E7A] hover:underline shrink-0"
                      >
                        <span>Review Checklist</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Matching Competitive Exams */}
          {(goal === 'all' || goal === 'exams') && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-[#0B192C] tabular-nums">
                  Recommended Entrance &amp; Competitive Exams ({matchedExams.length})
                </h2>
                <button
                  type="button"
                  onClick={() => navigate('/exams')}
                  className="text-xs font-semibold text-[#134E7A] hover:underline"
                >
                  Browse all exams →
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {matchedExams.map((ex) => (
                  <Card key={ex.id} className="p-5 flex flex-col justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#5C6573]">
                        {ex.category} · {ex.state} · {ex.conductingAuthority}
                      </p>
                      <h3 className="mt-1 font-display text-base font-bold text-[#0B192C]">
                        <button
                          type="button"
                          onClick={() => navigate(`/exams/${ex.slug}`)}
                          className="text-left hover:text-[#134E7A]"
                        >
                          {ex.examName} — {ex.fullName}
                        </button>
                      </h3>
                      <p className="mt-1.5 text-xs text-[#4B5565] line-clamp-2">{ex.examPurpose}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#EFECE3] pt-3 text-xs">
                      <span className="text-[#0E6B6E] font-medium">{ex.applicationFee}</span>
                      <button
                        type="button"
                        onClick={() => navigate(`/exams/${ex.slug}`)}
                        className="font-semibold text-[#134E7A] hover:underline shrink-0"
                      >
                        Syllabus &amp; Steps →
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Matching Colleges */}
          {(goal === 'all' || goal === 'colleges') && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-[#0B192C] tabular-nums">
                  Matching Universities &amp; Colleges ({matchedColleges.length})
                </h2>
                <button
                  type="button"
                  onClick={() => navigate('/colleges')}
                  className="text-xs font-semibold text-[#134E7A] hover:underline"
                >
                  Compare institutions →
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {matchedColleges.map((inst) => (
                  <Card key={inst.id} className="p-5 flex flex-col justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#5C6573]">
                        {inst.institutionType} · {inst.city}, {inst.state}
                      </p>
                      <h3 className="mt-1 font-display text-base font-bold text-[#0B192C]">
                        <button
                          type="button"
                          onClick={() => navigate(`/colleges/${inst.slug}`)}
                          className="text-left hover:text-[#134E7A]"
                        >
                          {inst.shortName}
                        </button>
                      </h3>
                      <p className="mt-1 text-xs text-[#4B5565] line-clamp-2">{inst.overview}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/colleges/${inst.slug}`)}
                      className="text-xs font-semibold text-[#134E7A] hover:underline text-left"
                    >
                      Admission Routes &amp; Fees →
                    </button>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Jobs & Services Grid */}
          {(goal === 'all' || goal === 'jobs' || goal === 'services') && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {(goal === 'all' || goal === 'jobs') && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold text-[#0B192C]">
                      Jobs &amp; Apprenticeships
                    </h2>
                    <button
                      type="button"
                      onClick={() => navigate('/jobs')}
                      className="text-xs font-semibold text-[#134E7A] hover:underline"
                    >
                      All jobs →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {matchedJobs.map((job) => (
                      <Card key={job.id} className="p-4 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-[#5C6573]">
                            {job.category} · {job.state}
                          </p>
                          <h3 className="text-sm font-bold text-[#0B192C]">
                            <button
                              type="button"
                              onClick={() => navigate(`/jobs/${job.slug}`)}
                              className="text-left hover:text-[#134E7A]"
                            >
                              {job.title}
                            </button>
                          </h3>
                          <p className="text-xs text-[#4B5565]">{job.qualification}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/jobs/${job.slug}`)}
                          className="text-xs font-semibold text-[#134E7A] hover:underline shrink-0"
                        >
                          Guide →
                        </button>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {(goal === 'all' || goal === 'services') && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold text-[#0B192C]">
                      Relevant Citizen &amp; Document Guides
                    </h2>
                    <button
                      type="button"
                      onClick={() => navigate('/services')}
                      className="text-xs font-semibold text-[#134E7A] hover:underline"
                    >
                      All services →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {matchedServices.map((svc) => (
                      <Card key={svc.id} className="p-4 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-[#5C6573]">
                            {svc.category} · {svc.state}
                          </p>
                          <h3 className="text-sm font-bold text-[#0B192C]">
                            <button
                              type="button"
                              onClick={() => navigate(`/services/${svc.slug}`)}
                              className="text-left hover:text-[#134E7A]"
                            >
                              {svc.title}
                            </button>
                          </h3>
                          <p className="text-xs text-[#4B5565] line-clamp-1">{svc.summary}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/services/${svc.slug}`)}
                          className="text-xs font-semibold text-[#134E7A] hover:underline shrink-0"
                        >
                          Checklist →
                        </button>
                      </Card>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          <Card className="p-5 bg-[#F3EFE6] border-[#D6CFC2] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-[#C46316] shrink-0 mt-0.5" />
              <div className="text-xs text-[#4B5565]">
                <p className="font-semibold text-[#0B192C]">
                  Stay cautious of guaranteed-selection or paid scholarship scams
                </p>
                <p className="mt-0.5">
                  Government scholarships and public recruitment portals never charge middleman
                  sanction fees via UPI.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/scam-alerts')}>
              Open Scam Alert Center →
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
