import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-navy/15 bg-white/60 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-2 text-pink-deep">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <div>
        <p className="font-display text-xl font-semibold text-navy">{title}</p>
        {description && <p className="mx-auto mt-1 max-w-sm text-sm text-navy-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}
