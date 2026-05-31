'use client';

import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

export function PerformanceHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Performance tracking</h2>
      </div>
      <div className="flex gap-2">
        <Button data-agent="performance-bulk-actions-btn" variant="outline" className="shadow-sm rounded-sm">
          Bulk Actions
        </Button>
        <Button data-agent="performance-new-review-btn" className="bg-[#0a66c2] hover:bg-[#004182] text-white shadow-lg shadow-blue-500/20 rounded-sm">
          <Star className="mr-2 h-4 w-4" /> New Review
        </Button>
      </div>
    </div>
  );
}
