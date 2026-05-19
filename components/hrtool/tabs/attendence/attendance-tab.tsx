'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrAttendanceService } from '@/services/hr';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';
import { toast } from 'sonner';

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
    queryKey: ['attendance'],
    queryFn: () => hrAttendanceService.getAttendance(),
    refetchInterval: 3000,
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
  const mockRequests = [
    { id: 1, name: 'Jane Cooper', date: '2026-05-15', requestType: 'Manual Check-in', time: '09:00 AM', reason: 'Forgot access card' },
    { id: 2, name: 'Alex Carter', date: '2026-05-14', requestType: 'Manual Check-out', time: '06:05 PM', reason: 'Client meeting out-of-office' }
  ];

  // Mock hour account
  const mockHourAccounts = [
    { name: 'Jane Cooper', standardHours: 160, workedHours: 172.5, balance: 12.5, status: 'overtime' },
    { name: 'Alex Carter', standardHours: 160, workedHours: 158.0, balance: -2.0, status: 'deficit' },
    { name: 'Sarah Jenkins', standardHours: 160, workedHours: 160.0, balance: 0.0, status: 'normal' }
  ];

  // Mock late arrivals
  const mockLateArrivals = [
    { name: 'Alex Carter', date: 'May 18, 2026', checkin: '09:45 AM', lateBy: '45 mins', severity: 'high' },
    { name: 'Sarah Jenkins', date: 'May 18, 2026', checkin: '09:12 AM', lateBy: '12 mins', severity: 'low' },
    { name: 'John Doe', date: 'May 17, 2026', checkin: '09:30 AM', lateBy: '30 mins', severity: 'medium' }
  ];

  const attendanceData = attendance?.data?.results || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{header.title}</h2>
          <p className="text-sm text-muted-foreground">{header.desc}</p>
        </div>
        
        {/* Quick Check-in/out Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={handleCheckIn} 
            disabled={checkInMutation.isPending}
            data-agent="attendance-quick-check-in-btn"
            className="bg-[#0a66c2] hover:bg-[#004182] text-white rounded-sm font-bold"
          >
            <LogIn className="mr-2 h-4 w-4" /> Check In
          </Button>
          <Button 
            onClick={handleCheckOut} 
            disabled={checkOutMutation.isPending}
            variant="outline" 
            data-agent="attendance-quick-check-out-btn"
            className="border-rose-500/20 text-rose-600 hover:bg-rose-500/5 rounded-sm font-bold"
          >
            <LogOut className="mr-2 h-4 w-4" /> Check Out
          </Button>
        </div>
      </div>

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
        <WorkRecords attendanceData={attendanceData} />
      )}
    </div>
  );
}
