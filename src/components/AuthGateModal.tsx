import { ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export function AuthGateModal() {
  const { authModalOpen, closeAuthModal, signInWithGoogle, authError } = useAuth();

  if (!authModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
    >
      <div className="animate-modal-enter w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#134E7A]">Bharat Connect Account</p>
            <h2 id="auth-modal-title" className="font-display text-xl font-bold text-[#0B192C]">
              Sign in to Save &amp; Track Progress
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Run rule-based scholarship eligibility checks, save document checklists, and organize
              your applications.
            </p>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            aria-label="Close sign in dialog"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {authError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800"
            >
              {authError}
            </div>
          )}

          <button
            type="button"
            onClick={signInWithGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:border-slate-400 hover:bg-slate-50 shadow-2xs transition-all min-h-[46px]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-4 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>Privacy &amp; Data Minimization Commitment</span>
            </div>
            <p className="leading-relaxed">
              Bharat Connect never collects Aadhaar numbers, OTPs, bank passwords, or external
              portal credentials. Only optional academic and domicile fields are stored for
              eligibility pre-checks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
