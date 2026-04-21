'use client';

import React from 'react';
import { Search, Bell, Heart, MessageSquare, Loader2, UserPlus, UserMinus, Home, Briefcase, Users, Newspaper, Network as NetworkIcon, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import { postService } from '@/services/post.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { api } from '@/lib/api';

import { DashboardSection } from './left-sidebar';
import { getOptimizedImage } from '@/lib/imagekit';

interface DashboardHeaderProps {
   isCollapsed: boolean;
   activeSection: DashboardSection;
   onSectionChange: (section: DashboardSection, userId?: string | null) => void;
   onMobileMenuToggle?: () => void;
}

export function DashboardHeader({ isCollapsed, activeSection, onSectionChange, onMobileMenuToggle }: DashboardHeaderProps) {
   const { user } = useAuth();
   const queryClient = useQueryClient();
   const [showNotifications, setShowNotifications] = React.useState(false);

   const { data: notifications } = useQuery({
      queryKey: ['notifications'],
      queryFn: postService.getNotifications,
      refetchInterval: 30000,
   });

   const markReadMutation = useMutation({
      mutationFn: postService.markNotificationRead,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
   });

   const clearAllMutation = useMutation({
      mutationFn: postService.deleteAllNotifications,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
   });

   const unreadCount = notifications?.filter((n: any) => !n.is_read).length || 0;

   const getRelativeTime = (dateStr: string) => {
      try {
         return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
      } catch (e) {
         return 'recently';
      }
   };

   return (
      <header className={cn(
         "fixed top-0 right-0 h-16 transition-all duration-300 ease-in-out flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40",
         "bg-background/80 backdrop-blur-md border-b border-border",
         "left-0 lg:left-auto",
         isCollapsed ? "lg:left-20" : "lg:left-60"
      )}>

         {/* Mobile: Hamburger + Brand */}
         <div className="flex items-center gap-3 lg:hidden">
            <button
               onClick={onMobileMenuToggle}
               className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted/50 border border-border text-muted-foreground hover:text-foreground transition-all active:scale-95"
            >
               <Menu className="w-5 h-5" />
            </button>
         </div>

         {/* Desktop: Search + Nav Tabs */}
         <div className="hidden lg:flex items-center flex-1 max-w-2xl h-full">
            <div className="relative group/search h-9 w-72 mr-8">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
               <input
                  type="text"
                  placeholder="Universal search..."
                  className="w-full h-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all"
               />
            </div>

            <nav className="flex items-center gap-6 h-full ml-4">
               <button
                  onClick={() => onSectionChange('dashboard')}
                  className="relative h-full flex flex-col items-center justify-center px-3 group/tab min-w-[64px]"
               >
                  <Home className={cn(
                     "w-[18px] h-[18px] mb-1 transition-colors",
                     activeSection === 'dashboard' ? "text-primary" : "text-muted-foreground group-hover/tab:text-foreground"
                  )} />
                  <span className={cn(
                     "text-[10px] font-medium transition-colors",
                     activeSection === 'dashboard' ? "text-foreground" : "text-muted-foreground group-hover/tab:text-foreground"
                  )}>Home</span>
                  {activeSection === 'dashboard' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(180,156,248,0.5)]" />}
               </button>

               <button
                  onClick={() => onSectionChange('network')}
                  className="relative h-full flex flex-col items-center justify-center px-3 group/tab min-w-[64px]"
               >
                  <NetworkIcon className={cn(
                     "w-[18px] h-[18px] mb-1 transition-colors",
                     activeSection === 'network' ? "text-primary" : "text-muted-foreground group-hover/tab:text-foreground"
                  )} />
                  <span className={cn(
                     "text-[10px] font-medium transition-colors",
                     activeSection === 'network' ? "text-foreground" : "text-muted-foreground group-hover/tab:text-foreground"
                  )}>Network</span>
                  {activeSection === 'network' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(180,156,248,0.5)]" />}
               </button>

               <button
                  onClick={() => onSectionChange('jobs')}
                  className="relative h-full flex flex-col items-center justify-center px-3 group/tab min-w-[64px]"
               >
                  <Briefcase className={cn(
                     "w-[18px] h-[18px] mb-1 transition-colors",
                     activeSection === 'jobs' ? "text-primary" : "text-muted-foreground group-hover/tab:text-foreground"
                  )} />
                  <span className={cn(
                     "text-[10px] font-medium transition-colors",
                     activeSection === 'jobs' ? "text-foreground" : "text-muted-foreground group-hover/tab:text-foreground"
                  )}>Jobs</span>
                  {activeSection === 'jobs' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(180,156,248,0.5)]" />}
               </button>

               <button
                  onClick={() => onSectionChange('news')}
                  className="relative h-full flex flex-col items-center justify-center px-3 group/tab min-w-[64px]"
               >
                  <div className="relative">
                     <Newspaper className={cn(
                        "w-[18px] h-[18px] mb-1 transition-colors",
                        activeSection === 'news' ? "text-primary" : "text-muted-foreground group-hover/tab:text-foreground"
                     )} />
                     <div className="absolute -top-1 -right-3 px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-500 text-[7px] font-black uppercase tracking-tighter scale-75">New</div>
                  </div>
                  <span className={cn(
                     "text-[10px] font-medium transition-colors",
                     activeSection === 'news' ? "text-foreground" : "text-muted-foreground group-hover/tab:text-foreground"
                  )}>News</span>
                  {activeSection === 'news' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(180,156,248,0.5)]" />}
               </button>
            </nav>
         </div>

         {/* Mobile: Bottom navigation tabs (compact) */}
         {/* Handled by a separate mobile bottom nav */}

         <div className="flex items-center gap-3 sm:gap-6 justify-end">
            <div className="flex items-center gap-3 sm:gap-5 sm:pr-6 sm:border-r sm:border-border">
               <ThemeToggle />

               <div className="relative">
                  <button
                     onClick={() => setShowNotifications(!showNotifications)}
                     className="relative text-muted-foreground hover:text-foreground transition-all hover:scale-105 active:scale-95"
                  >
                     <Bell className="w-5 h-5" />
                     {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-primary flex items-center justify-center text-[8px] font-bold text-primary-foreground border-2 border-background">
                           {unreadCount}
                        </span>
                     )}
                  </button>

                  {showNotifications && (
                     <div className="absolute top-12 right-0 w-[calc(100vw-32px)] sm:w-[380px] bg-card border border-border rounded-2xl shadow-md overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                           <div>
                              <h3 className="text-xs font-bold text-foreground">Notifications</h3>
                              <p className="text-[10px] text-muted-foreground font-medium">{unreadCount} unread notifications</p>
                           </div>
                           <button
                              type="button"
                              disabled={clearAllMutation.isPending || (notifications?.length === 0)}
                              onClick={(e) => {
                                 e.stopPropagation();
                                 clearAllMutation.mutate();
                              }}
                              className={cn(
                                 "text-[10px] font-bold text-primary hover:opacity-80 transition-all px-2.5 py-1 rounded-lg border border-primary/20",
                                 "flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                              )}
                           >
                              {clearAllMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                              Clear All
                           </button>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                           {notifications?.length === 0 ? (
                              <div className="p-12 text-center">
                                 <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-20" />
                                 <p className="text-muted-foreground text-xs font-medium">No new notifications</p>
                              </div>
                           ) : (
                              notifications?.map((notif: any) => (
                                 <div
                                    key={notif.id}
                                    onClick={() => markReadMutation.mutate(notif.id)}
                                    className={cn(
                                       "p-4 border-b border-border/50 hover:bg-muted/30 transition-all cursor-pointer group flex gap-3 items-start",
                                       !notif.is_read ? "bg-primary/5" : "opacity-60"
                                    )}
                                 >
                                    <div className={cn(
                                       "w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition-transform group-hover:scale-105",
                                       notif.notification_type === 'LIKE' ? "bg-rose-500/10 text-rose-500" :
                                          notif.notification_type === 'CONNECTION_REQUEST' || notif.notification_type === 'CONNECTION_ACCEPTED' ? "bg-cyan-500/10 text-cyan-500" :
                                             "bg-primary/10 text-primary"
                                    )}>
                                       {notif.notification_type === 'LIKE' ? <Heart className="w-3.5 h-3.5 fill-current" /> :
                                          notif.notification_type === 'CONNECTION_REQUEST' || notif.notification_type === 'CONNECTION_ACCEPTED' ? <UserPlus className="w-3.5 h-3.5" /> :
                                             <MessageSquare className="w-3.5 h-3.5" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                       <p className="text-[13px] text-foreground leading-snug mb-0.5">
                                          <span className="font-semibold">{notif.sender_name}</span> {notif.message.replace(notif.sender_name, '').trim()}
                                       </p>
                                       <p className="text-[10px] text-muted-foreground font-medium">{getRelativeTime(notif.created_at)}</p>
                                    </div>
                                 </div>
                              ))
                           )}
                        </div>

                        <div className="p-2.5 bg-muted/10 border-t border-border text-center">
                           <button className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">View All</button>
                        </div>
                     </div>
                  )}
               </div>
            </div>

            <button className="hidden xl:flex items-center gap-2.5 px-5 py-2 rounded-xl bg-primary/5 border border-primary/20 text-foreground text-[10px] font-semibold hover:bg-primary/10 transition-all shadow-sm group">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:animate-pulse" />
               Connect Wallet
            </button>

            <div
               onClick={() => onSectionChange('Profile')}
               className="relative group/avatar cursor-pointer"
            >
               <div className="absolute inset-0 bg-primary/20 blur-md opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
               <div className="w-9 h-9 rounded-full border border-border p-0.5 relative z-10 transition-transform group-hover/avatar:scale-110 shadow-sm">
                  <div className="w-full h-full rounded-full bg-background overflow-hidden">
                     {user?.profile?.profile_image_url ? (
                        <img
                           src={getOptimizedImage(user.profile.profile_image_url)}
                           alt="Profile"
                           className="w-full h-full object-cover rounded-full"
                        />
                     ) : (
                        <div className="w-full h-full bg-primary flex items-center justify-center text-[10px] font-bold text-white uppercase">
                           {user?.first_name?.[0] || 'U'}
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </header>
   );
}
