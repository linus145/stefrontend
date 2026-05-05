'use client';

import React from 'react';
import { Search, Bell, Heart, MessageSquare, Loader2, UserPlus, UserMinus, Home, Briefcase, Users, Newspaper, Network as NetworkIcon, Menu, Settings, User, LogOut, ChevronDown, Wallet, Rocket, ArrowUpCircle, HelpCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import { postService } from '@/services/post.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { api } from '@/lib/api';
export type DashboardSection = 'dashboard' | 'Profile' | 'messages' | 'network' | 'settings' | 'jobs' | 'news' | 'hire' | 'create-post' | 'notifications';
import { getOptimizedImage } from '@/lib/imagekit';

interface DashboardHeaderProps {
   isRightCollapsed?: boolean;
   hasRightSidebar?: boolean;
   activeSection: DashboardSection;
   onSectionChange: (section: DashboardSection, userId?: string | null) => void;
   onMobileMenuToggle?: () => void;
}

export function DashboardHeader({
   isRightCollapsed,
   hasRightSidebar,
   activeSection,
   onSectionChange,
}: DashboardHeaderProps) {
   const { user } = useAuth();
   const queryClient = useQueryClient();
   const [showNotifications, setShowNotifications] = React.useState(false);
   const [showProfileMenu, setShowProfileMenu] = React.useState(false);
   const [isMenuLocked, setIsMenuLocked] = React.useState(false);
   const { logout } = useAuth();

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

   const toggleMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      const nextLocked = !isMenuLocked;
      setIsMenuLocked(nextLocked);
      setShowProfileMenu(nextLocked);
   };

   return (
      <header className={cn(
         "fixed top-0 left-0 right-0 transition-all duration-300 ease-in-out flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40",
         "h-20 lg:h-16 bg-background/80 backdrop-blur-md border-b border-border"
      )}>

         {/* Left Section: Mobile Menu / Search */}
         <div className="flex items-center gap-6 lg:flex-1 min-w-0">
            {/* Brand Logo */}
            <div className="flex items-center gap-3 shrink-0">
               <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm hover:scale-105 transition-transform cursor-pointer">
                  <Rocket className="h-4 w-4" />
               </div>
               <div className="hidden sm:block animate-in fade-in slide-in-from-left-2 duration-300">
                  <h1 className="text-foreground font-semibold text-base leading-tight tracking-tight uppercase">B2LINQ</h1>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-80">Architect</p>
               </div>
            </div>


            <div className="hidden lg:flex items-center relative group/search h-9 w-48 xl:w-64 min-w-0 flex-shrink">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
               <input
                  type="text"
                  placeholder="Search the network..."
                  className="w-full h-full bg-muted/50 border border-border rounded-md pl-10 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all min-w-0"
               />
            </div>
         </div>

         {/* Center Section: Navigation Tabs (Desktop) / Theme Toggle (Mobile) */}
         <div className="flex lg:flex-none items-center justify-center min-w-0">
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 h-full min-w-0 overflow-x-auto custom-scrollbar">
               <button
                  onClick={() => onSectionChange('dashboard')}
                  className="relative h-full flex flex-col items-center justify-center px-3 group/tab min-w-[64px]"
               >
                  <Home className={cn(
                     "w-[20px] h-[20px] mb-1 transition-all group-hover/tab:scale-110",
                     activeSection === 'dashboard' ? "text-primary" : "text-muted-foreground group-hover/tab:text-foreground"
                  )} />
                  <span className={cn(
                     "text-[10px] font-bold uppercase tracking-tight transition-colors",
                     activeSection === 'dashboard' ? "text-foreground" : "text-muted-foreground group-hover/tab:text-foreground"
                  )}>Home</span>
                  {activeSection === 'dashboard' && <div className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(180,156,248,0.5)]" />}
               </button>

               <button
                  onClick={() => onSectionChange('network')}
                  className="relative h-full flex flex-col items-center justify-center px-3 group/tab min-w-[64px]"
               >
                  <NetworkIcon className={cn(
                     "w-[20px] h-[20px] mb-1 transition-all group-hover/tab:scale-110",
                     activeSection === 'network' ? "text-primary" : "text-muted-foreground group-hover/tab:text-foreground"
                  )} />
                  <span className={cn(
                     "text-[10px] font-bold uppercase tracking-tight transition-colors",
                     activeSection === 'network' ? "text-foreground" : "text-muted-foreground group-hover/tab:text-foreground"
                  )}>Network</span>
                  {activeSection === 'network' && <div className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(180,156,248,0.5)]" />}
               </button>

               <button
                  onClick={() => onSectionChange('messages')}
                  className="relative h-full flex flex-col items-center justify-center px-3 group/tab min-w-[64px]"
               >
                  <MessageSquare className={cn(
                     "w-[20px] h-[20px] mb-1 transition-all group-hover/tab:scale-110",
                     activeSection === 'messages' ? "text-primary" : "text-muted-foreground group-hover/tab:text-foreground"
                  )} />
                  <span className={cn(
                     "text-[10px] font-bold uppercase tracking-tight transition-colors",
                     activeSection === 'messages' ? "text-foreground" : "text-muted-foreground group-hover/tab:text-foreground"
                  )}>Messages</span>
                  {activeSection === 'messages' && <div className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(180,156,248,0.5)]" />}
               </button>

               <button
                  onClick={() => onSectionChange('jobs')}
                  className="relative h-full flex flex-col items-center justify-center px-3 group/tab min-w-[64px]"
               >
                  <Briefcase className={cn(
                     "w-[20px] h-[20px] mb-1 transition-all group-hover/tab:scale-110",
                     activeSection === 'jobs' ? "text-primary" : "text-muted-foreground group-hover/tab:text-foreground"
                  )} />
                  <span className={cn(
                     "text-[10px] font-bold uppercase tracking-tight transition-colors",
                     activeSection === 'jobs' ? "text-foreground" : "text-muted-foreground group-hover/tab:text-foreground"
                  )}>Jobs</span>
                  {activeSection === 'jobs' && <div className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(180,156,248,0.5)]" />}
               </button>

               <a
                  href="/recruiter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative h-full flex flex-col items-center justify-center px-3 group/tab min-w-[64px]"
               >
                  <div className="relative">
                     <Users className={cn(
                        "w-[20px] h-[20px] mb-1 transition-all group-hover/tab:scale-110",
                        activeSection === 'hire' ? "text-primary" : "text-muted-foreground group-hover/tab:text-foreground"
                     )} />
                     <div className="absolute -top-1 -right-4 px-1 py-0.5 bg-primary/20 border border-primary/30 rounded-[4px] text-[6px] font-black text-primary uppercase tracking-tighter scale-75 animate-pulse">
                        Soon
                     </div>
                  </div>
                  <span className={cn(
                     "text-[10px] font-bold uppercase tracking-tight transition-colors",
                     activeSection === 'hire' ? "text-foreground" : "text-muted-foreground group-hover/tab:text-foreground"
                  )}>Hire</span>
                  {activeSection === 'hire' && <div className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(180,156,248,0.5)]" />}
               </a>

               <button
                  onClick={() => onSectionChange('news')}
                  className="relative h-full flex flex-col items-center justify-center px-3 group/tab min-w-[64px]"
               >
                  <div className="relative">
                     <Newspaper className={cn(
                        "w-[20px] h-[20px] mb-1 transition-all group-hover/tab:scale-110",
                        activeSection === 'news' ? "text-primary" : "text-muted-foreground group-hover/tab:text-foreground"
                     )} />
                     <div className="absolute -top-1 -right-3 px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-500 text-[7px] font-black uppercase tracking-tighter scale-75">New</div>
                  </div>
                  <span className={cn(
                     "text-[10px] font-bold uppercase tracking-tight transition-colors",
                     activeSection === 'news' ? "text-foreground" : "text-muted-foreground group-hover/tab:text-foreground"
                  )}>News</span>
                  {activeSection === 'news' && <div className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(180,156,248,0.5)]" />}
               </button>

               <button
                  onClick={() => onSectionChange('notifications')}
                  className="relative h-full flex flex-col items-center justify-center px-3 group/tab min-w-[64px]"
               >
                  <div className="relative">
                     <Bell className={cn(
                        "w-[20px] h-[20px] mb-1 transition-all group-hover/tab:scale-110",
                        activeSection === 'notifications' ? "text-primary" : "text-muted-foreground group-hover/tab:text-foreground"
                     )} />
                     {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] rounded-full bg-rose-500 flex items-center justify-center text-[7px] font-black text-white border border-background">
                           {unreadCount}
                        </span>
                     )}
                  </div>
                  <span className={cn(
                     "text-[10px] font-bold uppercase tracking-tight transition-colors",
                     activeSection === 'notifications' ? "text-foreground" : "text-muted-foreground group-hover/tab:text-foreground"
                  )}>Notifications</span>
                  {activeSection === 'notifications' && <div className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(180,156,248,0.5)]" />}
               </button>
            </nav>

            <div className="lg:hidden">
               <ThemeToggle />
            </div>
         </div>

         {/* Right Section: Actions / Profile */}
         <div className="flex items-center gap-3 sm:gap-6 lg:flex-1 justify-end h-full min-w-0">
            <div className="flex items-center gap-3 sm:gap-5 sm:pr-6 sm:border-r sm:border-border h-8 min-w-0">
               <div className="hidden lg:block">
                  <ThemeToggle />
               </div>

               {/* Mobile Wallet Icon */}
               <button className="flex lg:hidden text-muted-foreground hover:text-foreground transition-all hover:scale-105 active:scale-95">
                  <div className="relative">
                     <Wallet className="w-6 h-6" />
                     <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-background" />
                  </div>
               </button>

            </div>

            <button className="hidden lg:flex items-center gap-2.5 px-4 xl:px-5 py-2 rounded-xl bg-primary/5 border border-primary/20 text-foreground text-[10px] font-bold hover:bg-primary/10 transition-all shadow-sm group">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:animate-pulse" />
               <span className="transition-all duration-300">
                  {isRightCollapsed ? 'Connect Wallet' : 'Wallet'}
               </span>
            </button>

            {/* LinkedIn-style "Me" Section on the right */}
            <div
               className="relative h-full flex flex-col items-center justify-center px-3 group/profile cursor-pointer min-w-[64px]"
               onMouseEnter={() => !isMenuLocked && setShowProfileMenu(true)}
               onMouseLeave={() => !isMenuLocked && setShowProfileMenu(false)}
            >
               <div
                  onClick={() => onSectionChange('Profile')}
                  className="relative mb-0.5"
               >
                  <div className={cn(
                     "w-7 h-7 lg:w-6 lg:h-6 rounded-full border p-0.5 relative z-10 transition-all duration-300",
                     (activeSection === 'Profile' || activeSection === 'settings' || showProfileMenu) ? "border-primary" : "border-muted-foreground/30 group-hover/profile:border-foreground"
                  )}>
                     <div className="w-full h-full rounded-full bg-background overflow-hidden">
                        {user?.profile?.profile_image_url ? (
                           <img
                              src={`${getOptimizedImage(user.profile.profile_image_url)}&v=${user.updated_at ? new Date(user.updated_at).getTime() : Date.now()}`}
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

               <div
                  onClick={toggleMenu}
                  className="flex items-center gap-0.5"
               >
                  <span className={cn(
                     "text-[10px] font-medium transition-colors hidden sm:block",
                     (activeSection === 'Profile' || activeSection === 'settings' || showProfileMenu) ? "text-foreground" : "text-muted-foreground group-hover/profile:text-foreground"
                  )}>Me</span>
                  <ChevronDown className={cn(
                     "w-3.5 h-3.5 lg:w-3 lg:h-3 transition-transform duration-300",
                     (showProfileMenu || isMenuLocked) ? "rotate-180 text-primary" : "text-muted-foreground group-hover/profile:text-foreground"
                  )} />
               </div>

               {/* Indicator Bar */}
               {(activeSection === 'Profile' || activeSection === 'settings') && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(180,156,248,0.5)]" />
               )}

               {showProfileMenu && (
                  <div className="absolute top-full right-0 mt-1 w-52 bg-card border border-border rounded-md shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                     <div className="px-4 py-2 mb-1 border-b border-border/50">
                        <p className="text-[11px] font-bold text-foreground truncate">{user?.first_name} {user?.last_name}</p>
                        <p className="text-[9px] text-muted-foreground truncate font-medium">{user?.email}</p>
                     </div>

                     <button
                        onClick={() => {
                           onSectionChange('Profile');
                           setShowProfileMenu(false);
                           setIsMenuLocked(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all group/item"
                     >
                        <User className="w-4 h-4 transition-colors group-hover/item:text-primary" />
                        Profile
                     </button>

                     <button
                        onClick={() => {
                           setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all group/item"
                     >
                        <ArrowUpCircle className="w-4 h-4 transition-colors group-hover/item:text-primary" />
                        Raise Capital
                     </button>

                     <button
                        onClick={() => {
                           setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all group/item"
                     >
                        <HelpCircle className="w-4 h-4 transition-colors group-hover/item:text-primary" />
                        Support
                     </button>

                     <button
                        onClick={() => {
                           onSectionChange('settings');
                           setShowProfileMenu(false);
                           setIsMenuLocked(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all group/item"
                     >
                        <Settings className="w-4 h-4 transition-colors group-hover/item:text-primary" />
                        Settings
                     </button>

                     <div className="mt-1 pt-1 border-t border-border/50">
                        <button
                           onClick={() => logout()}
                           className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all group/item"
                        >
                           <LogOut className="w-4 h-4 transition-colors group-hover/item:text-destructive" />
                           Logout
                        </button>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </header>
   );
}
