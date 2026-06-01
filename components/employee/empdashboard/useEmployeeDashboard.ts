'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrAttendanceService, hrLeaveService, hrEmployeeService, hrPerformanceService } from '@/services/hr';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useDashboardTheme } from '@/context/DashboardThemeContext';
import { toast } from 'sonner';
import { format, differenceInSeconds } from 'date-fns';

export function useEmployeeDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const { theme, toggleTheme, isDark } = useDashboardTheme();

  // State for demo mode
  const [isDemo, setIsDemo] = useState(false);
  const [demoUser, setDemoUser] = useState<any>(null);

  // Real-time time elapsed tracking
  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Leave requests dialog/drawer state
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState(''); // Selected leave category ID (UUID)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  // Credentials modal state
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [newPortalUsername, setNewPortalUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingCredentials, setIsSubmittingCredentials] = useState(false);

  // Mock data states for Demo mode
  const [demoAttendance, setDemoAttendance] = useState([
    { id: '1', date: '2026-05-18', status: 'present', total_work_hours: '8.5', location_in: 'Office', time_in: '09:02 AM', time_out: '05:32 PM' },
    { id: '2', date: '2026-05-17', status: 'present', total_work_hours: '9.0', location_in: 'Remote', time_in: '08:55 AM', time_out: '05:55 PM' },
    { id: '3', date: '2026-05-16', status: 'present', total_work_hours: '8.2', location_in: 'Office', time_in: '09:12 AM', time_out: '05:24 PM' },
  ]);

  const [demoLeaves, setDemoLeaves] = useState([
    { id: 'l1', start_date: '2026-06-10', end_date: '2026-06-12', total_days: 3, leave_type_name: 'Casual Leave', status: 'Pending', reason: 'Personal work at hometown' },
    { id: 'l2', start_date: '2026-04-05', end_date: '2026-04-06', total_days: 2, leave_type_name: 'Sick Leave', status: 'Approved', reason: 'Fever recovery' },
  ]);

  const [demoBalances, setDemoBalances] = useState([
    { id: 'b1', leave_type_name: 'Annual Leave', remaining_days: 14, total_days: 18, leave_type: 'b1' },
    { id: 'b2', leave_type_name: 'Sick Leave', remaining_days: 8, total_days: 10, leave_type: 'b2' },
    { id: 'b3', leave_type_name: 'Casual Leave', remaining_days: 5, total_days: 7, leave_type: 'b3' },
    { id: 'b4', leave_type_name: 'Maternity/Paternity', remaining_days: 30, total_days: 30, leave_type: 'b4' },
  ]);

  // Quick review approvals (subordinates for quick check option)
  const [demoApprovals, setDemoApprovals] = useState([
    { id: 'req1', name: 'Jane Cooper', type: 'Sick Leave Request', duration: '2 days (May 20 - May 21)', reason: 'Dental appointment & rest', isReal: false },
    { id: 'req2', name: 'Alex Carter', type: 'Manual Check-in Correction', duration: 'May 18 (09:00 AM)', reason: 'Forgot access card at home', isReal: false }
  ]);

  // Employee Goals Mock data
  const [demoGoals, setDemoGoals] = useState<any[]>([
    { id: 'g1', employee: 'demo_user_id', employee_detail: { first_name: 'David', last_name: 'Miller' }, title: 'Implement Shift Clock-In Sandbox Logic', description: 'Code the offline sandbox simulation for checking in/out on the Manager and Employee dashboards.', status: 'IN_PROGRESS', progress_percentage: 65, start_date: '2026-05-12', due_date: '2026-06-15' },
    { id: 'g2', employee: 'demo_user_id', employee_detail: { first_name: 'David', last_name: 'Miller' }, title: 'Refactor Auth Hook using TanStack Query', description: 'Standardize useAuth loading state transitions using clean mutation structures.', status: 'COMPLETED', progress_percentage: 100, start_date: '2026-05-01', due_date: '2026-05-10' },
    { id: 'g3', employee: 'demo_user_id', employee_detail: { first_name: 'David', last_name: 'Miller' }, title: 'Integrate Interactive Subordinates Leaves Ledger', description: 'Build interactive approvals lists with Approve and Reject hooks on the manager panel.', status: 'PENDING', progress_percentage: 0, start_date: '2026-05-25', due_date: '2026-06-25' }
  ]);

  // Employee Goals Progress Update Modal States
  const [isUpdateGoalOpen, setIsUpdateGoalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [updateGoalStatus, setUpdateGoalStatus] = useState('PENDING');
  const [updateGoalProgress, setUpdateGoalProgress] = useState(0);

  // Check login and demo mode status on mount
  useEffect(() => {
    setCurrentDateTime(new Date());
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    const storedDemoUser = localStorage.getItem('demo_employee_user');
    if (storedDemoUser) {
      setIsDemo(true);
      setDemoUser(JSON.parse(storedDemoUser));

      // Load check-in state from localStorage for demo mode!
      const storedCheckedIn = localStorage.getItem('demo_employee_isCheckedIn') === 'true';
      const storedCheckInTime = localStorage.getItem('demo_employee_checkInTime');
      if (storedCheckedIn && storedCheckInTime) {
        setIsCheckedIn(true);
        setCheckInTime(new Date(storedCheckInTime));
      }

      // Load demo goals
      const storedGoals = localStorage.getItem('demo_performance_goals');
      if (storedGoals) {
        setDemoGoals(JSON.parse(storedGoals));
      } else {
        localStorage.setItem('demo_performance_goals', JSON.stringify(demoGoals));
      }
    } else if (!authLoading && !isAuthenticated) {
      router.replace('/employee/login');
    }

    return () => clearInterval(timer);
  }, [authLoading, isAuthenticated, router]);

  // Live timer for active check-in session
  useEffect(() => {
    let intervalId: any;
    if (isCheckedIn && checkInTime) {
      intervalId = setInterval(() => {
        const diff = differenceInSeconds(new Date(), checkInTime);
        setElapsedSeconds(diff >= 0 ? diff : 0);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(intervalId);
  }, [isCheckedIn, checkInTime]);

  // Real Queries & Mutations (Active when not in demo mode)
  const { data: realAttendance } = useQuery({
    queryKey: ['employee-attendance'],
    queryFn: () => hrAttendanceService.getAttendance(),
    enabled: !isDemo && isAuthenticated,
    refetchInterval: 3000,
  });

  // Synchronize check-in status from real backend attendance data
  useEffect(() => {
    if (realAttendance?.data?.results) {
      const records = realAttendance.data.results;
      // Look at all records to find if there is an active session (where check_out is null or empty)
      let activeSession: any = null;
      for (const record of records) {
        if (record.sessions && record.sessions.length > 0) {
          const active = record.sessions.find((s: any) => !s.check_out);
          if (active) {
            activeSession = active;
            break;
          }
        }
      }

      if (activeSession) {
        setIsCheckedIn(true);
        setCheckInTime(new Date(activeSession.check_in));
      } else if (!isDemo) {
        setIsCheckedIn(false);
        setCheckInTime(null);
      }
    }
  }, [isDemo, realAttendance]);

  const { data: realBalances } = useQuery({
    queryKey: ['employee-leave-balances'],
    queryFn: () => hrLeaveService.getLeaveBalances(),
    enabled: !isDemo && isAuthenticated,
  });

  const { data: realLeaveTypes } = useQuery({
    queryKey: ['employee-leave-types'],
    queryFn: () => hrLeaveService.getLeaveTypes(),
    enabled: !isDemo && isAuthenticated,
  });

  const { data: realRequests } = useQuery({
    queryKey: ['employee-leave-requests'],
    queryFn: () => hrLeaveService.getLeaveRequests(),
    enabled: !isDemo && isAuthenticated,
  });

  const { data: currentEmployeeRes } = useQuery({
    queryKey: ['current-employee-profile'],
    queryFn: () => hrEmployeeService.getMyProfile(),
    enabled: !isDemo && isAuthenticated,
  });

  const currentEmployee = currentEmployeeRes?.data;

  // Fetch real performance goals
  const { data: realGoalsRes } = useQuery({
    queryKey: ['performance-goals'],
    queryFn: () => hrPerformanceService.getGoals(),
    enabled: !isDemo && isAuthenticated,
  });

  // Filter goals assigned to current employee in real mode
  const goals = isDemo
    ? demoGoals
    : (realGoalsRes?.data?.results || []).filter((g: any) => g.employee === currentEmployee?.id);

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => hrPerformanceService.updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-goals'] });
      toast.success('Goal progress updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update goal progress.');
    }
  });

  const handleUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;

    const payload = {
      status: updateGoalStatus,
      progress_percentage: updateGoalProgress,
    };

    if (isDemo) {
      const updated = demoGoals.map(g => g.id === selectedGoal.id ? { ...g, ...payload } : g);
      setDemoGoals(updated);
      localStorage.setItem('demo_performance_goals', JSON.stringify(updated));
      toast.success('Sandbox: Goal progress updated!');
      setIsUpdateGoalOpen(false);
      setSelectedGoal(null);
    } else {
      updateGoalMutation.mutate({
        id: selectedGoal.id,
        data: payload
      }, {
        onSuccess: () => {
          setIsUpdateGoalOpen(false);
          setSelectedGoal(null);
        }
      });
    }
  };

  useEffect(() => {
    if (currentEmployee) {
      setNewPortalUsername(currentEmployee.portal_username || '');
    }
  }, [currentEmployee]);

  // Set default selected leave category when leave types are fetched
  const balancesList = isDemo
    ? demoBalances
    : (realBalances?.data?.results && realBalances.data.results.length > 0
        ? realBalances.data.results
        : (realLeaveTypes?.data?.results || []).map((lt: any) => ({
            id: lt.id,
            leave_type: lt.id,
            leave_type_name: lt.name,
            total_days: String(lt.max_days_per_year || 0),
            used_days: '0',
            remaining_days: lt.max_days_per_year || 0,
          }))
      );
  useEffect(() => {
    if (balancesList.length > 0 && !leaveType) {
      setLeaveType(balancesList[0].leave_type || balancesList[0].id);
    }
  }, [balancesList, leaveType]);

  const checkInMutation = useMutation({
    mutationFn: (data: { location_in: string }) => hrAttendanceService.checkIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-attendance'] });
      setIsCheckedIn(true);
      setCheckInTime(new Date());
      toast.success('Successfully checked in!');
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.error || err.data?.error || err.message || '';
      if (errMsg.includes('Already checked in')) {
        setIsCheckedIn(true);
        if (!checkInTime) {
          setCheckInTime(new Date());
        }
        queryClient.invalidateQueries({ queryKey: ['employee-attendance'] });
        toast.info('Already checked in. Synchronizing timer...');
      } else {
        toast.error(errMsg || 'Check-in failed.');
      }
    }
  });

  const checkOutMutation = useMutation({
    mutationFn: (data: { location_out: string }) => hrAttendanceService.checkOut(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-attendance'] });
      setIsCheckedIn(false);
      setCheckInTime(null);
      toast.success('Successfully checked out!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Check-out failed.');
    }
  });

  // Action Handlers
  const handleCheckIn = () => {
    if (isDemo) {
      const now = new Date();
      setIsCheckedIn(true);
      setCheckInTime(now);
      localStorage.setItem('demo_employee_isCheckedIn', 'true');
      localStorage.setItem('demo_employee_checkInTime', now.toISOString());
      toast.success('Sandbox: Checked in successfully');
    } else {
      checkInMutation.mutate({ location_in: 'Office' });
    }
  };

  const handleCheckOut = () => {
    if (isDemo) {
      setIsCheckedIn(false);
      localStorage.removeItem('demo_employee_isCheckedIn');
      localStorage.removeItem('demo_employee_checkInTime');
      const hoursWorked = ((elapsedSeconds) / 3600).toFixed(2);
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const timeInStr = checkInTime ? format(checkInTime, 'hh:mm a') : '09:00 AM';
      const timeOutStr = format(new Date(), 'hh:mm a');

      // Prepend to logs
      setDemoAttendance(prev => [
        {
          id: String(Date.now()),
          date: todayStr,
          status: 'present',
          total_work_hours: hoursWorked,
          location_in: 'Office',
          time_in: timeInStr,
          time_out: timeOutStr
        },
        ...prev
      ]);
      setCheckInTime(null);
      toast.success(`Sandbox: Checked out! Worked ${hoursWorked} hours.`);
    } else {
      checkOutMutation.mutate({ location_out: 'Office' });
    }
  };

  const handleNewLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim() || !leaveType) {
      toast.error('All fields are required.');
      return;
    }

    setIsSubmittingLeave(true);
    if (isDemo) {
      setTimeout(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const selectedBal = demoBalances.find(b => b.leave_type === leaveType || b.id === leaveType);
        const typeName = selectedBal?.leave_type_name || 'Annual Leave';

        setDemoLeaves(prev => [
          {
            id: String(Date.now()),
            start_date: startDate,
            end_date: endDate,
            total_days: totalDays,
            leave_type_name: typeName,
            status: 'Pending',
            reason: reason.trim()
          },
          ...prev
        ]);

        // Deduct from balance for quick UI feedback in sandbox
        setDemoBalances(prev =>
          prev.map(b => b.leave_type === leaveType || b.id === leaveType
            ? { ...b, remaining_days: Math.max(0, b.remaining_days - totalDays) }
            : b
          )
        );

        setIsSubmittingLeave(false);
        setIsLeaveModalOpen(false);
        setStartDate('');
        setEndDate('');
        setReason('');
        toast.success('Sandbox: Leave request submitted!');
      }, 800);
    } else {
      try {
        const payload = {
          employee: currentEmployee?.id,
          startup: currentEmployee?.startup,
          leave_type: leaveType,
          start_date: startDate,
          end_date: endDate,
          reason: reason.trim()
        };
        await hrLeaveService.createLeaveRequest(payload);
        queryClient.invalidateQueries({ queryKey: ['employee-leave-requests'] });
        queryClient.invalidateQueries({ queryKey: ['employee-leave-balances'] });
        setIsSubmittingLeave(false);
        setIsLeaveModalOpen(false);
        setStartDate('');
        setEndDate('');
        setReason('');
        toast.success('Leave request submitted successfully!');
      } catch (err: any) {
        setIsSubmittingLeave(false);
        toast.error(err.message || 'Failed to submit leave request.');
      }
    }
  };

  const handleSignOut = async () => {
    if (isDemo) {
      localStorage.removeItem('demo_employee_user');
      toast.info('Logged out from demo environment.');
      router.replace('/employee/login');
    } else {
      await logout();
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortalUsername.trim()) {
      toast.error('Portal username cannot be empty.');
      return;
    }

    setIsSubmittingCredentials(true);
    if (isDemo) {
      setTimeout(() => {
        setDemoUser((prev: any) => ({
          ...prev,
          portal_username: newPortalUsername.trim()
        }));
        setIsSubmittingCredentials(false);
        setIsCredentialsModalOpen(false);
        setNewPassword('');
        toast.success('Sandbox: Credentials updated successfully!');
      }, 800);
    } else {
      try {
        if (newPassword.trim()) {
          // Dedicated change password API that synchronizes credentials with Django and the HR tool
          await hrEmployeeService.changePassword({
            password: newPassword.trim()
          });
        }

        await hrEmployeeService.changeCredentials({
          portal_username: newPortalUsername.trim()
        });

        // Refresh the query
        queryClient.invalidateQueries({ queryKey: ['current-employee-profile'] });
        setIsSubmittingCredentials(false);
        setIsCredentialsModalOpen(false);
        setNewPassword('');
        toast.success('Credentials updated successfully!');
      } catch (err: any) {
        setIsSubmittingCredentials(false);
        toast.error(err.response?.data?.error || err.message || 'Failed to update credentials.');
      }
    }
  };

  // Helper variables for user rendering
  let displayName = 'Loading Employee...';
  let displayId = 'EMP-0142';
  let displayDesignation = 'Employee Specialist';
  let displayDepartment = 'Operations';

  if (isDemo) {
    displayName = `${demoUser?.first_name} ${demoUser?.last_name}`;
    displayId = demoUser?.employee_id;
    displayDesignation = demoUser?.designation;
    displayDepartment = demoUser?.department;
  } else {
    // Name Resolution
    if (currentEmployee) {
      displayName = `${currentEmployee.first_name} ${currentEmployee.last_name}`;
    } else if (user?.profile) {
      const empProfile = user.profile as any;
      displayName = `${empProfile.first_name || ''} ${empProfile.last_name || ''}`.trim() || `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    } else if (user) {
      displayName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    }

    // ID Resolution
    if (currentEmployee?.employee_id) {
      displayId = currentEmployee.employee_id;
    } else if ((user?.profile as any)?.employee_id) {
      displayId = (user?.profile as any)?.employee_id;
    } else if (user?.id) {
      displayId = `EMP-${user.id.slice(0, 4)}`;
    }

    // Designation Resolution
    if (currentEmployee?.designation_detail?.title) {
      displayDesignation = currentEmployee.designation_detail.title;
    } else if (currentEmployee?.designation_detail?.name) {
      displayDesignation = currentEmployee.designation_detail.name;
    } else if ((user?.profile as any)?.designation_detail?.title) {
      displayDesignation = (user?.profile as any)?.designation_detail?.title;
    } else if ((user?.profile as any)?.designation_detail?.name) {
      displayDesignation = (user?.profile as any)?.designation_detail?.name;
    }

    // Department Resolution
    if (currentEmployee?.department_detail?.name) {
      displayDepartment = currentEmployee.department_detail.name;
    } else if ((user?.profile as any)?.department_detail?.name) {
      displayDepartment = (user?.profile as any)?.department_detail?.name;
    }
  }

  const attendanceLogs = isDemo ? demoAttendance : (realAttendance?.data?.results || []);
  const leaveRequestsList = isDemo ? demoLeaves : (realRequests?.data?.results || []).map((r: any) => ({
    id: r.id,
    leave_type_name: r.leave_type_detail?.name || 'Leave',
    start_date: r.start_date,
    end_date: r.end_date,
    total_days: Math.ceil(Math.abs(new Date(r.end_date).getTime() - new Date(r.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1,
    status: r.status,
    reason: r.reason
  }));

  // Build the pending requests list (employee's own pending leaves)
  const pendingList = isDemo
    ? demoApprovals.map((r: any) => ({ ...r, status: 'PENDING' }))
    : leaveRequestsList.filter((r: any) => {
        const statusUpper = r.status?.toUpperCase();
        return statusUpper === 'PENDING' || statusUpper === 'REJECTED';
      }).map((r: any) => ({
        id: r.id,
        name: r.leave_type_name || 'Leave',
        type: `${r.leave_type_name || 'Leave'} Request`,
        duration: `${r.total_days} days`,
        reason: r.reason,
        status: r.status,
      }));

  return {
    // Auth / loading
    authLoading,
    isDemo,
    isDark,
    toggleTheme,
    isAuthenticated,

    // Display info
    displayName,
    displayId,
    displayDesignation,
    displayDepartment,
    currentDateTime,

    // Shift tracker
    isCheckedIn,
    elapsedSeconds,
    checkInTime,
    checkInMutation,
    checkOutMutation,
    handleCheckIn,
    handleCheckOut,

    // Leave modal
    isLeaveModalOpen,
    setIsLeaveModalOpen,
    leaveType,
    setLeaveType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    reason,
    setReason,
    isSubmittingLeave,
    balancesList,
    handleNewLeaveSubmit,

    // Credentials modal
    isCredentialsModalOpen,
    setIsCredentialsModalOpen,
    newPortalUsername,
    setNewPortalUsername,
    newPassword,
    setNewPassword,
    showPassword,
    setShowPassword,
    isSubmittingCredentials,
    handleCredentialsSubmit,

    // Goals
    goals,
    isUpdateGoalOpen,
    setIsUpdateGoalOpen,
    selectedGoal,
    setSelectedGoal,
    updateGoalStatus,
    setUpdateGoalStatus,
    updateGoalProgress,
    setUpdateGoalProgress,
    updateGoalMutation,
    handleUpdateGoal,

    // Lists
    attendanceLogs,
    leaveRequestsList,
    pendingList,

    // Actions
    handleSignOut,
  };
}
