import { useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  PhoneCall,
  Search,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { ExternalPortalModal } from '../components/ExternalPortalModal.tsx';
import { Alert } from '../components/ui/Alert.tsx';
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { apiFetch } from '../lib/api.ts';

interface ScamAlertsPageProps {
  navigate: (path: string) => void;
}

const SCAM_PATTERNS = [
  {
    title: 'Fake Scholarship & Direct-Benefit WhatsApp Links',
    redFlags: [
      'Asks for a "verification fee", "processing charge", or "stamp duty" via UPI QR before releasing scholarship money.',
      'Uses lookalike domains such as scholarships-india.com, nsp-apply.org, or pm-yojana-free.in instead of scholarships.gov.in.',
    ],
    safeRule: 'Central & State scholarships on NSP and Karnataka SSP are always free to apply and credit directly via DBT.',
  },
  {
    title: 'Fake Government, SSC, Railway & PSU Offer Letters',
    redFlags: [
      'Sends a PDF "Appointment Letter" on WhatsApp demanding ₹1,500–₹25,000 for medical test, security deposit, or uniform.',
      'Uses personal Gmail/Yahoo email addresses instead of verified .gov.in / .nic.in domains.',
    ],
    safeRule: 'Genuine UPSC, SSC, RRB, IBPS, KPSC, and PSU results are published strictly on official websites and never charge job confirmation fees.',
  },
  {
    title: 'Fake Admission Quota & Counselling Agents',
    redFlags: [
      'Promises guaranteed IIT/NIT/AIIMS/MBBS seats without JEE/NEET rank or outside JoSAA / MCC / KEA online rounds.',
      'Demands original Class 10/12 marks cards and cash upfront for "backdoor management seats".',
    ],
    safeRule: 'All Indian medical, engineering, and university seats follow statutory JoSAA, MCC, or state counselling allotments.',
  },
  {
    title: 'Fake Visa, Passport Priority & UPI Refund Traps',
    redFlags: [
      'Claims instant "VIP passport slot" or guaranteed foreign work visa in exchange for upfront bank transfer.',
      'Asks you to scan a UPI QR code or enter your UPI PIN to "receive" a refund or stipend.',
    ],
    safeRule: 'Receiving money via UPI NEVER requires entering your PIN. Official passports route only through passportindia.gov.in.',
  },
];

export function ScamAlertsPage({ navigate }: ScamAlertsPageProps) {
  const { dbUser } = useAuth();
  const [urlInput, setUrlInput] = useState('');
  const [checkResult, setCheckResult] = useState<{
    verdict: 'trusted_suffix' | 'caution' | 'high_risk';
    headline: string;
    details: string[];
  } | null>(null);

  // Content / Scam Report Form State
  const [reportType, setReportType] = useState<
    'scam_alert' | 'broken_link' | 'outdated_info' | 'incorrect_fee' | 'other'
  >('scam_alert');
  const [entityTitle, setEntityTitle] = useState('');
  const [reportedUrl, setReportedUrl] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState(dbUser?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const [externalTarget, setExternalTarget] = useState<{
    title: string;
    portalName: string;
    url: string;
  } | null>(null);

  const inspectUrl = (e: FormEvent) => {
    e.preventDefault();
    const raw = urlInput.trim();
    if (!raw) return;

    const normalized = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`;
    try {
      const parsed = new URL(normalized);
      const host = parsed.hostname.toLowerCase();
      const details: string[] = [];

      if (parsed.protocol !== 'https:' && raw.startsWith('http://')) {
        details.push('Uses unencrypted http:// rather than https://.');
      }

      const isGovIn = host.endsWith('.gov.in') || host.endsWith('.nic.in');
      const isAcIn = host.endsWith('.ac.in') || host.endsWith('.edu.in');
      const hasSuspiciousKeywords =
        /(gov-in|nic-in|yojana|free-laptop|sarkari-offer|apply-now|verify-upi|cash-reward)/i.test(
          host
        );

      if (hasSuspiciousKeywords && !isGovIn) {
        setCheckResult({
          verdict: 'high_risk',
          headline: `Warning: "${host}" resembles a deceptive lookalike domain`,
          details: [
            'Official Indian government websites end strictly in .gov.in or .nic.in (e.g. nsp.gov.in, ssc.gov.in, cetonline.karnataka.gov.in).',
            'Do not enter Aadhaar, OTPs, bank details, or pay any UPI registration fees here.',
            ...details,
          ],
        });
        return;
      }

      if (isGovIn || isAcIn) {
        setCheckResult({
          verdict: 'trusted_suffix',
          headline: `"${host}" uses an official ${isGovIn ? '.gov.in / .nic.in' : '.ac.in / .edu.in'} institutional domain`,
          details: [
            'This domain suffix is reserved for verified Indian government departments or accredited academic institutions.',
            'Still ensure HTTPS padlock is active and never pay third-party personal UPI IDs.',
          ],
        });
        return;
      }

      setCheckResult({
        verdict: 'caution',
        headline: `"${host}" is a non-government (.com / .org / other) domain`,
        details: [
          'If this site claims to be an Indian government ministry, state scholarship, or railway recruitment board, verify directly on the official .gov.in directory first.',
          'Some legitimate private foundations (e.g. Tata Trusts, Reliance Foundation, HDFC) or authorized exam portals use .org / .com — confirm authenticity before sharing data.',
          ...details,
        ],
      });
    } catch {
      setCheckResult({
        verdict: 'caution',
        headline: 'Could not parse a valid web domain',
        details: [
          'Paste a complete website URL (for example: https://scholarships.gov.in) to inspect its domain structure.',
        ],
      });
    }
  };

  const submitScamOrIssueReport = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const res = await apiFetch<{ message: string }>('/api/reports/content', {
        method: 'POST',
        body: JSON.stringify({
          entityType: reportType === 'scam_alert' ? 'scam' : 'general',
          entityTitle: entityTitle.trim(),
          reportType,
          reportedUrl: reportedUrl.trim() || null,
          description: description.trim(),
          contactEmail: contactEmail.trim() || '',
        }),
      });
      setSubmitSuccess(res.message);
      setEntityTitle('');
      setReportedUrl('');
      setDescription('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      <Breadcrumbs
        items={[{ label: 'Home', path: '/' }, { label: 'Scam Alert & Domain Safety Center' }]}
        navigate={navigate}
      />

      <div className="space-y-2 border-b border-[#E2DDD1] pb-5">
        <p className="text-xs font-semibold text-[#C46316]">Citizen Digital Safety</p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B192C]">
          Scam Alert Center &amp; Official Link Verification
        </h1>
        <p className="text-sm text-[#4B5565] max-w-2xl leading-relaxed">
          Protect yourself against fake scholarship fees, fraudulent government job letters, paid
          admission agents, and phishing links. Verify domains before you share personal details.
        </p>
      </div>

      {/* Interactive Domain Inspector */}
      <Card className="p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-lg font-bold text-[#0B192C]">
            Quick Official Domain Checker
          </h2>
          <p className="text-xs text-[#5C6573]">
            Paste any scholarship, exam, job, or service URL you received via SMS or WhatsApp to
            verify whether it uses a genuine `.gov.in` / `.nic.in` / `.ac.in` suffix.
          </p>
        </div>

        <form onSubmit={inspectUrl} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5C6573]" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. https://scholarships.gov.in or suspicious-site.com"
              className="w-full rounded-lg border border-[#CFC8B8] bg-[#FAF8F3] py-2.5 pl-10 pr-4 text-sm text-[#0B192C] font-mono focus:border-[#134E7A] focus:bg-white focus:outline-none"
            />
          </div>
          <Button type="submit">Inspect Domain</Button>
        </form>

        {checkResult && (
          <div
            className={`rounded-lg border p-4 space-y-2 text-xs ${
              checkResult.verdict === 'trusted_suffix'
                ? 'border-[#0E6B6E]/35 bg-[#EEF7F6] text-[#0B192C]'
                : checkResult.verdict === 'high_risk'
                  ? 'border-red-300 bg-red-50 text-red-950'
                  : 'border-[#E9D2B5] bg-[#FDF6EC] text-[#5C2E09]'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {checkResult.verdict === 'trusted_suffix' ? (
                <ShieldCheck className="h-4 w-4 text-[#0E6B6E] shrink-0" />
              ) : checkResult.verdict === 'high_risk' ? (
                <ShieldAlert className="h-4 w-4 text-red-700 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-[#C46316] shrink-0" />
              )}
              <span>{checkResult.headline}</span>
            </div>
            <ul className="space-y-1 pl-6 list-disc leading-relaxed">
              {checkResult.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Common Indian Public Scam Playbook */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-[#0B192C]">
          Common Scam Patterns to Watch Out For
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {SCAM_PATTERNS.map((scam) => (
            <Card key={scam.title} className="p-6 space-y-3">
              <h3 className="font-display text-base font-bold text-[#0B192C]">{scam.title}</h3>
              <ul className="space-y-1.5 text-xs text-[#4B5565] list-disc pl-4 leading-relaxed">
                {scam.redFlags.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
              <div className="rounded-md border border-[#E2DDD1] bg-[#FAF8F3] p-3 text-xs text-[#0B192C]">
                <strong className="text-[#0E6B6E]">Verification Rule: </strong>
                {scam.safeRule}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Official Helplines + Bharat Connect Report Form */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        <Card className="lg:col-span-5 p-6 space-y-4 bg-[#0B192C] text-white border-[#0B192C]">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
            <PhoneCall className="h-4 w-4" />
            <span>Official Indian Cyber Fraud Reporting</span>
          </div>
          <h2 className="font-display text-xl font-bold">
            If You Lost Money or Shared OTPs
          </h2>
          <p className="text-xs leading-relaxed text-slate-300">
            Report immediately within the golden hour to freeze fraudulent bank transfers and block
            scam phone numbers.
          </p>
          <div className="space-y-2.5 text-xs border-t border-slate-700 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">National Cyber Crime Helpline</span>
              <span className="font-mono text-base font-bold text-amber-300">1930</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between bg-white text-[#0B192C] hover:bg-slate-100"
              onClick={() =>
                setExternalTarget({
                  title: 'National Cyber Crime Reporting Portal',
                  portalName: 'Ministry of Home Affairs (I4C)',
                  url: 'https://cybercrime.gov.in/',
                })
              }
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between bg-white text-[#0B192C] hover:bg-slate-100"
              onClick={() =>
                setExternalTarget({
                  title: 'Sanchar Saathi — Report Fraud Calls/SMS (Chakshu)',
                  portalName: 'Department of Telecommunications',
                  url: 'https://sancharsaathi.gov.in/',
                })
              }
            >
              <span>sancharsaathi.gov.in (Chakshu)</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-7 p-6 space-y-4">
          <div className="space-y-1 border-b border-[#EFECE3] pb-3">
            <h2 className="font-display text-lg font-bold text-[#0B192C]">
              Report a Broken Link, Outdated Guide, or Scam URL to Bharat Connect
            </h2>
            <p className="text-xs text-[#5C6573]">
              Reports go directly to our editorial verification queue so we can fix links or publish
              community warnings.
            </p>
          </div>

          {submitSuccess && (
            <div className="flex items-start gap-2.5 rounded-lg border border-[#0E6B6E]/30 bg-[#EEF7F6] p-4 text-xs text-[#0B192C]">
              <CheckCircle2 className="h-4 w-4 text-[#0E6B6E] shrink-0 mt-0.5" />
              <span>{submitSuccess}</span>
            </div>
          )}
          {submitError && <Alert variant="error">{submitError}</Alert>}

          <form onSubmit={submitScamOrIssueReport} className="space-y-3.5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs font-medium text-[#4B5565]">
                <span>Report Type *</span>
                <select
                  value={reportType}
                  onChange={(e) =>
                    setReportType(
                      e.target.value as
                        | 'scam_alert'
                        | 'broken_link'
                        | 'outdated_info'
                        | 'incorrect_fee'
                        | 'other'
                    )
                  }
                  className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C]"
                >
                  <option value="scam_alert">Fake Website / Scam Alert</option>
                  <option value="broken_link">Broken Official Portal Link</option>
                  <option value="outdated_info">Outdated Dates or Rules</option>
                  <option value="incorrect_fee">Incorrect Application Fee</option>
                  <option value="other">Other Verification Issue</option>
                </select>
              </label>

              <label className="space-y-1 text-xs font-medium text-[#4B5565]">
                <span>Guide Name or Subject *</span>
                <input
                  required
                  minLength={3}
                  value={entityTitle}
                  onChange={(e) => setEntityTitle(e.target.value)}
                  placeholder="e.g. Fake NSP Scholarship SMS"
                  className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C]"
                />
              </label>
            </div>

            <label className="block space-y-1 text-xs font-medium text-[#4B5565]">
              <span>Affected or Suspicious URL (Optional)</span>
              <input
                type="text"
                value={reportedUrl}
                onChange={(e) => setReportedUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C] font-mono"
              />
            </label>

            <label className="block space-y-1 text-xs font-medium text-[#4B5565]">
              <span>Details *</span>
              <textarea
                required
                minLength={10}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened, the fee demanded, or which official link needs correction..."
                className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C]"
              />
            </label>

            <label className="block space-y-1 text-xs font-medium text-[#4B5565]">
              <span>Contact Email (Optional)</span>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-[#CFC8B8] bg-white px-3 py-2 text-sm text-[#0B192C]"
              />
            </label>

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting Report...' : 'Submit Verification / Scam Report'}
            </Button>
          </form>
        </Card>
      </div>

      <ExternalPortalModal target={externalTarget} onClose={() => setExternalTarget(null)} />
    </div>
  );
}
