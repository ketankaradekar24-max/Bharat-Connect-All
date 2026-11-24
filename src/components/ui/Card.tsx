import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  tone?: 'paper' | 'stone' | 'ivory';
}

export function Card({
  children,
  className = '',
  interactive = false,
  tone = 'paper',
}: CardProps) {
  const surface =
    tone === 'stone'
      ? 'bg-[#F3EFE6]'
      : tone === 'ivory'
        ? 'bg-[#FAF8F3]'
        : 'bg-white';

  return (
    <div
      className={`rounded-lg border border-[#E2DDD1] ${surface} ${
        interactive
          ? 'transition-[transform,border-color,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:border-[#BDB5A2] hover:shadow-sm'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
