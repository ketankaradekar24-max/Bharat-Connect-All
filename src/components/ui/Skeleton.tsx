interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg border border-[#E2DDD1] bg-[#EAE4D7]/60 ${className}`}
    />
  );
}
