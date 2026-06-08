"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function CreditsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard?section=credits');
      } else {
        router.replace('/login?redirect=/dashboard?section=credits');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
      <Loader2 className="w-8 h-8 text-[#0a66c2] animate-spin" />
    </div>
  );
}
