import { useEffect, useState } from 'react';
import { ArrowRight, ExternalLink, Landmark, MapPin } from 'lucide-react';
import { ExternalPortalModal } from '../components/ExternalPortalModal.tsx';
import { Alert } from '../components/ui/Alert.tsx';
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { apiFetch } from '../lib/api.ts';
import type { Exam, JobListing, PublicService, Scholarship } from '../types/index.ts';

interface StatesHubPageProps {
  navigate: (path: string) => void;
  initialSearch?: string;
}

const INDIAN_STATES = [
  'Karnataka',
  'Maharashtra',
  'Kerala',
  'Tamil Nadu',
  'Telangana',
  'Andhra Pradesh',
  'Goa',
  'Gujarat',
  'Uttar Pradesh',
  'Rajasthan',
  'West Bengal',
  'All India',
];

const KARNATAKA_PORTALS = [
  {
    name: 'Seva Sindhu (Citizen Services & Guarantees)',
    desc: 'Gruha Lakshmi, Yuva Nidhi, Shakti, Birth/Death & State citizen services.',
    url: 'https://sevasindhu.karnataka.gov.in/',
  },
  {
    name: 'Karnataka SSP (Post-Matric & Pre-Matric Scholarships)',
    desc: 'Unified State Scholarship Portal for Karnataka SC, ST, OBC, Minority & Labour students.',
    url: 'https://ssp.postmatric.karnataka.gov.in/',
  },
  {
    name: 'KEA (KCET, NEET State Counselling & PGCET)',
    desc: 'Karnataka Examinations Authority for Engineering, Medical, Pharmacy & PG seat allotment.',
    url: 'https://cetonline.karnataka.gov.in/kea/',
  },
  {
    name: 'KPSC (KAS, FDA, SDA & State Civil Services)',
    desc: 'Karnataka Public Service Commission official notifications and OTR portal.',
    url: 'https://kpsc.kar.nic.in/',
  },
  {
    name: 'Nadakacheri / Atalji Janasnehi Kendra',
    desc: 'Caste, Income, Residence, Domicile & Family Tree (RD-Number) certificates.',
    url: 'https://nadakacheri.karnataka.gov.in/',
  },
  {
    name: 'Bhoomi & FRUITS (Karnataka Land & Farmer Records)',
    desc: 'Online RTC / Pahani extracts, Mutation status, and FRUITS Farmer Registration.',
    url: 'https://landrecords.karnataka.gov.in/',
  },
];

export function StatesHubPage({ navigate, initialSearch = '' }: StatesHubPageProps) {
  const params = new URLSearchParams(initialSearch);
  const [selectedState, setSelectedState] = useState(params.get('state') || 'Karnataka');
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<PublicService[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>([]);
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
        const q = new URLSearchParams({ state: selectedState });
        const [svcRes, exRes, schRes, jobRes] = await Promise.all([
          apiFetch<{ services: PublicService[] }>(`/api/services?${q.toString()}`),
          apiFetch<{ exams: Exam[] }>(`/api/exams?${q.toString()}`),
          apiFetch<{ scholarships: Scholarship[] }>(`/api/scholarships?${q.toString()}`),
          apiFetch<{ jobs: JobListing[] }>(`/api/jobs?${q.toString()}`),
        ]);
        if (!active) return;

        // Separate state-specific entries first, followed by nationwide All India entries
        const sortStateFirst = <T extends { state: string }>(arr: T[]) =>
          [...arr].sort((a, b) => {
            const aExact = a.state.toLowerCase() === selectedState.toLowerCase() ? 0 : 1;
            const bExact = b.state.toLowerCase() === selectedState.toLowerCase() ? 0 : 1;
            return aExact - bExact;
          });

        setServices(sortStateFirst(svcRes.services));
        setExams(sortStateFirst(exRes.exams));
        setScholarships(sortStateFirst(schRes.scholarships));
        setJobs(sortStateFirst(jobRes.jobs));
      } catch (err) {
        console.error('Load state hub error:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [selectedState]);

  const stateOnlyServices = services.filter(
    (s) => s.state.toLowerCase() === selectedState.toLowerCase() && selectedState !== 'All India'
  );
  const stateOnlyExams = exams.filter(
    (e) => e.state.toLowerCase() === selectedState.toLowerCase() && selectedState !== 'All India'
  );
  const stateOnlyScholarships = scholarships.filter(
    (s) => s.state.toLowerCase() === selectedState.toLowerCase() && selectedState !== 'All India'
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      <Breadcrumbs
        items={[{ label: 'Home', path: '/' }, { label: 'State Public Services' }]}
        navigate={navigate}
      />

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1.5 max-w-2xl">
          <p className="text-xs font-semibold  text-[#134E7A]">
            State & Regional Gateway · Jurisdiction Separated
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B192C]">
            State-Wise Public Services & Opportunities ({selectedState})
          </h1>
          <p className="text-sm text-slate-600">
            State-specific portals are clearly separated from All-India central services so citizens
            never confuse regional schemes with national portals.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Select State / Region
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-[#134E7A] focus:outline-none"
          >
            {INDIAN_STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* State Selection Chips */}
      <div className="flex flex-wrap gap-2">
        {INDIAN_STATES.map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setSelectedState(st)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedState === st
                ? 'border-[#134E7A] bg-[#134E7A] text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <MapPin className="h-3 w-3" />
            {st}
          </button>
        ))}
      </div>

      {selectedState === 'Karnataka' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-[#0B192C] flex items-center gap-2">
              <Landmark className="h-5 w-5 text-[#134E7A]" />
              Official Karnataka State Portals (State-Only)
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {KARNATAKA_PORTALS.map((portal) => (
              <Card key={portal.name} interactive className="p-5 flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold  text-amber-800">
                    Karnataka State Authority
                  </p>
                  <h3 className="font-display text-sm font-bold text-[#0B192C]">{portal.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{portal.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setExternalTarget({
                      title: portal.name,
                      portalName: 'Government of Karnataka Official Portal',
                      url: portal.url,
                    })
                  }
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#134E7A] hover:underline"
                >
                  Open Official Portal
                  <ExternalLink className="h-3 w-3" />
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedState !== 'Karnataka' && selectedState !== 'All India' && (
        <Alert variant="info" title={`${selectedState} + Central All-India Coverage`}>
          State-specific portals verified for {selectedState} are highlighted first below, followed
          by Central Government services (Parivahan, Passport Seva, NSP, DigiLocker, NTA exams)
          accessible to residents of {selectedState}.
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-44" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* State-specific Highlights */}
          {selectedState !== 'All India' && (
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#0B192C]">
                Dedicated {selectedState} Portals, Exams & Scholarships (
                {stateOnlyServices.length + stateOnlyExams.length + stateOnlyScholarships.length})
              </h2>
              {stateOnlyServices.length + stateOnlyExams.length + stateOnlyScholarships.length ===
              0 ? (
                <Card className="p-5">
                  <p className="text-sm text-slate-600">
                    State-specific portals for {selectedState} are actively expanding. Use the
                    Central / Nationwide verified guides below (accessible in {selectedState}) or
                    explore all exams and services.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {stateOnlyServices.map((svc) => (
                    <Card key={`svc-${svc.id}`} interactive className="p-5 space-y-2.5">
                      <p className="text-xs font-semibold text-[#134E7A]">
                        {svc.state} · {svc.category}
                      </p>
                      <h3 className="font-display text-base font-bold text-[#0B192C]">
                        {svc.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2">{svc.summary}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/services/${svc.slug}`)}
                      >
                        Open Step Guide
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Card>
                  ))}
                  {stateOnlyExams.map((ex) => (
                    <Card key={`ex-${ex.id}`} interactive className="p-5 space-y-2.5">
                      <p className="text-xs font-semibold text-[#C46316]">
                        {ex.state} Exam · {ex.category}
                      </p>
                      <h3 className="font-display text-base font-bold text-[#0B192C]">
                        {ex.examName} — {ex.fullName}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2">{ex.examPurpose}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/exams/${ex.slug}`)}
                      >
                        Exam Guide & Syllabus
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Card>
                  ))}
                  {stateOnlyScholarships.map((sch) => (
                    <Card key={`sch-${sch.id}`} interactive className="p-5 space-y-2.5">
                      <p className="text-xs font-semibold text-emerald-700">
                        {sch.state} Scholarship · {sch.category}
                      </p>
                      <h3 className="font-display text-base font-bold text-[#0B192C]">
                        {sch.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2">{sch.summary}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/scholarships/${sch.slug}`)}
                      >
                        Check Eligibility
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Central / Nationwide Services Available in Selected State */}
          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold text-[#0B192C]">
              All Verified Public Services & Schemes Accessible in {selectedState} ({services.length})
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {services.slice(0, 9).map((svc) => (
                <Card key={svc.id} interactive className="p-4 flex flex-col justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-slate-500">
                      {svc.state} · {svc.category}
                    </p>
                    <h3 className="font-display text-sm font-bold text-[#0B192C]">{svc.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/services/${svc.slug}`)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#134E7A] hover:underline"
                  >
                    View Guide <ArrowRight className="h-3 w-3" />
                  </button>
                </Card>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/services?state=${encodeURIComponent(selectedState)}`)}
              >
                All Services for {selectedState}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/exams?state=${encodeURIComponent(selectedState)}`)}
              >
                All Exams ({exams.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/jobs?state=${encodeURIComponent(selectedState)}`)}
              >
                Job Pathways ({jobs.length})
              </Button>
            </div>
          </section>
        </div>
      )}

      <ExternalPortalModal target={externalTarget} onClose={() => setExternalTarget(null)} />
    </div>
  );
}
