'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrAttendanceService } from '@/services/hr';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Modular Subcomponents
import { AttendanceActivity } from './AttendanceActivity';
import { AttendanceRequests } from './AttendanceRequests';
import { HourAccount } from './HourAccount';
import { LateEarlyArrivals } from './LateEarlyArrivals';
import { AttendanceSettings } from './AttendanceSettings';
import { WorkRecords } from './WorkRecords';

interface AttendanceTabProps {
  subTab?: string;
}

export function AttendanceTab({ subTab }: AttendanceTabProps) {
  const queryClient = useQueryClient();

  const [page, setPage] = React.useState(1);
  const [filterDate, setFilterDate] = React.useState('');

  // Attendance settings state
  const [settings, setSettings] = React.useState<any>({
    id: null,
    checkInTime: '09:00',
    checkOutTime: '18:00',
    gracePeriod: 15,
    minHoursFullDay: 8,
    minHoursHalfDay: 4,
    autoOvertime: true
  });

  const { data: shiftSettings } = useQuery({
    queryKey: ['attendanceSettings'],
    queryFn: () => hrAttendanceService.getSettings(),
  });

  React.useEffect(() => {
    if (shiftSettings?.data?.results && shiftSettings.data.results.length > 0) {
      const shift = shiftSettings.data.results[0];
      setSettings({
        id: shift.id,
        checkInTime: shift.start_time?.substring(0, 5) || '09:00',
        checkOutTime: shift.end_time?.substring(0, 5) || '18:00',
        gracePeriod: shift.grace_period || 15,
        minHoursFullDay: parseFloat(shift.min_hours_full_day) || 8,
        minHoursHalfDay: parseFloat(shift.min_hours_half_day) || 4,
        autoOvertime: true
      });
    }
  }, [shiftSettings]);

  const [isSaving, setIsSaving] = React.useState(false);

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => hrAttendanceService.updateSettings(settings.id, {
      name: 'Standard Day Shift',
      start_time: `${data.checkInTime}:00`,
      end_time: `${data.checkOutTime}:00`,
      grace_period: data.gracePeriod,
      min_hours_full_day: data.minHoursFullDay,
      min_hours_half_day: data.minHoursHalfDay,
      break_duration: 60
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendanceSettings'] });
      toast.success('Attendance settings saved successfully!');
      setIsSaving(false);
    },
    onError: () => {
      toast.error('Failed to save settings.');
      setIsSaving(false);
    }
  });

  const handleSaveSettings = () => {
    setIsSaving(true);
    updateSettingsMutation.mutate(settings);
  };

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance', page, filterDate],
    queryFn: () => hrAttendanceService.getAttendance({ page, date: filterDate || undefined }),
    refetchInterval: 3000,
  });

  const { data: monthlySummary } = useQuery({
    queryKey: ['attendance-monthly-summary'],
    queryFn: () => hrAttendanceService.getMonthlySummary(),
  });

  const checkInMutation = useMutation({
    mutationFn: (data: { location_in: string }) => hrAttendanceService.checkIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Checked in successfully');
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (data: { location_out: string }) => hrAttendanceService.checkOut(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Checked out successfully');
    },
  });

  const handleCheckIn = () => {
    checkInMutation.mutate({ location_in: 'Office' });
  };

  const handleCheckOut = () => {
    checkOutMutation.mutate({ location_out: 'Office' });
  };

  const getHeaderInfo = () => {
    switch (subTab) {
      case 'attendance-requests':
        return {
          title: 'Correction Requests',
          desc: 'Manage and approve manual check-in/out correction requests.'
        };
      case 'attendance-hour-account':
        return {
          title: 'Hour Account',
          desc: 'Track employee work hours balance, overtime, and deficit accounts.'
        };
      case 'attendance-work-records':
        return {
          title: 'Work Records',
          desc: 'View detailed daily work logs and check-in history.'
        };
      case 'attendance-activity':
        return {
          title: 'Live Attendance Activity Feed',
          desc: 'Live real-time feed of employee login and check-in activities.'
        };
      case 'attendance-late-early':
        return {
          title: 'Late Come Early Out',
          desc: 'Identify and track late arrivals and early departures.'
        };
      case 'attendance-settings':
        return {
          title: 'Attendance Settings',
          desc: 'Configure standard work shifts, check-in schedules, grace periods, and overtime parameters.'
        };
      default:
        return {
          title: 'Work Records',
          desc: 'View detailed daily work logs and check-in history.'
        };
    }
  };

  const header = getHeaderInfo();

  // Mock data for requests
  const mockRequests: any[] = [];

  // Mock hour account
  const mockHourAccounts: any[] = [];

  // Mock late arrivals
  const mockLateArrivals: any[] = [];

  const attendanceData = attendance?.data?.results || [];
  const totalCount = attendance?.data?.count || 0;
  const totalPages = Math.ceil(totalCount / 20) || 1;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);

    if (page <= 3) {
      end = Math.min(totalPages, maxVisible);
    }
    if (page > totalPages - 3) {
      start = Math.max(1, totalPages - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const showFilterAndPagination = subTab === undefined || subTab === 'attendance-work-records' || subTab === 'attendance-activity';

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{header.title}</h2>
        </div>

        {/* Quick Check-in/out Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleCheckIn}
            disabled={checkInMutation.isPending}
            data-agent="attendance-quick-check-in-btn"
            className="bg-[#0a66c2] hover:bg-[#004182] text-white rounded-sm font-semibold h-8 text-xs px-4"
          >
            <LogIn className="mr-1.5 h-3.5 w-3.5" /> Check In
          </Button>
          <Button
            onClick={handleCheckOut}
            disabled={checkOutMutation.isPending}
            variant="outline"
            data-agent="attendance-quick-check-out-btn"
            className="border-rose-500/20 text-rose-600 hover:bg-rose-500/5 rounded-sm font-semibold h-8 text-xs px-4"
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" /> Check Out
          </Button>
        </div>
      </div>

      {showFilterAndPagination && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Filter by Date:</span>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 text-xs rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
            {filterDate && (
              <Button
                onClick={() => {
                  setFilterDate('');
                  setPage(1);
                }}
                variant="ghost"
                className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 px-2 rounded-sm"
              >
                Clear Filter
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Render subTab layouts dynamically */}
      {subTab === 'attendance-settings' && (
        <AttendanceSettings
          settings={settings}
          setSettings={setSettings}
          isSaving={isSaving}
          handleSaveSettings={handleSaveSettings}
        />
      )}

      {subTab === 'attendance-requests' && (
        <AttendanceRequests mockRequests={mockRequests} />
      )}

      {subTab === 'attendance-hour-account' && (
        <HourAccount mockHourAccounts={mockHourAccounts} />
      )}

      {subTab === 'attendance-activity' && (
        <AttendanceActivity attendanceData={attendanceData} />
      )}

      {subTab === 'attendance-late-early' && (
        <LateEarlyArrivals mockLateArrivals={mockLateArrivals} />
      )}

      {/* Default/Standard Work Records View */}
      {(subTab === undefined || subTab === 'attendance-work-records') && (
        <WorkRecords attendanceData={attendanceData} monthlyHours={monthlySummary?.data?.total_monthly_hours || 0.00} />
      )}

      {showFilterAndPagination && totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-4 mt-4 relative">
          <div className="text-xs text-slate-555 dark:text-slate-400 font-medium sm:absolute sm:left-0 mb-3 sm:mb-0">
            Showing Page <strong className="text-slate-900 dark:text-slate-100">{page}</strong> of <strong className="text-slate-900 dark:text-slate-100">{totalPages}</strong> ({totalCount} total records)
          </div>
          <div className="flex items-center gap-1.5 justify-center">
            <Button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page <= 1}
              variant="outline"
              className="h-8 text-xs font-semibold px-3 rounded-sm border border-slate-200 dark:border-slate-800"
            >
              Previous
            </Button>

            <div className="flex items-center gap-1 mx-1">
              {getPageNumbers().map(p => (
                <Button
                  key={p}
                  onClick={() => setPage(p)}
                  variant={page === p ? "default" : "ghost"}
                  className={cn(
                    "h-8 w-8 text-xs font-bold rounded-sm p-0",
                    page === p
                      ? "bg-[#0a66c2] hover:bg-[#004182] text-white"
                      : "text-slate-505 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {p}
                </Button>
              ))}
            </div>

            <Button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages}
              variant="outline"
              className="h-8 text-xs font-semibold px-3 rounded-sm border border-slate-200 dark:border-slate-800"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
