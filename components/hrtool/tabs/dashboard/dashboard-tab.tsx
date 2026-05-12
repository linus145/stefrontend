'use client';

import React from 'react';
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

export function DashboardTab() {
  const stats = [
    {
      label: 'Total Employees',
      value: '124',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      label: 'On Leave Today',
      value: '8',
      change: '-2',
      trend: 'down',
      icon: FileText,
      color: 'orange'
    },
    {
      label: 'Present Today',
      value: '112',
      change: '92%',
      trend: 'up',
      icon: Calendar,
      color: 'green'
    },
    {
      label: 'Pending Requests',
      value: '15',
      change: '+5',
      trend: 'up',
      icon: Clock,
      color: 'purple'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      user: 'John Doe',
      action: 'applied for sick leave',
      time: '2 hours ago',
      status: 'pending',
      icon: Clock
    },
    {
      id: 2,
      user: 'Sarah Smith',
      action: 'completed performance review',
      time: '5 hours ago',
      status: 'completed',
      icon: CheckCircle2
    },
    {
      id: 3,
      user: 'Mike Johnson',
      action: 'updated payroll details',
      time: 'Yesterday',
      status: 'urgent',
      icon: AlertCircle
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">HR Overview</h1>
        <p className="text-muted-foreground">Monitor your organization's health and activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div 
            key={i}
            className="group p-6 bg-card border border-border rounded-sm hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/5"
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
              <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
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
            <button className="text-xs font-semibold text-blue-600 hover:underline">View all</button>
          </div>
          <div className="bg-card border border-border rounded-sm divide-y divide-border">
            {recentActivities.map((activity) => (
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
            ))}
          </div>
        </div>

        {/* Quick Actions/Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Quick Insights</h2>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-sm p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
            <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-500" />
            <p className="text-sm font-medium text-white/80">Organization growth</p>
            <h3 className="text-2xl font-bold mt-1">+15% this month</h3>
            <div className="mt-6 flex gap-2">
              <button className="px-4 py-2 bg-white text-blue-600 text-xs font-bold rounded-sm hover:bg-blue-50 transition-colors">
                Generate Report
              </button>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-sm p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Upcoming events</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-sm bg-muted flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">May</span>
                  <span className="text-sm font-bold">15</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Company Townhall</p>
                  <p className="text-xs text-muted-foreground">10:00 AM - 11:30 AM</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-sm bg-muted flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">May</span>
                  <span className="text-sm font-bold">18</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Payroll Processing</p>
                  <p className="text-xs text-muted-foreground">Full day event</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-sm p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Upcoming Leaves</h3>
            <div className="space-y-4">
              {[
                { name: 'Emily Wilson', type: 'Annual Leave', range: 'May 16 - May 20' },
                { name: 'David Chen', type: 'Sick Leave', range: 'May 14 - May 15' },
                { name: 'Jessica Lee', type: 'Casual Leave', range: 'May 22 - May 22' },
              ].map((leave, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-600">
                      {leave.name.split(' ').map(n => n[0]).join('')}
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
              ))}
              <button className="w-full mt-2 py-2 text-[10px] font-bold text-blue-600 hover:bg-blue-500/5 rounded-sm transition-colors border border-dashed border-blue-500/20">
                View Leave Calendar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
