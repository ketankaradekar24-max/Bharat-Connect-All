import { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  Building2,
  Car,
  ExternalLink,
  FileText,
  GraduationCap,
  HeartPulse,
  Landmark,
  Plane,
  RotateCcw,
  Search,
  Sprout,
  Wallet,
} from 'lucide-react';
import { ExternalPortalModal } from '../components/ExternalPortalModal.tsx';
import { TrustStrip } from '../components/SignatureElements.tsx';
import { Alert } from '../components/ui/Alert.tsx';
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { apiFetch } from '../lib/api.ts';
import type {
  CounsellingGuide,
  Exam,
  Institution,
  JobListing,
  PublicService,
  Scholarship,
} from '../types/index.ts';

interface ExploreServicesPageProps {
  navigate: (path: string) => void;
  initialSearch?: string;
}

const SERVICE_CATEGORIES = [
  'All',
  'Education & Scholarships',
  'College Admissions & Counselling',
  'Driving Licence & Transport',
  'Passport & Visa',
  'Government Documents',
  'Government Schemes',
  'Government Jobs',
  'Competitive Exams',
  'Skill Development & Learning',
  'Business & Entrepreneurship',
  'Tax & Financial',
  'Health & Public Services',
  'Agriculture & Rural Services',
];

const CITIZEN_NEEDS_TILES = [
  { label: 'All Needs', category: 'All', icon: Landmark },
  { label: 'Documents', category: 'Government Documents', icon: FileText },
  { label: 'Driving & Transport', category: 'Driving Licence & Transport', icon: Car },
  { label: 'Passport & Visa', category: 'Passport & Visa', icon: Plane },
  { label: 'Welfare Schemes', category: 'Government Schemes', icon: Landmark },
  { label: 'Employment & Jobs', category: 'Government Jobs', icon: Briefcase },
  { label: 'Education & Aid', category: 'Education & Scholarships', icon: GraduationCap },
  { label: 'Business & MSME', category: 'Business & Entrepreneurship', icon: Building2 },
  { label: 'Financial & Tax', category: 'Tax & Financial', icon: Wallet },
  { label: 'Health & ABHA', category: 'Health & Public Services', icon: HeartPulse },
  { label: 'Agriculture', category: 'Agriculture & Rural Services', icon: Sprout },
];

const STATE_OPTIONS = [
  'All',
  'Karnataka',
  'All India',
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
  'Goa',
];

const SUGGESTIONS = [
  'KCET & KEA counselling',
  'JoSAA seat allocation',
  'Driving licence & Vahan RC',
  'Passport renewal & Schengen visa',
  'Karnataka income certificate',
  'PM-KISAN & Bhoomi RTC',
  'SWAYAM free courses',
];

export function ExploreServicesPage({
  navigate,
  initialSearch = '',
}: ExploreServicesPageProps) {
  const { lang, setLang, t } = useLanguage();
  const params = new URLSearchParams(initialSearch);

  const [q, setQ] = useState(params.get('q') || '');
  const [categoryFilter, setCategoryFilter] = useState(params.get('category') || 'All');
  const [stateFilter, setStateFilter] = useState(params.get('state') || 'All');
  const [jurisdictionFilter, setJurisdictionFilter] = useState('All');

  const [services, setServices] = useState<PublicService[]>([]);
  const [matchedScholarships, setMatchedScholarships] = useState<Scholarship[]>([]);
  const [matchedExams, setMatchedExams] = useState<Exam[]>([]);
  const [matchedJobs, setMatchedJobs] = useState<JobListing[]>([]);
  const [matchedInstitutions, setMatchedInstitutions] = useState<Institution[]>([]);
  const [matchedCounselling, setMatchedCounselling] = useState<CounsellingGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [externalTarget, setExternalTarget] = useState<{
    title: string;
    portalName: string;
    url: string;
    isThirdParty?: boolean;
  } | null>(null);

  const loadResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (q.trim() && categoryFilter === 'All' && jurisdictionFilter === 'All') {
        const query = new URLSearchParams({ q: q.trim() });
        if (stateFilter !== 'All') query.set('state', stateFilter);
        const unified = await apiFetch<{
          services: PublicService[];
          scholarships: Scholarship[];
          exams?: Exam[];
          jobs?: JobListing[];
          institutions?: Institution[];
          counsellingGuides?: CounsellingGuide[];
        }>(`/api/search/unified?${query.toString()}`);
        setServices(unified.services);
        setMatchedScholarships(unified.scholarships);
        setMatchedExams(unified.exams ?? []);
        setMatchedJobs(unified.jobs ?? []);
        setMatchedInstitutions(unified.institutions ?? []);
        setMatchedCounselling(unified.counsellingGuides ?? []);
      } else {
        const query = new URLSearchParams();
        if (q.trim()) query.set('q', q.trim());
        if (categoryFilter !== 'All') query.set('category', categoryFilter);
        if (stateFilter !== 'All') query.set('state', stateFilter);
        if (jurisdictionFilter !== 'All') query.set('jurisdiction', jurisdictionFilter);

        const data = await apiFetch<{ services: PublicService[] }>(
          `/api/services?${query.toString()}`
        );
        setServices(data.services);
        setMatchedExams([]);
        setMatchedJobs([]);
        setMatchedInstitutions([]);
        setMatchedCounselling([]);

        if (categoryFilter === 'Education & Scholarships') {
          const schQuery = new URLSearchParams();
          if (q.trim()) schQuery.set('q', q.trim());
          if (stateFilter !== 'All') schQuery.set('state', stateFilter);
          const schData = await apiFetch<{ scholarships: Scholarship[] }>(
            `/api/scholarships?${schQuery.toString()}`
          );
          setMatchedScholarships(schData.scholarships);
        } else {
          setMatchedScholarships([]);
        }

        if (categoryFilter === 'Government Jobs') {
          const jobQuery = new URLSearchParams();
          if (q.trim()) jobQuery.set('q', q.trim());
          if (stateFilter !== 'All') jobQuery.set('state', stateFilter);
          const jobData = await apiFetch<{ jobs: JobListing[] }>(
            `/api/jobs?${jobQuery.toString()}`
          );
          setMatchedJobs(jobData.jobs);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to search services.');
    } finally {
      setLoading(false);
    }
  }, [q, categoryFilter, stateFilter, jurisdictionFilter]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const resetAll = () => {
    setQ('');
    setCategoryFilter('All');
    setStateFilter('All');
    setJurisdictionFilter('All');
  };

  const hasActiveFilters =
    Boolean(q.trim()) ||
    categoryFilter !== 'All' ||
    stateFilter !== 'All' ||
    jurisdictionFilter !== 'All';

  const getLocalized = (service: PublicService) => {
    if (lang === 'kn' && service.translations?.kn) {
      return {
        title: service.translations.kn.title || service.title,
        summary: service.translations.kn.summary || service.summary,
      };
    }
    if (lang === 'hi' && service.translations?.hi) {
      return {
        title: service.translations.hi.title || service.title,
        summary: service.translations.hi.summary || service.summary,
      };
    }
    return { title: service.title, summary: service.summary };
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumbs
          items={[{ label: 'Home', path: '/' }, { label: 'Explore Services' }]}
          navigate={navigate}
        />

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#5C6573]">{t.languageLabel}:</span>
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
                  : 'border border-[#D6CFC2] bg-white text-[#475467] hover:bg-[#F3EFE6]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editorial Service Masthead */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-end border-b border-[#E2DDD1] pb-6">
        <div className="lg:col-span-8 space-y-2">
          <p className="text-xs font-semibold text-[#0E6B6E]">Citizen &amp; Travel Desk</p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0B192C]">
            What do you need? Explore Official Service Journeys
          </h1>
          <p className="text-sm text-[#475467] max-w-2xl leading-relaxed">
            Choose an everyday citizen need below to review required documents, official government
            fees, verification dates, and direct `.gov.in` portals.
          </p>
        </div>
        <div className="lg:col-span-4 flex lg:justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/states')}>
            State Portals Hub →
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/scam-alerts')}>
            Check Link Safety
          </Button>
        </div>
      </div>

      {/* Interactive "What do you need?" Matrix */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-[#5C6573]">Select by Citizen Need</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {CITIZEN_NEEDS_TILES.map((tile) => {
            const Icon = tile.icon;
            const active = categoryFilter === tile.category;
            return (
              <button
                key={tile.label}
                type="button"
                onClick={() => setCategoryFilter(tile.category)}
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-xs font-semibold transition-all min-h-[44px] ${
                  active
                    ? 'border-[#0B192C] bg-[#0B192C] text-white shadow-2xs'
                    : 'border-[#E2DDD1] bg-white text-[#0B192C] hover:border-[#134E7A]/50 hover:bg-[#FAF8F3]'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${active ? 'text-amber-300' : 'text-[#134E7A]'}`}
                />
                <span className="truncate">{tile.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Unified Search & Filters Bar */}
      <Card className="p-5 space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5C6573]" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label="Unified service search"
            className="w-full rounded-lg border border-[#CFC8B8] bg-[#FAF8F3] py-3 pl-10 pr-4 text-sm text-[#0B192C] placeholder:text-[#7A828F] focus:border-[#134E7A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#134E7A]/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#5C6573] font-medium">Quick queries:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setCategoryFilter('All');
                setJurisdictionFilter('All');
                setQ(s);
              }}
              className="rounded-md border border-[#E2DDD1] bg-[#FAF8F3] px-2.5 py-1 text-[#0B192C] hover:border-[#134E7A] hover:bg-white hover:text-[#134E7A] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-1">
          <label className="space-y-1 text-xs font-medium text-[#475467]">
            <span>All 13 Categories</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C] focus:border-[#134E7A] focus:outline-none"
            >
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Service Categories' : c}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs font-medium text-[#475467]">
            <span>State Focus</span>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C] focus:border-[#134E7A] focus:outline-none"
            >
              {STATE_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All States & Central' : st}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs font-medium text-[#475467]">
            <span>Jurisdiction</span>
            <select
              value={jurisdictionFilter}
              onChange={(e) => setJurisdictionFilter(e.target.value)}
              className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C] focus:border-[#134E7A] focus:outline-none"
            >
              {['All', 'Central', 'State'].map((j) => (
                <option key={j} value={j}>
                  {j === 'All' ? 'Central & State' : `${j} Government`}
                </option>
              ))}
            </select>
          </label>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between border-t border-[#EFECE3] pt-3 text-xs">
            <span className="text-[#475467] tabular-nums">
              Showing {services.length} service{services.length === 1 ? '' : 's'}
              {matchedExams.length > 0 ? `, ${matchedExams.length} exam${matchedExams.length === 1 ? '' : 's'}` : ''}
              {matchedInstitutions.length > 0 ? `, ${matchedInstitutions.length} institution${matchedInstitutions.length === 1 ? '' : 's'}` : ''}
              {matchedCounselling.length > 0 ? `, ${matchedCounselling.length} counselling guide${matchedCounselling.length === 1 ? '' : 's'}` : ''}
              {matchedJobs.length > 0 ? `, ${matchedJobs.length} job${matchedJobs.length === 1 ? '' : 's'}` : ''}
              {matchedScholarships.length > 0
                ? `, ${matchedScholarships.length} scholarship${matchedScholarships.length === 1 ? '' : 's'}`
                : ''}
            </span>
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 font-semibold text-[#134E7A] hover:text-[#0D3B5E]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset filters</span>
            </button>
          </div>
        )}
      </Card>

      {error && (
        <Alert variant="error" title="Search error">
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
          {/* Matched Cross-Directory Results when searching or in Education/Jobs */}
          {matchedInstitutions.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0B192C] tabular-nums">
                  Matching Universities &amp; Colleges ({matchedInstitutions.length})
                </h2>
                <button
                  type="button"
                  onClick={() => navigate('/colleges')}
                  className="text-xs font-semibold text-[#134E7A] hover:underline"
                >
                  Compare colleges →
                </button>
              </div>
              <div className="divide-y divide-[#E2DDD1] rounded-lg border border-[#E2DDD1] bg-white">
                {matchedInstitutions.map((inst) => (
                  <div
                    key={inst.id}
                    className="p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:bg-[#FAF8F3] transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-[#5C6573]">
                        {inst.category} · {inst.institutionType} · {inst.city}, {inst.state}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(`/colleges/${inst.slug}`)}
                        className="text-base font-bold text-[#0B192C] hover:text-[#134E7A] text-left"
                      >
                        {inst.name}
                      </button>
                      <p className="text-xs text-[#475467]">
                        Accepts: {inst.entranceExamsAccepted.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Button size="sm" onClick={() => navigate(`/colleges/${inst.slug}`)}>
                        Admission Guide
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {matchedCounselling.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0B192C] tabular-nums">
                  Matching Counselling Playbooks ({matchedCounselling.length})
                </h2>
                <button
                  type="button"
                  onClick={() => navigate('/counselling')}
                  className="text-xs font-semibold text-[#134E7A] hover:underline"
                >
                  All playbooks →
                </button>
              </div>
              <div className="divide-y divide-[#E2DDD1] rounded-lg border border-[#E2DDD1] bg-white">
                {matchedCounselling.map((cg) => (
                  <div
                    key={cg.id}
                    className="p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:bg-[#FAF8F3] transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-[#5C6573]">
                        {cg.authorityCode} · {cg.stream} · {cg.state}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(`/counselling/${cg.slug}`)}
                        className="text-base font-bold text-[#0B192C] hover:text-[#134E7A] text-left"
                      >
                        {cg.title}
                      </button>
                    </div>
                    <Button size="sm" onClick={() => navigate(`/counselling/${cg.slug}`)}>
                      10-Step Playbook
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {matchedExams.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0B192C] tabular-nums">
                  Matching Competitive Exams ({matchedExams.length})
                </h2>
                <button
                  type="button"
                  onClick={() => navigate('/exams')}
                  className="text-xs font-semibold text-[#134E7A] hover:underline"
                >
                  Full exam directory →
                </button>
              </div>
              <div className="divide-y divide-[#E2DDD1] rounded-lg border border-[#E2DDD1] bg-white">
                {matchedExams.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:bg-[#FAF8F3] transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-[#5C6573]">
                        {ex.category} · {ex.state} · {ex.conductingAuthority}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(`/exams/${ex.slug}`)}
                        className="text-base font-bold text-[#0B192C] hover:text-[#134E7A] text-left"
                      >
                        {ex.examName} — {ex.fullName}
                      </button>
                    </div>
                    <Button size="sm" onClick={() => navigate(`/exams/${ex.slug}`)}>
                      Syllabus &amp; Guide
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {matchedJobs.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0B192C] tabular-nums">
                  Matching Jobs &amp; Recruitment Pathways ({matchedJobs.length})
                </h2>
                <button
                  type="button"
                  onClick={() => navigate('/jobs')}
                  className="text-xs font-semibold text-[#134E7A] hover:underline"
                >
                  Full jobs portal →
                </button>
              </div>
              <div className="divide-y divide-[#E2DDD1] rounded-lg border border-[#E2DDD1] bg-white">
                {matchedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:bg-[#FAF8F3] transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-[#5C6573]">
                        {job.category} · {job.state} · {job.organization}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(`/jobs/${job.slug}`)}
                        className="text-base font-bold text-[#0B192C] hover:text-[#134E7A] text-left"
                      >
                        {job.title}
                      </button>
                    </div>
                    <Button size="sm" onClick={() => navigate(`/jobs/${job.slug}`)}>
                      Guide &amp; Apply Steps
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {matchedScholarships.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0B192C] tabular-nums">
                  Matching Verified Scholarships ({matchedScholarships.length})
                </h2>
                <button
                  type="button"
                  onClick={() => navigate('/scholarships')}
                  className="text-xs font-semibold text-[#134E7A] hover:underline"
                >
                  Scholarship filters →
                </button>
              </div>
              <div className="divide-y divide-[#E2DDD1] rounded-lg border border-[#E2DDD1] bg-white">
                {matchedScholarships.map((sch) => (
                  <div
                    key={sch.id}
                    className="p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:bg-[#FAF8F3] transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-[#5C6573]">
                        {sch.state} · {sch.category} · {sch.providerName}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(`/scholarships/${sch.slug}`)}
                        className="text-base font-bold text-[#0B192C] hover:text-[#134E7A] text-left"
                      >
                        {sch.title}
                      </button>
                    </div>
                    <Button size="sm" onClick={() => navigate(`/scholarships/${sch.slug}`)}>
                      Check Eligibility
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Verified Public Service Journeys Ledger */}
          {(services.length > 0 ||
            (matchedScholarships.length === 0 &&
              matchedJobs.length === 0 &&
              matchedExams.length === 0 &&
              matchedInstitutions.length === 0 &&
              matchedCounselling.length === 0)) && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-xl font-bold text-[#0B192C] tabular-nums">
                  Official Public Service Guides ({services.length})
                </h2>
                <p className="text-xs text-[#5C6573]">
                  Ordered by official verification · Checklists &amp; exact fees included inside
                </p>
              </div>

              {services.length === 0 ? (
                <EmptyState
                  icon={<Search className="h-5 w-5" />}
                  title="No service guides match your search"
                  description="Try clearing filters or searching for Driving Licence, Passport, PAN, Voter ID, Karnataka Certificates, or Udyam MSME."
                  action={
                    <Button variant="outline" onClick={resetAll}>
                      Reset Search &amp; Filters
                    </Button>
                  }
                />
              ) : (
                <div className="divide-y divide-[#E2DDD1] rounded-lg border border-[#E2DDD1] bg-white overflow-hidden">
                  {services.map((service) => {
                    const localized = getLocalized(service);
                    return (
                      <div
                        key={service.id}
                        className="p-5 sm:p-6 hover:bg-[#FAF8F3] transition-colors space-y-4"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-2 max-w-3xl">
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#5C6573]">
                              <span className="font-semibold text-[#C46316]">
                                {service.category}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{service.jurisdiction}</span>
                              <span aria-hidden="true">·</span>
                              <span>{service.state}</span>
                              {service.country && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>Destination: {service.country}</span>
                                </>
                              )}
                            </div>

                            <h3 className="text-lg sm:text-xl font-bold text-[#0B192C]">
                              <button
                                type="button"
                                onClick={() => navigate(`/services/${service.slug}`)}
                                className="text-left hover:text-[#134E7A] transition-colors"
                              >
                                {localized.title}
                              </button>
                            </h3>

                            <p className="text-sm leading-relaxed text-[#475467]">
                              {localized.summary}
                            </p>

                            <TrustStrip
                              sourceName={service.departmentOrAuthority}
                              verifiedAt={service.lastVerifiedAt}
                            />
                          </div>

                          {/* Right Journey Stats & Actions */}
                          <div className="lg:w-72 shrink-0 flex flex-col justify-between gap-3 rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-4">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="text-[#5C6573]">Documents</p>
                                <p className="font-mono font-semibold text-[#0B192C] tabular-nums">
                                  {service.documentsRequired.length} items
                                </p>
                              </div>
                              <div>
                                <p className="text-[#5C6573]">Process</p>
                                <p className="font-mono font-semibold text-[#0B192C] tabular-nums">
                                  {service.applicationSteps.length} steps
                                </p>
                              </div>
                            </div>

                            {service.feesInfo && (
                              <p className="text-[11px] text-[#475467] line-clamp-2 border-t border-[#E2DDD1] pt-2">
                                <strong className="text-[#0B192C]">Official fee:</strong>{' '}
                                {service.feesInfo}
                              </p>
                            )}

                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={() => navigate(`/services/${service.slug}`)}
                              >
                                <span>Guide &amp; Checklist</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                aria-label={`Open official portal for ${service.title}`}
                                onClick={() =>
                                  setExternalTarget({
                                    title: service.title,
                                    portalName: service.officialWebsiteName,
                                    url: service.officialApplyUrl,
                                    isThirdParty: service.isThirdParty,
                                  })
                                }
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      <ExternalPortalModal target={externalTarget} onClose={() => setExternalTarget(null)} />
    </div>
  );
}
