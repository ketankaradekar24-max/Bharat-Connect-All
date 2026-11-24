import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Building2,
  CalendarClock,
  ChevronDown,
  Compass,
  ExternalLink,
  FileCheck2,
  GraduationCap,
  Landmark,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { ExternalPortalModal } from '../components/ExternalPortalModal.tsx';
import {
  BC_EASE,
  EditorialReveal,
  HeroItem,
  HeroStagger,
} from '../components/MotionPrimitives.tsx';
import {
  ApplicationJourneyBar,
  DeadlineUrgency,
  TrustStrip,
} from '../components/SignatureElements.tsx';
import { SpotlightSearch } from '../components/SpotlightSearch.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { apiFetch } from '../lib/api.ts';
import heroBharatImg from '../assets/images/hero_bharat_students_1794937499263.jpg';
import studentStudyImg from '../assets/images/student_study_focus_1794937500426.jpg';
import campusIndiaImg from '../assets/images/university_campus_india_1795016825721.jpg';
import citizenDeskImg from '../assets/images/citizen_service_guidance_1795016826745.jpg';
import type {
  Exam,
  JobListing,
  PublicService,
  PublicStats,
  Scholarship,
} from '../types/index.ts';

interface HomePageProps {
  navigate: (path: string) => void;
}

const SERVICE_NEEDS = [
  {
    label: 'Documents & Identity',
    desc: 'Aadhaar, PAN, Voter ID, DigiLocker, Domicile, Income & Caste',
    path: '/services?category=Government+Documents',
  },
  {
    label: 'Driving & Transport',
    desc: "Learner's & Permanent DL, Vahan RC transfer, NOC & e-Challan",
    path: '/services?category=Driving+Licence+%26+Transport',
  },
  {
    label: 'Passport & Visa',
    desc: 'Passport Seva PSK booking, Police Clearance & Country Visa checklists',
    path: '/services?category=Passport+%26+Visa',
  },
  {
    label: 'Welfare Schemes',
    desc: 'Karnataka Seva Sindhu, Guarantee schemes, PMAY & UDID',
    path: '/services?category=Government+Schemes',
  },
  {
    label: 'Business & MSME',
    desc: 'Udyam Registration, Startup India DPIIT, GST & FSSAI licensing',
    path: '/services?category=Business+%26+Entrepreneurship',
  },
  {
    label: 'Tax & Education Finance',
    desc: 'PM-Vidyalaxmi loan portal, Income Tax e-Filing, PPF & NPS',
    path: '/services?category=Tax+%26+Financial',
  },
  {
    label: 'Health & ABHA',
    desc: 'Ayushman Bharat PM-JAY, ABHA Health ID & eSanjeevani OPD',
    path: '/services?category=Health+%26+Public+Services',
  },
  {
    label: 'Agriculture & Rural',
    desc: 'PM-KISAN e-KYC, PMFBY Crop Insurance, e-NAM & Bhoomi RTC',
    path: '/services?category=Agriculture+%26+Rural+Services',
  },
];

const EDUCATION_TRACKS = [
  {
    code: '01',
    group: 'Engineering Entrances',
    summary: 'National, Karnataka & Regional State Counselling',
    links: [
      { label: 'JEE Main & Advanced', path: '/exams?q=JEE%20Main' },
      { label: 'KCET (Karnataka KEA)', path: '/exams?q=KCET' },
      { label: 'COMEDK UGET', path: '/exams?q=COMEDK' },
      { label: 'MHT CET / KEAM / WBJEE', path: '/exams?category=Engineering&subcategory=State' },
      { label: 'BITSAT & Private Univ.', path: '/exams?category=Engineering&subcategory=Private%20Universities' },
      { label: 'Diploma Lateral (DCET)', path: '/exams?q=DCET' },
    ],
  },
  {
    code: '02',
    group: 'Medical, Nursing & Allied Health',
    summary: 'MBBS, BDS, AYUSH, Pharmacy & Veterinary Pathways',
    links: [
      { label: 'NEET UG', path: '/exams?q=NEET%20UG' },
      { label: 'NEET PG & INI-CET', path: '/exams?q=INI-CET' },
      { label: 'B.Sc Nursing & Allied', path: '/exams?category=Medical&subcategory=Nursing' },
      { label: 'Pharmacy & AYUSH', path: '/exams?category=Medical&subcategory=Pharmacy' },
    ],
  },
  {
    code: '03',
    group: 'Universities, Counselling & Comparison',
    summary: 'Admission Authorities, Fee Rules & Side-by-Side Comparison',
    links: [
      { label: 'CUET UG & Central Univ.', path: '/exams?category=University%20Admissions' },
      { label: 'VTU Belagavi Guide', path: '/universities/vtu' },
      { label: 'Compare Colleges (up to 3)', path: '/colleges' },
      { label: 'JoSAA, KEA & MCC Playbooks', path: '/counselling' },
    ],
  },
];

const FAQS = [
  {
    q: 'How does Bharat Connect help with both education admissions and public services?',
    a: 'You can search one verified directory for entrance exams, universities like VTU and IITs, counselling playbooks, scholarships, driving licences, passports, PAN, Voter ID, Karnataka certificates, and business registrations—complete with document checklists and official portal links.',
  },
  {
    q: 'Does Bharat Connect submit applications or act as a government / visa agency?',
    a: 'No. Bharat Connect is an independent guidance platform. We do not submit applications, charge agent fees, guarantee visa/loan/scholarship approval, or represent any government ministry or embassy.',
  },
  {
    q: 'Does Bharat Connect collect Aadhaar numbers, OTPs, or bank passwords?',
    a: 'Never. We follow strict data minimization and never collect Aadhaar numbers, OTPs, bank credentials, payment cards, or external portal passwords. You authenticate and submit strictly on official .gov.in or institutional portals.',
  },
  {
    q: 'How do I check eligibility and track my deadlines?',
    a: 'Open the Personal Opportunity Finder to match your state, education level, marks, and family income against verified scholarships and exams—or use the Deadline Calendar and Personal Dashboard to save preparation checklists and reminders.',
  },
];

export function HomePage({ navigate }: HomePageProps) {
  const { dbUser, openAuthModal } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const prefersReduced = useReducedMotion();

  const [stats, setStats] = useState<PublicStats | null>(null);
  const [recentScholarships, setRecentScholarships] = useState<Scholarship[]>([]);
  const [featuredServices, setFeaturedServices] = useState<PublicService[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<JobListing[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [studioTab, setStudioTab] = useState<'finder' | 'cost'>('finder');

  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [externalTarget, setExternalTarget] = useState<{
    title: string;
    portalName: string;
    url: string;
    isThirdParty?: boolean;
  } | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [statsData, scholarshipData, servicesData, jobsData, examsData] = await Promise.all([
          apiFetch<PublicStats>('/api/public/stats'),
          apiFetch<{ scholarships: Scholarship[] }>('/api/scholarships'),
          apiFetch<{ services: PublicService[] }>('/api/services'),
          apiFetch<{ jobs: JobListing[] }>('/api/jobs'),
          apiFetch<{ exams: Exam[] }>('/api/exams'),
        ]);
        if (!active) return;
        setStats(statsData);
        setRecentScholarships(scholarshipData.scholarships.slice(0, 4));
        setFeaturedServices(servicesData.services.slice(0, 5));
        setFeaturedJobs(jobsData.jobs.slice(0, 5));
        setUpcomingExams(examsData.exams.slice(0, 4));
      } catch (error) {
        console.error('Homepage data load error:', error);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const upcomingTimeline = useMemo(() => {
    const items: Array<{
      id: string;
      kind: 'Scholarship' | 'Exam' | 'Recruitment';
      title: string;
      authority: string;
      dateStr?: string | null;
      fallback: string;
      path: string;
    }> = [];

    recentScholarships.slice(0, 2).forEach((s) =>
      items.push({
        id: `sch-${s.id}`,
        kind: 'Scholarship',
        title: s.title,
        authority: s.providerName,
        dateStr: s.deadlineDate,
        fallback: s.importantDatesText || 'Check official portal cycle',
        path: `/scholarships/${s.slug}`,
      })
    );
    upcomingExams.slice(0, 2).forEach((e) =>
      items.push({
        id: `ex-${e.id}`,
        kind: 'Exam',
        title: `${e.examName} — ${e.fullName}`,
        authority: e.conductingAuthority,
        dateStr: e.nextExamDate,
        fallback: e.importantDatesText,
        path: `/exams/${e.slug}`,
      })
    );
    featuredJobs.slice(0, 2).forEach((j) =>
      items.push({
        id: `jb-${j.id}`,
        kind: 'Recruitment',
        title: j.title,
        authority: j.organization,
        dateStr: j.deadlineDate,
        fallback: j.deadlineText,
        path: `/jobs/${j.slug}`,
      })
    );
    return items;
  }, [recentScholarships, upcomingExams, featuredJobs]);

  const leadScholarship = recentScholarships[0] || null;
  const secondaryScholarships = recentScholarships.slice(1, 4);

  const markImgErr = (key: string) =>
    setImgErrors((prev) => ({ ...prev, [key]: true }));

  return (
    <div>
      {/* 1. Signature Editorial Hero */}
      <section className="border-b border-[#E2DDD1] bg-[#FAF8F3] bg-civic-grid">
        <div className="mx-auto max-w-6xl px-4 pt-5 pb-12 sm:px-6 lg:pt-8 lg:pb-14">
          {/* Operational Masthead & Language Switch */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-[#E2DDD1] pb-3.5 text-xs">
            <p className="font-medium text-[#475467]">
              India’s Opportunity &amp; Public Services Network · Karnataka &amp; All India Coverage
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[#5C6573] mr-1">{t.languageLabel}:</span>
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
                  className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                    lang === opt.code
                      ? 'bg-[#0B192C] text-white'
                      : 'border border-[#D6CFC2] bg-white text-[#475467] hover:border-[#0B192C]/40 hover:text-[#0B192C]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 12-Column Asymmetric Hero Composition */}
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
            <HeroStagger className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <HeroItem className="space-y-4">
                <p className="text-xs font-semibold text-[#C46316]">
                  Verified Official Portals · Document Checklists · Zero Middlemen
                </p>
                <h1 className="text-[clamp(2.15rem,4vw,3.35rem)] font-semibold tracking-tight text-[#0B192C] leading-[1.1]">
                  {lang === 'en'
                    ? 'Discover opportunities. Access services. Plan your future.'
                    : t.heroTitle}
                </h1>
                <p className="text-base leading-relaxed text-[#475467] max-w-2xl">
                  {t.heroSubtitle}
                </p>
              </HeroItem>

              {/* Universal Discovery Search */}
              <HeroItem className="space-y-2">
                <SpotlightSearch
                  navigate={navigate}
                  placeholder="Search scholarships, JEE, KCET, NEET, colleges, driving licence, passport, jobs..."
                />
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#5C6573]">
                  <span>
                    Press{' '}
                    <kbd className="rounded border border-[#D6CFC2] bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#0B192C]">
                      ⌘K
                    </kbd>{' '}
                    anywhere for instant directory lookup across 6 verified collections.
                  </span>
                </div>
              </HeroItem>

              {/* Hero Actions */}
              <HeroItem className="flex flex-wrap items-center gap-4 pt-1">
                <Button variant="navy" size="lg" onClick={() => navigate('/opportunities')}>
                  <Compass className="h-4 w-4" />
                  <span>Check My Eligibility</span>
                </Button>
                <button
                  type="button"
                  onClick={() => navigate('/exams')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#134E7A] hover:text-[#0D3B5E] whitespace-nowrap transition-colors"
                >
                  <span>Browse Exams &amp; Admissions</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                {!dbUser && (
                  <button
                    type="button"
                    onClick={openAuthModal}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#475467] hover:text-[#0B192C] whitespace-nowrap transition-colors"
                  >
                    <span>Sign In</span>
                  </button>
                )}
              </HeroItem>
            </HeroStagger>

            {/* Right: Art-Directed Documentary Photo Frame */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="relative flex-1 min-h-[290px] overflow-hidden rounded-lg border border-[#D6CFC2] bg-[#0B192C]">
                {!imgErrors.hero ? (
                  <>
                    <img
                      src={heroBharatImg}
                      alt="Indian university students collaborating over verified entrance exams and public services"
                      referrerPolicy="no-referrer"
                      onError={() => markImgErr('hero')}
                      className="h-full w-full object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#0B192C]/90 via-[#0B192C]/25 to-transparent"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white space-y-1">
                      <p className="font-mono text-[11px] font-medium text-amber-300 tabular-nums">
                        {stats
                          ? `${stats.verifiedExams} Exams · ${stats.verifiedServices} Services · ${stats.verifiedScholarships} Scholarships`
                          : 'Verified All-India Directory'}
                      </p>
                      <p className="text-sm font-medium leading-snug text-slate-100">
                        Built for Indian students, parents, graduates, and citizens seeking clear
                        processes without confusing broker websites.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full min-h-[290px] flex-col justify-end bg-[#0B192C] p-8 text-white">
                    <p
                      className="text-xl font-bold"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      Verified Services &amp; Admissions
                    </p>
                    <p className="mt-1.5 text-sm text-slate-200">
                      Clear step-by-step checklists and direct official portal links.
                    </p>
                  </div>
                )}
              </div>
              <p className="mt-2 text-[11px] italic text-[#5C6573]">
                Fig. 01 — Consolidated guidance across national &amp; state education, citizen
                documents, and welfare portals.
              </p>
            </div>
          </div>

          {/* 2. Quick-Access Pathways Strip (Horizontal 6-Column Ledger) */}
          <div className="mt-10 grid grid-cols-2 divide-y sm:divide-y-0 sm:grid-cols-3 lg:grid-cols-6 sm:divide-x divide-[#E2DDD1] rounded-lg border border-[#E2DDD1] bg-white">
            {[
              {
                label: 'Entrance Exams',
                metric: stats ? `${stats.verifiedExams}` : '—',
                sub: 'JEE, KCET, NEET, UPSC',
                path: '/exams',
                icon: GraduationCap,
              },
              {
                label: 'Colleges & Univ.',
                metric: stats ? `${stats.verifiedInstitutions}` : '—',
                sub: 'VTU, IITs, AIIMS, Compare',
                path: '/colleges',
                icon: Building2,
              },
              {
                label: 'Public Services',
                metric: stats ? `${stats.verifiedServices}` : '—',
                sub: 'DL, Passport, Schemes',
                path: '/services',
                icon: Landmark,
              },
              {
                label: 'Scholarships',
                metric: stats ? `${stats.verifiedScholarships}` : '—',
                sub: 'NSP, Karnataka SSP, CSR',
                path: '/scholarships',
                icon: FileCheck2,
              },
              {
                label: 'Jobs & Internships',
                metric: stats ? `${stats.verifiedJobs}` : '—',
                sub: 'NCS, Govt, Apprentices',
                path: '/jobs',
                icon: Briefcase,
              },
              {
                label: 'Scam Link Checker',
                metric: '1930',
                sub: 'Verify .gov.in domains',
                path: '/scam-alerts',
                icon: ShieldAlert,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className="group p-4 text-left hover:bg-[#FAF8F3] transition-colors flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Icon className="h-4 w-4 text-[#134E7A] group-hover:text-[#C46316] transition-colors" />
                    <span className="font-mono text-sm font-semibold text-[#0B192C] tabular-nums">
                      {item.metric}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0B192C] group-hover:text-[#134E7A]">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-[#5C6573] truncate">{item.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Featured Opportunities — Front-Page 3-Tier Editorial Salience */}
      <section className="py-16 bg-white border-b border-[#E2DDD1]">
        <EditorialReveal className="mx-auto max-w-6xl px-4 sm:px-6 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E2DDD1] pb-4">
            <div>
              <p className="text-xs font-semibold text-[#C46316]">
                Featured Financial Aid &amp; Scholarships
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#0B192C] sm:text-3xl">
                Verified Scholarships &amp; Grants
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button
                type="button"
                onClick={() => navigate('/opportunities')}
                className="font-semibold text-[#0E6B6E] hover:underline whitespace-nowrap"
              >
                Check personal eligibility →
              </button>
              <button
                type="button"
                onClick={() => navigate('/scholarships')}
                className="font-semibold text-[#134E7A] hover:underline whitespace-nowrap"
              >
                View all scholarships →
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <Skeleton className="lg:col-span-7 h-72" />
              <Skeleton className="lg:col-span-5 h-72" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
              {/* Dominant Lead Opportunity */}
              {leadScholarship && (
                <div className="lg:col-span-7 rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-6 sm:p-8 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#C46316]">
                      Featured Opportunity · {leadScholarship.providerType} · {leadScholarship.state}
                    </span>
                    <DeadlineUrgency
                      dateStr={leadScholarship.deadlineDate}
                      fallbackText={leadScholarship.importantDatesText}
                    />
                  </div>

                  <div className="space-y-2.5">
                    <h3
                      className="text-2xl font-semibold text-[#0B192C] leading-snug"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      <button
                        type="button"
                        onClick={() => navigate(`/scholarships/${leadScholarship.slug}`)}
                        className="text-left hover:text-[#134E7A] transition-colors"
                      >
                        {leadScholarship.title}
                      </button>
                    </h3>
                    <p className="text-xs font-medium text-[#5C6573]">
                      Administered by {leadScholarship.providerName}
                    </p>
                    <p className="text-sm leading-relaxed text-[#475467]">
                      {leadScholarship.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 border-t border-b border-[#E2DDD1] py-4 sm:grid-cols-3 text-xs">
                    <div>
                      <p className="font-semibold text-[#5C6573]">Award / Benefit</p>
                      <p className="mt-1 font-semibold text-[#0B192C]">
                        {leadScholarship.benefitsSummary}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#5C6573]">Education Scope</p>
                      <p className="mt-1 font-semibold text-[#0B192C]">
                        {leadScholarship.educationLevels.join(', ')}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#5C6573]">Income Ceiling</p>
                      <p className="mt-1 font-semibold text-[#0B192C] tabular-nums">
                        {leadScholarship.maxFamilyIncome
                          ? `≤ ₹${leadScholarship.maxFamilyIncome.toLocaleString('en-IN')}`
                          : 'Check official norms'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <TrustStrip
                      sourceName={leadScholarship.officialSourceName}
                      verifiedAt={leadScholarship.lastVerifiedAt}
                    />
                    <div className="flex items-center gap-3">
                      <Button
                        variant="navy"
                        size="sm"
                        onClick={() => navigate(`/scholarships/${leadScholarship.slug}`)}
                      >
                        <span>Eligibility &amp; Checklist</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setExternalTarget({
                            title: leadScholarship.title,
                            portalName: leadScholarship.officialSourceName,
                            url: leadScholarship.officialApplyUrl,
                          })
                        }
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Compact Editorial Secondary Stack */}
              <div className="lg:col-span-5 divide-y divide-[#E2DDD1] border-t border-b border-[#E2DDD1]">
                {secondaryScholarships.map((item) => (
                  <div key={item.id} className="py-4.5 space-y-2 group">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5C6573]">
                      <span>
                        {item.state} · {item.category}
                      </span>
                      <DeadlineUrgency
                        dateStr={item.deadlineDate}
                        fallbackText={item.importantDatesText}
                      />
                    </div>
                    <h3 className="text-base font-bold text-[#0B192C] leading-snug">
                      <button
                        type="button"
                        onClick={() => navigate(`/scholarships/${item.slug}`)}
                        className="text-left group-hover:text-[#134E7A] transition-colors"
                      >
                        {item.title}
                      </button>
                    </h3>
                    <p className="text-xs text-[#475467] line-clamp-2">{item.benefitsSummary}</p>
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <button
                        type="button"
                        onClick={() => navigate(`/scholarships/${item.slug}`)}
                        className="inline-flex items-center gap-1 font-semibold text-[#134E7A] hover:underline"
                      >
                        <span>View requirements</span>
                        <ArrowRight className="h-3 w-3" />
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
                        className="inline-flex items-center gap-1 text-[#5C6573] hover:text-[#0B192C]"
                      >
                        <span>Portal</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </EditorialReveal>
      </section>

      {/* 4. Education, Exams & Universities — Architectural Split with Campus Photo */}
      <section className="py-16 bg-[#FAF8F3] border-b border-[#E2DDD1]">
        <EditorialReveal className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-stretch">
            {/* Left Campus Visual */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="relative flex-1 min-h-[300px] overflow-hidden rounded-lg border border-[#D6CFC2] bg-[#0B192C]">
                {!imgErrors.campus ? (
                  <>
                    <img
                      src={campusIndiaImg}
                      alt="Indian university campus courtyard with engineering students"
                      referrerPolicy="no-referrer"
                      onError={() => markImgErr('campus')}
                      className="h-full w-full object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#0B192C]/85 via-[#0B192C]/20 to-transparent"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white space-y-2">
                      <p className="text-xs font-semibold text-amber-300">
                        National &amp; State Admissions Matrix
                      </p>
                      <p className="text-sm font-medium text-slate-100">
                        Compare engineering, medical, and university admissions across JoSAA, KEA
                        KCET, COMEDK, CUET, and 85+ verified exam guides.
                      </p>
                      <div className="pt-1 flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate('/colleges')}
                        >
                          <span>Compare Colleges</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full min-h-[300px] flex-col justify-end bg-[#0B192C] p-6 text-white">
                    <p className="text-lg font-bold">Education &amp; University Admissions</p>
                  </div>
                )}
              </div>
              <p className="mt-2 text-[11px] italic text-[#5C6573]">
                Fig. 02 — Structured admission routes covering central institutes, VTU Belagavi,
                state universities, and counselling playbooks.
              </p>
            </div>

            {/* Right Structured Directory Tracks */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-[#134E7A]">
                    Education, Exams &amp; Admissions
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#0B192C] sm:text-3xl">
                    Entrance Pathways &amp; College Discovery
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/exams')}
                  className="text-xs font-semibold text-[#134E7A] hover:underline whitespace-nowrap"
                >
                  Open full exam directory →
                </button>
              </div>

              <div className="divide-y divide-[#E2DDD1] rounded-lg border border-[#E2DDD1] bg-white">
                {EDUCATION_TRACKS.map((track) => (
                  <div key={track.code} className="p-5 sm:p-6 space-y-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-xs font-semibold text-[#C46316] tabular-nums">
                          {track.code}
                        </span>
                        <h3 className="text-base font-bold text-[#0B192C]">{track.group}</h3>
                      </div>
                      <span className="text-xs text-[#5C6573]">{track.summary}</span>
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
                      {track.links.map((lnk) => (
                        <button
                          key={lnk.label}
                          type="button"
                          onClick={() => navigate(lnk.path)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#134E7A] underline decoration-[#CFC8B8] underline-offset-4 hover:text-[#0B192C] hover:decoration-[#0B192C] transition-colors"
                        >
                          <span>{lnk.label}</span>
                          <ArrowUpRight className="h-3 w-3 text-[#7A828F]" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </EditorialReveal>
      </section>

      {/* 5. Government Services — "What do you need?" Horizontal Matrix + Live Desk */}
      <section className="py-16 bg-[#F3EFE6] border-b border-[#E2DDD1]">
        <EditorialReveal className="mx-auto max-w-6xl px-4 sm:px-6 space-y-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 space-y-3">
              <p className="text-xs font-semibold text-[#0E6B6E]">
                Citizen &amp; Public Services Hub
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-[#0B192C] sm:text-3xl">
                What do you need today?
              </h2>
              <p className="text-sm leading-relaxed text-[#475467] max-w-2xl">
                Prepare exact documents, understand official government fees, and inspect step-by-step
                checklists before visiting any `.gov.in` service portal or Seva Kendra.
              </p>
            </div>
            <div className="lg:col-span-5 flex flex-wrap lg:justify-end gap-3">
              <Button variant="navy" size="md" onClick={() => navigate('/services')}>
                <span>Explore All {stats?.verifiedServices ?? ''} Services</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="md" onClick={() => navigate('/states')}>
                <span>Karnataka &amp; States Hub</span>
              </Button>
            </div>
          </div>

          {/* 8-Need Architectural Matrix */}
          <div className="grid grid-cols-1 border border-[#D6CFC2] rounded-lg overflow-hidden bg-white sm:grid-cols-2 lg:grid-cols-4">
            {SERVICE_NEEDS.map((need, idx) => (
              <button
                key={need.label}
                type="button"
                onClick={() => navigate(need.path)}
                className={`group p-5 text-left hover:bg-[#FAF8F3] transition-colors flex flex-col justify-between gap-3 border-[#E2DDD1] ${
                  idx < 4 ? 'border-b' : 'border-b lg:border-b-0'
                } ${idx % 4 !== 3 ? 'lg:border-r' : ''} ${idx % 2 === 0 ? 'sm:border-r' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-semibold text-[#C46316] tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#9AA2AE] group-hover:text-[#134E7A] group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B192C] group-hover:text-[#134E7A]">
                    {need.label}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#5C6573]">{need.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Bottom Split: Popular Citizen Guides + Guidance Photo */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-stretch pt-2">
            <div className="lg:col-span-7 rounded-lg border border-[#D6CFC2] bg-white divide-y divide-[#EFECE3]">
              <div className="px-5 py-3.5 flex items-center justify-between bg-[#FAF8F3]">
                <span className="text-xs font-bold text-[#0B192C]">
                  Most Accessed Citizen Service Guides
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/services')}
                  className="text-xs font-semibold text-[#134E7A] hover:underline"
                >
                  All guides →
                </button>
              </div>
              {featuredServices.map((svc) => (
                <div
                  key={svc.id}
                  className="px-5 py-3.5 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between hover:bg-[#FAF8F3] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#5C6573]">
                      {svc.category} · {svc.state}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate(`/services/${svc.slug}`)}
                      className="text-sm font-bold text-[#0B192C] hover:text-[#134E7A] text-left truncate block max-w-full"
                    >
                      {svc.title}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-xs">
                    <button
                      type="button"
                      onClick={() => navigate(`/services/${svc.slug}`)}
                      className="font-semibold text-[#134E7A] hover:underline whitespace-nowrap"
                    >
                      Checklist →
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setExternalTarget({
                          title: svc.title,
                          portalName: svc.officialWebsiteName,
                          url: svc.officialApplyUrl,
                          isThirdParty: svc.isThirdParty,
                        })
                      }
                      className="inline-flex items-center gap-1 text-[#5C6573] hover:text-[#0B192C] whitespace-nowrap"
                    >
                      <span>Portal</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-5 flex flex-col">
              <div className="relative flex-1 min-h-[240px] overflow-hidden rounded-lg border border-[#D6CFC2] bg-[#0B192C]">
                {!imgErrors.citizen ? (
                  <>
                    <img
                      src={citizenDeskImg}
                      alt="Indian parent and graduate reviewing official application documents together"
                      referrerPolicy="no-referrer"
                      onError={() => markImgErr('citizen')}
                      className="h-full w-full object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#0B192C]/80 via-transparent to-transparent"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <p className="text-xs font-semibold text-teal-200">
                        Document-First Preparation
                      </p>
                      <p className="text-xs text-slate-100 mt-0.5">
                        Every guide verifies document lists, fees, and official links before you
                        submit externally.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-end bg-[#0B192C] p-5 text-white">
                    <p className="text-sm font-semibold">Prepare Documents Before Applying</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </EditorialReveal>
      </section>

      {/* 6. Career Opportunities — Structured Recruitment Index Table */}
      {featuredJobs.length > 0 && (
        <section className="py-16 bg-white border-b border-[#E2DDD1]">
          <EditorialReveal className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#134E7A]">
                  Verified Recruitment &amp; Apprenticeship Tracks
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#0B192C] sm:text-3xl">
                  Jobs, Public Recruitment &amp; Internships
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="text-xs font-semibold text-[#134E7A] hover:underline whitespace-nowrap"
              >
                Explore all {stats ? stats.verifiedJobs : ''} job pathways →
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-[#E2DDD1] bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2DDD1] bg-[#FAF8F3] text-[11px] font-semibold text-[#5C6573]">
                    <th className="py-3 px-4">Role / Pathway</th>
                    <th className="py-3 px-4 hidden md:table-cell">Authority / Scope</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Qualification</th>
                    <th className="py-3 px-4">Cycle / Deadline</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE3] text-xs">
                  {featuredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-[#FAF8F3] transition-colors">
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => navigate(`/jobs/${job.slug}`)}
                          className="font-bold text-[#0B192C] hover:text-[#134E7A] text-left"
                        >
                          {job.title}
                        </button>
                        <p className="text-[11px] text-[#0E6B6E] font-medium mt-0.5">
                          {job.category} · {job.state}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-[#475467] hidden md:table-cell">
                        {job.organization}
                      </td>
                      <td className="py-3.5 px-4 text-[#475467] hidden sm:table-cell max-w-xs">
                        <span className="line-clamp-2">{job.qualification}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <DeadlineUrgency
                          dateStr={job.deadlineDate}
                          fallbackText={job.deadlineText}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => navigate(`/jobs/${job.slug}`)}
                            className="font-semibold text-[#134E7A] hover:underline"
                          >
                            Guide
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setExternalTarget({
                                title: job.title,
                                portalName: job.officialSourceName,
                                url: job.officialApplyUrl,
                              })
                            }
                            className="inline-flex items-center gap-1 font-medium text-[#5C6573] hover:text-[#0B192C]"
                          >
                            <span>Apply</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </EditorialReveal>
        </section>
      )}

      {/* 7. Upcoming Deadlines & 5-Stage Application Journey */}
      <section className="py-16 bg-[#FAF8F3] border-b border-[#E2DDD1]">
        <EditorialReveal className="mx-auto max-w-6xl px-4 sm:px-6 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#C46316]">
                Structured Execution &amp; Calendar
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#0B192C] sm:text-3xl">
                Application Journey &amp; Upcoming Deadlines
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/tools')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#134E7A] hover:underline whitespace-nowrap"
            >
              <CalendarClock className="h-4 w-4" />
              <span>Open Full Deadline Calendar →</span>
            </button>
          </div>

          <ApplicationJourneyBar activeStage="Prepare" />

          {/* Timeline Strip */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingTimeline.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => navigate(entry.path)}
                className="group rounded-lg border border-[#E2DDD1] bg-white p-4 text-left hover:border-[#134E7A]/45 transition-colors flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-semibold text-[#134E7A]">{entry.kind}</span>
                  <DeadlineUrgency dateStr={entry.dateStr} fallbackText={entry.fallback} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0B192C] group-hover:text-[#134E7A] line-clamp-1">
                    {entry.title}
                  </p>
                  <p className="text-xs text-[#5C6573] truncate mt-0.5">{entry.authority}</p>
                </div>
              </button>
            ))}
          </div>
        </EditorialReveal>
      </section>

      {/* 8. Personalized Discovery & Learning Resources Studio (Split Composition) */}
      <section className="py-16 bg-white border-b border-[#E2DDD1]">
        <EditorialReveal className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-stretch">
            {/* Left: Interactive Studio Switcher */}
            <div className="lg:col-span-7 flex flex-col justify-between rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-6 sm:p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-[#0E6B6E]">
                    Personalized Planning Tools
                  </p>
                  <div className="inline-flex rounded-md border border-[#D6CFC2] bg-white p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setStudioTab('finder')}
                      className={`rounded px-3 py-1 font-semibold transition-colors ${
                        studioTab === 'finder'
                          ? 'bg-[#0B192C] text-white'
                          : 'text-[#475467] hover:text-[#0B192C]'
                      }`}
                    >
                      Opportunity Finder
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudioTab('cost')}
                      className={`rounded px-3 py-1 font-semibold transition-colors ${
                        studioTab === 'cost'
                          ? 'bg-[#0B192C] text-white'
                          : 'text-[#475467] hover:text-[#0B192C]'
                      }`}
                    >
                      Cost &amp; Loan Planner
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {studioTab === 'finder' ? (
                    <motion.div
                      key="finder"
                      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                      transition={{ duration: 0.16, ease: BC_EASE }}
                      className="space-y-4"
                    >
                      <h2 className="text-2xl font-semibold text-[#0B192C]">
                        Match Your Profile Against Verified Opportunities
                      </h2>
                      <p className="text-sm leading-relaxed text-[#475467]">
                        Select your state, education level, stream, social category, marks, and
                        annual family income to receive transparent rule-based eligibility notes—no
                        black-box guesses.
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
                        <div className="rounded-md border border-[#E2DDD1] bg-white p-3">
                          <p className="font-semibold text-[#0E6B6E]">01. Domicile &amp; Category</p>
                          <p className="mt-1 text-[#5C6573]">
                            Karnataka SSP, Central NSP &amp; All-India filters
                          </p>
                        </div>
                        <div className="rounded-md border border-[#E2DDD1] bg-white p-3">
                          <p className="font-semibold text-[#134E7A]">02. Transparent Rules</p>
                          <p className="mt-1 text-[#5C6573]">
                            Clear eligibility reasons before opening portals
                          </p>
                        </div>
                        <div className="rounded-md border border-[#E2DDD1] bg-white p-3">
                          <p className="font-semibold text-[#C46316]">03. Direct Checklists</p>
                          <p className="mt-1 text-[#5C6573]">
                            Jump directly into documents &amp; steps
                          </p>
                        </div>
                      </div>
                      <Button variant="navy" onClick={() => navigate('/opportunities')}>
                        <Compass className="h-4 w-4" />
                        <span>Open Personal Opportunity Finder</span>
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="cost"
                      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                      transition={{ duration: 0.16, ease: BC_EASE }}
                      className="space-y-4"
                    >
                      <h2 className="text-2xl font-semibold text-[#0B192C]">
                        Estimate Annual College Fees, Aid &amp; Education Loans
                      </h2>
                      <p className="text-sm leading-relaxed text-[#475467]">
                        Calculate multi-year tuition, hostel, and academic budgets alongside
                        expected scholarships and PM-Vidyalaxmi education loan coverage.
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
                        <div className="rounded-md border border-[#E2DDD1] bg-white p-3">
                          <p className="font-semibold text-[#0B192C]">Tuition &amp; Hostel</p>
                          <p className="mt-1 text-[#5C6573]">Model 1 to 5 year degree totals</p>
                        </div>
                        <div className="rounded-md border border-[#E2DDD1] bg-white p-3">
                          <p className="font-semibold text-[#0E6B6E]">Scholarship Offset</p>
                          <p className="mt-1 text-[#5C6573]">Subtract SSP/NSP fee support</p>
                        </div>
                        <div className="rounded-md border border-[#E2DDD1] bg-white p-3">
                          <p className="font-semibold text-[#134E7A]">PM-Vidyalaxmi Ready</p>
                          <p className="mt-1 text-[#5C6573]">Official loan portal checklist</p>
                        </div>
                      </div>
                      <Button variant="navy" onClick={() => navigate('/tools')}>
                        <span>Open Deadlines &amp; Cost Planner</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: Career, Roadmaps & Learning Studio Card */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-lg border border-[#E2DDD1] bg-white overflow-hidden">
              <div className="relative h-52 bg-[#0B192C]">
                {!imgErrors.study ? (
                  <>
                    <img
                      src={studentStudyImg}
                      alt="Student organizing documents and planning career roadmap"
                      referrerPolicy="no-referrer"
                      onError={() => markImgErr('study')}
                      className="h-full w-full object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#0B192C]/80 via-transparent to-transparent"
                    />
                  </>
                ) : null}
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <p className="text-xs font-semibold text-amber-300">
                    Career &amp; Learning Studio
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3
                    className="text-xl font-semibold text-[#0B192C]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Career Roadmaps, Resume Builder &amp; Free Courses
                  </h3>
                  <p className="text-xs leading-relaxed text-[#475467]">
                    Follow structured India career tracks, practice UPSC/technical interview
                    questions, generate an ATS-clean PDF resume, and access free NPTEL, SWAYAM &amp;
                    NCERT resources.
                  </p>
                </div>

                <Button variant="outline" onClick={() => navigate('/learning')}>
                  <BookOpen className="h-4 w-4" />
                  <span>Launch Career &amp; Resume Studio</span>
                </Button>
              </div>
            </div>
          </div>
        </EditorialReveal>
      </section>

      {/* 9. Deep Ink Trust, Verification & Scam Safety Statement */}
      <section className="bg-[#0B192C] py-16 text-white">
        <EditorialReveal className="mx-auto max-w-6xl px-4 sm:px-6 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold text-amber-300">
                Trust, Verification &amp; Citizen Safety
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Built for Public Trust, Transparency, and Data Minimization
              </h2>
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate('/scam-alerts')}>
              <ShieldAlert className="h-4 w-4 text-[#C46316]" />
              <span>Verify Official Links &amp; Report Scams</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 divide-y md:divide-y-0 md:grid-cols-4 md:divide-x divide-slate-800 border border-slate-800 rounded-lg bg-[#10233D]">
            {[
              {
                title: 'Official Portals Only',
                desc: 'We guide clearly and route directly to authentic .gov.in, .nic.in, or official university portals—never paid broker forms.',
              },
              {
                title: 'Zero Aadhaar or OTP Storage',
                desc: 'Bharat Connect never asks for Aadhaar numbers, OTPs, bank passwords, or payment card numbers.',
              },
              {
                title: 'Domain & Scam Checker',
                desc: 'Inspect suspicious recruitment or scholarship links and call National Cyber Helpline 1930 on fake UPI demands.',
              },
              {
                title: 'English, ಕನ್ನಡ & हिन्दी',
                desc: 'Plain-language steps in English, Kannada, and Hindi while keeping dates anchored to official notices.',
              },
            ].map((item) => (
              <div key={item.title} className="p-6 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <ShieldCheck className="h-4 w-4 text-teal-300 shrink-0" />
                  <span>{item.title}</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </EditorialReveal>
      </section>

      {/* 10. Community Digest & Frequently Asked Questions */}
      <section className="bg-white py-16">
        <EditorialReveal className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
            <div className="lg:col-span-5 space-y-4">
              <p className="text-xs font-semibold text-[#134E7A]">
                Community &amp; Help Desk
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-[#0B192C] sm:text-3xl">
                Questions Answered Clearly
              </h2>
              <p className="text-sm leading-relaxed text-[#475467]">
                Unsure about Karnataka SSP documents, JoSAA choice locking, or Parivahan slot
                rules? Explore peer discussions or check our policies.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button variant="outline" size="sm" onClick={() => navigate('/community')}>
                  <span>Open Community Q&amp;A</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/about')}>
                  <span>About Bharat Connect</span>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-7 divide-y divide-[#E2DDD1] border-t border-b border-[#E2DDD1]">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={faq.q} className="py-4">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 text-left text-base font-bold text-[#0B192C] hover:text-[#134E7A] transition-colors min-h-[42px]"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-[#5C6573] shrink-0 transition-transform duration-150 ${
                          isOpen ? 'rotate-180 text-[#0B192C]' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                          transition={{ duration: 0.16, ease: BC_EASE }}
                        >
                          <p className="mt-2.5 text-sm leading-relaxed text-[#475467]">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </EditorialReveal>
      </section>

      <ExternalPortalModal target={externalTarget} onClose={() => setExternalTarget(null)} />
    </div>
  );
}
