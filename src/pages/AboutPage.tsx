import { useState } from 'react';
import { Mail, ShieldCheck, User } from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';

interface AboutPageProps {
  section?: 'about' | 'contact';
  navigate: (path: string) => void;
}

export function AboutPage({ section = 'about', navigate }: AboutPageProps) {
  const [founderName, setFounderName] = useState('Founder Name (Editable Placeholder)');
  const [founderRole, setFounderRole] = useState('Founder & Product Architect, Bharat Connect');
  const [founderBio, setFounderBio] = useState(
    'Replace this placeholder with your verified biography, background, and why you started Bharat Connect for students and citizens in Karnataka and across India.'
  );
  const [founderVision, setFounderVision] = useState(
    'Every student and citizen, regardless of geography or family background, deserves clear, honest, and accessible guidance to discover opportunities and essential services.'
  );
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [editingFounder, setEditingFounder] = useState(false);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-10">
      <Breadcrumbs
        items={[
          { label: 'Home', path: '/' },
          { label: section === 'contact' ? 'Contact & Support' : 'About Bharat Connect' },
        ]}
        navigate={navigate}
      />

      {/* Mission */}
      <section className="space-y-4">
        <p className="text-xs font-semibold text-[#134E7A]">About Bharat Connect</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#0B192C] sm:text-4xl">
          Your Digital Guide to Opportunities and Essential Public Services
        </h1>
        <p className="text-base leading-relaxed text-slate-600">
          Bharat Connect is an independent public-interest initiative focused on helping students,
          parents, graduates, job seekers, entrepreneurs, and citizens discover verified
          scholarships and essential government services without searching across dozens of confusing
          portals.
        </p>
        <p className="text-sm leading-relaxed text-slate-600">
          Launching with deep coverage for Karnataka residents before expanding nationwide, the
          platform prioritizes verified official sources, plain-language eligibility and document
          checklists, and strict respect for user privacy.
        </p>
      </section>

      {/* Brand Principles */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5 space-y-2">
          <h2 className="font-display text-base font-bold text-[#0B192C]">
            Independent &amp; Honest
          </h2>
          <p className="text-xs leading-relaxed text-slate-600">
            We never claim government ownership, official NSP/SSP partnership, or guaranteed
            scholarship or visa approval.
          </p>
        </Card>
        <Card className="p-5 space-y-2">
          <h2 className="font-display text-base font-bold text-[#0B192C]">Verified Portals Only</h2>
          <p className="text-xs leading-relaxed text-slate-600">
            Every published record carries its official source URL, direct application portal, and
            last verification date.
          </p>
        </Card>
        <Card className="p-5 space-y-2">
          <h2 className="font-display text-base font-bold text-[#0B192C]">Data Minimization</h2>
          <p className="text-xs leading-relaxed text-slate-600">
            We collect only the academic and domicile details required for eligibility pre-checks—never
            Aadhaar numbers, OTPs, or portal passwords.
          </p>
        </Card>
      </section>

      {/* Founder / Co-Founder Section (Editable Placeholder) */}
      <Card className="p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-[#0B192C]">
              Founder &amp; Leadership
            </h2>
            <p className="text-xs text-slate-500">
              Editable placeholder preview — update with your verified details before public launch.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingFounder((prev) => !prev)}
          >
            {editingFounder ? 'Done Previewing' : 'Edit Placeholder'}
          </Button>
        </div>

        {editingFounder ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-xs font-medium text-slate-700">
              <span>Founder Name</span>
              <input
                value={founderName}
                onChange={(e) => setFounderName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-slate-700">
              <span>Role</span>
              <input
                value={founderRole}
                onChange={(e) => setFounderRole(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
              <span>Short Biography</span>
              <textarea
                rows={3}
                value={founderBio}
                onChange={(e) => setFounderBio(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
              <span>Vision Statement</span>
              <textarea
                rows={2}
                value={founderVision}
                onChange={(e) => setFounderVision(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-slate-700 sm:col-span-2">
              <span>Professional Profile Link (LinkedIn / Website)</span>
              <input
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
        ) : (
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
              <User className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-lg font-bold text-[#0B192C]">{founderName}</h3>
              <p className="text-xs font-semibold text-[#134E7A]">{founderRole}</p>
              <p className="text-sm leading-relaxed text-slate-600">{founderBio}</p>
              <p className="text-sm italic text-slate-700">“{founderVision}”</p>
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs font-semibold text-[#134E7A] underline"
                >
                  Professional Profile
                </a>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Contact */}
      <Card
        className={`p-6 sm:p-8 space-y-3 ${
          section === 'contact' ? 'border-[#134E7A]' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-[#134E7A]" />
          <h2 className="font-display text-xl font-bold text-[#0B192C]">
            Official Contact &amp; Corrections
          </h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Found an outdated scholarship deadline, broken official URL, or missing scheme? Reach out
          to our verification team through your configured official Bharat Connect support address
          (configure your custom domain support email before public launch).
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
          <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
          <span>Do not email sensitive personal documents, Aadhaar numbers, or passwords.</span>
        </div>
      </Card>
    </div>
  );
}
