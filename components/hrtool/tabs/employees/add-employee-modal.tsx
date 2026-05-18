'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { hrmsService } from '@/services/hrms.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface AddEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddEmployeeModal({ open, onOpenChange }: AddEmployeeModalProps) {
  const queryClient = useQueryClient();
  const [newEmployee, setNewEmployee] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    employment_type: 'FULL_TIME'
  });

  const createEmployeeMutation = useMutation({
    mutationFn: (data: any) => hrmsService.addManualEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee created successfully');
      onOpenChange(false);
      setNewEmployee({ first_name: '', last_name: '', email: '', phone: '', employment_type: 'FULL_TIME' });
    },
    onError: () => toast.error('Failed to create employee')
  });

  const handleCreateEmployee = () => {
    if (!newEmployee.first_name || !newEmployee.email) {
      toast.error('First name and email are required');
      return;
    }
    createEmployeeMutation.mutate({
      ...newEmployee,
      status: 'ACTIVE'
    });
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <Button 
          onClick={() => onOpenChange(false)}
          variant="outline" 
          className="h-10 px-4 border-border hover:bg-blue-50/30 text-muted-foreground font-bold text-xs rounded-sm gap-2 shadow-sm transition-all"
        >
          <ArrowLeft className="h-4 w-4 text-[#0a66c2]" /> Back to Directory
        </Button>
      </div>

      <Card className="border-border/40 bg-card/40 backdrop-blur-md rounded-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold tracking-tight text-[#0a66c2]">Add New Employee</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Enter the details of the new employee to add them directly to the directory.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">First Name</label>
              <Input
                value={newEmployee.first_name}
                onChange={(e) => setNewEmployee({ ...newEmployee, first_name: e.target.value })}
                data-agent="employee-first-name-input"
                className="rounded-sm bg-white"
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Last Name</label>
              <Input
                value={newEmployee.last_name}
                onChange={(e) => setNewEmployee({ ...newEmployee, last_name: e.target.value })}
                data-agent="employee-last-name-input"
                className="rounded-sm bg-white"
                placeholder="Doe"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
            <Input
              value={newEmployee.email}
              onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
              data-agent="employee-email-input"
              className="rounded-sm bg-white"
              placeholder="john.doe@example.com"
              type="email"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Phone Number</label>
            <Input
              value={newEmployee.phone}
              onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
              data-agent="employee-phone-input"
              className="rounded-sm bg-white"
              placeholder="+1 234 567 8900"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Employment Type</label>
            <select
              value={newEmployee.employment_type}
              onChange={(e) => setNewEmployee({ ...newEmployee, employment_type: e.target.value })}
              data-agent="employee-type-select"
              className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="FULL_TIME">Permanent</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERN">Intern</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border/30 mt-6">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="rounded-sm h-10 px-5 text-xs font-bold border-border"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateEmployee} 
              disabled={createEmployeeMutation.isPending}
              data-agent="employee-submit-button"
              className="bg-[#0a66c2] text-white hover:bg-[#004182] rounded-sm h-10 px-5 text-xs font-bold shadow-sm"
            >
              {createEmployeeMutation.isPending ? 'Saving...' : 'Add Employee'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
