import { useState } from 'react';
import type { ReactNode } from 'react';

import { AdminHeader } from '@/components/layout/admin/AdminHeader';
import { AdminSidebar } from '@/components/layout/admin/AdminSidebar';

export function AdminLayout({ pageTitle, children }: { pageTitle: string; children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-cream-2">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader pageTitle={pageTitle} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
