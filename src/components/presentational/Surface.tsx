import React from 'react';

export function Surface({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`bg-[var(--surface)] border border-[var(--surface-border)] rounded-xl shadow-sm p-4 md:p-6 ${className}`}>
      {children}
    </div>
  );
}

export default Surface;
