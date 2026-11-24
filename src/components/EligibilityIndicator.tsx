import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import type { EligibilityAssessment } from '../types/index.ts';

interface EligibilityIndicatorProps {
  assessment: EligibilityAssessment;
}

export function EligibilityIndicator({ assessment }: EligibilityIndicatorProps) {
  if (assessment.outcome === 'Potentially Eligible') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
        <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
        <span>Potentially Eligible</span>
      </span>
    );
  }

  if (assessment.outcome === 'Not Eligible') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700">
        <XCircle className="h-4 w-4 text-red-600 shrink-0" />
        <span>Not Eligible</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C46316]">
      <AlertCircle className="h-4 w-4 text-[#C46316] shrink-0" />
      <span>Insufficient Information</span>
    </span>
  );
}
