'use client';

import React from 'react';
import { Search, Bell, Heart, MessageSquare, Loader2, UserPlus, UserMinus, Home, Briefcase, Users, Newspaper, Network as NetworkIcon, Menu, Settings, User, LogOut, ChevronDown, Wallet, Rocket, ArrowUpCircle, HelpCircle, Sparkles, Crown, Coins } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { creditsService } from '@/services/credits.service';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import { postService } from '@/services/post.service';
import { toast } from 'sonner';
import { notificationService } from '@/services/notification.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { api } from '@/lib/api';
import { axiosInstance } from '@/lib/axios';
export type DashboardSection = 'dashboard' | 'Profile' | 'messages' | 'network' | 'settings' | 'jobs' | 'news' | 'hire' | 'create-post' | 'notifications' | 'premium' | 'credits' | 'userblogs';
import { getOptimizedImage } from '@/lib/imagekit';

import { GlobalSearch } from './search/global-search';

interface DashboardHeaderProps {
   isRightCollapsed?: boolean;
   hasRightSidebar?: boolean;
   activeSection: DashboardSection;
   onSectionChange: (section: DashboardSection, userId?: string | null, intent?: 'connection' | 'direct') => void;
   onMobileMenuToggle?: () => void;
}

export function DashboardHeader({
   isRightCollapsed,
   hasRightSidebar,
   activeSection,
   onSectionChange,
}: DashboardHeaderProps) {
   const { user, userSubscription, fetchSubscription } = useAuth();
   const isPremium = !!(userSubscription &&
      userSubscription.status === 'active' &&
      userSubscription.plan_details &&
      Number(userSubscription.plan_details.price) > 0);
   const queryClient = useQueryClient();
   const [showNotifications, setShowNotifications] = React.useState(false);
   const [showProfileMenu, setShowProfileMenu] = React.useState(false);
   const [isMenuLocked, setIsMenuLocked] = React.useState(false);
   const [showMobileProfileSidebar, setShowMobileProfileSidebar] = React.useState(false);
   const [isActivating, setIsActivating] = React.useState(false);
   const { logout } = useAuth();

   const { data: notifications } = useQuery({
      queryKey: ['notifications'],
      queryFn: () => notificationService.getNotifications('USER'),
      refetchInterval: 30000,
   });

   const { data: creditsData } = useQuery({
      queryKey: ['userCredits'],
      queryFn: () => creditsService.getBalance(),
      refetchInterval: 60000,
   });
   const creditBalance = creditsData?.data?.balance ?? 0;

   const markReadMutation = useMutation({
      mutationFn: notificationService.markNotificationRead,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
   });

   const clearAllMutation = useMutation({
      mutationFn: () => notificationService.deleteAllNotifications('USER'),
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

   const handleGoToBilling = (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      onSectionChange('settings');
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'Billing');
      window.history.replaceState(null, '', url.pathname + url.search);
      window.dispatchEvent(new Event('settings-tab-change'));
      setShowProfileMenu(false);
      setShowMobileProfileSidebar(false);
   };

   const handleGoToCredits = (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      onSectionChange('settings');
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'Credits');
      window.history.replaceState(null, '', url.pathname + url.search);
      window.dispatchEvent(new Event('settings-tab-change'));
      setShowProfileMenu(false);
      setShowMobileProfileSidebar(false);
   };

   const handleActivateSub = async (e: React.MouseEvent) => {
      e.stopPropagation();
      // Prevent self-activation of premium subscriptions via header
      if (Number(userSubscription?.plan_details?.price ?? 0) > 0) {
         toast.error("Verification Required", {
            description: "Premium plans must be verified manually by an administrator. Routing to billing uploader...",
         });
         handleGoToBilling();
         return;
      }

      setIsActivating(true);
      try {
         const response = await axiosInstance.post('/subscription/my-subscription/', {
            action: 'activate',
         });
         if (response.data) {
            await fetchSubscription();
            toast.success('Subscription activated successfully!', {
               description: `Welcome to the ${userSubscription?.plan_details?.name || 'Premium Plan'}! All premium features are now unlocked.`,
            });
         }
      } catch (error: any) {
         console.error('Error activating subscription:', error);
         toast.error(
            error.response?.data?.error || 'Failed to activate subscription. Please try again.'
         );
      } finally {
         setIsActivating(false);
      }
   };

   const renderPendingSubBox = (isMobile: boolean) => {
      if (!userSubscription?.plan_details) return null;

      const planPrice = Number(userSubscription.plan_details.price ?? 0);
      const isFreePlan = planPrice === 0;
      const isVerified = userSubscription.is_payment_verified ?? false;
      const latestPayment = userSubscription.latest_payment && userSubscription.latest_payment.plan === userSubscription.plan
         ? userSubscription.latest_payment
         : null;

      const isPendingSub = !isFreePlan ? !isVerified : userSubscription.status === 'pending';
      if (!isPendingSub) return null;

      const paddingClass = isMobile ? "px-5 py-3.5 mx-4 my-2" : "px-3 py-2 mx-2 my-1.5";
      const fontTitleClass = isMobile ? "text-[11px]" : "text-[10px]";
      const fontBtnClass = isMobile ? "text-[11px] h-8" : "text-[10px] h-7";

      if (!isFreePlan) {
         if (latestPayment?.status === 'pending') {
            return (
               <div className={cn(paddingClass, "bg-amber-500/10 border border-amber-500/20 rounded flex flex-col gap-2 shadow-sm animate-in fade-in duration-300")}>
                  <p className={cn(fontTitleClass, "text-amber-700 dark:text-amber-400 font-bold leading-normal")}>
                     Payment verification is under progress for {userSubscription.plan_details.name}.
                  </p>
                  <button
                     onClick={(e) => handleGoToBilling(e)}
                     className={cn(fontBtnClass, "w-full bg-amber-500 hover:bg-amber-600 text-white font-bold rounded flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-[0.98]")}
                  >
                     <span>View Status</span>
                  </button>
               </div>
            );
         } else if (latestPayment?.status === 'rejected') {
            return (
               <div className={cn(paddingClass, "bg-rose-500/10 border border-rose-500/20 rounded flex flex-col gap-2 shadow-sm animate-in fade-in duration-300")}>
                  <p className={cn(fontTitleClass, "text-rose-700 dark:text-rose-400 font-bold leading-normal")}>
                     Verification Rejected! Please re-submit proof.
                  </p>
                  <button
                     onClick={(e) => handleGoToBilling(e)}
                     className={cn(fontBtnClass, "w-full bg-rose-500 hover:bg-rose-600 text-white font-bold rounded flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-[0.98]")}
                  >
                     <span>Resolve Now</span>
                  </button>
               </div>
            );
         } else {
            return (
               <div className={cn(paddingClass, "bg-amber-500/10 border border-amber-500/20 rounded flex flex-col gap-2 shadow-sm animate-in fade-in duration-300")}>
                  <p className={cn(fontTitleClass, "text-amber-700 dark:text-amber-400 font-bold leading-normal")}>
                     Payment Verification Required for {userSubscription.plan_details.name}.
                  </p>
                  <button
                     onClick={(e) => handleGoToBilling(e)}
                     className={cn(fontBtnClass, "w-full bg-amber-500 hover:bg-amber-600 text-white font-bold rounded flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-[0.98]")}
                  >
                     <span>Verify Payment</span>
                  </button>
               </div>
            );
         }
      } else {
         return (
            <div className={cn(paddingClass, "bg-amber-500/10 border border-amber-500/20 rounded flex flex-col gap-2 shadow-sm animate-in fade-in duration-300")}>
               <p className={cn(fontTitleClass, "text-amber-700 dark:text-amber-400 font-bold leading-normal")}>
                  Your Free Tier is pending activation.
               </p>
               <button
                  onClick={handleActivateSub}
                  disabled={isActivating}
                  className={cn(fontBtnClass, "w-full bg-amber-500 hover:bg-amber-600 text-white font-bold rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-75 active:scale-[0.98]")}
               >
                  {isActivating ? (
                     <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Activating...</span>
                     </>
                  ) : (
                     <span>Activate Plan Now</span>
                  )}
               </button>
            </div>
         );
      }
   };

   const toggleMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      const nextLocked = !isMenuLocked;
      setIsMenuLocked(nextLocked);
      setShowProfileMenu(nextLocked);
   };

   return (
      <>
         {/* ═══ Mobile Profile Sidebar Overlay ═══ */}
         {showMobileProfileSidebar && (
            <div className="fixed inset-0 top-20 z-[100] lg:hidden" onClick={() => setShowMobileProfileSidebar(false)}>
               <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />
               <div
                  className="absolute left-0 top-0 h-full w-60 bg-background border-r border-border shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col"
                  onClick={(e) => e.stopPropagation()}
               >
                  {/* Plan & Credits Info */}
                  <div className="px-5 py-3.5 border-b border-border/60">
                     <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <span>Plan Status</span>
                        {isPremium ? (
                           <span className="text-[11px] font-extrabold bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC05] bg-clip-text text-transparent uppercase tracking-normal">
                              {userSubscription?.plan_details?.name || 'Premium'}
                           </span>
                        ) : userSubscription?.status === 'pending' && userSubscription?.plan_details ? (
                           <span className="text-[11px] font-extrabold text-amber-500 animate-pulse uppercase tracking-normal">
                              {userSubscription?.plan_details?.name} (Pending)
                           </span>
                        ) : (
                           <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                              Free Tier
                           </span>
                        )}
                     </div>
                     <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                        <span>AI Credits</span>
                        <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase">
                           {creditBalance}
                        </span>
                     </div>
                     <div className="h-[2px] w-full rounded-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] mt-2.5" />
                  </div>

                  {/* Menu Items */}
                  <div className="flex-1 overflow-y-auto py-2">
                     <button
                        onClick={() => { onSectionChange('Profile'); setShowMobileProfileSidebar(false); }}
                        className="w-full flex items-center gap-3.5 px-6 py-3.5 text-[13px] font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                     >
                        <User className="w-5 h-5" />
                        View Profile
                     </button>
                     {renderPendingSubBox(true)}
                     <button
                        onClick={() => {
                           onSectionChange('settings');
                           const url = new URL(window.location.href);
                           url.searchParams.set('tab', 'Billing');
                           window.history.replaceState(null, '', url.pathname + url.search);
                           window.dispatchEvent(new Event('settings-tab-change'));
                           setShowMobileProfileSidebar(false);
                        }}
                        className="w-full flex items-center gap-3.5 px-6 py-3.5 text-[13px] font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                     >
                        {isPremium ? (
                           <Sparkles className="w-5 h-5" />
                        ) : (
                           <Crown className="w-5 h-5" />
                        )}
                        {isPremium ? "Manage / Upgrade Plan" : "Try Premium"}
                     </button>
                     <button
                        onClick={() => setShowMobileProfileSidebar(false)}
                        className="w-full flex items-center gap-3.5 px-6 py-3.5 text-[13px] font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                     >
                        <ArrowUpCircle className="w-5 h-5" />
                        Raise Capital
                     </button>
                     <div className="flex items-center gap-3.5 px-6 py-3.5">
                        <ThemeToggle />
                        <span className="text-[13px] font-medium text-muted-foreground">Theme</span>
                     </div>
                  </div>

                  {/* Logout at bottom */}
                  <div className="p-4 border-t border-border">
                     <button
                        onClick={() => { logout(); setShowMobileProfileSidebar(false); }}
                        className="w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-[13px] font-medium text-destructive hover:bg-destructive/10 transition-all"
                     >
                        <LogOut className="w-5 h-5" />
                        Logout
                     </button>
                  </div>
               </div>
            </div>
         )}

         <header className={cn(
            "fixed top-0 left-0 right-0 z-[60]",
            "h-20 lg:h-16 bg-background/80 backdrop-blur-md border-b border-border"
         )}>
            {/* ═══ MOBILE HEADER (lg:hidden) ═══ */}
            <div className="flex lg:hidden items-center justify-between h-full px-4">
               {/* Left: Profile Avatar */}
               <button
                  onClick={() => setShowMobileProfileSidebar(true)}
                  className={cn(
                     "w-9 h-9 rounded-full transition-all active:scale-95 shrink-0 flex items-center justify-center p-[2px]",
                     isPremium
                        ? "bg-[conic-gradient(from_0deg,#4285F4,#EA4335,#FBBC05,#34A853,#4285F4)] animate-[spin_5s_linear_infinite]"
                        : "border-2 border-muted-foreground/30 hover:border-primary"
                  )}
               >
                  <div className="w-full h-full rounded-full bg-background overflow-hidden flex items-center justify-center">
                     {user?.profile?.profile_image_url ? (
                        <img
                           src={`${getOptimizedImage(user.profile.profile_image_url)}&v=${user.updated_at ? new Date(user.updated_at).getTime() : Date.now()}`}
                           alt="Profile"
                           className="w-full h-full object-cover rounded-full"
                        />
                     ) : (
                        <div className="w-full h-full bg-primary flex items-center justify-center text-[10px] font-bold text-white uppercase rounded-full">
                           {user?.first_name?.[0] || 'U'}
                        </div>
                     )}
                  </div>
               </button>

               {/* Center: Brand Logo */}
               <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                     <Rocket className="h-3.5 w-3.5" />
                  </div>
                  <div>
                     <h1 className="text-foreground font-semibold text-sm leading-tight tracking-tight uppercase">B2LINQ</h1>
                  </div>
               </div>

               {/* Right: Message Icon & Credits */}
               <div className="flex items-center gap-1.5 shrink-0">

                  {activeSection !== 'premium' ? (
                     <button
                        onClick={() => onSectionChange('messages')}
                        className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-primary transition-all active:scale-95 shrink-0"
                     >
                        <MessageSquare className={cn(
                           "w-5 h-5",
                           activeSection === 'messages' && "text-primary"
                        )} />
                     </button>
                  ) : (
                     <div className="w-9 h-9" />
                  )}
               </div>
            </div>

            {/* ═══ DESKTOP HEADER (hidden lg:flex) ═══ */}
            <div className="hidden lg:flex items-center h-full px-4 sm:px-6 lg:px-8">

               {/* Left Section: Logo & Search */}
               <div className="flex items-center gap-4 shrink-0">
                  {/* Brand Logo */}
                  <div className="flex items-center gap-3 shrink-0">
                     <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm hover:scale-105 transition-transform cursor-pointer -ml-3">
                        <Rocket className="h-4 w-4" />
                     </div>
                     <div className="hidden sm:block animate-in fade-in slide-in-from-left-2 duration-300">
                        <h1 className="text-foreground font-semibold text-base leading-tight tracking-tight uppercase">B2LINQ</h1>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-80">Architect</p>
                     </div>
                  </div>

                  {activeSection !== 'premium' && <GlobalSearch onSectionChange={onSectionChange} />}
               </div>

               {/* Center Section: Navigation Tabs — truly centered */}
               <div className="flex-1" />
               <div className="hidden">
                  {activeSection === 'premium' ? (
                     <div className="flex-1" />
                  ) : (
                     <div className="flex-1 flex items-center justify-center h-full min-w-0">
                        <nav className="hidden lg:flex items-center gap-0 xl:gap-1 h-full min-w-0 xl:-translate-x-12 transition-transform">
                           <button
                              onClick={() => onSectionChange('dashboard')}
                              className="relative h-full flex flex-col items-center justify-center px-2 xl:px-3 group/tab min-w-[52px]"
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
                              className="relative h-full flex flex-col items-center justify-center px-2 xl:px-3 group/tab min-w-[52px]"
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
                              className="relative h-full flex flex-col items-center justify-center px-2 xl:px-3 group/tab min-w-[52px]"
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
                              className="relative h-full flex flex-col items-center justify-center px-2 xl:px-3 group/tab min-w-[52px]"
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

                           <button
                              onClick={() => onSectionChange('news')}
                              className="relative h-full flex flex-col items-center justify-center px-2 xl:px-3 group/tab min-w-[52px]"
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
                              className="relative h-full flex flex-col items-center justify-center px-2 xl:px-3 group/tab min-w-[52px]"
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

                           <a
                              href="/recruiter"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                 if (!isPremium) {
                                    e.preventDefault();
                                    toast.error("Upgrade to Premium", {
                                       description: "You need an active premium subscription to access the recruiter platform and AI hiring features."
                                    });
                                 }
                              }}
                              className="relative h-full flex flex-col items-center justify-center px-2 xl:px-3 group/tab min-w-[52px]"
                           >
                              <div className="relative">
                                 <Users className={cn(
                                    "w-[20px] h-[20px] mb-1 transition-all group-hover/tab:scale-110",
                                    activeSection === 'hire' ? "text-primary" : "text-muted-foreground group-hover/tab:text-foreground"
                                 )} />
                                 <div className="absolute -top-1.5 -right-4 px-1.5 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-[4px] text-[7px] font-black uppercase tracking-wider scale-75 shadow-[0_0_10px_rgba(16,185,129,0.5)] border border-emerald-400/20">
                                    New
                                 </div>
                              </div>
                              <span className={cn(
                                 "text-[10px] font-bold uppercase tracking-tight transition-colors whitespace-nowrap",
                                 activeSection === 'hire' ? "text-foreground" : "text-muted-foreground group-hover/tab:text-foreground"
                              )}>Hire with AI</span>
                              {activeSection === 'hire' && <div className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(180,156,248,0.5)]" />}
                           </a>
                        </nav>
                     </div>
                  )}
               </div>

               {/* Right Section: Actions / Profile */}
               <div className="flex items-center gap-2 sm:gap-3 shrink-0 h-full">


                  {/* <button className="hidden lg:flex items-center gap-2 px-3 xl:px-4 py-2 rounded-xl bg-primary/5 border border-primary/20 text-foreground text-[10px] font-bold hover:bg-primary/10 transition-all shadow-sm group whitespace-nowrap">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:animate-pulse" />
                     <span className="transition-all duration-300">
                        {isRightCollapsed ? 'Connect Wallet' : 'Wallet'}
                     </span>
                  </button> */}

                  {/* LinkedIn-style "Me" Section on the right */}
                  <div
                     className="relative h-full flex flex-col items-center justify-center px-2 group/profile cursor-pointer min-w-[48px]"
                     onMouseEnter={() => !isMenuLocked && setShowProfileMenu(true)}
                     onMouseLeave={() => !isMenuLocked && setShowProfileMenu(false)}
                  >
                     <div
                        onClick={() => onSectionChange('Profile')}
                        className="relative mb-0.5"
                     >
                        <div className={cn(
                           "w-7 h-7 lg:w-6 lg:h-6 rounded-full relative z-10 transition-all duration-300 flex items-center justify-center p-[1.5px]",
                           isPremium
                              ? "bg-[conic-gradient(from_0deg,#4285F4,#EA4335,#FBBC05,#34A853,#4285F4)] animate-[spin_5s_linear_infinite]"
                              : "border border-muted-foreground/30 group-hover/profile:border-foreground",
                           !isPremium && (activeSection === 'Profile' || activeSection === 'settings' || showProfileMenu) && "border-primary"
                        )}>
                           <div className="w-full h-full rounded-full bg-background overflow-hidden flex items-center justify-center">
                              {user?.profile?.profile_image_url ? (
                                 <img
                                    src={`${getOptimizedImage(user.profile.profile_image_url)}&v=${user.updated_at ? new Date(user.updated_at).getTime() : Date.now()}`}
                                    alt="Profile"
                                    className="w-full h-full object-cover rounded-full"
                                 />
                              ) : (
                                 <div className="w-full h-full bg-primary flex items-center justify-center text-[10px] font-bold text-white uppercase rounded-full">
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
                           <div className="px-4 py-2.5 mb-1 border-b border-border/50">
                              <p className="text-[11px] font-bold text-foreground truncate">{user?.first_name} {user?.last_name}</p>
                              <p className="text-[9px] text-muted-foreground truncate font-medium">{user?.email}</p>
                              <div className="mt-2.5 pt-2 border-t border-border/30 space-y-1">
                                 <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                    <span>Plan Status</span>
                                    {isPremium ? (
                                       <span className="text-[10px] font-extrabold bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC05] bg-clip-text text-transparent uppercase tracking-normal">
                                          {userSubscription?.plan_details?.name || 'Premium'}
                                       </span>
                                    ) : userSubscription?.status === 'pending' && userSubscription?.plan_details ? (
                                       <span className="text-[10px] font-extrabold text-amber-500 animate-pulse uppercase tracking-normal">
                                          {userSubscription?.plan_details?.name} (Pending)
                                       </span>
                                    ) : (
                                       <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">
                                          Free Tier
                                       </span>
                                    )}
                                 </div>
                                 <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                    <span>AI Credits</span>
                                    <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-450 uppercase">
                                       {creditBalance}
                                    </span>
                                 </div>
                                 <div className="h-[2px] w-full rounded-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]" />
                              </div>
                           </div>

                           {renderPendingSubBox(false)}

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
                                 onSectionChange('settings');
                                 const url = new URL(window.location.href);
                                 url.searchParams.set('tab', 'Billing');
                                 window.history.replaceState(null, '', url.pathname + url.search);
                                 window.dispatchEvent(new Event('settings-tab-change'));
                                 setShowProfileMenu(false);
                                 setIsMenuLocked(false);
                              }}
                              className={cn(
                                 "w-[calc(100%-16px)] mx-2 my-1 flex items-center gap-3 px-3 py-2 text-[12px] font-bold rounded transition-all border group/item shadow-sm",
                                 isPremium
                                    ? "text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-500/5 hover:bg-violet-500/10 dark:hover:bg-violet-500/20 border-violet-600/30 dark:border-violet-400/30"
                                    : "text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-500/5 hover:bg-amber-500/10 dark:hover:bg-amber-500/20 border-amber-600/30 dark:border-amber-400/30"
                              )}
                           >
                              {isPremium ? (
                                 <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400 group-hover/item:scale-110 transition-transform shrink-0" />
                              ) : (
                                 <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover/item:scale-110 transition-transform shrink-0" />
                              )}
                              {isPremium ? "Manage / Upgrade Plan" : "Try Premium"}
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
            </div>
         </header>
      </>
   );
}
