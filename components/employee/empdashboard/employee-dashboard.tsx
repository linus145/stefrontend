'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrAttendanceService, hrLeaveService, hrEmployeeService } from '@/services/hr';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useDashboardTheme } from '@/context/DashboardThemeContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format, differenceInSeconds } from 'date-fns';

import { DashboardHeader } from './DashboardHeader';
import { WelcomeBanner } from '../WelcomeBanner';
import { ShiftTracker } from '../ShiftTracker';
import { PendingRequestsSummary } from '../PendingRequestsSummary';
import { LeaveBalanceCards } from '../empleaves/LeaveBalanceCards';
import { LeaveRequestLogs } from '../empleaves/LeaveRequestLogs';
import { TimecardLogs } from '../TimecardLogs';
import { LeaveRequestModal } from './LeaveRequestModal';
import { CredentialsModal } from './CredentialsModal';

export function EmployeeDashboard() {
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
      const storedCheckedIn = localStorage.getItem('demo_isCheckedIn') === 'true';
      const storedCheckInTime = localStorage.getItem('demo_checkInTime');
      if (storedCheckedIn && storedCheckInTime) {
        setIsCheckedIn(true);
        setCheckInTime(new Date(storedCheckInTime));
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

  // Format active duration elapsed (HH:MM:SS)
  const formatDuration = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Real Queries & Mutations (Active when not in demo mode)
  const { data: realAttendance } = useQuery({
    queryKey: ['employee-attendance'],
    queryFn: () => hrAttendanceService.getAttendance(),
    enabled: isAuthenticated,
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

  useEffect(() => {
    if (currentEmployee) {
      setNewPortalUsername(currentEmployee.portal_username || '');
    }
  }, [currentEmployee]);

  // Set default selected leave category when leave types are fetched
  const balancesList = isDemo ? demoBalances : (realBalances?.data?.results || []);
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
      localStorage.setItem('demo_isCheckedIn', 'true');
      localStorage.setItem('demo_checkInTime', now.toISOString());
      toast.success('Sandbox: Checked in successfully');
      
      // Sync with real backend
      if (isAuthenticated) {
        checkInMutation.mutate({ location_in: 'Office' });
      }
    } else {
      handleCheckInLocally();
    }
  };

  const handleCheckInLocally = () => {
    // Standard coordinates or office location triggers
    checkInMutation.mutate({ location_in: 'Office' });
  };

  const handleCheckOut = () => {
    if (isDemo) {
      setIsCheckedIn(false);
      localStorage.removeItem('demo_isCheckedIn');
      localStorage.removeItem('demo_checkInTime');
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
      
      // Sync with real backend
      if (isAuthenticated) {
        checkOutMutation.mutate({ location_out: 'Office' });
      }
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
        await hrEmployeeService.changeCredentials({
          portal_username: newPortalUsername.trim(),
          password: newPassword.trim() || undefined
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
    ? demoApprovals
    : leaveRequestsList.filter((r: any) => r.status?.toUpperCase() === 'PENDING').map((r: any) => ({
      id: r.id,
      name: r.leave_type_name || 'Leave',
      type: `${r.leave_type_name || 'Leave'} Request`,
      duration: `${r.total_days} days`,
      reason: r.reason,
    }));

  if (authLoading && !isDemo) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#0a66c2]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans select-none antialiased transition-colors duration-500">
      <DashboardHeader
        displayName={displayName}
        displayDesignation={displayDesignation}
        displayId={displayId}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onOpenCredentials={() => setIsCredentialsModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Grid Content */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        <WelcomeBanner
          displayName={displayName}
          displayDesignation={displayDesignation}
          displayDepartment={displayDepartment}
          currentDateTime={currentDateTime}
        />

        {/* Top Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Check-In / Clock In Card (5 columns) */}
          <div className="lg:col-span-5 flex flex-col">
            <ShiftTracker
              isCheckedIn={isCheckedIn}
              elapsedSeconds={elapsedSeconds}
              checkInTime={checkInTime}
              displayDepartment={displayDepartment}
              isSyncing={!isDemo && (checkInMutation.isPending || checkOutMutation.isPending)}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
            />
          </div>

          {/* Quick Checks and Action Items (7 columns) */}
          <div className="lg:col-span-7 flex flex-col">
            <PendingRequestsSummary
              pendingList={pendingList}
            />
          </div>
        </div>

        {/* Leave Balances Grid Widget */}
        <LeaveBalanceCards
          balancesList={balancesList}
          onRequestLeave={() => setIsLeaveModalOpen(true)}
        />

        {/* Detailed Logs: Attendance & Leaves Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Leaves Request History (7 Columns) */}
          <div className="lg:col-span-7">
            <LeaveRequestLogs leaveRequestsList={leaveRequestsList} />
          </div>

          {/* Recent Attendance Log Sheets (5 Columns) */}
          <div className="lg:col-span-5">
            <TimecardLogs attendanceLogs={attendanceLogs} />
          </div>
        </div>
      </main>

      <LeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        leaveType={leaveType}
        setLeaveType={setLeaveType}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        reason={reason}
        setReason={setReason}
        isSubmittingLeave={isSubmittingLeave}
        balancesList={balancesList}
        onSubmit={handleNewLeaveSubmit}
      />

      <CredentialsModal
        isOpen={isCredentialsModalOpen}
        onClose={() => setIsCredentialsModalOpen(false)}
        newPortalUsername={newPortalUsername}
        setNewPortalUsername={setNewPortalUsername}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        isSubmittingCredentials={isSubmittingCredentials}
        onSubmit={handleCredentialsSubmit}
      />
    </div>
  );
}
