import { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckSquare,
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
import { TrustStrip } from '../components/SignatureElements.tsx';
import { Alert } from '../components/ui/Alert.tsx';
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { apiFetch } from '../lib/api.ts';
import type { Institution } from '../types/index.ts';

interface CollegesPageProps {
  navigate: (path: string) => void;
  initialSearch?: string;
}

const STREAM_OPTIONS = [
  'All',
  'Engineering',
  'Medical',
  'Dental',
  'Pharmacy',
  'Nursing',
  'Veterinary',
  'Allied Health',
  'Law',
  'Agriculture',
  'Architecture',
  'Management',
  'Science',
  'Arts',
];

const STATE_OPTIONS = [
  'All',
  'Karnataka',
  'All India',
  'Delhi',
  'Tamil Nadu',
  'Maharashtra',
  'West Bengal',
  'Uttar Pradesh',
  'Rajasthan',
  'Odisha',
  'Punjab',
  'Puducherry',
  'Telangana',
  'Kerala',
];

const TYPE_OPTIONS = [
  { value: 'All', label: 'All Institution Types' },
  { value: 'Government', label: 'Government / Public' },
  { value: 'Private', label: 'Private' },
  { value: 'Deemed', label: 'Deemed University' },
  { value: 'Autonomous', label: 'Autonomous College' },
  { value: 'University', label: 'Universities Only' },
];

const EXAM_OPTIONS = [
  'All',
  'JEE Main',
  'JEE Advanced',
  'KCET',
  'COMEDK UGET',
  'Karnataka DCET',
  'Karnataka PGCET',
  'NEET UG',
  'NEET PG',
  'INI-CET',
  'CUET UG',
  'BITSAT',
  'VITEEE',
  'SRMJEEE',
  'MET (Manipal)',
  'AEEE',
  'KIITEE',
  'WBJEE',
  'TNEA',
  'GATE',
  'GPAT',
  'CLAT',
  'NATA',
];

export function CollegesPage({ navigate, initialSearch = '' }: CollegesPageProps) {
  const params = new URLSearchParams(initialSearch);

  const [q, setQ] = useState(params.get('q') || '');
  const [stateFilter, setStateFilter] = useState(params.get('state') || 'All');
  const [cityFilter, setCityFilter] = useState(params.get('city') || '');
  const [streamFilter, setStreamFilter] = useState(params.get('stream') || 'All');
  const [typeFilter, setTypeFilter] = useState(params.get('type') || 'All');
  const [examFilter, setExamFilter] = useState(params.get('exam') || 'All');
  const [privateOnly, setPrivateOnly] = useState(params.get('privateOnly') === 'true');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [compareList, setCompareList] = useState<Institution[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const [externalTarget, setExternalTarget] = useState<{
    title: string;
    portalName: string;
    url: string;
  } | null>(null);

  const loadInstitutions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (q.trim()) query.set('q', q.trim());
      if (stateFilter !== 'All') query.set('state', stateFilter);
      if (cityFilter.trim()) query.set('city', cityFilter.trim());
      if (streamFilter !== 'All') query.set('stream', streamFilter);
      if (typeFilter !== 'All') query.set('institutionType', typeFilter);
      if (examFilter !== 'All') query.set('entranceExam', examFilter);
      if (privateOnly) query.set('privateOnly', 'true');

      const data = await apiFetch<{ institutions: Institution[] }>(
        `/api/institutions?${query.toString()}`
      );
      setInstitutions(data.institutions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load universities and colleges.');
    } finally {
      setLoading(false);
    }
  }, [q, stateFilter, cityFilter, streamFilter, typeFilter, examFilter, privateOnly]);

  useEffect(() => {
    loadInstitutions();
  }, [loadInstitutions]);

  const resetAll = () => {
    setQ('');
    setStateFilter('All');
    setCityFilter('');
    setStreamFilter('All');
    setTypeFilter('All');
    setExamFilter('All');
    setPrivateOnly(false);
  };

  const toggleCompare = (inst: Institution) => {
    setCompareList((prev) => {
      if (prev.some((item) => item.id === inst.id)) {
        return prev.filter((item) => item.id !== inst.id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), inst];
      }
      return [...prev, inst];
    });
  };

  const hasFilters =
    Boolean(q.trim()) ||
    Boolean(cityFilter.trim()) ||
    stateFilter !== 'All' ||
    streamFilter !== 'All' ||
    typeFilter !== 'All' ||
    examFilter !== 'All' ||
    privateOnly;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', path: '/' },
          { label: 'Exams & Admissions', path: '/exams' },
          { label: 'Find Colleges & Universities' },
        ]}
        navigate={navigate}
      />

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E2DDD1] pb-6">
        <div className="space-y-1.5 max-w-2xl">
          <p className="text-xs font-semibold text-[#C46316]">
            Verified Institution Directory · Official Admission Portals Only
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B192C]">
            Find Colleges, Universities &amp; Admission Routes
          </h1>
          <p className="text-sm text-[#475467] leading-relaxed">
            Search IITs, NITs, IIITs, GFTIs, VTU &amp; Karnataka autonomous colleges, Private &amp;
            Deemed universities, and Medical, Dental, AYUSH, Nursing, Pharmacy &amp; Veterinary
            institutions. Compare up to 3 institutions side-by-side.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/universities/vtu')}>
            <span>VTU Belagavi Guide</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/counselling')}>
            <span>Counselling Guides</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-1.5">
        {[
          {
            label: 'All Institutions',
            active: !hasFilters,
            onClick: resetAll,
          },
          {
            label: 'Karnataka & VTU',
            active: stateFilter === 'Karnataka' && !privateOnly,
            onClick: () => {
              resetAll();
              setStateFilter('Karnataka');
            },
          },
          {
            label: 'Private Universities',
            active: privateOnly,
            onClick: () => {
              resetAll();
              setPrivateOnly(true);
            },
          },
          {
            label: 'Medical Colleges',
            active: streamFilter === 'Medical',
            onClick: () => {
              resetAll();
              setStreamFilter('Medical');
            },
          },
          {
            label: 'Engineering',
            active: streamFilter === 'Engineering' && !privateOnly && stateFilter === 'All',
            onClick: () => {
              resetAll();
              setStreamFilter('Engineering');
            },
          },
          {
            label: 'Pharmacy / Allied Health',
            active: ['Dental', 'Pharmacy', 'Nursing', 'Veterinary', 'Allied Health'].includes(
              streamFilter
            ),
            onClick: () => {
              resetAll();
              setStreamFilter('Pharmacy');
            },
          },
        ].map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={preset.onClick}
            className={`min-h-[36px] rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              preset.active
                ? 'border-[#134E7A] bg-[#134E7A] text-white'
                : 'border-[#E2DDD1] bg-white text-[#475467] hover:border-[#BDB5A2] hover:text-[#0B192C]'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Multi-Facet Search & Filter Card */}
      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5C6573]" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search VTU, IIT, NITK, BITS, AIIMS, RVCE, St. John's..."
              aria-label="Search colleges and universities"
              className="w-full rounded-lg border border-[#CFC8B8] bg-[#FAF8F3] pl-10 pr-4 py-2.5 text-sm text-[#0B192C] placeholder:text-[#7A828F] focus:border-[#134E7A] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="md:col-span-4">
            <input
              type="text"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="Filter by city (e.g., Bengaluru, Mysuru, Vellore)"
              aria-label="Filter by city"
              className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C] placeholder:text-[#7A828F] focus:border-[#134E7A] focus:outline-none"
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
                  {st === 'All' ? 'All States' : st}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select
            value={streamFilter}
            onChange={(e) => setStreamFilter(e.target.value)}
            aria-label="Filter by stream or course"
            className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C] focus:border-[#134E7A] focus:outline-none"
          >
            {STREAM_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Streams / Courses' : s}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filter by institution type"
            className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C] focus:border-[#134E7A] focus:outline-none"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <select
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            aria-label="Filter by entrance exam accepted"
            className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C] focus:border-[#134E7A] focus:outline-none"
          >
            {EXAM_OPTIONS.map((ex) => (
              <option key={ex} value={ex}>
                {ex === 'All' ? 'All Accepted Entrance Exams' : `Accepts ${ex}`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EFECE3] pt-3">
          <label className="inline-flex items-center gap-2 text-xs font-medium text-[#475467] cursor-pointer">
            <input
              type="checkbox"
              checked={privateOnly}
              onChange={(e) => setPrivateOnly(e.target.checked)}
              className="h-4 w-4 rounded border-[#CFC8B8] text-[#134E7A] focus:ring-[#134E7A]"
            />
            <span>Private &amp; Deemed Universities Only</span>
          </label>

          {hasFilters && (
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#475467] hover:text-[#0B192C]"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </Card>

      {/* Compare Bar */}
      {compareList.length > 0 && (
        <Card className="border-[#134E7A] bg-[#F1F6FA] p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <GitCompare className="h-4 w-4 text-[#134E7A] shrink-0" />
            <span className="font-bold text-[#0B192C] tabular-nums">
              Compare Selected ({compareList.length}/3):
            </span>
            {compareList.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1 rounded-md border border-[#C8DAE8] bg-white px-2.5 py-1 font-semibold text-[#0B192C]"
              >
                {item.shortName}
                <button
                  type="button"
                  onClick={() => toggleCompare(item)}
                  aria-label={`Remove ${item.shortName} from comparison`}
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

      {/* Side-by-Side Comparison Matrix */}
      {compareOpen && compareList.length >= 2 && (
        <Card className="p-5 space-y-4 overflow-x-auto">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-[#0B192C]">
              Side-by-Side Institution Comparison
            </h2>
            <span className="text-xs text-[#5C6573]">
              Factual official admission attributes only — zero unverified rankings
            </span>
          </div>

          <table className="w-full min-w-[640px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2DDD1] bg-[#F3EFE6]">
                <th className="p-3 font-semibold text-[#475467] w-40">Parameter</th>
                {compareList.map((inst) => (
                  <th key={inst.id} className="p-3 font-bold text-[#0B192C]">
                    <button
                      type="button"
                      onClick={() => navigate(`/colleges/${inst.slug}`)}
                      className="text-left text-[#134E7A] hover:underline"
                    >
                      {inst.name}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE3]">
              <tr>
                <td className="p-3 font-semibold text-[#475467]">Type &amp; Category</td>
                {compareList.map((inst) => (
                  <td key={inst.id} className="p-3 text-[#0B192C]">
                    {inst.institutionType} · {inst.category}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#475467]">Location</td>
                {compareList.map((inst) => (
                  <td key={inst.id} className="p-3 text-[#0B192C]">
                    {inst.city}, {inst.state}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#475467]">Streams</td>
                {compareList.map((inst) => (
                  <td key={inst.id} className="p-3 text-[#0B192C]">
                    {inst.streams.join(', ')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#475467]">Exams Accepted</td>
                {compareList.map((inst) => (
                  <td key={inst.id} className="p-3 font-semibold text-[#0B192C]">
                    {inst.entranceExamsAccepted.join(', ')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#475467]">UG Admission Route</td>
                {compareList.map((inst) => (
                  <td key={inst.id} className="p-3 text-[#475467] leading-relaxed">
                    {inst.ugAdmissionsInfo}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#475467]">Fees Guidance</td>
                {compareList.map((inst) => (
                  <td key={inst.id} className="p-3 text-[#475467] leading-relaxed">
                    {inst.feesInfo}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#475467]">Official Portal</td>
                {compareList.map((inst) => (
                  <td key={inst.id} className="p-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExternalTarget({
                          title: `${inst.shortName} Official Admission Portal`,
                          portalName: inst.name,
                          url: inst.officialAdmissionUrl,
                        })
                      }
                      className="inline-flex items-center gap-1 font-semibold text-[#134E7A] hover:underline"
                    >
                      <span>Official Admissions</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Card>
      )}

      {error && <Alert variant="error" title="Error loading institutions">{error}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5C6573]">
        <span>
          Showing{' '}
          <strong className="font-mono text-[#0B192C] tabular-nums">{institutions.length}</strong>{' '}
          verified institution{institutions.length === 1 ? '' : 's'}
        </span>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">
            Select 2–3 institutions to compare admission routes &amp; entrance criteria
          </span>
          <div className="inline-flex items-center rounded-lg border border-[#E2DDD1] bg-[#F3EFE6] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              aria-label="Card view"
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
              aria-label="Table view"
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

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-56" />
          ))}
        </div>
      ) : institutions.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-5 w-5" />}
          title="No matching institutions found"
          description="Try clearing filters or searching for VTU, IIT, NITK, BITS Pilani, AIIMS, or RGUHS."
          action={
            <Button variant="outline" size="sm" onClick={resetAll}>
              Show All Verified Institutions
            </Button>
          }
        />
      ) : viewMode === 'table' ? (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2DDD1] bg-[#F3EFE6] text-[#475467]">
                <th className="p-3.5 font-semibold">Institution</th>
                <th className="p-3.5 font-semibold">Type &amp; Location</th>
                <th className="p-3.5 font-semibold">Streams</th>
                <th className="p-3.5 font-semibold">Exams Accepted</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE3]">
              {institutions.map((inst) => {
                const selected = compareList.some((c) => c.id === inst.id);
                return (
                  <tr key={inst.id} className="hover:bg-[#FAF8F3]/80 transition-colors">
                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/colleges/${inst.slug}`)}
                        className="font-semibold text-[#0B192C] hover:text-[#134E7A] text-left"
                      >
                        {inst.name}
                      </button>
                      <p className="text-[11px] text-[#5C6573]">{inst.category}</p>
                    </td>
                    <td className="p-3.5 text-[#475467]">
                      {inst.institutionType} · {inst.city}, {inst.state}
                    </td>
                    <td className="p-3.5 text-[#475467] max-w-[180px]">
                      <span className="line-clamp-2">{inst.streams.join(', ')}</span>
                    </td>
                    <td className="p-3.5 font-medium text-[#0B192C] max-w-[200px]">
                      <span className="line-clamp-2">{inst.entranceExamsAccepted.join(', ')}</span>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap space-x-2">
                      <button
                        type="button"
                        onClick={() => toggleCompare(inst)}
                        className={`font-semibold ${
                          selected ? 'text-[#C46316]' : 'text-[#5C6573] hover:text-[#0B192C]'
                        }`}
                      >
                        {selected ? 'Selected' : 'Compare'}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/colleges/${inst.slug}`)}
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
          {institutions.map((inst) => {
            const selected = compareList.some((c) => c.id === inst.id);
            return (
              <Card key={inst.id} interactive className="p-5 flex flex-col justify-between gap-4">
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-[#5C6573]">
                        <span className="font-semibold text-[#134E7A]">{inst.category}</span>
                        {' · '}
                        {inst.institutionType}
                      </p>
                      <h2 className="font-display text-lg font-bold text-[#0B192C] leading-snug">
                        <button
                          type="button"
                          onClick={() => navigate(`/colleges/${inst.slug}`)}
                          className="text-left hover:text-[#134E7A] transition-colors"
                        >
                          {inst.name}
                        </button>
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleCompare(inst)}
                      aria-label={selected ? 'Remove from comparison' : 'Select for comparison'}
                      className={`inline-flex h-10 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold shrink-0 transition-colors ${
                        selected
                          ? 'border-[#134E7A] bg-[#F1F6FA] text-[#134E7A]'
                          : 'border-[#E2DDD1] bg-white text-[#475467] hover:border-[#BDB5A2] hover:text-[#0B192C]'
                      }`}
                    >
                      {selected ? (
                        <CheckSquare className="h-3.5 w-3.5" />
                      ) : (
                        <Square className="h-3.5 w-3.5" />
                      )}
                      <span>Compare</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-[#475467]">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#7A828F] shrink-0" />
                      <span>
                        {inst.city}, {inst.state}
                      </span>
                    </span>
                    <TrustStrip verifiedAt={inst.lastVerifiedAt} />
                  </div>

                  <p className="text-sm text-[#475467] leading-relaxed line-clamp-2">
                    {inst.overview}
                  </p>

                  <div className="grid grid-cols-1 gap-1.5 border-t border-[#EFECE3] pt-3 text-xs">
                    <div>
                      <span className="text-[#5C6573]">Streams: </span>
                      <span className="font-medium text-[#0B192C]">{inst.streams.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-[#5C6573]">Accepted Exams: </span>
                      <span className="font-semibold text-[#0B192C]">
                        {inst.entranceExamsAccepted.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EFECE3] pt-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/colleges/${inst.slug}`)}
                  >
                    <span>Admission Routes &amp; Guide</span>
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
            );
          })}
        </div>
      )}

      <ExternalPortalModal target={externalTarget} onClose={() => setExternalTarget(null)} />
    </div>
  );
}
