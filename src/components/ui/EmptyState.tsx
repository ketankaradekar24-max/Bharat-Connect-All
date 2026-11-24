import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-[#E2DDD1] bg-white px-6 py-12 text-center">
      {icon && (
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-[#E2DDD1] bg-[#FAF8F3] text-[#4B5565]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-[#0B192C]">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-[#4B5565] leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
