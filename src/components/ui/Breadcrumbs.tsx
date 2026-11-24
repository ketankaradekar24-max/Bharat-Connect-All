interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  navigate: (path: string) => void;
}

export function Breadcrumbs({ items, navigate }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-[#5C6573]">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={`${item.label}-${idx}`} className="inline-flex items-center gap-2">
            {idx > 0 && (
              <span className="text-[#BDB5A2] select-none" aria-hidden="true">
                /
              </span>
            )}
            {item.path && !isLast ? (
              <button
                type="button"
                onClick={() => navigate(item.path!)}
                className="font-medium text-[#5C6573] hover:text-[#134E7A] transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span
                className={
                  isLast ? 'font-semibold text-[#0B192C] truncate max-w-[260px] sm:max-w-md' : ''
                }
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
