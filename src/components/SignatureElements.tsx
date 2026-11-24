import { CalendarClock, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

export interface DeadlineUrgencyProps {
  dateStr?: string | null;
  fallbackText?: string | null;
}

export function getDeadlineStatus(dateStr?: string | null): {
  label: string;
  toneClass: string;
  urgency: 'closing' | 'week' | 'month' | 'upcoming' | 'rolling';
} {
  if (!dateStr) {
    return {
      label: 'Official cycle',
      toneClass: 'text-[#475467]',
      urgency: 'rolling',
    };
  }

  const parsed = Date.parse(dateStr);
  if (Number.isNaN(parsed)) {
    return {
      label: dateStr,
      toneClass: 'text-[#475467]',
      urgency: 'rolling',
    };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((parsed - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `Cycle window (${dateStr})`,
      toneClass: 'text-[#5C6573]',
      urgency: 'rolling',
    };
  }
  if (diffDays <= 7) {
    return {
      label: diffDays === 0 ? 'Closes today' : `Closing in ${diffDays}d`,
      toneClass: 'text-[#B45309] font-semibold',
      urgency: 'closing',
    };
  }
  if (diffDays <= 30) {
    return {
      label: `This month · ${dateStr}`,
      toneClass: 'text-[#C46316] font-semibold',
      urgency: 'month',
    };
  }
  return {
    label: `Upcoming · ${dateStr}`,
    toneClass: 'text-[#0E6B6E] font-medium',
    urgency: 'upcoming',
  };
}

export function DeadlineUrgency({ dateStr, fallbackText }: DeadlineUrgencyProps) {
  const status = getDeadlineStatus(dateStr);
  const displayText =
    status.urgency === 'rolling' && fallbackText ? fallbackText : status.label;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs tabular-nums ${status.toneClass}`}>
      <CalendarClock className="h-3.5 w-3.5 shrink-0" />
      <span>{displayText}</span>
    </span>
  );
}

interface TrustStripProps {
  sourceName?: string | null;
  verifiedAt?: string | null;
  isOfficial?: boolean;
  className?: string;
}

export function TrustStrip({
  sourceName,
  verifiedAt,
  isOfficial = true,
  className = '',
}: TrustStripProps) {
  const formattedDate = verifiedAt
    ? new Date(verifiedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div
      className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#5C6573] ${className}`}
    >
      <span className="inline-flex items-center gap-1 font-semibold text-[#0E6B6E]">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
        <span>{isOfficial ? 'Official Source' : 'Verified Guide'}</span>
      </span>
      {sourceName && (
        <>
          <span aria-hidden="true">·</span>
          <span className="text-[#475467]">{sourceName}</span>
        </>
      )}
      {formattedDate && (
        <>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Clock className="h-3 w-3 shrink-0" />
            <span>Verified {formattedDate}</span>
          </span>
        </>
      )}
    </div>
  );
}

export type JourneyStage = 'Discover' | 'Prepare' | 'Apply' | 'Track' | 'Complete';

const STAGES: Array<{ id: JourneyStage; desc: string }> = [
  { id: 'Discover', desc: 'Verify eligibility & official domain' },
  { id: 'Prepare', desc: 'Assemble required documents' },
  { id: 'Apply', desc: 'Submit on official .gov.in portal' },
  { id: 'Track', desc: 'Save ref ID & reminders' },
  { id: 'Complete', desc: 'Allotment, card or disbursement' },
];

export function ApplicationJourneyBar({
  activeStage = 'Prepare',
  compact = false,
}: {
  activeStage?: JourneyStage;
  compact?: boolean;
}) {
  const activeIdx = STAGES.findIndex((s) => s.id === activeStage);

  return (
    <div className="rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="text-xs font-semibold text-[#0B192C]">Application Journey</p>
        <p className="font-mono text-[11px] text-[#5C6573] tabular-nums">
          Stage {activeIdx + 1} of {STAGES.length}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {STAGES.map((stage, idx) => {
          const done = idx < activeIdx;
          const current = idx === activeIdx;
          return (
            <div
              key={stage.id}
              className={`relative flex flex-col gap-1 border-t-2 pt-2.5 ${
                current
                  ? 'border-[#C46316]'
                  : done
                    ? 'border-[#0E6B6E]'
                    : 'border-[#E2DDD1]'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`font-mono text-[11px] font-semibold tabular-nums ${
                    current
                      ? 'text-[#C46316]'
                      : done
                        ? 'text-[#0E6B6E]'
                        : 'text-[#7A828F]'
                  }`}
                >
                  0{idx + 1}
                </span>
                {done && <CheckCircle2 className="h-3.5 w-3.5 text-[#0E6B6E]" />}
              </div>
              <p
                className={`text-xs font-bold ${
                  current || done ? 'text-[#0B192C]' : 'text-[#5C6573]'
                }`}
              >
                {stage.id}
              </p>
              {!compact && <p className="text-[11px] leading-snug text-[#5C6573]">{stage.desc}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
