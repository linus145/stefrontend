'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { Bell, Heart, MessageSquare, UserPlus, Loader2, Trash2, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function NotificationsView() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications('USER'),
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: notificationService.markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllNotificationsRead('USER'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read.');
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => notificationService.deleteAllNotifications('USER'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification history cleared.');
    },
  });

  const getRelativeTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch (e) {
      return 'recently';
    }
  };

  const unreadCount = notifications?.filter((n: any) => !n.is_read).length || 0;

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">Notifications</h2>
            <p className="text-sm text-muted-foreground font-medium">
              You have {unreadCount} unread alerts in your network.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => markAllReadMutation.mutate()}
              disabled={unreadCount === 0 || markAllReadMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-all border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {markAllReadMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Mark all as read
            </button>
            <button
              onClick={() => clearAllMutation.mutate()}
              disabled={!notifications?.length || clearAllMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-sm text-[11px] font-bold uppercase tracking-wider transition-all border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {clearAllMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Clear All
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-sm p-6 flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-sm bg-muted shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="w-3/4 h-3 bg-muted rounded" />
                  <div className="w-1/4 h-2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : !notifications?.length ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-sm bg-muted/5">
            <Bell className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-bold text-foreground">All caught up!</h3>
            <p className="text-sm text-muted-foreground">No new notifications to show right now.</p>
          </div>
        ) : (
          <div className="space-y-3 pb-12">
            {notifications.map((notif: any) => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markReadMutation.mutate(notif.id)}
                className={cn(
                  "group relative bg-card border transition-all cursor-pointer rounded-sm p-6 flex gap-5 items-start shadow-sm",
                  !notif.is_read 
                    ? "border-primary/30 bg-primary/[0.02] hover:bg-primary/[0.04]" 
                    : "border-border opacity-70 hover:opacity-100 hover:border-muted-foreground/30"
                )}
              >
                {!notif.is_read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-sm" />
                )}
                
                <div className={cn(
                  "w-10 h-10 rounded-sm shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 border shadow-sm",
                  notif.notification_type === 'LIKE' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                  notif.notification_type === 'CONNECTION_REQUEST' || notif.notification_type === 'CONNECTION_ACCEPTED' ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" :
                  "bg-primary/10 text-primary border-primary/20"
                )}>
                  {notif.notification_type === 'LIKE' ? <Heart className="w-4 h-4 fill-current" /> :
                  notif.notification_type === 'CONNECTION_REQUEST' || notif.notification_type === 'CONNECTION_ACCEPTED' ? <UserPlus className="w-4 h-4" /> :
                  <MessageSquare className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[15px] text-foreground leading-snug mb-1.5">
                    <span className="font-bold">{notif.sender_name}</span> {notif.message.replace(notif.sender_name, '').trim()}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getRelativeTime(notif.created_at)}
                    </span>
                    {!notif.is_read && (
                      <span className="text-[10px] font-black text-primary uppercase tracking-tighter bg-primary/10 px-1.5 py-0.5 rounded">New</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Clock({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
