import { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  Bookmark,
  Building2,
  Check,
  CheckSquare,
  ClipboardList,
  ExternalLink,
  GitCompare,
  LayoutGrid,
  MapPin,
  RotateCcw,
  Search,
  Square,
  Table2,
  X,
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
import type { CounsellingGuide, Exam, Institution } from '../types/index.ts';

interface ExamsPageProps {
  navigate: (path: string) => void;
  initialSearch?: string;
}

const EXAM_CATEGORIES = [
  { value: 'All', label: 'All Exams' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Medical', label: 'Medical' },
  { value: 'University Admissions', label: 'University Admissions' },
  { value: 'Law', label: 'Law' },
  { value: 'Management', label: 'Management' },
  { value: 'Agriculture', label: 'Agriculture' },
  { value: 'Architecture & Design', label: 'Architecture & Design' },
  { value: 'Banking', label: 'Banking' },
  { value: 'Government Jobs', label: 'Government Jobs' },
  { value: 'Railway', label: 'Railway' },
  { value: 'Defence', label: 'Defence' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'State Exams', label: 'State Exams' },
  { value: 'Research & Teaching', label: 'Research & Teaching' },
  { value: 'Professional Exams', label: 'Professional Exams' },
];

const ENGINEERING_SUBCATEGORIES = [
  { value: 'All', label: 'All Engineering' },
  { value: 'National', label: 'National' },
  { value: 'State', label: 'State' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Private Universities', label: 'Private Universities' },
  { value: 'University Admissions', label: 'University Admissions' },
  { value: 'Counselling', label: 'Counselling' },
];

const MEDICAL_SUBCATEGORIES = [
  { value: 'All', label: 'All Medical' },
  { value: 'NEET UG', label: 'NEET UG' },
  { value: 'NEET PG', label: 'NEET PG' },
  { value: 'AIIMS & INI', label: 'AIIMS & INI' },
  { value: 'Dental', label: 'Dental' },
  { value: 'AYUSH', label: 'AYUSH' },
  { value: 'Nursing', label: 'Nursing' },
  { value: 'Pharmacy', label: 'Pharmacy' },
  { value: 'Veterinary', label: 'Veterinary' },
  { value: 'Allied Health', label: 'Allied Health' },
  { value: 'Medical Colleges', label: 'Medical Colleges' },
];

const STATE_OPTIONS = [
  'All',
  'All India',
  'Karnataka',
  'Maharashtra',
  'Kerala',
  'Andhra Pradesh',
  'Telangana',
  'Gujarat',
  'West Bengal',
  'Odisha',
  'Uttar Pradesh',
  'Tamil Nadu',
  'Rajasthan',
  'Madhya Pradesh',
  'Bihar',
  'Assam',
  'Haryana',
  'Punjab',
  'Himachal Pradesh',
  'Uttarakhand',
  'Chhattisgarh',
  'Jharkhand',
  'Goa',
  'Delhi',
];

const QUICK_EXAMS = [
  { label: 'JEE Main', query: 'JEE Main' },
  { label: 'KCET', query: 'KCET' },
  { label: 'COMEDK', query: 'COMEDK' },
  { label: 'DCET (Lateral)', query: 'DCET' },
  { label: 'BITSAT', query: 'BITSAT' },
  { label: 'VITEEE', query: 'VITEEE' },
  { label: 'NEET UG', query: 'NEET UG' },
  { label: 'INI-CET', query: 'INI-CET' },
  { label: 'CUET UG', query: 'CUET' },
  { label: 'TNEA', query: 'TNEA' },
  { label: 'MHT CET', query: 'MHT CET' },
  { label: 'WBJEE', query: 'WBJEE' },
  { label: 'KEAM', query: 'KEAM' },
  { label: 'EAPCET', query: 'EAPCET' },
  { label: 'CLAT', query: 'CLAT' },
  { label: 'GATE', query: 'GATE' },
];

const PATHWAY_HIGHLIGHTS = [
  {
    code: 'ENG',
    title: 'Engineering & Technical',
    desc: 'JEE Main / Advanced, KCET, COMEDK, DCET, MHT CET, WBJEE, KEAM, EAPCET, BITSAT & JoSAA/KEA counselling.',
    category: 'Engineering',
  },
  {
    code: 'MED',
    title: 'Medical, AYUSH & Allied Health',
    desc: 'NEET UG/PG, INI-CET, AIIMS Nursing, Pharmacy, Dental, AYUSH, Veterinary & MCC/state quotas.',
    category: 'Medical',
  },
  {
    code: 'UNI',
    title: 'University & Research Admissions',
    desc: 'CUET UG/PG, VTU, Central/Deemed universities, GATE, IIT JAM & UGC NET/JRF routes.',
    category: 'University Admissions',
  },
  {
    code: 'PUB',
    title: 'Civil Services, Banking & Defence',
    desc: 'UPSC CSE, KPSC KAS, SSC CGL/CHSL, IBPS/SBI PO, RRB NTPC, NDA/CDS & PSU tracks.',
    category: 'Government Jobs',
  },
];

function normalizeCategory(raw: string | null): string {
  if (!raw) return 'All';
  if (raw === 'Medical & Healthcare') return 'Medical';
  if (raw === 'Karnataka Exams') return 'Karnataka';
  if (raw === 'State Examinations') return 'State Exams';
  if (raw === 'Professional Entrances') return 'Professional Exams';
  return raw;
}

export function ExamsPage({ navigate, initialSearch = '' }: ExamsPageProps) {
  const { dbUser, openAuthModal } = useAuth();
  const params = new URLSearchParams(initialSearch);

  const [q, setQ] = useState(params.get('q') || '');
  const [categoryFilter, setCategoryFilter] = useState(
    normalizeCategory(params.get('category'))
  );
  const [subcategoryFilter, setSubcategoryFilter] = useState(params.get('subcategory') || 'All');
  const [stateFilter, setStateFilter] = useState(params.get('state') || 'All');
  const [jurisdictionFilter, setJurisdictionFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [exams, setExams] = useState<Exam[]>([]);
  const [relatedInstitutions, setRelatedInstitutions] = useState<Institution[]>([]);
  const [relatedCounselling, setRelatedCounselling] = useState<CounsellingGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  const [compareList, setCompareList] = useState<Exam[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const [externalTarget, setExternalTarget] = useState<{
    title: string;
    portalName: string;
    url: string;
  } | null>(null);

  const showInstitutionsPanel =
    categoryFilter === 'University Admissions' ||
    (categoryFilter === 'Engineering' &&
      (subcategoryFilter === 'University Admissions' ||
        subcategoryFilter === 'Private Universities' ||
        subcategoryFilter === 'Karnataka')) ||
    (categoryFilter === 'Medical' && subcategoryFilter === 'Medical Colleges');

  const showCounsellingPanel =
    categoryFilter === 'Engineering' && subcategoryFilter === 'Counselling';

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (q.trim()) query.set('q', q.trim());
      if (categoryFilter !== 'All') query.set('category', categoryFilter);
      if (
        subcategoryFilter !== 'All' &&
        subcategoryFilter !== 'University Admissions' &&
        subcategoryFilter !== 'Medical Colleges' &&
        subcategoryFilter !== 'Counselling'
      ) {
        query.set('subcategory', subcategoryFilter);
      }
      if (stateFilter !== 'All') query.set('state', stateFilter);
      if (jurisdictionFilter !== 'All') query.set('jurisdiction', jurisdictionFilter);

      const tasks: Promise<unknown>[] = [
        apiFetch<{ exams: Exam[] }>(`/api/exams?${query.toString()}`),
      ];

      if (showInstitutionsPanel) {
        const instQuery = new URLSearchParams();
        if (q.trim()) instQuery.set('q', q.trim());
        if (stateFilter !== 'All') instQuery.set('state', stateFilter);
        if (categoryFilter === 'Engineering' && subcategoryFilter === 'Private Universities') {
          instQuery.set('privateOnly', 'true');
          instQuery.set('stream', 'Engineering');
        } else if (
          categoryFilter === 'Engineering' &&
          subcategoryFilter === 'University Admissions'
        ) {
          instQuery.set('stream', 'Engineering');
        } else if (categoryFilter === 'Engineering' && subcategoryFilter === 'Karnataka') {
          instQuery.set('state', 'Karnataka');
          instQuery.set('stream', 'Engineering');
        } else if (categoryFilter === 'Medical' && subcategoryFilter === 'Medical Colleges') {
          instQuery.set('stream', 'Medical');
        }
        tasks.push(
          apiFetch<{ institutions: Institution[] }>(`/api/institutions?${instQuery.toString()}`)
        );
      } else {
        setRelatedInstitutions([]);
      }

      if (showCounsellingPanel) {
        const cgQuery = new URLSearchParams({ stream: 'Engineering' });
        if (q.trim()) cgQuery.set('q', q.trim());
        if (stateFilter !== 'All') cgQuery.set('state', stateFilter);
        tasks.push(
          apiFetch<{ guides: CounsellingGuide[] }>(`/api/counselling?${cgQuery.toString()}`)
        );
      } else {
        setRelatedCounselling([]);
      }

      const results = await Promise.all(tasks);
      const examRes = results[0] as { exams: Exam[] };

      if (
        (categoryFilter === 'Engineering' && subcategoryFilter === 'Counselling') ||
        (categoryFilter === 'Medical' && subcategoryFilter === 'Medical Colleges')
      ) {
        setExams([]);
      } else {
        setExams(examRes.exams);
      }

      let idx = 1;
      if (showInstitutionsPanel && results[idx]) {
        setRelatedInstitutions((results[idx] as { institutions: Institution[] }).institutions);
        idx += 1;
      }
      if (showCounsellingPanel && results[idx]) {
        setRelatedCounselling((results[idx] as { guides: CounsellingGuide[] }).guides);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load exams and admissions.');
    } finally {
      setLoading(false);
    }
  }, [
    q,
    categoryFilter,
    subcategoryFilter,
    stateFilter,
    jurisdictionFilter,
    showInstitutionsPanel,
    showCounsellingPanel,
    dbUser?.id,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const nextParams = new URLSearchParams(initialSearch);
    const nextQ = nextParams.get('q');
    const nextCat = nextParams.get('category');
    const nextSub = nextParams.get('subcategory');
    const nextState = nextParams.get('state');
    if (nextQ !== null) setQ(nextQ);
    if (nextCat) setCategoryFilter(normalizeCategory(nextCat));
    if (nextSub) setSubcategoryFilter(nextSub);
    if (nextState) setStateFilter(nextState);
  }, [initialSearch]);

  const handleCategoryChange = (cat: string) => {
    setCategoryFilter(cat);
    setSubcategoryFilter('All');
  };

  const toggleCompare = (exam: Exam) => {
    setCompareList((prev) => {
      if (prev.some((item) => item.id === exam.id)) {
        return prev.filter((item) => item.id !== exam.id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), exam];
      }
      return [...prev, exam];
    });
  };

  const handleToggleSave = async (exam: Exam) => {
    if (!dbUser) {
      openAuthModal();
      return;
    }
    setSavingId(exam.id);
    try {
      if (exam.tracker?.isSaved) {
        await apiFetch(`/api/student/exams/${exam.id}/tracker`, { method: 'DELETE' });
        setExams((prev) =>
          prev.map((item) => (item.id === exam.id ? { ...item, tracker: null } : item))
        );
      } else {
        const res = await apiFetch<{ tracker: Exam['tracker'] }>(
          `/api/student/exams/${exam.id}/tracker`,
          {
            method: 'PUT',
            body: JSON.stringify({ isSaved: true, status: 'Interested' }),
          }
        );
        setExams((prev) =>
          prev.map((item) => (item.id === exam.id ? { ...item, tracker: res.tracker } : item))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update saved exam.');
    } finally {
      setSavingId(null);
    }
  };

  const resetAll = () => {
    setQ('');
    setCategoryFilter('All');
    setSubcategoryFilter('All');
    setStateFilter('All');
    setJurisdictionFilter('All');
  };

  const hasFilters =
    Boolean(q.trim()) ||
    categoryFilter !== 'All' ||
    subcategoryFilter !== 'All' ||
    stateFilter !== 'All' ||
    jurisdictionFilter !== 'All';

  const activeSubcategories =
    categoryFilter === 'Engineering'
      ? ENGINEERING_SUBCATEGORIES
      : categoryFilter === 'Medical'
        ? MEDICAL_SUBCATEGORIES
        : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      <Breadcrumbs
        items={[{ label: 'Home', path: '/' }, { label: 'Exams, Admissions & Colleges' }]}
        navigate={navigate}
      />

      {/* Editorial Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E2DDD1] pb-6">
        <div className="space-y-1.5 max-w-2xl">
          <p className="text-xs font-semibold text-[#C46316]">
            Verified Directory · Official Exam, University &amp; Counselling Portals
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B192C]">
            Entrance Exams, University Admissions &amp; Counselling
          </h1>
          <p className="text-sm text-[#475467] leading-relaxed">
            Explore structured guides across National &amp; State Engineering (JEE, KCET, COMEDK,
            DCET, MHT CET, WBJEE, KEAM, EAPCET, TNEA), Medical/AYUSH/Nursing/Pharmacy, University
            Admissions, and Public Service recruitment—compare up to 3 exams side-by-side.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm" onClick={() => navigate('/colleges')}>
            <Building2 className="h-3.5 w-3.5" />
            <span>Find &amp; Compare Colleges</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/counselling')}>
            <ClipboardList className="h-3.5 w-3.5" />
            <span>Counselling Guides</span>
          </Button>
        </div>
      </div>

      {/* Pathway Strip for Rapid Stream Orientation */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PATHWAY_HIGHLIGHTS.map((item) => {
          const active = categoryFilter === item.category;
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => handleCategoryChange(active ? 'All' : item.category)}
              className={`rounded-lg border p-3.5 text-left transition-colors ${
                active
                  ? 'border-[#134E7A] bg-[#0B192C] text-white'
                  : 'border-[#E2DDD1] bg-[#F3EFE6]/60 text-[#0B192C] hover:border-[#BDB5A2] hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`font-mono text-[11px] font-semibold ${
                    active ? 'text-[#F59E0B]' : 'text-[#C46316]'
                  }`}
                >
                  {item.code}
                </span>
                <ArrowRight
                  className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-[#5C6573]'}`}
                />
              </div>
              <p className="mt-1.5 text-sm font-bold leading-snug">{item.title}</p>
              <p
                className={`mt-1 text-xs leading-relaxed line-clamp-2 ${
                  active ? 'text-slate-300' : 'text-[#475467]'
                }`}
              >
                {item.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Category Filter Row */}
      <div className="flex flex-wrap gap-1.5">
        {EXAM_CATEGORIES.map((cat) => {
          const active = categoryFilter === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleCategoryChange(cat.value)}
              className={`min-h-[36px] rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                active
                  ? 'border-[#134E7A] bg-[#134E7A] text-white'
                  : 'border-[#E2DDD1] bg-white text-[#475467] hover:border-[#BDB5A2] hover:text-[#0B192C]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Subcategory Navigation for Engineering & Medical */}
      {activeSubcategories && (
        <div className="rounded-lg border border-[#E2DDD1] bg-[#F3EFE6] p-3.5 space-y-2">
          <p className="text-xs font-semibold text-[#475467]">
            {categoryFilter} Subcategories
          </p>
          <div className="flex flex-wrap gap-1.5">
            {activeSubcategories.map((sub) => {
              const active = subcategoryFilter === sub.value;
              return (
                <button
                  key={sub.value}
                  type="button"
                  onClick={() => setSubcategoryFilter(sub.value)}
                  className={`min-h-[34px] rounded-md border px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'border-[#0B192C] bg-[#0B192C] text-white'
                      : 'border-[#D6CFC2] bg-white text-[#0B192C] hover:border-[#0B192C]/40'
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Filter Panel */}
      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-6">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5C6573]" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search JEE, KCET, COMEDK, DCET, BITSAT, NEET, INI-CET, AIAPGET, CUET, TNEA..."
              aria-label="Search entrance and competitive exams"
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
              {STATE_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All States / Regions' : st}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={jurisdictionFilter}
              onChange={(e) => setJurisdictionFilter(e.target.value)}
              aria-label="Filter by jurisdiction"
              className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C] focus:border-[#134E7A] focus:outline-none"
            >
              <option value="All">All Jurisdictions</option>
              <option value="Central">Central / National</option>
              <option value="State">State Level</option>
              <option value="Private / Deemed">Private / Deemed University</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EFECE3] pt-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs">
            <span className="font-medium text-[#5C6573]">Quick search:</span>
            {QUICK_EXAMS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setCategoryFilter('All');
                  setSubcategoryFilter('All');
                  setQ(item.query);
                }}
                className="font-semibold text-[#134E7A] hover:underline underline-offset-4 px-1"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => navigate('/universities/vtu')}
              className="font-semibold text-[#C46316] hover:underline underline-offset-4 px-1"
            >
              VTU Admissions →
            </button>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#475467] hover:text-[#0B192C]"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </Card>

      {/* Compare Bar (Up to 3 Exams Side-by-Side) */}
      {compareList.length > 0 && (
        <Card className="border-[#134E7A] bg-[#F1F6FA] p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <GitCompare className="h-4 w-4 text-[#134E7A] shrink-0" />
            <span className="font-bold text-[#0B192C] tabular-nums">
              Compare Exams ({compareList.length}/3):
            </span>
            {compareList.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1 rounded-md border border-[#C8DAE8] bg-white px-2.5 py-1 font-semibold text-[#0B192C]"
              >
                {item.examName}
                <button
                  type="button"
                  onClick={() => toggleCompare(item)}
                  aria-label={`Remove ${item.examName} from comparison`}
                  className="text-[#5C6573] hover:text-[#0B192C]"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCompareList([]);
                setCompareOpen(false);
              }}
            >
              Clear
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={compareList.length < 2}
              onClick={() => setCompareOpen((prev) => !prev)}
            >
              {compareOpen ? 'Hide Comparison' : 'Compare Side-by-Side'}
            </Button>
          </div>
        </Card>
      )}

      {/* Side-by-Side Exam Comparison Matrix */}
      {compareOpen && compareList.length >= 2 && (
        <Card className="p-5 space-y-4 overflow-x-auto">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-[#0B192C]">
              Side-by-Side Exam Comparison
            </h2>
            <span className="text-xs text-[#5C6573]">
              Official eligibility, fees, and pattern parameters verified from conducting bodies
            </span>
          </div>

          <table className="w-full min-w-[640px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2DDD1] bg-[#F3EFE6]">
                <th className="p-3 font-semibold text-[#475467] w-40">Parameter</th>
                {compareList.map((ex) => (
                  <th key={ex.id} className="p-3 font-bold text-[#0B192C]">
                    <button
                      type="button"
                      onClick={() => navigate(`/exams/${ex.slug}`)}
                      className="text-left text-[#134E7A] hover:underline"
                    >
                      {ex.examName}
                    </button>
                    <p className="text-[11px] font-normal text-[#5C6573] mt-0.5">{ex.fullName}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE3]">
              <tr>
                <td className="p-3 font-semibold text-[#475467]">Conducting Body</td>
                {compareList.map((ex) => (
                  <td key={ex.id} className="p-3 text-[#0B192C]">
                    {ex.conductingAuthority}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#475467]">Scope &amp; State</td>
                {compareList.map((ex) => (
                  <td key={ex.id} className="p-3 text-[#0B192C]">
                    {ex.category} · {ex.state}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#475467]">Qualification</td>
                {compareList.map((ex) => (
                  <td key={ex.id} className="p-3 text-[#475467] leading-relaxed">
                    {ex.qualificationRequirements}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#475467]">Age Limit</td>
                {compareList.map((ex) => (
                  <td key={ex.id} className="p-3 text-[#0B192C]">
                    {ex.ageLimit}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#475467]">Application Fee</td>
                {compareList.map((ex) => (
                  <td key={ex.id} className="p-3 font-medium text-[#0B192C] tabular-nums">
                    {ex.applicationFee}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#475467]">Exam Pattern</td>
                {compareList.map((ex) => (
                  <td key={ex.id} className="p-3 text-[#475467] leading-relaxed">
                    {ex.examPattern}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#475467]">Important Dates</td>
                {compareList.map((ex) => (
                  <td key={ex.id} className="p-3 text-[#0B192C] tabular-nums">
                    <DeadlineUrgency
                      dateStr={ex.nextExamDate}
                      fallbackText={ex.importantDatesText}
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#475467]">Official Portal</td>
                {compareList.map((ex) => (
                  <td key={ex.id} className="p-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExternalTarget({
                          title: ex.fullName,
                          portalName: ex.conductingAuthority,
                          url: ex.officialApplyUrl,
                        })
                      }
                      className="inline-flex items-center gap-1 font-semibold text-[#134E7A] hover:underline"
                    >
                      <span>Official Apply</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Card>
      )}

      {error && <Alert variant="error" title="Error loading directory">{error}</Alert>}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-56" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Inline Counselling Section */}
          {showCounsellingPanel && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#0B192C]">
                    Engineering Counselling &amp; Seat Allotment Guides ({relatedCounselling.length})
                  </h2>
                  <p className="text-xs text-[#475467]">
                    Step-by-step JoSAA, CSAB, KEA, COMEDK, MHT CET, KEAM, EAPCET, WBJEEB, TNEA &amp;
                    state counselling playbooks.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/counselling')}>
                  <span>Open Full Counselling Hub</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {relatedCounselling.map((cg) => (
                  <Card key={cg.id} interactive className="p-5 flex flex-col justify-between gap-3">
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-[#134E7A]">
                        {cg.authorityCode} · {cg.scope} · {cg.state}
                      </p>
                      <h3 className="font-display text-base font-bold text-[#0B192C]">
                        {cg.title}
                      </h3>
                      <p className="text-xs text-[#475467] line-clamp-2">{cg.overview}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#EFECE3] pt-3">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/counselling/${cg.slug}`)}
                      >
                        <span>10-Step Guide</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExternalTarget({
                            title: `${cg.authorityCode} Portal`,
                            portalName: cg.conductingBody,
                            url: cg.officialWebsiteUrl,
                          })
                        }
                      >
                        <span>Official Site</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Inline Institutions / Universities Section */}
          {showInstitutionsPanel && relatedInstitutions.length > 0 && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#0B192C]">
                    {categoryFilter === 'Medical'
                      ? 'Verified Medical, Dental, AYUSH & Allied Institutions'
                      : subcategoryFilter === 'Private Universities'
                        ? 'Private & Deemed Universities (Admissions & Entrance Exams)'
                        : 'Universities & Institutions (VTU, IITs, NITs, IIITs, State & Private)'}{' '}
                    ({relatedInstitutions.length})
                  </h2>
                  <p className="text-xs text-[#475467]">
                    Universities like VTU Belagavi and RGUHS are affiliating universities — open any
                    institution for UG, PG, Lateral Entry, and Quota rules.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/colleges')}>
                  <span>Open Full College Discovery &amp; Compare</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {relatedInstitutions.map((inst) => (
                  <Card key={inst.id} interactive className="p-5 flex flex-col justify-between gap-3">
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-[#5C6573]">
                        <span className="font-semibold text-[#134E7A]">{inst.category}</span>
                        {' · '}
                        {inst.institutionType}
                        {' · '}
                        <span className="inline-flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" /> {inst.city}, {inst.state}
                        </span>
                      </p>
                      <h3 className="font-display text-base font-bold text-[#0B192C]">
                        <button
                          type="button"
                          onClick={() => navigate(`/colleges/${inst.slug}`)}
                          className="text-left hover:text-[#134E7A] transition-colors"
                        >
                          {inst.name}
                        </button>
                      </h3>
                      <p className="text-xs text-[#475467] line-clamp-2">{inst.overview}</p>
                      <p className="text-xs text-[#475467] pt-1">
                        <strong className="text-[#0B192C]">Exams Accepted: </strong>
                        {inst.entranceExamsAccepted.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#EFECE3] pt-3">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/colleges/${inst.slug}`)}
                      >
                        <span>University Admission Guide</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExternalTarget({
                            title: `${inst.shortName} Official Admission Portal`,
                            portalName: inst.name,
                            url: inst.officialAdmissionUrl,
                          })
                        }
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Entrance Examinations Ledger */}
          {!showCounsellingPanel &&
            !(categoryFilter === 'Medical' && subcategoryFilter === 'Medical Colleges') && (
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#5C6573]">
                  <span>
                    Showing{' '}
                    <strong className="font-mono text-[#0B192C] tabular-nums">{exams.length}</strong>{' '}
                    verified entrance &amp; competitive exam{exams.length === 1 ? '' : 's'}
                  </span>

                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline">
                      Select 2–3 exams to compare eligibility &amp; fees side-by-side
                    </span>
                    <div className="inline-flex items-center rounded-lg border border-[#E2DDD1] bg-[#F3EFE6] p-0.5">
                      <button
                        type="button"
                        onClick={() => setViewMode('cards')}
                        aria-label="Editorial card view"
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
                        aria-label="Structured table view"
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                          viewMode === 'table'
                            ? 'bg-white text-[#0B192C] shadow-2xs'
                            : 'text-[#5C6573] hover:text-[#0B192C]'
                        }`}
                      >
                        <Table2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Table</span>
                      </button>
                    </div>
                  </div>
                </div>

                {exams.length === 0 ? (
                  <EmptyState
                    icon={<Award className="h-5 w-5" />}
                    title="No matching exams found"
                    description="Try clearing filters or searching by exam name (e.g., KCET, JEE Main, BITSAT, NEET UG, INI-CET, TNEA, GATE)."
                    action={
                      <Button variant="outline" size="sm" onClick={resetAll}>
                        Show All Verified Exams
                      </Button>
                    }
                  />
                ) : viewMode === 'table' ? (
                  <Card className="overflow-x-auto">
                    <table className="w-full min-w-[780px] border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#E2DDD1] bg-[#F3EFE6] text-[#475467]">
                          <th className="p-3.5 font-semibold">Exam</th>
                          <th className="p-3.5 font-semibold">Category &amp; Scope</th>
                          <th className="p-3.5 font-semibold">Qualification</th>
                          <th className="p-3.5 font-semibold">Cycle / Date</th>
                          <th className="p-3.5 font-semibold">Fee</th>
                          <th className="p-3.5 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFECE3]">
                        {exams.map((exam) => {
                          const selected = compareList.some((c) => c.id === exam.id);
                          return (
                            <tr
                              key={exam.id}
                              className="hover:bg-[#FAF8F3]/80 transition-colors"
                            >
                              <td className="p-3.5">
                                <button
                                  type="button"
                                  onClick={() => navigate(`/exams/${exam.slug}`)}
                                  className="font-semibold text-[#0B192C] hover:text-[#134E7A] text-left"
                                >
                                  {exam.examName}
                                </button>
                                <p className="text-[11px] text-[#5C6573] line-clamp-1">
                                  {exam.conductingAuthority}
                                </p>
                              </td>
                              <td className="p-3.5 text-[#475467]">
                                <span className="font-medium text-[#134E7A]">{exam.category}</span>
                                {' · '}
                                {exam.state}
                              </td>
                              <td className="p-3.5 text-[#475467] max-w-[200px]">
                                <span className="line-clamp-2">
                                  {exam.qualificationRequirements}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <DeadlineUrgency
                                  dateStr={exam.nextExamDate}
                                  fallbackText={exam.importantDatesText}
                                />
                              </td>
                              <td className="p-3.5 font-mono text-[#0B192C] tabular-nums max-w-[140px]">
                                <span className="line-clamp-2">{exam.applicationFee}</span>
                              </td>
                              <td className="p-3.5 text-right whitespace-nowrap space-x-2">
                                <button
                                  type="button"
                                  onClick={() => toggleCompare(exam)}
                                  className={`font-semibold ${
                                    selected ? 'text-[#C46316]' : 'text-[#5C6573] hover:text-[#0B192C]'
                                  }`}
                                >
                                  {selected ? 'Selected' : 'Compare'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => navigate(`/exams/${exam.slug}`)}
                                  className="font-semibold text-[#134E7A] hover:underline"
                                >
                                  Guide →
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {exams.map((exam) => {
                      const isSaved = Boolean(exam.tracker?.isSaved);
                      const selectedCompare = compareList.some((c) => c.id === exam.id);
                      return (
                        <Card
                          key={exam.id}
                          interactive
                          className="p-5 flex flex-col justify-between gap-4"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-[#5C6573]">
                                  <span className="text-[#134E7A] font-semibold">
                                    {exam.category}
                                  </span>
                                  {' · '}
                                  {exam.state}
                                </p>
                                <h2 className="font-display text-lg font-bold text-[#0B192C] leading-snug">
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/exams/${exam.slug}`)}
                                    className="text-left hover:text-[#134E7A] transition-colors"
                                  >
                                    {exam.examName} — {exam.fullName}
                                  </button>
                                </h2>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => toggleCompare(exam)}
                                  aria-label={
                                    selectedCompare ? 'Remove from comparison' : 'Compare exam'
                                  }
                                  className={`inline-flex h-10 items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold transition-colors ${
                                    selectedCompare
                                      ? 'border-[#134E7A] bg-[#F1F6FA] text-[#134E7A]'
                                      : 'border-[#E2DDD1] bg-white text-[#475467] hover:border-[#BDB5A2] hover:text-[#0B192C]'
                                  }`}
                                >
                                  {selectedCompare ? (
                                    <CheckSquare className="h-3.5 w-3.5" />
                                  ) : (
                                    <Square className="h-3.5 w-3.5" />
                                  )}
                                  <span className="hidden sm:inline">Compare</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleSave(exam)}
                                  disabled={savingId === exam.id}
                                  aria-label={isSaved ? 'Remove saved exam' : 'Save exam'}
                                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                                    isSaved
                                      ? 'border-[#134E7A] bg-[#F1F6FA] text-[#134E7A]'
                                      : 'border-[#E2DDD1] bg-white text-[#5C6573] hover:border-[#BDB5A2] hover:text-[#0B192C]'
                                  }`}
                                >
                                  {isSaved ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Bookmark className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <TrustStrip
                              sourceName={exam.conductingAuthority}
                              verifiedAt={exam.lastVerifiedAt}
                            />

                            <p className="text-sm text-[#475467] leading-relaxed line-clamp-2">
                              {exam.examPurpose}
                            </p>

                            <div className="grid grid-cols-2 gap-2 border-t border-[#EFECE3] pt-3 text-xs">
                              <div>
                                <span className="text-[#5C6573]">Qualification: </span>
                                <span className="font-medium text-[#0B192C] line-clamp-1">
                                  {exam.qualificationRequirements}
                                </span>
                              </div>
                              <div>
                                <DeadlineUrgency
                                  dateStr={exam.nextExamDate}
                                  fallbackText={exam.importantDatesText}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EFECE3] pt-3">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => navigate(`/exams/${exam.slug}`)}
                            >
                              <span>Exam Guide &amp; Syllabus</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setExternalTarget({
                                  title: exam.fullName,
                                  portalName: exam.conductingAuthority,
                                  url: exam.officialApplyUrl,
                                })
                              }
                            >
                              <span>Official Portal</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </Card>
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
