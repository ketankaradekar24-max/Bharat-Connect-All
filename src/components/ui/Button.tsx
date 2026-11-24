import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'navy' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[#134E7A] text-white hover:bg-[#0D3B5E] border border-transparent shadow-2xs',
  navy: 'bg-[#0B192C] text-white hover:bg-[#132842] border border-transparent shadow-2xs',
  secondary:
    'bg-[#F3EFE6] text-[#0B192C] hover:bg-[#EAE4D7] border border-[#DFD9CA]',
  outline:
    'bg-white text-[#0B192C] border border-[#CFC8B8] hover:border-[#0B192C]/50 hover:bg-[#FAF8F3]',
  ghost:
    'bg-transparent text-[#475467] hover:bg-[#F3EFE6] hover:text-[#0B192C] border border-transparent',
  danger:
    'bg-white text-red-700 border border-red-200 hover:bg-red-50 hover:border-red-300',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-[38px] px-3.5 py-1.5 text-xs',
  md: 'min-h-[42px] px-4 py-2 text-sm',
  lg: 'min-h-[46px] px-5 py-2.5 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-[transform,background-color,border-color,color] duration-150 ease-out active:scale-[0.985] disabled:opacity-55 disabled:pointer-events-none whitespace-nowrap shrink-0 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
