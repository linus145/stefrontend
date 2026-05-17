'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { 
  Bell, 
  Heart, 
  MessageSquare, 
  UserPlus, 
  CheckCircle2, 
  Trash2, 
  Loader2, 
  BrainCircuit, 
  Building2, 
  ExternalLink,
  Clock,
  Sparkles,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NotificationPopoverProps {
  currentDashboard: 'USER' | 'RECRUITER' | 'INTERVIEW' | 'HR';
  triggerColorClass?: string;
  dotColorClass?: string;
  align?: 'left' | 'right';
}

export function NotificationPopover({ 
  currentDashboard, 
  triggerColorClass = "text-muted-foreground hover:text-foreground",
  dotColorClass = "bg-rose-500",
  align = "right"
}: NotificationPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // 1. Fetch unread counts across all dashboards (cross-dashboard)
  const { data: counts, refetch: refetchCounts } = useQuery({
    queryKey: ['notifications-counts'],
    queryFn: () => notificationService.getUnreadCounts(),
    refetchInterval: 15000,
  });

  // Active tab in popover: defaults to current dashboard (excluding USER for corporate popover), but user can click other tabs!
  const [activeTab, setActiveTab] = useState<'RECRUITER' | 'INTERVIEW' | 'HR'>(
    currentDashboard === 'USER' ? 'RECRUITER' : (currentDashboard as 'RECRUITER' | 'INTERVIEW' | 'HR')
  );

  // Sync activeTab if currentDashboard changes
  useEffect(() => {
    if (currentDashboard !== 'USER') {
      setActiveTab(currentDashboard as 'RECRUITER' | 'INTERVIEW' | 'HR');
    }
  }, [currentDashboard]);

  // 2. Fetch notifications for the active tab
  const { data: notifications, isLoading, refetch: refetchNotifications } = useQuery({
    queryKey: ['notifications', activeTab],
    queryFn: () => notificationService.getNotifications(activeTab),
    refetchInterval: 30000,
    enabled: isOpen || !!counts?.total,
  });

  // Mutators
  const markReadMutation = useMutation({
    mutationFn: notificationService.markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-counts'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllNotificationsRead(activeTab),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', activeTab] });
      queryClient.invalidateQueries({ queryKey: ['notifications-counts'] });
      toast.success(`Marked all ${activeTab.toLowerCase()} alerts as read`);
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => notificationService.deleteAllNotifications(activeTab),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', activeTab] });
      queryClient.invalidateQueries({ queryKey: ['notifications-counts'] });
      toast.success(`Cleared ${activeTab.toLowerCase()} notification history`);
    },
  });

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRelativeTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch (e) {
      return 'recently';
    }
  };

  const getDashboardIcon = (dash: 'USER' | 'RECRUITER' | 'INTERVIEW' | 'HR') => {
    switch (dash) {
      case 'USER': return <User className="w-3.5 h-3.5" />;
      case 'RECRUITER': return <Building2 className="w-3.5 h-3.5" />;
      case 'INTERVIEW': return <BrainCircuit className="w-3.5 h-3.5" />;
      case 'HR': return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LIKE': 
        return <Heart className="w-3.5 h-3.5 fill-current" />;
      case 'CONNECTION_REQUEST':
      case 'CONNECTION_ACCEPTED':
      case 'CONNECTION_REJECTED':
        return <UserPlus className="w-3.5 h-3.5" />;
      case 'NEW_APPLICATION':
        return <Building2 className="w-3.5 h-3.5" />;
      case 'INTERVIEW_INVITE':
      case 'INTERVIEW_COMPLETED':
        return <BrainCircuit className="w-3.5 h-3.5" />;
      case 'LEAVE_REQUEST':
      case 'LEAVE_APPROVED':
      case 'LEAVE_REJECTED':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'NEW_MESSAGE':
        return <MessageSquare className="w-3.5 h-3.5" />;
      default:
        return <Bell className="w-3.5 h-3.5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'LIKE': 
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case 'CONNECTION_REQUEST':
      case 'CONNECTION_ACCEPTED':
        return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
      case 'NEW_APPLICATION':
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case 'INTERVIEW_INVITE':
      case 'INTERVIEW_COMPLETED':
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case 'LEAVE_REQUEST':
      case 'LEAVE_APPROVED':
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case 'NEW_MESSAGE':
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const getDashboardLabel = (dash: 'USER' | 'RECRUITER' | 'INTERVIEW' | 'HR') => {
    switch (dash) {
      case 'USER': return 'User';
      case 'RECRUITER': return 'Recruiter';
      case 'INTERVIEW': return 'Interview';
      case 'HR': return 'HR';
    }
  };

  const getDashboardUrl = (dash: 'USER' | 'RECRUITER' | 'INTERVIEW' | 'HR') => {
    switch (dash) {
      case 'USER': return '/dashboard';
      case 'RECRUITER': return '/recruiter';
      case 'INTERVIEW': return '/recruiter/AIInterviews';
      case 'HR': return '/Hrtools';
    }
  };

  // Unread badge for trigger (specific to current dashboard, excluding USER for corporate popover)
  const currentUnreadCount = counts ? (currentDashboard === 'USER' ? 0 : (counts[currentDashboard as 'RECRUITER' | 'INTERVIEW' | 'HR'] || 0)) : 0;
  // Total unread count across corporate dashboards (excluding USER)
  const totalUnreadCount = counts ? ((counts.RECRUITER || 0) + (counts.INTERVIEW || 0) + (counts.HR || 0)) : 0;

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          refetchCounts();
          if (!isOpen) {
            refetchNotifications();
          }
        }}
        className={cn(
          "relative flex items-center justify-center p-1.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-1 focus:ring-primary/20",
          triggerColorClass,
          isOpen && "text-foreground bg-muted/30"
        )}
        title="Notifications"
      >
        <Bell className="w-5 h-5 transition-transform duration-300" />
        
        {/* Unread badge (flashes if there is anything unread) */}
        {totalUnreadCount > 0 && (
          <span className={cn(
            "absolute -top-0.5 -right-0.5 min-w-[12px] h-[12px] rounded-full flex items-center justify-center text-[7px] font-black text-white border border-background animate-pulse",
            currentUnreadCount > 0 ? dotColorClass : "bg-muted-foreground/60"
          )}>
            {totalUnreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className={cn(
          "absolute mt-2.5 w-[360px] bg-card/95 backdrop-blur-md border border-border/80 rounded-sm shadow-2xl z-50 animate-in fade-in slide-in-from-top-3 duration-250 flex flex-col max-h-[500px]",
          align === "right" ? "right-0" : "left-0"
        )}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wider">Alerts</h3>
              {totalUnreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-sm bg-rose-500/10 text-rose-500 text-[9px] font-bold">
                  {totalUnreadCount} New
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => markAllReadMutation.mutate()}
                disabled={!notifications?.filter((n: any) => !n.is_read).length || markAllReadMutation.isPending}
                className="p-1 rounded-sm text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Mark all as read"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => clearAllMutation.mutate()}
                disabled={!notifications?.length || clearAllMutation.isPending}
                className="p-1 rounded-sm text-muted-foreground/60 hover:text-destructive hover:bg-destructive/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Clear history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Cross-Dashboard Tabs */}
          <div className="bg-muted/30 border-b border-border/40 px-2 py-1.5 flex gap-1 items-center justify-between">
            {(['RECRUITER', 'INTERVIEW', 'HR'] as const).map((dash) => {
              const dashUnread = counts ? (counts[dash] || 0) : 0;
              const isSelected = activeTab === dash;
              return (
                <button
                  key={dash}
                  onClick={() => setActiveTab(dash)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 py-1 rounded-sm text-[10px] font-bold transition-all capitalize border",
                    isSelected 
                      ? "bg-background border-border text-foreground shadow-sm" 
                      : "bg-transparent border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {getDashboardIcon(dash)}
                  <span>{getDashboardLabel(dash)}</span>
                  {dashUnread > 0 && (
                    <span className={cn(
                      "px-1 py-0.2 rounded-full text-[7px] font-black text-white ml-0.5 shrink-0 min-w-[12px] text-center",
                      currentDashboard === dash ? dotColorClass : "bg-muted-foreground/60"
                    )}>
                      {dashUnread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5 min-h-[220px] max-h-[340px]">
            {isLoading ? (
              <div className="space-y-2 py-4 px-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 items-center animate-pulse">
                    <div className="w-8 h-8 bg-muted rounded-sm shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 bg-muted rounded w-3/4" />
                      <div className="h-2 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !notifications?.length ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="w-8 h-8 text-muted-foreground/20 mb-2" />
                <h4 className="text-[11px] font-bold text-foreground">No {getDashboardLabel(activeTab)} Alerts</h4>
                <p className="text-[10px] text-muted-foreground/75 px-6 mt-0.5">
                  You are all caught up on this panel.
                </p>
              </div>
            ) : (
              notifications.map((notif: any) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && markReadMutation.mutate(notif.id)}
                  className={cn(
                    "relative border rounded-sm p-3 flex gap-3 items-start transition-all cursor-pointer shadow-sm group",
                    !notif.is_read 
                      ? "border-primary/20 bg-primary/[0.01] hover:bg-primary/[0.03]" 
                      : "border-border/40 opacity-70 hover:opacity-100 hover:border-border/80"
                  )}
                >
                  {!notif.is_read && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-l-sm" />
                  )}

                  {/* Icon Indicator */}
                  <div className={cn(
                    "w-7 h-7 rounded-sm shrink-0 flex items-center justify-center border",
                    getNotificationColor(notif.notification_type)
                  )}>
                    {getNotificationIcon(notif.notification_type)}
                  </div>

                  {/* Message body */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-foreground leading-snug break-words">
                      {notif.sender_name && notif.message.includes(notif.sender_name) ? (
                        <>
                          <span className="font-bold text-foreground">{notif.sender_name}</span>
                          {notif.message.replace(notif.sender_name, '')}
                        </>
                      ) : (
                        notif.message
                      )}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-muted-foreground">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{getRelativeTime(notif.created_at)}</span>
                      {!notif.is_read && (
                        <span className="text-[7px] font-black text-primary uppercase tracking-tighter bg-primary/10 px-1 py-0.2 rounded-sm ml-1">New</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer - Switch Dashboard / Cross Dashboard link */}
          {activeTab !== currentDashboard && (
            <a
              href={getDashboardUrl(activeTab)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="border-t border-border/50 bg-muted/20 px-4 py-2.5 text-[11px] font-bold text-blue-500 hover:text-blue-600 hover:bg-muted/40 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Go to {getDashboardLabel(activeTab)} Panel</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
