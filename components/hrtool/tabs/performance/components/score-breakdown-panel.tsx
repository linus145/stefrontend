'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, BarChart2 } from 'lucide-react';
import { PerformanceAnalytics } from '@/types/performance';

interface ScoreBreakdownPanelProps {
  calculatedReviews: any[];
  analytics?: PerformanceAnalytics;
}

export function ScoreBreakdownPanel({ calculatedReviews, analytics }: ScoreBreakdownPanelProps) {
  const hasBreakdowns = calculatedReviews && calculatedReviews.length > 0;

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border/50 rounded-sm h-full flex flex-col">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#0a66c2]" />
            Score Distribution & Breakdowns
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col">
          {!hasBreakdowns ? (
            <div className="p-8 flex flex-col items-center justify-center h-full text-center space-y-4">
              <BarChart2 className="h-12 w-12 text-muted-foreground/30" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold">No Individual Data</h4>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                  Calculate review scores to see individual vector breakdowns and 9-box placement.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {/* 9-Box Macro Summary Header */}
              {analytics?.distribution9Box && (
                <div className="p-4 bg-muted/10 border-b border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    9-Box Enterprise Distribution
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 text-center rounded-sm">
                      <span className="text-xs font-bold text-emerald-600">{analytics.distribution9Box.highPerformanceHighPotential}</span>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-2 text-center rounded-sm">
                      <span className="text-xs font-bold text-emerald-600">{analytics.distribution9Box.medPerformanceHighPotential}</span>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 p-2 text-center rounded-sm">
                      <span className="text-xs font-bold text-amber-600">{analytics.distribution9Box.lowPerformanceHighPotential}</span>
                    </div>
                    
                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-2 text-center rounded-sm">
                      <span className="text-xs font-bold text-emerald-600">{analytics.distribution9Box.highPerformanceMedPotential}</span>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 p-2 text-center rounded-sm">
                      <span className="text-xs font-bold text-blue-600">{analytics.distribution9Box.medPerformanceMedPotential}</span>
                    </div>
                    <div className="bg-amber-500/5 border border-amber-500/20 p-2 text-center rounded-sm">
                      <span className="text-xs font-bold text-amber-600">{analytics.distribution9Box.lowPerformanceMedPotential}</span>
                    </div>
                    
                    <div className="bg-amber-500/10 border border-amber-500/20 p-2 text-center rounded-sm">
                      <span className="text-xs font-bold text-amber-600">{analytics.distribution9Box.highPerformanceLowPotential}</span>
                    </div>
                    <div className="bg-amber-500/5 border border-amber-500/20 p-2 text-center rounded-sm">
                      <span className="text-xs font-bold text-amber-600">{analytics.distribution9Box.medPerformanceLowPotential}</span>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 p-2 text-center rounded-sm">
                      <span className="text-xs font-bold text-rose-600">{analytics.distribution9Box.lowPerformanceLowPotential}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[8px] uppercase tracking-widest text-muted-foreground mt-1 px-1">
                    <span>Low Perf</span>
                    <span>High Perf</span>
                  </div>
                </div>
              )}

              {calculatedReviews.slice(0, 4).map((review: any) => (
                <div key={`breakdown-${review.id}`} className="p-4 hover:bg-muted/10 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold">{review.employee_detail?.first_name} {review.employee_detail?.last_name}</span>
                    <Badge className="text-[9px] bg-[#0a66c2]">{review.score_breakdown.final_calculated_score}% Total</Badge>
                  </div>
                  
                  {/* OKR Vector */}
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <span>Performance (Goals/Core)</span>
                      <span>{parseFloat(review.score_breakdown.avg_goal_progress).toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-sm overflow-hidden flex">
                      <div 
                        className="bg-emerald-500 transition-all duration-1000" 
                        style={{ width: `${review.score_breakdown.avg_goal_progress}%` }} 
                      />
                    </div>
                  </div>

                  {/* Feedback Vector */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <span>Potential (360/Leadership)</span>
                      <span>{parseFloat(review.score_breakdown.avg_feedback_rating).toFixed(1)}/5.0</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-sm overflow-hidden flex">
                      <div 
                        className="bg-amber-500 transition-all duration-1000" 
                        style={{ width: `${(review.score_breakdown.avg_feedback_rating / 5) * 100}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
