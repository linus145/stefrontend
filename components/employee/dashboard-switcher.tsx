'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { EmployeeDashboard } from '@/components/employee/empdashboard/employee-dashboard';
import { ManagerDashboard } from '@/components/employee/manager/dashboard';

export function EmployeeDashboardSwitcher() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [role, setRole] = useState<'EMPLOYEE' | 'MANAGER' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if there is a demo user in localStorage first
    const storedDemoUser = localStorage.getItem('demo_employee_user');
    if (storedDemoUser) {
      try {
        const demoUser = JSON.parse(storedDemoUser);
        if (demoUser?.role === 'MANAGER') {
          setRole('MANAGER');
        } else {
          setRole('EMPLOYEE');
        }
      } catch (e) {
        setRole('EMPLOYEE');
      }
      setIsLoading(false);
      return;
    }

    // Otherwise, check the real logged-in user profile
    if (!authLoading) {
      if (isAuthenticated && user) {
        const empProfile = (user as any).profile;
        if (empProfile?.role === 'MANAGER') {
          setRole('MANAGER');
        } else {
          setRole('EMPLOYEE');
        }
      }
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, user]);

  if (isLoading || (authLoading && !localStorage.getItem('demo_employee_user'))) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#0a66c2]" />
      </div>
    );
  }

  if (role === 'MANAGER') {
    return <ManagerDashboard />;
  }

  return <EmployeeDashboard />;
}
