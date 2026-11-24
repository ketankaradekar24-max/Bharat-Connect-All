import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

const STYLES: Record<AlertVariant, { wrap: string; iconColor: string; Icon: typeof Info }> = {
  info: {
    wrap: 'border-[#C8DAE8] bg-[#F1F6FA] text-[#0B192C]',
    iconColor: 'text-[#134E7A]',
    Icon: Info,
  },
  success: {
    wrap: 'border-[#C4DFD6] bg-[#EFF7F4] text-[#0D3B2E]',
    iconColor: 'text-[#0E6B6E]',
    Icon: CheckCircle2,
  },
  warning: {
    wrap: 'border-[#E9D2B5] bg-[#FDF6EC] text-[#5C2E09]',
    iconColor: 'text-[#C46316]',
    Icon: AlertCircle,
  },
  error: {
    wrap: 'border-red-200 bg-red-50/85 text-red-950',
    iconColor: 'text-red-700',
    Icon: ShieldAlert,
  },
};

export function Alert({
  variant = 'info',
  title,
  children,
  action,
  className = '',
}: AlertProps) {
  const { wrap, iconColor, Icon } = STYLES[variant];
  return (
    <div
      role={variant === 'error' ? 'alert' : undefined}
      className={`flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between ${wrap} ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />
        <div className="space-y-0.5 text-xs leading-relaxed sm:text-sm">
          {title && <p className="font-semibold">{title}</p>}
          <div>{children}</div>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
