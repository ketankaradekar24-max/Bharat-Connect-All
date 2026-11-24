import { useLanguage } from '../context/LanguageContext.tsx';
import { BrandMark, HorizonRule } from './BrandMark.tsx';

interface FooterProps {
  navigate: (path: string) => void;
}

export function Footer({ navigate }: FooterProps) {
  const { lang, setLang } = useLanguage();

  return (
    <footer className="bg-[#0B192C] text-slate-300">
      <HorizonRule />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2.5">
              <BrandMark className="h-8 w-8" inverted />
              <span
                className="text-lg font-bold tracking-tight text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Bharat Connect
              </span>
            </div>

            <p className="text-sm leading-relaxed text-slate-300 max-w-md">
              Your digital guide to verified entrance exams, university admissions, scholarships,
              essential government services, and citizen checklists across Karnataka and India.
            </p>

            <p className="text-xs leading-relaxed text-slate-400 max-w-md">
              Independent Initiative: Bharat Connect is not a government portal, visa agency, or
              embassy. Always verify and submit final applications directly on official domains.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 mr-1">Language:</span>
              {(
                [
                  { code: 'en', label: 'English' },
                  { code: 'kn', label: 'ಕನ್ನಡ' },
                  { code: 'hi', label: 'हिन्दी' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setLang(opt.code)}
                  className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                    lang === opt.code
                      ? 'bg-[#134E7A] text-white'
                      : 'border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <p className="text-xs font-semibold tracking-wide text-white">Discovery</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/exams')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Competitive Exams
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/colleges')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Colleges &amp; Universities
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/counselling')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Counselling Playbooks
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/scholarships')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Scholarships
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/services')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Explore Services
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/jobs')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Jobs &amp; Careers
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/states')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  State Services Hub
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <p className="text-xs font-semibold tracking-wide text-white">Workspace</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/opportunities')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Opportunity Finder
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/learning')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Career &amp; Resume Studio
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/tools')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Deadlines &amp; Cost Planner
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  User Dashboard
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/community')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Community Q&amp;A
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Student Profile
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/about')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  About &amp; Mission
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/contact')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Contact &amp; Support
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-semibold tracking-wide text-white">Trust &amp; Policies</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/scam-alerts')}
                  className="text-amber-300 hover:text-white transition-colors font-medium"
                >
                  Scam Alert &amp; Link Checker
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/privacy')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Privacy Policy (Data Minimization)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/terms')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/disclaimer')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Service &amp; Scholarship Disclaimer
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Bharat Connect. Independent Citizen &amp; Student Hub.</p>
          <p>Zero Aadhaar/OTP collection · Official portal redirects only</p>
        </div>
      </div>
    </footer>
  );
}
