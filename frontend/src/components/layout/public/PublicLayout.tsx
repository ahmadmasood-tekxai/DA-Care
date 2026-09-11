import type { ReactNode } from 'react';

import { PublicFooter } from '@/components/layout/public/PublicFooter';
import { PublicHeader } from '@/components/layout/public/PublicHeader';

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <PublicHeader />
      <main className="flex-1 pt-[72px]">{children}</main>
      <PublicFooter />
    </div>
  );
}
