'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrPerformanceService } from '@/services/hr';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Target, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export function KpiOverviewView() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('');

  const { data: kpisData, isLoading } = useQuery({
    queryKey: ['performance-kpis'],
    queryFn: () => hrPerformanceService.getKPIs(),
  });

  const kpis = kpisData?.data?.results || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => hrPerformanceService.createKPI(data),
    onSuccess: () => {
      toast.success('KPI created successfully.');
      queryClient.invalidateQueries({ queryKey: ['performance-kpis'] });
      setIsCreateOpen(false);
      setName('');
      setDescription('');
      setTargetValue('');
      setUnit('');
    },
    onError: () => {
      toast.error('Failed to create KPI.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => hrPerformanceService.deleteKPI(id),
    onSuccess: () => {
      toast.success('KPI deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['performance-kpis'] });
    },
    onError: () => {
      toast.error('Failed to delete KPI.');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('KPI Name is required.');
      return;
    }
    createMutation.mutate({
      name,
      description,
      target_value: targetValue ? parseFloat(targetValue) : null,
      unit,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">KPI Overview</h2>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-[#0a66c2] hover:bg-[#004182] text-white shadow-lg shadow-blue-500/20 rounded-sm"
          data-agent="performance-new-kpi-btn"
        >
          <Plus className="mr-2 h-4 w-4" /> New KPI
        </Button>
      </div>

      <Card className="bg-card/50 border-border/50 overflow-hidden rounded-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[9px] text-muted-foreground uppercase bg-muted/10 border-b border-border/50">
              <tr>
                <th className="px-4 py-2 font-bold">KPI Name</th>
                <th className="px-4 py-2 font-bold">Description</th>
                <th className="px-4 py-2 font-bold">Target</th>
                <th className="px-4 py-2 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-xs text-muted-foreground">
                    Loading KPIs...
                  </td>
                </tr>
              ) : kpis.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-xs text-muted-foreground">
                    No KPIs defined yet.
                  </td>
                </tr>
              ) : (
                kpis.map((kpi: any) => (
                  <tr key={kpi.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-3.5 w-3.5 text-blue-500" />
                        <span className="font-semibold text-xs text-foreground">{kpi.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground text-[11px]">{kpi.description}</td>
                    <td className="px-4 py-2 font-bold text-[11px]">
                      {kpi.target_value ? `${kpi.target_value} ${kpi.unit}` : '--'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            toast('Delete this KPI configuration?', {
                              description: 'This action cannot be undone.',
                              action: {
                                label: 'Delete',
                                onClick: () => deleteMutation.mutate(kpi.id),
                              },
                              cancel: {
                                label: 'Cancel',
                                onClick: () => {},
                              },
                            });
                          }}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 h-7 w-7 rounded-sm flex items-center justify-center"
                          data-agent={`performance-delete-kpi-btn-${kpi.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="w-full max-w-[480px] max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-card border border-border/50 rounded-sm shadow-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Create New KPI</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define a new performance standard key indicator.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="name">
                KPI Name *
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sales Conversion Rate"
                className="rounded-sm bg-background border-input"
                required
                data-agent="new-kpi-name-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="description">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this KPI measures and how it is evaluated..."
                className="rounded-sm bg-background border-input min-h-[80px]"
                data-agent="new-kpi-desc-textarea"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="targetValue">
                  Target Value
                </label>
                <Input
                  id="targetValue"
                  type="number"
                  step="0.01"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="e.g. 85.00"
                  className="rounded-sm bg-background border-input"
                  data-agent="new-kpi-target-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="unit">
                  Unit
                </label>
                <Input
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. % or USD"
                  className="rounded-sm bg-background border-input"
                  data-agent="new-kpi-unit-input"
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-sm border-input hover:bg-slate-50 text-slate-700"
                data-agent="new-kpi-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-[#0a66c2] hover:bg-[#004182] text-white rounded-sm shadow-md"
                data-agent="new-kpi-submit-btn"
              >
                {createMutation.isPending ? 'Creating...' : 'Create KPI'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
