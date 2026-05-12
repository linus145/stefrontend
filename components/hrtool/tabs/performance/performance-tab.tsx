'use client';

import { useQuery } from '@tanstack/react-query';
import { hrmsService } from '@/services/hrms.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, TrendingUp, Award, MessageSquare, Star, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function PerformanceTab() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['performance-reviews'],
    queryFn: () => hrmsService.getReviews(),
  });

  const { data: goals } = useQuery({
    queryKey: ['performance-goals'],
    queryFn: () => hrmsService.getGoals(),
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Tracking</h2>
          <p className="text-sm text-muted-foreground">Monitor KPIs, goals, and employee reviews.</p>
        </div>
        <Button className="bg-[#0a66c2] hover:bg-[#004182] text-white shadow-lg shadow-blue-500/20 rounded-sm">
          <Star className="mr-2 h-4 w-4" /> New Review
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Active Goals</h3>
              <Button variant="link" className="text-blue-600 text-xs font-bold uppercase p-0 h-auto">View All</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals?.data?.results?.map((goal: any) => (
                <Card key={goal.id} className="bg-card/50 border-border/50 group hover:border-blue-500/30 transition-all rounded-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-8 h-8 rounded-sm bg-blue-500/10 flex items-center justify-center text-blue-600">
                        <Target className="h-4 w-4" />
                      </div>
                      <Badge variant="outline" className="text-[9px] uppercase border-blue-500/20 text-blue-600 rounded-sm">
                        {goal.status}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-bold truncate">{goal.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{goal.employee_detail?.first_name} {goal.employee_detail?.last_name}</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter">
                        <span>Progress</span>
                        <span className="text-blue-600">{goal.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-none overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-1000" 
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Recent Reviews</h3>
            <div className="space-y-3">
              {reviews?.data?.results?.map((review: any) => (
                <div key={review.id} className="flex items-center justify-between p-4 rounded-sm bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-sm bg-blue-500/10 flex items-center justify-center text-blue-600">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{review.employee_detail?.first_name} {review.employee_detail?.last_name}</p>
                      <p className="text-xs text-muted-foreground">Reviewed by {review.reviewer_detail?.first_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`h-3 w-3 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Rating: {review.rating}/5</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm hover:bg-blue-500/10 hover:text-blue-600">
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/50 border-border/50 rounded-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-500" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-sm bg-blue-500/5 border border-blue-500/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Top Performer</p>
                <p className="text-sm font-bold mt-1">Jane Cooper</p>
                <p className="text-xs text-muted-foreground">98% KPI Achievement</p>
              </div>
              <div className="p-4 rounded-sm bg-sky-500/5 border border-sky-500/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600">Avg. Team Score</p>
                <h4 className="text-sm font-bold mt-1">4.2 / 5.0</h4>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 rounded-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                360° Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">12 new feedbacks collected this week from peer reviews.</p>
              <Button variant="link" className="text-blue-600 p-0 h-auto text-xs font-bold uppercase tracking-wider">
                Generate Report →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
