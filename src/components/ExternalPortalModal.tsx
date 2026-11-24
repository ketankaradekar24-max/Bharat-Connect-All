import { ExternalLink, ShieldCheck, X } from 'lucide-react';
import { trackAnalyticsEvent } from '../lib/analytics.ts';

interface ExternalPortalModalProps {
  target: {
    title: string;
    portalName: string;
    url: string;
    isThirdParty?: boolean;
  } | null;
  onClose: () => void;
}

export function ExternalPortalModal({ target, onClose }: ExternalPortalModalProps) {
  if (!target) return null;

  let host = target.url;
  try {
    host = new URL(target.url).hostname;
  } catch {
    // keep raw string
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="external-portal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
    >
      <div className="animate-modal-enter w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#C46316]">Leaving Bharat Connect</p>
            <h2
              id="external-portal-title"
              className="mt-1 font-display text-lg font-bold text-[#0B192C]"
            >
              Proceed to Official Destination
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close redirect confirmation"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5 text-xs">
          <p className="font-semibold text-[#0B192C]">{target.portalName}</p>
          <p className="font-mono text-[#134E7A] break-all">{host}</p>
          {target.isThirdParty && (
            <p className="text-[#C46316] font-medium pt-1">
              Notice: This is an authorized partner portal rather than a direct `.gov.in` domain.
            </p>
          )}
        </div>

        <div className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
          <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
          <p>
            Complete all authentication, Aadhaar/OTP checks, document uploads, and official fee
            payments strictly on the destination website. Bharat Connect never collects passwords or
            payments.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 min-h-[40px]"
          >
            Stay on Bharat Connect
          </button>
          <a
            href={target.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackAnalyticsEvent('portal_click', window.location.pathname, host);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#134E7A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0D3B5E] min-h-[40px]"
          >
            <span>Open {host}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
