'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { hrEmployeeService, hrOrgService, hrLeaveService } from '@/services/hr';
import {
  Users,
  Calendar,
  FileText,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

export function DashboardTab() {
  const router = useRouter();
  const { data: employeesRes, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees', 'dashboard'],
    queryFn: () => hrEmployeeService.getEmployees(),
  });

  const { data: departmentsRes, isLoading: deptsLoading } = useQuery({
    queryKey: ['departments', 'dashboard'],
    queryFn: () => hrOrgService.getDepartments(),
  });

  const { data: designationsRes, isLoading: desigsLoading } = useQuery({
    queryKey: ['designations', 'dashboard'],
    queryFn: () => hrOrgService.getDesignations(),
  });

  const { data: leaveRequestsRes, isLoading: leavesLoading } = useQuery({
    queryKey: ['leave-requests', 'dashboard'],
    queryFn: () => hrLeaveService.getLeaveRequests(),
  });

  const totalEmployees = employeesRes?.data?.count ?? employeesRes?.data?.results?.length ?? 0;
  const totalDepartments = departmentsRes?.data?.count ?? departmentsRes?.data?.results?.length ?? 0;
  const totalDesignations = designationsRes?.data?.count ?? designationsRes?.data?.results?.length ?? 0;
  const pendingLeaves = leaveRequestsRes?.data?.results?.filter((r: any) => r.status === 'PENDING' || r.status === 'pending')?.length ?? 0;

  const stats = [
    {
      label: 'Total Employees',
      value: totalEmployees.toString(),
      change: `+${totalEmployees}`,
      trend: 'up',
      icon: Users,
      color: 'blue',
      link: 'employees'
    },
    {
      label: 'Total Departments',
      value: totalDepartments.toString(),
      change: 'Active',
      trend: 'up',
      icon: FileText,
      color: 'orange',
      link: 'organization'
    },
    {
      label: 'Total Designations',
      value: totalDesignations.toString(),
      change: 'Active',
      trend: 'up',
      icon: Calendar,
      color: 'green',
      link: 'organization'
    },
    {
      label: 'Pending Leave Requests',
      value: pendingLeaves.toString(),
      change: pendingLeaves > 0 ? 'Urgent' : 'Clear',
      trend: pendingLeaves > 0 ? 'down' : 'up',
      icon: Clock,
      color: 'purple',
      link: 'leave'
    }
  ];

  const isLoading = employeesLoading || deptsLoading || desigsLoading || leavesLoading;

  // Helper to format relative time safely
  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Recently';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return 'Recently';
    }
  };

  // Generate activities dynamically from real data: leave requests and employee onboarding
  const recentActivities = React.useMemo(() => {
    const activities: any[] = [];

    // Add activities for leave requests
    if (leaveRequestsRes?.data?.results) {
      leaveRequestsRes.data.results.forEach((req: any) => {
        const user = req.employee_name || `${req.employee_detail?.first_name || ''} ${req.employee_detail?.last_name || ''}`.trim() || 'Employee';
        const date = req.updated_at || req.created_at;
        const timeStr = date ? formatRelativeTime(date) : 'Recently';
        const timestamp = date ? new Date(date).getTime() : 0;

        let action = '';
        let status = 'pending';
        let icon = Clock;

        if (req.status?.toLowerCase() === 'pending') {
          action = `applied for ${req.leave_type_name || 'leave'}`;
          status = 'pending';
          icon = Clock;
        } else if (req.status?.toLowerCase() === 'approved') {
          action = `leave request was approved`;
          status = 'completed';
          icon = CheckCircle2;
        } else if (req.status?.toLowerCase() === 'rejected') {
          action = `leave request was rejected`;
          status = 'urgent';
          icon = AlertCircle;
        } else {
          action = `leave request status updated to ${req.status}`;
          status = 'pending';
          icon = Clock;
        }

        activities.push({
          id: `leave-${req.id}`,
          user,
          action,
          time: timeStr,
          status,
          icon,
          timestamp
        });
      });
    }

    // Add activities for employee onboarding
    if (employeesRes?.data?.results) {
      employeesRes.data.results.forEach((emp: any) => {
        const user = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'New Employee';
        const date = emp.created_at;
        const timeStr = date ? formatRelativeTime(date) : 'Recently';
        const timestamp = date ? new Date(date).getTime() : 0;

        activities.push({
          id: `emp-${emp.id}`,
          user,
          action: `joined the organization as ${emp.designation_detail?.name || 'team member'}`,
          time: timeStr,
          status: 'completed',
          icon: CheckCircle2,
          timestamp
        });
      });
    }

    // Sort by timestamp descending
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  }, [leaveRequestsRes, employeesRes]);

  // Generate upcoming leaves dynamically from real data
  const upcomingLeaves = React.useMemo(() => {
    return (leaveRequestsRes?.data?.results || [])
      .filter((req: any) => req.status?.toLowerCase() === 'approved')
      .map((req: any) => {
        const name = req.employee_name || `${req.employee_detail?.first_name || ''} ${req.employee_detail?.last_name || ''}`.trim() || 'Employee';
        const type = req.leave_type_name || 'Leave';
        let range = '';
        try {
          const start = new Date(req.start_date);
          const end = new Date(req.end_date);
          range = `${format(start, 'MMM dd')} - ${format(end, 'MMM dd')}`;
        } catch (e) {
          range = `${req.start_date} - ${req.end_date}`;
        }
        return {
          name,
          type,
          range,
          startDate: new Date(req.start_date)
        };
      })
      .sort((a: any, b: any) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, 5);
  }, [leaveRequestsRes]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header section */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Hr dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            onClick={() => router.push(`/Hrtools?tab=${stat.link}`)}
            className="group p-6 bg-card border border-border rounded-sm hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className={cn(
                "p-2 rounded-sm bg-muted group-hover:scale-110 transition-transform",
                stat.color === 'blue' && "text-blue-600 bg-blue-500/10",
                stat.color === 'orange' && "text-orange-600 bg-orange-500/10",
                stat.color === 'green' && "text-green-600 bg-green-500/10",
                stat.color === 'purple' && "text-purple-600 bg-purple-500/10"
              )}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full",
                stat.trend === 'up' ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
              )}>
                {stat.change}
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
            <div className="mt-4">
              {isLoading ? (
                <div className="h-9 w-12 bg-muted/60 animate-pulse rounded-sm" />
              ) : (
                <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
              )}
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <button data-agent="dashboard-view-all-activities-btn" className="text-xs font-semibold text-blue-600 hover:underline">View all</button>
          </div>
          <div className="bg-card border border-border rounded-sm divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-muted/60" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted/60 rounded-sm w-3/4" />
                    <div className="h-3 bg-muted/40 rounded-sm w-1/4" />
                  </div>
                </div>
              ))
            ) : recentActivities.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground italic">
                No recent activities recorded.
              </div>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                  <div className={cn(
                    "p-2 rounded-full",
                    activity.status === 'pending' && "bg-orange-500/10 text-orange-600",
                    activity.status === 'completed' && "bg-green-500/10 text-green-600",
                    activity.status === 'urgent' && "bg-red-500/10 text-red-600"
                  )}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      <span className="font-bold">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions/Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Quick Insights</h2>

          <div className="bg-card border border-border rounded-sm p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Upcoming Leaves</h3>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted/60" />
                      <div className="space-y-2">
                        <div className="h-3 bg-muted/60 rounded-sm w-20" />
                        <div className="h-2.5 bg-muted/40 rounded-sm w-12" />
                      </div>
                    </div>
                    <div className="h-3 bg-muted/60 rounded-sm w-16" />
                  </div>
                ))
              ) : upcomingLeaves.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground italic">
                  No upcoming leaves scheduled.
                </div>
              ) : (
                upcomingLeaves.map((leave, i) => (
                  <div key={i} className="flex items-center justify-between group animate-in fade-in duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-600 uppercase">
                        {leave.name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-xs font-bold">{leave.name}</p>
                        <p className="text-[10px] text-muted-foreground">{leave.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-medium text-foreground">{leave.range}</p>
                    </div>
                  </div>
                ))
              )}
              <button data-agent="dashboard-view-leave-calendar-btn" className="w-full mt-2 py-2 text-[10px] font-bold text-blue-600 hover:bg-blue-500/5 rounded-sm transition-colors border border-dashed border-blue-500/20">
                View Leave Calendar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
