'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrAttendanceService, hrLeaveService, hrEmployeeService, hrPerformanceService, hrPayrollService } from '@/services/hr';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useDashboardTheme } from '@/context/DashboardThemeContext';
import { toast } from 'sonner';
import { format, differenceInSeconds } from 'date-fns';

export function useManagerDashboard() {
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

    // Manager-specific states for Demo Mode
    const [demoSubordinates, setDemoSubordinates] = useState([
        { id: 'sub1', first_name: 'Jane', last_name: 'Cooper', email: 'jane.cooper@company.com', phone: '+91 98765 43210', designation_title: 'Senior UI/UX Designer', department_name: 'Design', status: 'ACTIVE', avatar: '' },
        { id: 'sub2', first_name: 'Alex', last_name: 'Carter', email: 'alex.carter@company.com', phone: '+91 98765 11223', designation_title: 'Frontend Engineer', department_name: 'Engineering', status: 'ACTIVE', avatar: '' },
        { id: 'sub3', first_name: 'Robert', last_name: 'Fox', email: 'robert.fox@company.com', phone: '+91 98765 44332', designation_title: 'Backend Engineer', department_name: 'Engineering', status: 'ACTIVE', avatar: '' },
    ]);

    const [demoLeavesToApprove, setDemoLeavesToApprove] = useState([
        { id: 'app1', employee_name: 'Jane Cooper', leave_type_name: 'Sick Leave', start_date: '2026-06-02', end_date: '2026-06-03', total_days: 2, reason: 'Wisdom tooth extraction surgery and rest', status: 'Pending' },
        { id: 'app2', employee_name: 'Alex Carter', leave_type_name: 'Casual Leave', start_date: '2026-06-12', end_date: '2026-06-15', total_days: 3, reason: 'Attending elder sister\'s wedding in home town', status: 'Pending' },
    ]);

    // Mock personal logs for the manager
    const [demoAttendance, setDemoAttendance] = useState([
        { id: 'm1', date: '2026-05-18', status: 'present', total_work_hours: '8.6', location_in: 'Office', time_in: '09:05 AM', time_out: '05:41 PM' },
        { id: 'm2', date: '2026-05-17', status: 'present', total_work_hours: '9.2', location_in: 'Remote', time_in: '08:52 AM', time_out: '06:04 PM' },
        { id: 'm3', date: '2026-05-16', status: 'present', total_work_hours: '8.0', location_in: 'Office', time_in: '09:10 AM', time_out: '05:10 PM' },
    ]);

    const [demoLeaves, setDemoLeaves] = useState([
        { id: 'ml1', start_date: '2026-06-20', end_date: '2026-06-22', total_days: 3, leave_type_name: 'Annual Leave', status: 'Pending', reason: 'Summer family trip' },
        { id: 'ml2', start_date: '2026-05-02', end_date: '2026-05-02', total_days: 1, leave_type_name: 'Casual Leave', status: 'Approved', reason: 'Personal registration work' },
    ]);

    const [demoBalances, setDemoBalances] = useState([
        { id: 'mb1', leave_type_name: 'Annual Leave', remaining_days: 22, total_days: 25, leave_type: 'mb1' },
        { id: 'mb2', leave_type_name: 'Sick Leave', remaining_days: 11, total_days: 12, leave_type: 'mb2' },
        { id: 'mb3', leave_type_name: 'Casual Leave', remaining_days: 7, total_days: 8, leave_type: 'mb3' },
    ]);

    // Manager-specific strategic goals for Demo Mode
    const [demoGoals, setDemoGoals] = useState<any[]>([
        { id: 'g1', employee: 'sub1', employee_detail: { first_name: 'Jane', last_name: 'Cooper' }, title: 'Redesign HR Portal User Experience', description: 'Create high-fidelity mockups and user flows for the employee leave and shift tracking dashboards.', status: 'IN_PROGRESS', progress_percentage: 65, start_date: '2026-05-10', due_date: '2026-06-15' },
        { id: 'g2', employee: 'sub2', employee_detail: { first_name: 'Alex', last_name: 'Carter' }, title: 'Implement Shift Clock-In Sandbox Logic', description: 'Code the offline sandbox simulation for checking in/out on the Manager and Employee dashboards.', status: 'COMPLETED', progress_percentage: 100, start_date: '2026-05-12', due_date: '2026-05-28' },
        { id: 'g3', employee: 'sub3', employee_detail: { first_name: 'Robert', last_name: 'Fox' }, title: 'Optimize Database Indexing for Payroll Runs', description: 'Implement composite index schemas on payroll ledger tables to scale employee roster queries.', status: 'PENDING', progress_percentage: 0, start_date: '2026-05-28', due_date: '2026-06-25' },
    ]);

    // Goals Assign Modal States
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedAssignee, setSelectedAssignee] = useState('');
    const [goalTitle, setGoalTitle] = useState('');
    const [goalDesc, setGoalDesc] = useState('');
    const [goalStartDate, setGoalStartDate] = useState('');
    const [goalDueDate, setGoalDueDate] = useState('');
    const [goalStatus, setGoalStatus] = useState('PENDING');
    const [goalProgress, setGoalProgress] = useState(0);

    // Payroll approvals state
    const [payrollApprovalConfirm, setPayrollApprovalConfirm] = useState<string | null>(null);

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
            const storedCheckedIn = localStorage.getItem('demo_manager_isCheckedIn') === 'true';
            const storedCheckInTime = localStorage.getItem('demo_manager_checkInTime');
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

    // Real queries for real Manager (Active when not in demo mode)
    const { data: realAttendance } = useQuery({
        queryKey: ['employee-attendance'],
        queryFn: () => hrAttendanceService.getAttendance(),
        enabled: !isDemo && isAuthenticated,
    });

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

    // Query all employees to filter subordinates in real mode
    const { data: allEmployeesRes } = useQuery({
        queryKey: ['manager-subordinates'],
        queryFn: () => hrEmployeeService.getEmployees({ limit: 100 }),
        enabled: !isDemo && isAuthenticated && !!currentEmployee,
    });

    // Query all leave requests to filter team approvals in real mode
    const { data: allLeaveRequestsRes } = useQuery({
        queryKey: ['manager-team-leave-requests'],
        queryFn: () => hrLeaveService.getLeaveRequests({ limit: 100 }),
        enabled: !isDemo && isAuthenticated && !!currentEmployee,
    });

    // Actions for real manager approvals
    const approveLeaveMutation = useMutation({
        mutationFn: ({ id, comment }: { id: string; comment?: string }) => hrLeaveService.approveLeave(id, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['manager-team-leave-requests'] });
            toast.success('Leave request approved successfully!');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to approve leave request.');
        }
    });

    const rejectLeaveMutation = useMutation({
        mutationFn: ({ id, comment }: { id: string; comment?: string }) => hrLeaveService.rejectLeave(id, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['manager-team-leave-requests'] });
            toast.success('Leave request rejected successfully.');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to reject leave request.');
        }
    });

    // Fetch real performance goals
    const { data: realGoalsRes } = useQuery({
        queryKey: ['performance-goals'],
        queryFn: () => hrPerformanceService.getGoals(),
        enabled: !isDemo && isAuthenticated,
    });

    // Payroll approvals queue & settings (real mode only)
    const { data: payrollApprovalsRes } = useQuery({
        queryKey: ['manager-payroll-approvals'],
        queryFn: () => hrPayrollService.getApprovalsQueue(),
        enabled: !isDemo && isAuthenticated,
        refetchInterval: 30000,
    });

    const { data: payrollSettingsRes } = useQuery({
        queryKey: ['manager-payroll-settings'],
        queryFn: () => hrPayrollService.getSettingsConfigs(),
        enabled: !isDemo && isAuthenticated,
    });

    const approvePayrollMutation = useMutation({
        mutationFn: (id: string) => hrPayrollService.approvePayroll(id),
        onSuccess: (res: any) => {
            queryClient.invalidateQueries({ queryKey: ['manager-payroll-approvals'] });
            queryClient.invalidateQueries({ queryKey: ['payroll-approvals'] });
            queryClient.invalidateQueries({ queryKey: ['payrolls'] });
            setPayrollApprovalConfirm(null);
            const isPartial = res.message?.includes('L1') || res.message?.includes('recorded');
            toast.success(isPartial ? (res.message || 'L1 Approval recorded.') : 'Payroll cycle fully approved!');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Failed to approve payroll cycle.');
        },
    });

    const rejectPayrollMutation = useMutation({
        mutationFn: (id: string) => hrPayrollService.rejectPayroll(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['manager-payroll-approvals'] });
            queryClient.invalidateQueries({ queryKey: ['payroll-approvals'] });
            queryClient.invalidateQueries({ queryKey: ['payrolls'] });
            setPayrollApprovalConfirm(null);
            toast.success('Payroll cycle sent back for correction.');
        },
        onError: () => {
            toast.error('Failed to reject payroll cycle.');
        },
    });

    const handleApprovePayroll = (id: string) => {
        approvePayrollMutation.mutate(id);
    };

    const handleRejectPayroll = (id: string) => {
        rejectPayrollMutation.mutate(id);
    };

    // Compute which payroll cycles the current user can act on
    const payrollApprovalsList = !isDemo ? (payrollApprovalsRes?.data || []) : [];
    const payrollSettings = !isDemo ? payrollSettingsRes?.data : null;

    const getPayrollApprovalAccess = (run: any) => {
        if (!payrollSettings || !user) return { allowed: false, stage: '' };
        if (payrollSettings.finance_approval_required && !run.finance_approved) {
            return {
                allowed: user.id === payrollSettings.finance_manager,
                stage: 'Finance Manager (L1)',
            };
        }
        if (payrollSettings.director_approval_required && !run.director_approved) {
            return {
                allowed: user.id === payrollSettings.director,
                stage: 'Director (Final)',
            };
        }
        return { allowed: true, stage: 'Final' };
    };

    const goals = isDemo ? demoGoals : (realGoalsRes?.data?.results || []);

    const createGoalMutation = useMutation({
        mutationFn: (data: any) => hrPerformanceService.createGoal(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['performance-goals'] });
            toast.success('Goal assigned successfully!');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to assign goal.');
        }
    });

    const updateGoalMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => hrPerformanceService.updateGoal(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['performance-goals'] });
            toast.success('Goal updated successfully!');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to update goal.');
        }
    });

    const deleteGoalMutation = useMutation({
        mutationFn: (id: string) => hrPerformanceService.deleteGoal(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['performance-goals'] });
            toast.success('Goal deleted successfully.');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to delete goal.');
        }
    });

    const handleCreateGoal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssignee || !goalTitle || !goalStartDate || !goalDueDate) {
            toast.error('All fields are required.');
            return;
        }

        const payload = {
            employee: selectedAssignee,
            title: goalTitle,
            description: goalDesc,
            status: goalStatus,
            progress_percentage: goalProgress,
            start_date: goalStartDate,
            due_date: goalDueDate,
        };

        if (isDemo) {
            const selectedEmp = demoSubordinates.find(sub => sub.id === selectedAssignee);
            const newGoal = {
                id: String(Date.now()),
                employee: selectedAssignee,
                employee_detail: selectedEmp ? { first_name: selectedEmp.first_name, last_name: selectedEmp.last_name } : { first_name: 'Unknown', last_name: 'Employee' },
                title: goalTitle,
                description: goalDesc,
                status: goalStatus,
                progress_percentage: goalProgress,
                start_date: goalStartDate,
                due_date: goalDueDate
            };
            const updated = [newGoal, ...demoGoals];
            setDemoGoals(updated);
            localStorage.setItem('demo_performance_goals', JSON.stringify(updated));
            toast.success('Sandbox: Goal created and assigned!');
            setIsAssignModalOpen(false);
        } else {
            createGoalMutation.mutate(payload, {
                onSuccess: () => setIsAssignModalOpen(false)
            });
        }
    };

    const handleUpdateGoal = (id: string, updatedData: any) => {
        if (isDemo) {
            const updated = demoGoals.map(g => g.id === id ? { ...g, ...updatedData } : g);
            setDemoGoals(updated);
            localStorage.setItem('demo_performance_goals', JSON.stringify(updated));
            toast.success('Sandbox: Goal updated!');
        } else {
            updateGoalMutation.mutate({ id, data: updatedData });
        }
    };

    const handleDeleteGoal = (id: string) => {
        if (isDemo) {
            const updated = demoGoals.filter(g => g.id !== id);
            setDemoGoals(updated);
            localStorage.setItem('demo_performance_goals', JSON.stringify(updated));
            toast.success('Sandbox: Goal removed successfully.');
        } else {
            deleteGoalMutation.mutate(id);
        }
    };

    useEffect(() => {
        if (currentEmployee) {
            setNewPortalUsername(currentEmployee.portal_username || '');
        }
    }, [currentEmployee]);

    // Setup leave type
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

    // Synchronize check-in status from real backend attendance data
    useEffect(() => {
        if (realAttendance?.data?.results) {
            const records = realAttendance.data.results;
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
                if (!checkInTime) setCheckInTime(new Date());
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

    const handleCheckIn = () => {
        if (isDemo) {
            const now = new Date();
            setIsCheckedIn(true);
            setCheckInTime(now);
            localStorage.setItem('demo_manager_isCheckedIn', 'true');
            localStorage.setItem('demo_manager_checkInTime', now.toISOString());
            toast.success('Sandbox: Checked in successfully');
        } else {
            checkInMutation.mutate({ location_in: 'Office' });
        }
    };

    const handleCheckOut = () => {
        if (isDemo) {
            setIsCheckedIn(false);
            localStorage.removeItem('demo_manager_isCheckedIn');
            localStorage.removeItem('demo_manager_checkInTime');
            const hoursWorked = ((elapsedSeconds) / 3600).toFixed(2);
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const timeInStr = checkInTime ? format(checkInTime, 'hh:mm a') : '09:00 AM';
            const timeOutStr = format(new Date(), 'hh:mm a');

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

    // Manager Approve & Reject Actions
    const handleApproveTeamLeave = (id: string, name: string) => {
        if (isDemo) {
            setDemoLeavesToApprove(prev => prev.filter(r => r.id !== id));
            toast.success(`Sandbox: Approved leave request for ${name}!`);
        } else {
            approveLeaveMutation.mutate({ id });
        }
    };

    const handleRejectTeamLeave = (id: string, name: string) => {
        if (isDemo) {
            setDemoLeavesToApprove(prev => prev.filter(r => r.id !== id));
            toast.info(`Sandbox: Rejected leave request for ${name}.`);
        } else {
            rejectLeaveMutation.mutate({ id });
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
    let displayName = 'Loading Manager...';
    let displayId = 'MGR-0214';
    let displayDesignation = 'Manager Specialist';
    let displayDepartment = 'Operations';

    if (isDemo) {
        displayName = `${demoUser?.first_name} ${demoUser?.last_name}`;
        displayId = demoUser?.employee_id;
        displayDesignation = demoUser?.designation;
        displayDepartment = demoUser?.department;
    } else {
        if (currentEmployee) {
            displayName = `${currentEmployee.first_name} ${currentEmployee.last_name}`;
            displayId = currentEmployee.employee_id || `MGR-${currentEmployee.id.slice(0, 4)}`;
            displayDesignation = currentEmployee.designation_detail?.title || currentEmployee.designation_detail?.name || 'Manager Specialist';
            displayDepartment = currentEmployee.department_detail?.name || 'Operations';
        } else if (user) {
            displayName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email;
            displayId = `MGR-${user.id.slice(0, 4)}`;
        }
    }

    // Roster lists
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

    // Direct reports & Team approvals filter
    const teamSubordinates = isDemo
        ? demoSubordinates
        : (allEmployeesRes?.data?.results || []).filter((e: any) => e.reporting_manager === currentEmployee?.id);

    const teamLeaveApprovals = isDemo
        ? demoLeavesToApprove
        : (allLeaveRequestsRes?.data?.results || [])
            .filter((r: any) => r.employee_detail?.reporting_manager === currentEmployee?.id && r.status?.toUpperCase() === 'PENDING')
            .map((r: any) => ({
                id: r.id,
                employee_name: `${r.employee_detail?.first_name} ${r.employee_detail?.last_name}`,
                leave_type_name: r.leave_type_detail?.name || 'Leave Request',
                start_date: r.start_date,
                end_date: r.end_date,
                total_days: Math.ceil(Math.abs(new Date(r.end_date).getTime() - new Date(r.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1,
                reason: r.reason,
                status: r.status
            }));

    // Build the pending requests list (manager's own pending and rejected leaves)
    const pendingList = isDemo
        ? demoLeaves.filter((r: any) => {
            const statusUpper = r.status?.toUpperCase();
            return statusUpper === 'PENDING' || statusUpper === 'REJECTED';
          }).map((r: any) => ({
            id: r.id,
            name: r.leave_type_name || 'Leave',
            type: `${r.leave_type_name || 'Leave'} Request`,
            duration: `${r.total_days} days`,
            reason: r.reason,
            status: r.status,
          }))
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

    const openAssignModal = () => {
        setSelectedAssignee('');
        setGoalTitle('');
        setGoalDesc('');
        setGoalStartDate(format(new Date(), 'yyyy-MM-dd'));
        setGoalDueDate(format(new Date(), 'yyyy-MM-dd'));
        setGoalStatus('PENDING');
        setGoalProgress(0);
        setIsAssignModalOpen(true);
    };

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
        handleUpdateGoal,
        handleDeleteGoal,
        handleCreateGoal,
        createGoalMutation,

        // Assign modal
        isAssignModalOpen,
        setIsAssignModalOpen,
        openAssignModal,
        selectedAssignee,
        setSelectedAssignee,
        goalTitle,
        setGoalTitle,
        goalDesc,
        setGoalDesc,
        goalStartDate,
        setGoalStartDate,
        goalDueDate,
        setGoalDueDate,
        goalStatus,
        setGoalStatus,
        goalProgress,
        setGoalProgress,

        // Team
        teamSubordinates,
        teamLeaveApprovals,
        handleApproveTeamLeave,
        handleRejectTeamLeave,

        // Lists
        attendanceLogs,
        leaveRequestsList,
        pendingList,

        // Payroll approvals (manager)
        payrollApprovalsList,
        payrollSettings,
        getPayrollApprovalAccess,
        handleApprovePayroll,
        handleRejectPayroll,
        approvePayrollMutation,
        rejectPayrollMutation,
        payrollApprovalConfirm,
        setPayrollApprovalConfirm,

        // Actions
        handleSignOut,
    };
}
