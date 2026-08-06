import { Suspense } from 'react';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import InviteAcceptClient from './invite-client';

export default function InvitePage() {
  return (
    <MarketingShell>
      <Suspense fallback={<p className="p-8 text-center text-sm text-slate-500">…</p>}>
        <InviteAcceptClient />
      </Suspense>
    </MarketingShell>
  );
}
