'use client';

import React, { useState } from 'react';
import {
  User, Lock, Bell, Eye, EyeOff, Shield, Camera,
  Mail, Phone, Save, Trash2, Smartphone,
  MapPin, Globe, CreditCard, LogOut, ChevronDown, CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { HelpTab } from '../help/help-tab';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PrivacyTab } from '../privacy/privacy-tab';
import { NotificationsTab } from '../notification/notifications-tab';
import { SecurityTab } from '../security/security-tab';
import { BillingTab } from '../billing/billing-tab';
import { ProfileEditForm } from '../../profile/profile-edit-form';

type SettingsTab = 'Account' | 'Privacy' | 'Notifications' | 'Security' | 'Billing' | 'Help';

export function SettingsView({ isCollapsed }: { isCollapsed?: boolean }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('Account');
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkTab = () => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab && ['Account', 'Privacy', 'Notifications', 'Security', 'Billing'].includes(tab)) {
          setActiveTab(tab as SettingsTab);
          // If on mobile, expand the tab detail view directly
          setShowMobileDetail(true);
        }
      };

      checkTab();
      window.addEventListener('settings-tab-change', checkTab);
      return () => window.removeEventListener('settings-tab-change', checkTab);
    }
  }, []);

  const menuItems: { id: SettingsTab; icon: React.ReactNode; label: string; description: string }[] = [
    {
      id: 'Account',
      icon: <User className="w-5 h-5" />,
      label: 'My Account',
      description: 'Manage your profile details and professional identity'
    },
    {
      id: 'Privacy',
      icon: <Eye className="w-5 h-5" />,
      label: 'Privacy & Visibility',
      description: 'Control your visibility and who can see your activity'
    },
    {
      id: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      label: 'Notifications',
      description: 'Configure how you receive alerts and updates'
    },
    {
      id: 'Security',
      icon: <Shield className="w-5 h-5" />,
      label: 'Security & Login',
      description: 'Protect your account with password and 2FA'
    },
    {
      id: 'Billing',
      icon: <CreditCard className="w-5 h-5" />,
      label: 'Billing & Plans',
      description: 'View pricing, features and manage your subscriptions'
    },
    {
      id: 'Help',
      icon: <HelpCircle className="w-5 h-5" />,
      label: 'Help & Support',
      description: 'Find contact numbers and request help from our team'
    },
  ];

  const handleTabClick = (id: SettingsTab) => {
    setActiveTab(id);
    setShowMobileDetail(true);
  };

  return (
    <div className={cn(
      "flex-1 min-h-screen bg-background flex flex-col md:flex-row transition-all duration-300 ease-in-out"
    )}>
      {/* Settings Navigation (Mobile) */}
      <div className={cn(
        "md:hidden flex-1 flex flex-col bg-background animate-in fade-in slide-in-from-right duration-300",
        showMobileDetail ? "hidden" : "flex"
      )}>
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your account preferences</p>
        </div>
        <div className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className="w-full flex items-center justify-between p-4 rounded-sm border border-border bg-card hover:bg-muted/30 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#0a66c2]/10 flex items-center justify-center text-[#0a66c2] group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90" />
            </button>
          ))}

          {/* Sign Out - Hidden as already available in profile dropdown */}
          {/* 
          <button className="w-full flex items-center gap-4 p-4 rounded-sm border border-border bg-card text-destructive hover:bg-destructive/5 transition-all text-left mt-8">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Sign Out</h3>
              <p className="text-[11px] opacity-70 mt-0.5">Logout from your account</p>
            </div>
          </button>
          */}
        </div>
      </div>

      {/* Settings Detail View (Mobile) */}
      <div className={cn(
        "md:hidden flex-1 flex flex-col animate-in fade-in slide-in-from-right duration-300",
        !showMobileDetail ? "hidden" : "flex"
      )}>
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center gap-4">
          <button
            onClick={() => setShowMobileDetail(false)}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ChevronDown className="w-5 h-5 rotate-90" />
          </button>
          <h2 className="text-lg font-bold text-foreground">
            {menuItems.find(m => m.id === activeTab)?.label}
          </h2>
        </div>
        <div className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SettingsTab)} className="w-full">
            <TabsContent value="Account">
              {user && <ProfileEditForm initialUser={user} isSettingsTab={true} />}
            </TabsContent>
            <TabsContent value="Privacy">
              <PrivacyTab />
            </TabsContent>
            <TabsContent value="Notifications">
              <NotificationsTab />
            </TabsContent>
            <TabsContent value="Security">
              <SecurityTab />
            </TabsContent>
            <TabsContent value="Billing">
              <BillingTab />
            </TabsContent>
            <TabsContent value="Help">
              <HelpTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Desktop: Sidebar navigation */}
      <div className="hidden md:block w-72 border-r border-border p-6 bg-sidebar/40 shrink-0">
        <h2 className="text-xl font-semibold text-foreground mb-8 tracking-tight px-4">Settings</h2>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all group",
                activeTab === item.id
                  ? "bg-[#0a66c2]/10 text-[#0a66c2] border border-[#0a66c2]/20 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <div className={cn(
                "transition-colors",
                activeTab === item.id ? "text-[#0a66c2]" : "text-muted-foreground group-hover:text-foreground"
              )}>
                {item.icon}
              </div>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Desktop Main Content */}
      <div className="hidden md:flex flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">
        <div className={cn(
          "mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full transition-all duration-300",
          activeTab === 'Billing' ? "max-w-6xl" : activeTab === 'Account' ? "max-w-4xl" : "max-w-3xl"
        )}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SettingsTab)} className="w-full">
            <TabsContent value="Account">
              {user && <ProfileEditForm initialUser={user} isSettingsTab={true} />}
            </TabsContent>
            <TabsContent value="Privacy">
              <PrivacyTab />
            </TabsContent>
            <TabsContent value="Notifications">
              <NotificationsTab />
            </TabsContent>
            <TabsContent value="Security">
              <SecurityTab />
            </TabsContent>
            <TabsContent value="Billing">
              <BillingTab />
            </TabsContent>
            <TabsContent value="Help">
              <HelpTab />
            </TabsContent>
          </Tabs>

          {/* Footer Actions */}
          {activeTab !== 'Billing' && activeTab !== 'Account' && (
            <div className="pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0 bg-background/80 backdrop-blur-sm z-20 py-4 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10">
              <Button variant="ghost" className="rounded-sm font-bold text-xs text-muted-foreground uppercase tracking-widest px-6 h-11">
                Discard
              </Button>
              <Button className="rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-xs uppercase tracking-widest px-8 h-11 shadow-md shadow-[#0a66c2]/10 hover:translate-y-[-1px] active:scale-95 transition-all">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="space-y-2 group">
      <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 transition-colors group-focus-within:text-[#0a66c2]">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#0a66c2] transition-colors">
            {icon}
          </div>
        )}
        <Input
          defaultValue={value}
          className={cn(
            "h-11 bg-background border-border rounded-sm focus:ring-1 focus:ring-[#0a66c2]/40 transition-all shadow-sm text-sm",
            icon && "pl-11"
          )}
        />
      </div>
    </div>
  );
}
