import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  LayoutGrid,
  List,
  RotateCcw,
  Search,
} from 'lucide-react';
import { EligibilityIndicator } from '../components/EligibilityIndicator.tsx';
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
import type { Scholarship } from '../types/index.ts';

interface ScholarshipsPageProps {
  navigate: (path: string) => void;
  initialSearch?: string;
}

const STATES = [
  'All',
  'Karnataka',
  'All India',
  'Maharashtra',
  'Tamil Nadu',
  'Kerala',
  'Andhra Pradesh',
  'Telangana',
  'Delhi',
];

const LEVELS = [
  'All',
  'School',
  'PUC',
  'Diploma',
  'Undergraduate',
  'Postgraduate',
  'Professional',
];

const CATEGORIES = [
  'All',
  'State',
  'Central',
  'Merit-based',
  'Need-based',
  'Minority',
  'Disability',
  'Private',
];

const PROVIDER_TYPES = [
  'All',
  'Government - Central',
  'Government - State',
  'Private / Foundation',
  'Institutional',
];

export function ScholarshipsPage({ navigate, initialSearch = '' }: ScholarshipsPageProps) {
  const { dbUser, openAuthModal } = useAuth();
  const params = new URLSearchParams(initialSearch);

  const [q, setQ] = useState(params.get('q') || '');
  const [stateFilter, setStateFilter] = useState(params.get('state') || 'All');
  const [levelFilter, setLevelFilter] = useState(params.get('level') || 'All');
  const [categoryFilter, setCategoryFilter] = useState(params.get('category') || 'All');
  const [providerFilter, setProviderFilter] = useState('All');
  const [eligibleCategoryFilter, setEligibleCategoryFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [maxIncomeFilter, setMaxIncomeFilter] = useState('All');
  const [eligibilityFilter, setEligibilityFilter] = useState<'all' | 'eligible'>('all');
  const [sortBy, setSortBy] = useState<'verified' | 'deadline' | 'title'>('verified');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [externalTarget, setExternalTarget] = useState<{
    title: string;
    portalName: string;
    url: string;
  } | null>(null);

  const fetchScholarships = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (q.trim()) query.set('q', q.trim());
      if (stateFilter !== 'All') query.set('state', stateFilter);
      if (levelFilter !== 'All') query.set('educationLevel', levelFilter);
      if (categoryFilter !== 'All') query.set('category', categoryFilter);
      if (providerFilter !== 'All') query.set('providerType', providerFilter);
      if (eligibleCategoryFilter !== 'All') query.set('eligibleCategory', eligibleCategoryFilter);
      if (genderFilter !== 'All') query.set('gender', genderFilter);
      if (maxIncomeFilter !== 'All') query.set('maxIncome', maxIncomeFilter);

      const data = await apiFetch<{ scholarships: Scholarship[] }>(
        `/api/scholarships?${query.toString()}`
      );
      setScholarships(data.scholarships);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load scholarships.');
    } finally {
      setLoading(false);
    }
  }, [
    q,
    stateFilter,
    levelFilter,
    categoryFilter,
    providerFilter,
    eligibleCategoryFilter,
    genderFilter,
    maxIncomeFilter,
    dbUser?.id,
  ]);

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  const displayedScholarships = useMemo(() => {
    let list = [...scholarships];
    if (eligibilityFilter === 'eligible') {
      list = list.filter((s) => s.eligibility?.outcome === 'Potentially Eligible');
    }
    if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'deadline') {
      list.sort((a, b) => {
        if (!a.deadlineDate && !b.deadlineDate) return 0;
        if (!a.deadlineDate) return 1;
        if (!b.deadlineDate) return -1;
        return a.deadlineDate.localeCompare(b.deadlineDate);
      });
    } else {
      list.sort((a, b) => {
        const da = a.lastVerifiedAt ? new Date(a.lastVerifiedAt).getTime() : 0;
        const db = b.lastVerifiedAt ? new Date(b.lastVerifiedAt).getTime() : 0;
        return db - da;
      });
    }
    return list;
  }, [scholarships, eligibilityFilter, sortBy]);

  const toggleSave = async (item: Scholarship) => {
    if (!dbUser) {
      openAuthModal();
      return;
    }
    setSavingId(item.id);
    try {
      if (item.isSaved) {
        await apiFetch(`/api/student/saved/${item.id}`, { method: 'DELETE' });
      } else {
        await apiFetch(`/api/student/saved/${item.id}`, { method: 'POST' });
      }
      setScholarships((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, isSaved: !s.isSaved } : s))
      );
    } catch (err) {
      console.error('Toggle save failed:', err);
    } finally {
      setSavingId(null);
    }
  };

  const resetFilters = () => {
    setQ('');
    setStateFilter('All');
    setLevelFilter('All');
    setCategoryFilter('All');
    setProviderFilter('All');
    setEligibleCategoryFilter('All');
    setGenderFilter('All');
    setMaxIncomeFilter('All');
    setEligibilityFilter('all');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      <Breadcrumbs
        items={[{ label: 'Home', path: '/' }, { label: 'Scholarships' }]}
        navigate={navigate}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-[#E2DDD1] pb-6">
        <div className="space-y-1.5 max-w-2xl">
          <p className="text-xs font-semibold text-[#C46316]">Education Opportunities &amp; Aid</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B192C]">
            Scholarship &amp; Financial Aid Directory
          </h1>
          <p className="text-sm text-[#475467] leading-relaxed">
            Verified National Scholarship Portal (NSP), Karnataka SSP, state welfare, and private
            foundation scholarships with direct DBT portal links.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/opportunities')}>
            Run Eligibility Finder
          </Button>
          {!dbUser && (
            <Button variant="primary" size="sm" onClick={openAuthModal}>
              Sign in for pre-checks
            </Button>
          )}
        </div>
      </div>

      {/* Quick Category Ribbon */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => {
          const active = categoryFilter === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategoryFilter(c)}
              className={`min-h-[36px] rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                active
                  ? 'border-[#134E7A] bg-[#134E7A] text-white'
                  : 'border-[#E2DDD1] bg-white text-[#475467] hover:border-[#BDB5A2] hover:text-[#0B192C]'
              }`}
            >
              {c === 'All' ? 'All Scholarships' : c}
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      <Card className="p-5 space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5C6573]" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by scholarship name, provider, department, course, or state..."
            aria-label="Search scholarships"
            className="w-full rounded-lg border border-[#CFC8B8] bg-[#FAF8F3] py-3 pl-10 pr-4 text-sm text-[#0B192C] placeholder:text-[#7A828F] focus:border-[#134E7A] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-xs font-medium text-[#475467]">
            <span>State / Region</span>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C] focus:border-[#134E7A] focus:outline-none"
            >
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All States' : s}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs font-medium text-[#475467]">
            <span>Education Level</span>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C] focus:border-[#134E7A] focus:outline-none"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l === 'All' ? 'All Levels' : l}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs font-medium text-[#475467]">
            <span>Category</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C] focus:border-[#134E7A] focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs font-medium text-[#475467]">
            <span>Provider Type</span>
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C] focus:border-[#134E7A] focus:outline-none"
            >
              {PROVIDER_TYPES.map((p) => (
                <option key={p} value={p}>
                  {p === 'All' ? 'All Providers' : p}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="space-y-1 text-xs font-medium text-[#475467]">
            <span>Social / Eligibility Group</span>
            <select
              value={eligibleCategoryFilter}
              onChange={(e) => setEligibleCategoryFilter(e.target.value)}
              className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C] focus:border-[#134E7A] focus:outline-none"
            >
              {['All', 'General', 'OBC', 'SC', 'ST', 'EWS', 'Minority', 'Disability'].map((g) => (
                <option key={g} value={g}>
                  {g === 'All' ? 'All Social Categories' : g}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs font-medium text-[#475467]">
            <span>Gender Focus</span>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C] focus:border-[#134E7A] focus:outline-none"
            >
              <option value="All">All Genders</option>
              <option value="Female">Women / Girl Student Schemes</option>
            </select>
          </label>

          <label className="space-y-1 text-xs font-medium text-[#475467]">
            <span>Annual Family Income Ceiling</span>
            <select
              value={maxIncomeFilter}
              onChange={(e) => setMaxIncomeFilter(e.target.value)}
              className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2.5 text-sm text-[#0B192C] focus:border-[#134E7A] focus:outline-none"
            >
              <option value="All">Any Income Limit</option>
              <option value="250000">Up to ₹2,50,000 / year</option>
              <option value="450000">Up to ₹4,50,000 / year</option>
              <option value="800000">Up to ₹8,00,000 / year</option>
            </select>
          </label>
        </div>

        {/* Toolbar: Sort, Eligibility toggle, View mode */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EFECE3] pt-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-[#475467]">
              <span className="font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'verified' | 'deadline' | 'title')}
                className="rounded-lg border border-[#CFC8B8] bg-white px-2.5 py-1.5 text-xs font-medium text-[#0B192C]"
              >
                <option value="verified">Recently Verified</option>
                <option value="deadline">Deadline Soonest</option>
                <option value="title">Title (A–Z)</option>
              </select>
            </label>

            {dbUser && (
              <div className="inline-flex items-center gap-1 rounded-lg border border-[#E2DDD1] bg-[#F3EFE6] p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setEligibilityFilter('all')}
                  className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                    eligibilityFilter === 'all'
                      ? 'bg-white text-[#0B192C] shadow-2xs'
                      : 'text-[#5C6573]'
                  }`}
                >
                  All Results
                </button>
                <button
                  type="button"
                  onClick={() => setEligibilityFilter('eligible')}
                  className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                    eligibilityFilter === 'eligible'
                      ? 'bg-white text-[#0E6B6E] shadow-2xs'
                      : 'text-[#5C6573]'
                  }`}
                >
                  Potentially Eligible
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#134E7A] hover:underline"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>

            <div className="hidden sm:inline-flex items-center rounded-lg border border-[#E2DDD1] bg-[#F3EFE6] p-0.5">
              <button
                type="button"
                aria-label="List view"
                onClick={() => setViewMode('list')}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === 'list' ? 'bg-white text-[#0B192C] shadow-2xs' : 'text-[#5C6573]'
                }`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setViewMode('grid')}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-[#0B192C] shadow-2xs' : 'text-[#5C6573]'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {error && (
        <Alert variant="error" title="Unable to load scholarships">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : displayedScholarships.length === 0 ? (
        <EmptyState
          icon={<Search className="h-5 w-5" />}
          title="No verified scholarships match those filters"
          description="Try clearing one or more filters or broadening your search query."
          action={
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-medium text-[#5C6573] tabular-nums">
            Showing <strong className="font-mono text-[#0B192C]">{displayedScholarships.length}</strong>{' '}
            verified scholarship{displayedScholarships.length === 1 ? '' : 's'}
          </p>

          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 gap-5 md:grid-cols-2'
                : 'space-y-4'
            }
          >
            {displayedScholarships.map((item) => (
              <Card key={item.id} interactive className="p-6 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1.5 max-w-3xl">
                      <p className="text-xs font-medium text-[#5C6573]">
                        <span className="font-semibold text-[#134E7A]">{item.providerType}</span>
                        {' · '}
                        {item.state}
                        {' · '}
                        {item.category}
                        {' · '}
                        {item.educationLevels.join(', ')}
                      </p>

                      <h2 className="font-display text-xl font-bold text-[#0B192C] leading-snug">
                        <button
                          type="button"
                          onClick={() => navigate(`/scholarships/${item.slug}`)}
                          className="text-left hover:text-[#134E7A] transition-colors"
                        >
                          {item.title}
                        </button>
                      </h2>

                      <TrustStrip
                        sourceName={item.providerName}
                        verifiedAt={item.lastVerifiedAt}
                      />
                    </div>

                    <Button
                      variant={item.isSaved ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => toggleSave(item)}
                      disabled={savingId === item.id}
                      aria-label={item.isSaved ? 'Remove from saved' : 'Save scholarship'}
                    >
                      {item.isSaved ? (
                        <>
                          <BookmarkCheck className="h-4 w-4 text-[#134E7A]" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-4 w-4 text-[#5C6573]" />
                          <span>Save</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-[#475467]">{item.summary}</p>

                  <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-3.5 text-xs text-[#475467] sm:grid-cols-3">
                    <div>
                      <strong className="text-[#0B192C]">Award / Support:</strong>{' '}
                      <span className="tabular-nums">
                        {item.amountDisplay || item.benefitsSummary}
                      </span>
                    </div>
                    <div>
                      <strong className="text-[#0B192C]">Gender / Focus:</strong>{' '}
                      {item.genderEligibility && item.genderEligibility !== 'All'
                        ? item.genderEligibility
                        : item.eligibleCategories.join(', ')}
                    </div>
                    <div>
                      <DeadlineUrgency
                        dateStr={item.deadlineDate}
                        fallbackText={item.importantDatesText || 'Check official portal'}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#EFECE3] pt-4">
                  <div className="flex flex-wrap items-center gap-4">
                    {item.eligibility ? (
                      <EligibilityIndicator assessment={item.eligibility} />
                    ) : (
                      <span className="text-xs text-[#5C6573]">
                        Sign in for rule-based eligibility check
                      </span>
                    )}
                    {item.applicationStatus && (
                      <span className="text-xs font-semibold text-[#134E7A]">
                        Tracker: {item.applicationStatus}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/scholarships/${item.slug}`)}
                    >
                      View Details
                    </Button>
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
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <ExternalPortalModal target={externalTarget} onClose={() => setExternalTarget(null)} />
    </div>
  );
}
