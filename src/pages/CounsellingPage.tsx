import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckSquare,
  ClipboardList,
  ExternalLink,
  Search,
  ShieldCheck,
  Square,
} from 'lucide-react';
import { ExternalPortalModal } from '../components/ExternalPortalModal.tsx';
import { Alert } from '../components/ui/Alert.tsx';
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { apiFetch } from '../lib/api.ts';
import type { CounsellingGuide } from '../types/index.ts';

interface CounsellingPageProps {
  navigate: (path: string) => void;
  slug?: string;
}

const STREAM_FILTERS = ['All', 'Engineering', 'Medical & AYUSH', 'University Admissions'];

export function CounsellingPage({ navigate, slug }: CounsellingPageProps) {
  const [guides, setGuides] = useState<CounsellingGuide[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<CounsellingGuide | null>(null);
  const [streamFilter, setStreamFilter] = useState('All');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedDocsMap, setCheckedDocsMap] = useState<Record<string, number[]>>({});

  const [externalTarget, setExternalTarget] = useState<{
    title: string;
    portalName: string;
    url: string;
  } | null>(null);

  const loadGuides = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (streamFilter !== 'All') query.set('stream', streamFilter);
      if (q.trim()) query.set('q', q.trim());

      const data = await apiFetch<{ guides: CounsellingGuide[] }>(
        `/api/counselling?${query.toString()}`
      );
      setGuides(data.guides);

      if (slug) {
        const match = data.guides.find((g) => g.slug === slug);
        if (match) {
          setSelectedGuide(match);
        } else {
          const single = await apiFetch<{ guide: CounsellingGuide }>(
            `/api/counselling/${encodeURIComponent(slug)}`
          );
          setSelectedGuide(single.guide);
        }
      } else if (data.guides.length > 0 && !selectedGuide) {
        setSelectedGuide(data.guides[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load counselling guides.');
    } finally {
      setLoading(false);
    }
  }, [streamFilter, q, slug]);

  useEffect(() => {
    loadGuides();
  }, [loadGuides]);

  const handleSelectGuide = (guide: CounsellingGuide) => {
    setSelectedGuide(guide);
    navigate(`/counselling/${guide.slug}`);
  };

  const toggleDocCheck = (guideSlug: string, idx: number) => {
    setCheckedDocsMap((prev) => {
      const current = prev[guideSlug] ?? [];
      const next = current.includes(idx)
        ? current.filter((i) => i !== idx)
        : [...current, idx];
      return { ...prev, [guideSlug]: next };
    });
  };

  const activeCheckedDocs = selectedGuide ? checkedDocsMap[selectedGuide.slug] ?? [] : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', path: '/' },
          { label: 'Exams & Admissions', path: '/exams' },
          { label: 'Counselling Playbooks' },
        ]}
        navigate={navigate}
      />

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E2DDD1] pb-6">
        <div className="space-y-1.5 max-w-2xl">
          <p className="text-xs font-semibold text-[#C46316]">
            10-Step Seat Allotment Guides · Official Authorities Only
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0B192C]">
            College Admission &amp; Counselling Playbooks
          </h1>
          <p className="text-sm text-[#4B5565] leading-relaxed">
            Step-by-step official guidance covering JoSAA, CSAB, KEA (KCET &amp; Karnataka NEET),
            MCC, AACCC AYUSH, COMEDK, MHT CET CAP, KEAM, AP/TS EAPCET, WBJEEB, TNEA, UPTAC, and
            CUET/Private University admissions.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => navigate('/colleges')}>
          Find Participating Colleges
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {STREAM_FILTERS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStreamFilter(st)}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                streamFilter === st
                  ? 'border-[#134E7A] bg-[#134E7A] text-white'
                  : 'border-[#E2DDD1] bg-white text-[#4B5565] hover:border-[#BDB5A2] hover:text-[#0B192C]'
              }`}
            >
              {st === 'All' ? 'All Counselling Streams' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5C6573]" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search JoSAA, KEA, MCC, TNEA..."
            className="w-full rounded-lg border border-[#CFC8B8] bg-white pl-9 pr-3 py-2 text-xs text-[#0B192C] placeholder:text-[#7A828F] focus:border-[#134E7A] focus:outline-none"
          />
        </div>
      </div>

      {error && <Alert variant="error" title="Error loading guides">{error}</Alert>}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-2">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-16" />
            ))}
          </div>
          <div className="lg:col-span-8">
            <Skeleton className="h-96" />
          </div>
        </div>
      ) : guides.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-5 w-5" />}
          title="No counselling guides matched"
          description="Try clearing your search or selecting another counselling stream."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQ('');
                setStreamFilter('All');
              }}
            >
              Show All Counselling Guides
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Authority Selector Rail */}
          <div className="lg:col-span-4 rounded-lg border border-[#E2DDD1] bg-white divide-y divide-[#EFECE3] overflow-hidden">
            {guides.map((guide) => {
              const active = selectedGuide?.slug === guide.slug;
              return (
                <button
                  key={guide.id}
                  type="button"
                  onClick={() => handleSelectGuide(guide)}
                  className={`w-full p-3.5 text-left transition-colors ${
                    active ? 'bg-[#F3EFE6]' : 'bg-white hover:bg-[#FAF8F3]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                    <span className={active ? 'text-[#C46316]' : 'text-[#134E7A]'}>
                      {guide.authorityCode}
                    </span>
                    <span className="text-[#5C6573]">
                      {guide.scope} · {guide.state}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-[#0B192C] leading-snug">
                    {guide.title}
                  </p>
                </button>
              );
            })}
          </div>

          {/* 10-Step Structured Guide View */}
          {selectedGuide && (
            <div className="lg:col-span-8 space-y-5">
              <Card className="p-6 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#134E7A]">
                      {selectedGuide.authorityCode} · {selectedGuide.stream} · {selectedGuide.state}
                    </p>
                    <h2 className="text-xl sm:text-2xl font-semibold text-[#0B192C]">
                      {selectedGuide.title}
                    </h2>
                    <p className="text-xs font-medium text-[#4B5565]">
                      Conducting Body: {selectedGuide.conductingBody}
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      setExternalTarget({
                        title: `${selectedGuide.authorityCode} Official Counselling Portal`,
                        portalName: selectedGuide.conductingBody,
                        url: selectedGuide.officialWebsiteUrl,
                      })
                    }
                  >
                    Official Portal
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <p className="text-sm leading-relaxed text-[#4B5565]">{selectedGuide.overview}</p>
              </Card>

              <Card className="p-6 space-y-5">
                {[
                  { num: '01.', title: 'Who Is Eligible?', body: selectedGuide.whoIsEligible },
                  {
                    num: '02.',
                    title: 'Registration Process',
                    body: selectedGuide.registrationProcess,
                  },
                  {
                    num: '03.',
                    title: 'Choice Filling & Option Entry Strategy',
                    body: selectedGuide.choiceFillingGuide,
                  },
                  {
                    num: '04.',
                    title: 'Seat Allotment Process & Willingness Options',
                    body: selectedGuide.seatAllotmentProcess,
                  },
                  {
                    num: '05.',
                    title: 'Reporting & Document Verification',
                    body: selectedGuide.reportingProcess,
                  },
                  {
                    num: '06.',
                    title: 'Fee Payment & Security Deposit Rules',
                    body: selectedGuide.feePaymentInfo,
                  },
                  {
                    num: '07.',
                    title: 'Subsequent, Mop-Up & Special Rounds',
                    body: selectedGuide.subsequentRoundsInfo,
                  },
                  {
                    num: '08.',
                    title: 'Important Deadlines & Schedule',
                    body: selectedGuide.importantDeadlinesText,
                  },
                ].map((step, index) => (
                  <div
                    key={step.num}
                    className={
                      index > 0 ? 'border-t border-[#EFECE3] pt-4 space-y-1.5' : 'space-y-1.5'
                    }
                  >
                    <h3 className="text-sm font-bold text-[#0B192C] flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#C46316] tabular-nums">
                        {step.num}
                      </span>
                      <span>{step.title}</span>
                    </h3>
                    <p className="text-sm leading-relaxed text-[#4B5565] pl-7">{step.body}</p>
                  </div>
                ))}

                {/* 09. Interactive Required Documents Checklist */}
                <div className="border-t border-[#EFECE3] pt-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-[#0B192C] flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#C46316] tabular-nums">
                        09.
                      </span>
                      <span>Interactive Required Documents Checklist</span>
                    </h3>
                    <span className="font-mono text-xs font-semibold text-[#0E6B6E] tabular-nums">
                      {activeCheckedDocs.length}/{selectedGuide.documentsRequired.length} ready
                    </span>
                  </div>

                  <ul className="space-y-2 pl-7 text-sm">
                    {selectedGuide.documentsRequired.map((doc, idx) => {
                      const checked = activeCheckedDocs.includes(idx);
                      return (
                        <li key={doc}>
                          <button
                            type="button"
                            onClick={() => toggleDocCheck(selectedGuide.slug, idx)}
                            className={`flex w-full items-start gap-2.5 rounded-md border p-2.5 text-left transition-colors ${
                              checked
                                ? 'border-[#C4DFD6] bg-[#EFF7F4] text-[#0D3B2E]'
                                : 'border-[#E2DDD1] bg-[#FAF8F3] text-[#0B192C] hover:border-[#BDB5A2]'
                            }`}
                          >
                            {checked ? (
                              <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#0E6B6E]" />
                            ) : (
                              <Square className="mt-0.5 h-4 w-4 shrink-0 text-[#7A828F]" />
                            )}
                            <span className={checked ? 'line-through opacity-85' : ''}>{doc}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* 10. Common Mistakes & Official Verification */}
                <div className="border-t border-[#EFECE3] pt-4 space-y-3">
                  <h3 className="text-sm font-bold text-[#0B192C] flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#C46316] tabular-nums">
                      10.
                    </span>
                    <span>Common Mistakes to Avoid &amp; Official Website</span>
                  </h3>
                  <div className="ml-7 rounded-lg border border-[#E9D2B5] bg-[#FDF6EC] p-4 space-y-2">
                    <ul className="space-y-1.5 text-sm text-[#5C2E09]">
                      {selectedGuide.commonMistakes.map((mistake) => (
                        <li key={mistake} className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#C46316]" />
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pl-7 pt-1 flex flex-wrap items-center gap-3">
                    <Button
                      variant="navy"
                      size="sm"
                      onClick={() =>
                        setExternalTarget({
                          title: `${selectedGuide.authorityCode} Official Portal`,
                          portalName: selectedGuide.conductingBody,
                          url: selectedGuide.officialWebsiteUrl,
                        })
                      }
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Visit Official Portal ({selectedGuide.authorityCode})
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      <ExternalPortalModal target={externalTarget} onClose={() => setExternalTarget(null)} />
    </div>
  );
}
