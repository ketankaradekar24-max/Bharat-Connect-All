import { useId } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { BC_EASE } from './MotionPrimitives.tsx';

export interface TabOption<T extends string> {
  id: T;
  label: string;
  count?: number;
}

interface TabsProps<T extends string> {
  options: readonly TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
}

export function Tabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel = 'Section tabs',
}: TabsProps<T>) {
  const prefersReduced = useReducedMotion();
  const groupId = useId();

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-[#E2DDD1] bg-[#F3EFE6] p-1"
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={`relative inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[38px] ${
              active ? 'text-[#0B192C]' : 'text-[#475467] hover:text-[#0B192C]'
            }`}
          >
            {active && (
              <motion.span
                layoutId={`tab-bg-${groupId}`}
                transition={{ duration: prefersReduced ? 0 : 0.18, ease: BC_EASE }}
                className="absolute inset-0 rounded-md bg-white border border-[#E2DDD1] shadow-2xs"
              />
            )}
            <span className="relative z-10">{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={`relative z-10 font-mono text-[11px] tabular-nums ${
                  active ? 'text-[#134E7A]' : 'text-[#737C8A]'
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
