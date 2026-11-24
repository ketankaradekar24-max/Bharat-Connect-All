import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx';
import { Card } from '../components/ui/Card.tsx';

interface PolicyPageProps {
  type: 'privacy' | 'terms' | 'disclaimer';
  navigate: (path: string) => void;
}

export function PolicyPage({ type, navigate }: PolicyPageProps) {
  const title =
    type === 'privacy'
      ? 'Privacy Policy'
      : type === 'terms'
        ? 'Terms of Service'
        : 'Service & Scholarship Disclaimer';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6">
      <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: title }]} navigate={navigate} />

      <Card className="p-6 sm:p-8 space-y-6">
        {type === 'privacy' && (
          <>
            <h1 className="font-display text-3xl font-extrabold text-[#0B192C]">Privacy Policy</h1>
            <p className="text-sm leading-relaxed text-slate-600">
              Bharat Connect follows data-minimization principles aligned with the Digital Personal
              Data Protection framework in India. We collect only the information needed to
              authenticate your account (name and email via Google Sign-In) and optional profile
              fields you choose to enter for rule-based scholarship eligibility pre-checks or
              personal service checklists.
            </p>
            <section className="space-y-2 border-t border-slate-100 pt-4">
              <h2 className="font-display text-lg font-bold text-[#0B192C]">
                What We Never Collect
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                Bharat Connect does not request or store Aadhaar numbers, bank account passwords,
                payment cards, OTPs, passport scans, or external government portal credentials (such
                as NSP, Karnataka SSP, Parivahan, or Passport Seva passwords).
              </p>
            </section>
            <section className="space-y-2 border-t border-slate-100 pt-4">
              <h2 className="font-display text-lg font-bold text-[#0B192C]">
                How Your Data Is Used
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                Your academic level, domicile state, marks percentage, and family income range are
                used solely to compute transparent rule-based eligibility matches and organize your
                personal application tracker. We do not sell user personal data to third parties.
              </p>
            </section>
          </>
        )}

        {type === 'terms' && (
          <>
            <h1 className="font-display text-3xl font-extrabold text-[#0B192C]">
              Terms of Service
            </h1>
            <p className="text-sm leading-relaxed text-slate-600">
              Bharat Connect is an independent informational and citizen-organization tool. By
              using this platform, you acknowledge that all scholarship, document, passport, visa,
              licence, and exam applications must be submitted directly on the respective official
              government, institutional, or embassy portals.
            </p>
            <section className="space-y-2 border-t border-slate-100 pt-4">
              <h2 className="font-display text-lg font-bold text-[#0B192C]">Acceptable Use</h2>
              <p className="text-sm leading-relaxed text-slate-600">
                Users must not attempt automated scraping, spam, unauthorized access to
                administrative routes, or misrepresentation of identity.
              </p>
            </section>
          </>
        )}

        {type === 'disclaimer' && (
          <>
            <h1 className="font-display text-3xl font-extrabold text-[#0B192C]">
              Service &amp; Scholarship Disclaimer
            </h1>
            <p className="text-sm leading-relaxed text-slate-600">
              Bharat Connect is an independent initiative and is not affiliated with, owned by, or
              officially endorsed by the Government of India, Government of Karnataka, National
              Scholarship Portal (NSP), State Scholarship Portal (SSP), Parivahan, Passport Seva,
              or any foreign embassy.
            </p>
            <p className="text-sm leading-relaxed text-slate-600">
              Eligibility pre-checks, fee references, and document checklists displayed on Bharat
              Connect are informational guides only and do not guarantee scholarship selection,
              loan approval, job placement, or visa issuance. Always review the latest official
              notification on the provider&apos;s official website before applying.
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
