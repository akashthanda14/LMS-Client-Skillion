import React from 'react';

export default function BrandOrbs({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="blurred-orb left-[-6rem] top-[-6rem] w-72 h-72 rounded-full bg-gradient-to-br from-[var(--brand-500)] to-[#a78bfa]" />
      <div className="blurred-orb right-[-4rem] bottom-[-4rem] w-56 h-56 rounded-full bg-gradient-to-tr from-[#34d399] to-[var(--brand-100)]" />
    </div>
  );
}
