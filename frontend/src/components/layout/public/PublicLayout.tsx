import type { ReactNode } from 'react';

import { PublicFooter } from '@/components/layout/public/PublicFooter';
import { PublicHeader } from '@/components/layout/public/PublicHeader';
import { UrgencyBanner } from '@/components/common/UrgencyBanner';
import { SocialProofTicker } from '@/components/common/SocialProofTicker';

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* Urgency Banner — static, sits at very top in document flow */}
      <UrgencyBanner />

      {/* Sticky header — sticks right below the banner */}
      <div className="sticky top-0 z-50">
        <PublicHeader />
      </div>

      {/* Main content — no extra padding needed, header is in flow */}
      <main className="flex-1">{children}</main>

      <PublicFooter />

      {/* Social proof floating ticker */}
      <SocialProofTicker />
    </div>
  );
}
