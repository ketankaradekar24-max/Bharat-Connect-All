import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  ClipboardList,
  Clock,
  FileText,
  GraduationCap,
  Search,
  X,
} from 'lucide-react';
import { apiFetch } from '../lib/api.ts';
import { BC_EASE } from './MotionPrimitives.tsx';
import type {
  CounsellingGuide,
  Exam,
  Institution,
  JobListing,
  PublicService,
  Scholarship,
} from '../types/index.ts';

type SearchScope =
  | 'all'
  | 'exams'
  | 'colleges'
  | 'counselling'
  | 'services'
  | 'scholarships'
  | 'jobs';

interface SpotlightSearchProps {
  navigate: (path: string) => void;
  placeholder?: string;
  initialQuery?: string;
  variant?: 'hero' | 'modal';
  onCloseModal?: () => void;
  autoFocus?: boolean;
}

interface ResultItem {
  key: string;
  group: string;
  title: string;
  subtitle: string;
  target: string;
  scope: Exclude<SearchScope, 'all'>;
}

const SCOPE_OPTIONS: Array<{ id: SearchScope; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'exams', label: 'Exams' },
  { id: 'colleges', label: 'Colleges' },
  { id: 'counselling', label: 'Counselling' },
  { id: 'services', label: 'Services' },
  { id: 'scholarships', label: 'Scholarships' },
  { id: 'jobs', label: 'Jobs' },
];

const POPULAR_SHORTCUTS: Array<{ label: string; category: string; target: string; query: string }> = [
  { label: 'KCET Karnataka', category: 'Engineering Exam', target: '/exams/kcet-karnataka-kea', query: 'KCET' },
  {
    label: 'VTU Belagavi Admissions',
    category: 'State University',
    target: '/colleges/vtu-belagavi',
    query: 'VTU',
  },
  {
    label: 'JoSAA Seat Allocation',
    category: 'Counselling Playbook',
    target: '/counselling/josaa-centralized-counselling',
    query: 'JoSAA',
  },
  { label: 'NEET UG Guide', category: 'Medical Exam', target: '/exams/neet-ug-nta', query: 'NEET UG' },
  {
    label: 'Driving Licence (Parivahan)',
    category: 'Transport Service',
    target: '/services?q=driving+licence',
    query: 'Driving Licence',
  },
  {
    label: 'Passport Seva & Renewal',
    category: 'Travel Document',
    target: '/services?q=passport',
    query: 'Passport',
  },
  {
    label: 'Karnataka SSP Scholarship',
    category: 'Financial Aid',
    target: '/scholarships?state=Karnataka',
    query: 'Karnataka SSP',
  },
  {
    label: 'PM Internship & Govt Jobs',
    category: 'Jobs & Careers',
    target: '/jobs',
    query: 'Internship',
  },
];

const RECENT_STORAGE_KEY = 'bc_recent_searches_v1';

function readRecentSearches(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string').slice(0, 5) : [];
  } catch {
    return [];
  }
}

function writeRecentSearch(term: string): string[] {
  const clean = term.trim();
  if (!clean) return readRecentSearches();
  const next = [clean, ...readRecentSearches().filter((x) => x.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
  try {
    window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors
  }
  return next;
}

function getGroupIcon(scope: Exclude<SearchScope, 'all'>) {
  switch (scope) {
    case 'exams':
      return Award;
    case 'colleges':
      return Building2;
    case 'counselling':
      return ClipboardList;
    case 'scholarships':
      return GraduationCap;
    case 'jobs':
      return Briefcase;
    case 'services':
    default:
      return FileText;
  }
}

export function SpotlightSearch({
  navigate,
  placeholder = 'Search scholarships, exams, colleges, driving licence, passport, jobs...',
  initialQuery = '',
  variant = 'hero',
  onCloseModal,
  autoFocus = false,
}: SpotlightSearchProps) {
  const prefersReduced = useReducedMotion();
  const [query, setQuery] = useState(initialQuery);
  const [scope, setScope] = useState<SearchScope>('all');
  const [focused, setFocused] = useState(variant === 'modal');
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => readRecentSearches());
  const [results, setResults] = useState<{
    exams: Exam[];
    institutions: Institution[];
    counsellingGuides: CounsellingGuide[];
    services: PublicService[];
    scholarships: Scholarship[];
    jobs: JobListing[];
  }>({
    exams: [],
    institutions: [],
    counsellingGuides: [],
    services: [],
    scholarships: [],
    jobs: [],
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults({
        exams: [],
        institutions: [],
        counsellingGuides: [],
        services: [],
        scholarships: [],
        jobs: [],
      });
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const data = await apiFetch<{
          services?: PublicService[];
          scholarships?: Scholarship[];
          exams?: Exam[];
          jobs?: JobListing[];
          institutions?: Institution[];
          counsellingGuides?: CounsellingGuide[];
        }>(`/api/search/unified?q=${encodeURIComponent(trimmed)}`);
        if (cancelled) return;
        setResults({
          exams: data.exams ?? [],
          institutions: data.institutions ?? [],
          counsellingGuides: data.counsellingGuides ?? [],
          services: data.services ?? [],
          scholarships: data.scholarships ?? [],
          jobs: data.jobs ?? [],
        });
        setActiveIndex(-1);
      } catch {
        if (!cancelled) {
          setResults({
            exams: [],
            institutions: [],
            counsellingGuides: [],
            services: [],
            scholarships: [],
            jobs: [],
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  const flattenedItems = useMemo<ResultItem[]>(() => {
    const items: ResultItem[] = [];
    const include = (targetScope: Exclude<SearchScope, 'all'>) =>
      scope === 'all' || scope === targetScope;

    if (include('exams')) {
      results.exams.slice(0, scope === 'all' ? 3 : 6).forEach((e) => {
        items.push({
          key: `exam-${e.id}`,
          group: 'Exams',
          title: `${e.examName} — ${e.fullName}`,
          subtitle: `${e.category} · ${e.state}`,
          target: `/exams/${e.slug}`,
          scope: 'exams',
        });
      });
    }
    if (include('colleges')) {
      results.institutions.slice(0, scope === 'all' ? 3 : 6).forEach((inst) => {
        items.push({
          key: `inst-${inst.id}`,
          group: 'Colleges & Universities',
          title: inst.name,
          subtitle: `${inst.category} · ${inst.city}, ${inst.state}`,
          target: `/colleges/${inst.slug}`,
          scope: 'colleges',
        });
      });
    }
    if (include('counselling')) {
      results.counsellingGuides.slice(0, scope === 'all' ? 2 : 5).forEach((cg) => {
        items.push({
          key: `cg-${cg.id}`,
          group: 'Counselling Playbooks',
          title: cg.title,
          subtitle: `${cg.authorityCode} · ${cg.scope} · ${cg.state}`,
          target: `/counselling/${cg.slug}`,
          scope: 'counselling',
        });
      });
    }
    if (include('services')) {
      results.services.slice(0, scope === 'all' ? 3 : 6).forEach((svc) => {
        items.push({
          key: `svc-${svc.id}`,
          group: 'Public Services',
          title: svc.title,
          subtitle: `${svc.category} · ${svc.state}`,
          target: `/services/${svc.slug}`,
          scope: 'services',
        });
      });
    }
    if (include('scholarships')) {
      results.scholarships.slice(0, scope === 'all' ? 2 : 5).forEach((sch) => {
        items.push({
          key: `sch-${sch.id}`,
          group: 'Scholarships',
          title: sch.title,
          subtitle: `${sch.providerType} · ${sch.state}`,
          target: `/scholarships/${sch.slug}`,
          scope: 'scholarships',
        });
      });
    }
    if (include('jobs')) {
      results.jobs.slice(0, scope === 'all' ? 2 : 5).forEach((job) => {
        items.push({
          key: `job-${job.id}`,
          group: 'Jobs & Careers',
          title: job.title,
          subtitle: `${job.category} · ${job.organization}`,
          target: `/jobs/${job.slug}`,
          scope: 'jobs',
        });
      });
    }

    return items;
  }, [results, scope]);

  const navigateWithRecord = (target: string, recordedQuery?: string) => {
    if (recordedQuery && recordedQuery.trim()) {
      setRecentSearches(writeRecentSearch(recordedQuery));
    }
    setFocused(false);
    onCloseModal?.();
    navigate(target);
  };

  const getFallbackSearchTarget = (raw: string): string => {
    const trimmed = raw.trim();
    const qParam = trimmed ? `?q=${encodeURIComponent(trimmed)}` : '';
    if (scope === 'exams') return `/exams${qParam}`;
    if (scope === 'colleges') return `/colleges${qParam}`;
    if (scope === 'counselling') return '/counselling';
    if (scope === 'scholarships') return `/scholarships${qParam}`;
    if (scope === 'jobs') return `/jobs${qParam}`;
    return `/services${qParam}`;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && flattenedItems[activeIndex]) {
      const selected = flattenedItems[activeIndex];
      navigateWithRecord(selected.target, query);
      return;
    }
    navigateWithRecord(getFallbackSearchTarget(query), query);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      if (flattenedItems.length > 0) {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % flattenedItems.length);
      }
    } else if (e.key === 'ArrowUp') {
      if (flattenedItems.length > 0) {
        e.preventDefault();
        setActiveIndex((prev) => (prev <= 0 ? flattenedItems.length - 1 : prev - 1));
      }
    } else if (e.key === 'Escape') {
      setFocused(false);
      onCloseModal?.();
    }
  };

  const clearRecent = () => {
    try {
      window.localStorage.removeItem(RECENT_STORAGE_KEY);
    } catch {
      // ignore
    }
    setRecentSearches([]);
  };

  const showPanel = variant === 'modal' || focused;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Scope Filter Segmented Control */}
      <div className="mb-2.5 flex items-center gap-1 overflow-x-auto pb-0.5">
        {SCOPE_OPTIONS.map((opt) => {
          const active = scope === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setScope(opt.id)}
              className={`relative rounded-md px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                active
                  ? 'text-white'
                  : 'bg-[#F3EFE6] text-[#475467] hover:bg-[#EAE4D7] hover:text-[#0B192C]'
              }`}
            >
              {active && (
                <motion.span
                  layoutId={`search-scope-${variant}`}
                  transition={{ duration: prefersReduced ? 0 : 0.16, ease: BC_EASE }}
                  className="absolute inset-0 rounded-md bg-[#0B192C]"
                />
              )}
              <span className="relative z-10">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Search Input */}
      <form onSubmit={handleSubmit}>
        <div
          className={`flex flex-col gap-2 rounded-lg border bg-white p-1.5 transition-all duration-150 sm:flex-row sm:items-center ${
            focused
              ? 'border-[#134E7A] ring-2 ring-[#134E7A]/15 shadow-sm'
              : 'border-[#CFC8B8] shadow-2xs'
          }`}
        >
          <div className="relative flex-1 flex items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-[#5C6573]" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onFocus={() => setFocused(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setFocused(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              aria-label="Search across exams, colleges, scholarships, services, and jobs"
              className="w-full rounded-md bg-transparent py-2.5 pl-9 pr-8 text-sm text-[#0B192C] placeholder:text-[#7A828F] focus:outline-none min-h-[42px]"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                aria-label="Clear search query"
                className="absolute right-2 rounded p-1 text-[#7A828F] hover:text-[#0B192C]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#134E7A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0D3B5E] active:scale-[0.99] transition-all whitespace-nowrap shrink-0 min-h-[42px]"
          >
            <span>Search Directory</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Intelligent Discovery Dropdown / Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
            transition={{ duration: 0.16, ease: BC_EASE }}
            className={`${
              variant === 'modal'
                ? 'mt-3 max-h-[60vh]'
                : 'absolute left-0 right-0 z-30 mt-2 max-h-[420px] shadow-xl'
            } overflow-y-auto rounded-lg border border-[#D6CFC2] bg-white divide-y divide-[#EFECE3]`}
          >
            {query.trim().length < 2 ? (
              <div className="p-4 space-y-4">
                {recentSearches.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#5C6573]">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Recent Searches
                      </span>
                      <button
                        type="button"
                        onClick={clearRecent}
                        className="text-[#134E7A] hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => {
                            setQuery(term);
                            inputRef.current?.focus();
                          }}
                          className="rounded-md border border-[#E2DDD1] bg-[#FAF8F3] px-2.5 py-1 text-xs font-medium text-[#0B192C] hover:border-[#134E7A] hover:text-[#134E7A] transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-[#5C6573]">
                    Popular Pathways &amp; Direct Shortcuts
                  </p>
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {POPULAR_SHORTCUTS.map((sc) => (
                      <button
                        key={sc.label}
                        type="button"
                        onClick={() => navigateWithRecord(sc.target, sc.query)}
                        className="flex items-center justify-between rounded-md px-2.5 py-2 text-left hover:bg-[#FAF8F3] transition-colors group"
                      >
                        <div>
                          <p className="text-xs font-semibold text-[#0B192C] group-hover:text-[#134E7A]">
                            {sc.label}
                          </p>
                          <p className="text-[11px] text-[#5C6573]">{sc.category}</p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-[#9AA2AE] group-hover:text-[#134E7A] group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : loading ? (
              <div className="p-5 flex items-center gap-3 text-xs text-[#5C6573]">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#134E7A] border-t-transparent" />
                <span>
                  Searching verified exams, colleges, counselling guides, services, and scholarships...
                </span>
              </div>
            ) : flattenedItems.length === 0 ? (
              <div className="p-5 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-[#475467]">
                  No instant suggestions matched <strong className="text-[#0B192C]">"{query}"</strong>{' '}
                  in this scope.
                </div>
                <button
                  type="button"
                  onClick={() => navigateWithRecord(getFallbackSearchTarget(query), query)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#134E7A] hover:underline"
                >
                  <span>Search full directory</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div>
                {flattenedItems.map((item, idx) => {
                  const Icon = getGroupIcon(item.scope);
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => navigateWithRecord(item.target, query)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors ${
                        isActive ? 'bg-[#F3EFE6]' : 'hover:bg-[#FAF8F3]'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#134E7A]" />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-[#0B192C]">
                            {item.title}
                          </p>
                          <p className="truncate text-[11px] text-[#5C6573]">
                            <span className="font-semibold text-[#0E6B6E]">{item.group}</span>
                            {' · '}
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#9AA2AE]" />
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => navigateWithRecord(getFallbackSearchTarget(query), query)}
                  className="flex w-full items-center justify-between bg-[#FAF8F3] px-4 py-2.5 text-xs font-semibold text-[#134E7A] hover:bg-[#F3EFE6] transition-colors"
                >
                  <span>View all results for "{query.trim()}"</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
