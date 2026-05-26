'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrPerformanceService, hrEmployeeService } from '@/services/hr';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calculator, FileText, User, MessageSquare, Award } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface LogsMatrixTableProps {
  reviews: any[];
  isLoading: boolean;
  onCalculate: (id: string) => void;
  isCalculating: boolean;
}

export function LogsMatrixTable({ reviews, isLoading, onCalculate, isCalculating }: LogsMatrixTableProps) {
  const queryClient = useQueryClient();

  // State for Feedbacks
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [selectedReviewForFeedback, setSelectedReviewForFeedback] = useState<any>(null);
  const [providerId, setProviderId] = useState('');
  const [feedbackType, setFeedbackType] = useState('peer');
  const [feedbackRating, setFeedbackRating] = useState(4);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState('false');

  // State for Competency Scores
  const [isCompetencyOpen, setIsCompetencyOpen] = useState(false);
  const [selectedReviewForCompetency, setSelectedReviewForCompetency] = useState<any>(null);
  const [competencyId, setCompetencyId] = useState('');
  const [competencyScore, setCompetencyScore] = useState(4);
  const [competencyWeight, setCompetencyWeight] = useState(100);

  // Queries
  const { data: employeesData } = useQuery({
    queryKey: ['employees-list'],
    queryFn: () => hrEmployeeService.getEmployees({ page_size: 100 }),
    enabled: isFeedbackOpen,
  });
  const employees = employeesData?.data?.results || [];

  const { data: competenciesData } = useQuery({
    queryKey: ['performance-competencies'],
    queryFn: () => hrPerformanceService.getCompetencies(),
    enabled: isCompetencyOpen,
  });
  const competencies = competenciesData?.data?.results || [];

  // Mutations
  const feedbackMutation = useMutation({
    mutationFn: (data: any) => hrPerformanceService.createFeedback(data),
    onSuccess: () => {
      toast.success('360 Feedback submitted successfully.');
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      setIsFeedbackOpen(false);
      setProviderId('');
      setFeedbackType('peer');
      setFeedbackRating(4);
      setFeedbackContent('');
      setIsAnonymous('false');
    },
    onError: () => {
      toast.error('Failed to submit feedback.');
    },
  });

  const competencyScoreMutation = useMutation({
    mutationFn: (data: any) => hrPerformanceService.createCompetencyScore(data),
    onSuccess: () => {
      toast.success('Competency score submitted successfully.');
      queryClient.invalidateQueries({ queryKey: ['performance-reviews'] });
      setIsCompetencyOpen(false);
      setCompetencyId('');
      setCompetencyScore(4);
      setCompetencyWeight(100);
    },
    onError: () => {
      toast.error('Failed to submit competency score.');
    },
  });

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerId || !feedbackContent || !selectedReviewForFeedback) {
      toast.error('Please fill in all required fields.');
      return;
    }
    feedbackMutation.mutate({
      review: selectedReviewForFeedback.id,
      provider: providerId,
      feedback_type: feedbackType,
      rating: feedbackRating,
      content: feedbackContent,
      is_anonymous: isAnonymous === 'true',
    });
  };

  const handleCompetencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!competencyId || !selectedReviewForCompetency) {
      toast.error('Please select a competency.');
      return;
    }
    competencyScoreMutation.mutate({
      review: selectedReviewForCompetency.id,
      competency: competencyId,
      score: competencyScore,
      weight: competencyWeight,
    });
  };

  const openFeedback = (review: any) => {
    setSelectedReviewForFeedback(review);
    setIsFeedbackOpen(true);
  };

  const openCompetency = (review: any) => {
    setSelectedReviewForCompetency(review);
    setIsCompetencyOpen(true);
  };

  return (
    <Card className="bg-card/50 border-border/50 rounded-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Actionable Logs Matrix</h3>
        <Badge variant="secondary" className="text-[10px] uppercase font-bold">Appraisal Periods</Badge>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-muted-foreground uppercase bg-muted/10">
            <tr>
              <th className="px-6 py-3 font-bold">Employee</th>
              <th className="px-6 py-3 font-bold">Period</th>
              <th className="px-6 py-3 font-bold">Status</th>
              <th className="px-6 py-3 font-bold text-center">Final Score</th>
              <th className="px-6 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                  Loading reviews...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                  No performance reviews found.
                </td>
              </tr>
            ) : (
              reviews.map((review: any) => (
                <tr key={review.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {review.employee_detail ? `${review.employee_detail.first_name} ${review.employee_detail.last_name}` : 'Unknown Employee'}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Rev: {review.reviewer_detail ? `${review.reviewer_detail.first_name} ${review.reviewer_detail.last_name}` : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-xs text-foreground">
                      {review.cycle_detail ? review.cycle_detail.name : 'Ad-hoc Cycle'}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Due: {review.cycle_detail ? review.cycle_detail.due_date : review.review_period_end}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={`text-[9px] uppercase font-bold ${
                      review.status === 'SUBMITTED' ? 'border-emerald-500/20 text-emerald-600 bg-emerald-500/5' :
                      review.status === 'DRAFT' ? 'border-amber-500/20 text-amber-600 bg-amber-500/5' :
                      'border-blue-500/20 text-blue-600 bg-blue-500/5'
                    }`}>
                      {review.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {review.score_breakdown ? (
                      <div className="font-bold text-[#0a66c2] text-sm">{parseFloat(review.score_breakdown.final_calculated_score).toFixed(1)}%</div>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-muted-foreground/60 italic">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-[10px] font-bold uppercase rounded-sm cursor-pointer"
                        onClick={() => openFeedback(review)}
                        title="Add 360 Feedback"
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-1 text-slate-500" /> Feedback
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-[10px] font-bold uppercase rounded-sm cursor-pointer"
                        onClick={() => openCompetency(review)}
                        title="Rate Competencies"
                      >
                        <Award className="h-3.5 w-3.5 mr-1 text-slate-500" /> Rate
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-[10px] font-bold uppercase rounded-sm bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 cursor-pointer"
                        onClick={() => onCalculate(review.id)}
                        disabled={isCalculating}
                      >
                        <Calculator className="mr-1 h-3.5 w-3.5" /> Calc
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add 360 Feedback Dialog */}
      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-border rounded-sm shadow-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Add 360 Feedback</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Submit peer or manager review ratings for: <span className="font-semibold text-slate-750">"{selectedReviewForFeedback?.employee_detail ? `${selectedReviewForFeedback.employee_detail.first_name} ${selectedReviewForFeedback.employee_detail.last_name}` : ''}"</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFeedbackSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="feedbackProvider">
                  Feedback Provider *
                </label>
                <select
                  id="feedbackProvider"
                  value={providerId}
                  onChange={(e) => setProviderId(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  required
                >
                  <option value="">Select Employee...</option>
                  {employees.map((emp: any) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="feedbackType">
                  Feedback Type
                </label>
                <select
                  id="feedbackType"
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="peer">Peer Review</option>
                  <option value="manager">Manager Review</option>
                  <option value="self">Self Appraisal</option>
                  <option value="direct_report">Direct Report</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="feedbackRating">
                  Rating (1-5) *
                </label>
                <Input
                  id="feedbackRating"
                  type="number"
                  min="1"
                  max="5"
                  value={feedbackRating}
                  onChange={(e) => setFeedbackRating(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="rounded-sm bg-white border-input"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="isAnonymous">
                  Anonymity
                </label>
                <select
                  id="isAnonymous"
                  value={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="false">Show Provider Name</option>
                  <option value="true">Anonymous Feedback</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="feedbackContent">
                Feedback Content *
              </label>
              <Textarea
                id="feedbackContent"
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                placeholder="Share constructive feedback, strengths, and areas of improvement..."
                className="rounded-sm bg-white border-input min-h-[80px]"
                required
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFeedbackOpen(false)}
                className="rounded-sm border-input hover:bg-slate-50 text-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={feedbackMutation.isPending}
                className="bg-[#0a66c2] hover:bg-[#004182] text-white rounded-sm shadow-md"
              >
                {feedbackMutation.isPending ? 'Submitting...' : 'Save Feedback'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rate Competencies Dialog */}
      <Dialog open={isCompetencyOpen} onOpenChange={setIsCompetencyOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-border rounded-sm shadow-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Rate Core Competencies</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Rate reviewee on core skills for: <span className="font-semibold text-slate-750">"{selectedReviewForCompetency?.employee_detail ? `${selectedReviewForCompetency.employee_detail.first_name} ${selectedReviewForCompetency.employee_detail.last_name}` : ''}"</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCompetencySubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="compSelect">
                Select Competency *
              </label>
              <select
                id="compSelect"
                value={competencyId}
                onChange={(e) => setCompetencyId(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                required
              >
                <option value="">Choose competency...</option>
                {competencies.map((comp: any) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name} ({comp.category.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="compScore">
                  Competency Score (1-5) *
                </label>
                <Input
                  id="compScore"
                  type="number"
                  min="1"
                  max="5"
                  value={competencyScore}
                  onChange={(e) => setCompetencyScore(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="rounded-sm bg-white border-input"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="compWeight">
                  Score Weight (%)
                </label>
                <Input
                  id="compWeight"
                  type="number"
                  min="1"
                  max="100"
                  value={competencyWeight}
                  onChange={(e) => setCompetencyWeight(Math.min(100, Math.max(1, parseInt(e.target.value) || 100)))}
                  className="rounded-sm bg-white border-input"
                  required
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCompetencyOpen(false)}
                className="rounded-sm border-input hover:bg-slate-50 text-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={competencyScoreMutation.isPending}
                className="bg-[#0a66c2] hover:bg-[#004182] text-white rounded-sm shadow-md"
              >
                {competencyScoreMutation.isPending ? 'Submitting...' : 'Save Rating'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
