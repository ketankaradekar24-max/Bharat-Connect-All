import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Building2,
  ExternalLink,
  GraduationCap,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { ExternalPortalModal } from '../components/ExternalPortalModal.tsx';
import { ReportIssueButton } from '../components/ReportIssueButton.tsx';
import { Alert } from '../components/ui/Alert.tsx';
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { apiFetch } from '../lib/api.ts';
import type { Institution } from '../types/index.ts';

interface InstitutionDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export function InstitutionDetailPage({ slug, navigate }: InstitutionDetailPageProps) {
  const resolvedSlug = slug === 'vtu' ? 'vtu-belagavi' : slug;

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [externalTarget, setExternalTarget] = useState<{
    title: string;
    portalName: string;
    url: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<{ institution: Institution }>(
          `/api/institutions/${encodeURIComponent(resolvedSlug)}`
        );
        if (!active) return;
        setInstitution(data.institution);
      } catch (err) {
        if (active)
          setError(err instanceof Error ? err.message : 'Unable to load institution guide.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [resolvedSlug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-44" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-4">
        <Alert variant="error" title="Institution guide unavailable">
          {error || 'The requested university or college guide could not be found.'}
        </Alert>
        <Button variant="outline" onClick={() => navigate('/colleges')}>
          Back to Find Colleges
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', path: '/' },
          { label: 'Colleges & Universities', path: '/colleges' },
          { label: institution.shortName },
        ]}
        navigate={navigate}
      />

      {/* Top Banner */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <p className="text-xs font-medium text-[#5C6573]">
              <span className="font-semibold text-[#134E7A]">{institution.category}</span>
              {' · '}
              {institution.institutionType}
              {' · '}
              {institution.primaryStream}
              {' · '}
              <span className="text-[#0E6B6E] font-semibold">Verified Official Source</span>
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0B192C]">
              {institution.name}
            </h1>
            <p className="flex items-center gap-1.5 text-sm font-medium text-[#4B5565]">
              <MapPin className="h-4 w-4 text-[#7A828F] shrink-0" />
              <span>
                {institution.city}, {institution.state}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setExternalTarget({
                  title: `${institution.shortName} Official Admission Portal`,
                  portalName: institution.name,
                  url: institution.officialAdmissionUrl,
                })
              }
            >
              Official Admission Portal
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setExternalTarget({
                  title: `${institution.shortName} Official Website`,
                  portalName: institution.name,
                  url: institution.officialWebsiteUrl,
                })
              }
            >
              Official Website
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-8 space-y-5">
          {/* 1. Overview & Campuses */}
          <Card className="p-5 space-y-3">
            <h2 className="text-lg font-semibold text-[#0B192C] flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#134E7A]" />
              01. Overview, Campuses &amp; Institutional Status
            </h2>
            <p className="text-sm leading-relaxed text-[#4B5565]">{institution.overview}</p>

            {institution.affiliatedCollegesInfo && (
              <div className="rounded-lg border border-[#C8DAE8] bg-[#F1F6FA] p-4 text-sm text-[#0B192C] space-y-1">
                <p className="font-semibold text-[#134E7A]">Affiliated Colleges Network</p>
                <p className="leading-relaxed text-[#4B5565]">
                  {institution.affiliatedCollegesInfo}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
              <div className="rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-3.5">
                <p className="text-xs font-semibold text-[#5C6573]">Campuses / Regions</p>
                <ul className="mt-1.5 space-y-1 text-xs text-[#0B192C]">
                  {institution.campuses.map((c) => (
                    <li key={c}>· {c}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-3.5">
                <p className="text-xs font-semibold text-[#5C6573]">Major Courses Offered</p>
                <ul className="mt-1.5 space-y-1 text-xs text-[#0B192C]">
                  {institution.coursesOffered.map((course) => (
                    <li key={course}>· {course}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* 2. Admission Routes Matrix */}
          <Card className="p-5 space-y-3">
            <h2 className="text-lg font-semibold text-[#0B192C]">
              02. Verified Admission Routes &amp; Accepted Entrance Exams
            </h2>
            <div className="space-y-3">
              {institution.admissionRoutes.map((route) => (
                <div
                  key={route.routeName}
                  className="rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-4 space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-[#0B192C]">{route.routeName}</h3>
                    <span className="text-xs font-semibold text-[#134E7A]">
                      {route.counsellingAuthority}
                    </span>
                  </div>
                  <p className="text-xs text-[#4B5565]">
                    <strong className="text-[#0B192C]">Exam / Merit Basis: </strong>
                    {route.examOrBasis}
                  </p>
                  <p className="text-xs text-[#4B5565]">
                    <strong className="text-[#0B192C]">Eligibility: </strong>
                    {route.eligibility}
                  </p>
                  <p className="text-xs text-[#5C6573]">{route.notes}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* 3. UG, PG & Lateral Entry */}
          <Card className="p-5 space-y-4">
            <h2 className="text-lg font-semibold text-[#0B192C] flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[#134E7A]" />
              03. UG, PG &amp; Lateral Entry Admission Guidance
            </h2>

            <div className="space-y-3 text-sm text-[#4B5565]">
              <div>
                <p className="font-semibold text-[#0B192C]">Undergraduate (UG) Admissions</p>
                <p className="mt-0.5 leading-relaxed">{institution.ugAdmissionsInfo}</p>
              </div>
              {institution.pgAdmissionsInfo && (
                <div className="border-t border-[#EFECE3] pt-3">
                  <p className="font-semibold text-[#0B192C]">Postgraduate (PG) Admissions</p>
                  <p className="mt-0.5 leading-relaxed">{institution.pgAdmissionsInfo}</p>
                </div>
              )}
              {institution.lateralEntryInfo && (
                <div className="border-t border-[#EFECE3] pt-3">
                  <p className="font-semibold text-[#0B192C]">
                    Diploma-to-Engineering / Lateral Entry
                  </p>
                  <p className="mt-0.5 leading-relaxed">{institution.lateralEntryInfo}</p>
                </div>
              )}
            </div>
          </Card>

          {/* 4. Counselling, Fees & Scholarships */}
          <Card className="p-5 space-y-4">
            <h2 className="text-lg font-semibold text-[#0B192C]">
              04. Counselling, Quota Rules, Fees &amp; Scholarships
            </h2>
            <div className="space-y-3 text-sm text-[#4B5565]">
              <div>
                <p className="font-semibold text-[#0B192C]">Counselling &amp; Quota Structure</p>
                <p className="mt-0.5 leading-relaxed">{institution.quotaAndCounsellingInfo}</p>
              </div>
              <div className="border-t border-[#EFECE3] pt-3">
                <p className="font-semibold text-[#0B192C]">Fees Guidance</p>
                <p className="mt-0.5 leading-relaxed">{institution.feesInfo}</p>
              </div>
              <div className="border-t border-[#EFECE3] pt-3">
                <p className="font-semibold text-[#0B192C]">Scholarships &amp; Financial Aid</p>
                <p className="mt-0.5 leading-relaxed">{institution.scholarshipsInfo}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
          <Card className="p-5 space-y-4">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[#0E6B6E] mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#0B192C]">Verified Institutional Guide</p>
                <p className="text-xs text-[#4B5565]">
                  Last Verified:{' '}
                  <span className="font-mono tabular-nums">
                    {institution.lastVerifiedAt
                      ? new Date(institution.lastVerifiedAt).toLocaleDateString('en-IN')
                      : 'Verified'}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-2 border-t border-[#EFECE3] pt-3">
              <p className="text-xs font-semibold text-[#5C6573]">Accepted Entrance Exams</p>
              <div className="flex flex-wrap gap-1.5">
                {institution.entranceExamsAccepted.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => navigate(`/exams?q=${encodeURIComponent(ex)}`)}
                    className="rounded-md border border-[#E2DDD1] bg-[#FAF8F3] px-2.5 py-1 text-xs font-semibold text-[#134E7A] hover:border-[#134E7A] hover:bg-white transition-colors"
                  >
                    {ex} →
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t border-[#EFECE3] pt-3">
              <Button
                variant="primary"
                className="w-full justify-between"
                onClick={() =>
                  setExternalTarget({
                    title: `${institution.shortName} Admission Portal`,
                    portalName: institution.name,
                    url: institution.officialAdmissionUrl,
                  })
                }
              >
                Open Official Admission Portal
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate('/counselling')}
              >
                View Counselling Step Guides
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() =>
                  navigate(`/colleges?state=${encodeURIComponent(institution.state)}`)
                }
              >
                More Colleges in {institution.state}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="border-t border-[#EFECE3] pt-3">
              <ReportIssueButton
                entityType="institution"
                entitySlug={institution.slug}
                entityTitle={institution.name}
                defaultUrl={institution.officialAdmissionUrl}
                compact
              />
            </div>
          </Card>
        </div>
      </div>

      <ExternalPortalModal target={externalTarget} onClose={() => setExternalTarget(null)} />
    </div>
  );
}
