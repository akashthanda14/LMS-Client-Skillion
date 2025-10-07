import { cva } from 'class-variance-authority';

export const buttonVariants = cva('inline-flex items-center justify-center rounded-lg font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2', {
  variants: {
    variant: {
      default: 'bg-[var(--surface)] text-slate-900 border border-[var(--surface-border)]',
      primary: 'bg-[var(--brand-500)] text-white shadow-md',
      ghost: 'bg-transparent text-[var(--brand-600)]',
      destructive: 'bg-[var(--destructive)] text-white',
    },
    size: {
      sm: 'px-3 py-1.5 text-sm',
      default: 'px-4 py-2',
      lg: 'px-6 py-3 text-base',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export const badgeVariants = cva('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', {
  variants: {
    variant: {
      default: 'bg-gray-100 text-gray-800',
      primary: 'bg-[var(--brand-500)] text-white',
      outline: 'bg-transparent border border-[var(--surface-border)] text-slate-900',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
