'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrmsService } from '@/services/hrms.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Play, FileDown, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function PayrollTab() {
  const queryClient = useQueryClient();
  const { data: payrolls, isLoading } = useQuery({
    queryKey: ['payrolls'],
    queryFn: () => hrmsService.getPayrolls(),
  });

  const processMutation = useMutation({
    mutationFn: (id: string) => hrmsService.processPayroll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });
      toast.success('Payroll processed successfully');
    },
    onError: () => {
      toast.error('Failed to process payroll');
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payroll Management</h2>
          <p className="text-sm text-muted-foreground">Process monthly payroll and generate payslips.</p>
        </div>
        <Button className="bg-[#0a66c2] hover:bg-[#004182] text-white shadow-lg shadow-blue-500/20 rounded-sm">
          <Play className="mr-2 h-4 w-4" /> Start New Run
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Recent Payroll Runs</h3>
          {payrolls?.data?.results?.map((run: any) => (
            <Card key={run.id} className="bg-card/50 border-border/50 hover:border-blue-500/30 transition-all group rounded-sm">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-sm bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold">{run.month_name} {run.year}</h4>
                      <p className="text-xs text-muted-foreground">Processed on {new Date(run.processed_at || run.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">₹{run.total_net_amount?.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Disbursed</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {run.status === 'processed' ? (
                        <Button variant="outline" size="sm" className="text-xs h-8 border-blue-500/20 text-blue-600 hover:bg-blue-500/5 rounded-sm">
                          <FileDown className="mr-1.5 h-3.5 w-3.5" /> Reports
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          className="h-8 bg-[#0a66c2] hover:bg-[#004182] rounded-sm"
                          onClick={() => processMutation.mutate(run.id)}
                          disabled={processMutation.isPending}
                        >
                          <Play className="mr-1.5 h-3.5 w-3.5" /> Process
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="bg-[#0a66c2] text-white border-none shadow-xl shadow-blue-500/20 overflow-hidden relative rounded-sm">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CreditCard className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-50">
                <CheckCircle2 className="h-5 w-5" />
                Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] text-blue-100 uppercase font-bold tracking-widest">Next TD/PF Filing</p>
              <h3 className="text-2xl font-bold mt-1">May 15, 2026</h3>
              <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-none text-[10px] rounded-sm">On Track</Badge>
                <span className="text-xs text-blue-100">All reports generated</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 rounded-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Missing Structures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">3 employees are missing salary structures and won't be included in next run.</p>
              <Button variant="link" className="text-blue-600 p-0 h-auto text-xs font-bold uppercase tracking-wider">
                Fix Now →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
