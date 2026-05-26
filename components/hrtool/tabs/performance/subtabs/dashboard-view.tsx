'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrPerformanceService } from '@/services/hr';
import { toast } from 'sonner';

import { PerformanceHeader } from '../components/performance-header';
import { MetricsGrid } from '../components/metrics-grid';
import { LogsMatrixTable } from '../components/logs-matrix-table';
import { ScoreBreakdownPanel } from '../components/score-breakdown-panel';

export function DashboardView() {
  const queryClient = useQueryClient();

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['performance-analytics'],
    queryFn: () => hrPerformanceService.getAnalytics(),
  });

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['performance-reviews'],
    queryFn: () => hrPerformanceService.getReviews(),
  });

  const calculateMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await hrPerformanceService.calculateScore(reviewId);
      return res.data || res;
    },
    onSuccess: () => {
      toast.success('Performance score calculated successfully.');
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['performance-analytics'] });
    },
    onError: () => {
      toast.error('Failed to calculate performance score.');
    }
  });

  // Calculate high-level stats from the reviews data
  const reviews = reviewsData?.data?.results || [];
  const calculatedReviews = reviews.filter((r: any) => r.score_breakdown);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <PerformanceHeader />

      <MetricsGrid 
        analytics={analyticsData} 
        isLoading={analyticsLoading} 
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <LogsMatrixTable 
            reviews={reviews} 
            isLoading={reviewsLoading} 
            onCalculate={(id) => calculateMutation.mutate(id)}
            isCalculating={calculateMutation.isPending}
          />
        </div>

        <div className="space-y-6">
          <ScoreBreakdownPanel 
            calculatedReviews={calculatedReviews}
            analytics={analyticsData}
          />
        </div>
      </div>
    </div>
  );
}
