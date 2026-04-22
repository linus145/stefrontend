'use client';

import React, { useState } from 'react';
import { 
  User, Lock, Bell, Eye, EyeOff, Shield, Camera, 
  Mail, Phone, Save, Trash2, Smartphone, 
  MapPin, Globe, CreditCard, LogOut, ChevronDown, CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PrivacyTab } from './privacy-tab';
import { NotificationsTab } from './notifications-tab';
import { SecurityTab } from './security-tab';

type SettingsTab = 'Privacy' | 'Notifications' | 'Security';

export function SettingsView({ isCollapsed }: { isCollapsed: boolean }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('Privacy');

  const menuItems: { id: SettingsTab; icon: React.ReactNode; label: string }[] = [
    { id: 'Privacy', icon: <Eye className="w-4 h-4" />, label: 'Privacy & Visibility' },
    { id: 'Notifications', icon: <Bell className="w-4 h-4" />, label: 'Notifications' },
    { id: 'Security', icon: <Shield className="w-4 h-4" />, label: 'Security & Login' },
  ];

  return (
    <div className={cn(
      "flex-1 min-h-screen bg-background flex flex-col md:flex-row transition-all duration-300 ease-in-out",
      isCollapsed ? "lg:ml-20" : "lg:ml-60"
    )}>
      {/* Settings Navigation */}
      {/* Mobile: Horizontal tabs on top */}
      <div className="md:hidden border-b border-border bg-sidebar/40 px-4 py-4">
        <h2 className="text-lg font-semibold text-foreground mb-4 tracking-tight">Settings</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0",
                activeTab === item.id
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
              )}
            >
              <div className={cn(
                "transition-colors",
                activeTab === item.id ? "text-primary" : "text-muted-foreground"
              )}>
                {item.icon}
              </div>
              {item.label}
            </button>
          ))}
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
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                activeTab === item.id 
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <div className={cn(
                "transition-colors",
                activeTab === item.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}>
                {item.icon}
              </div>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-10">
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SettingsTab)} className="w-full">
            {/* Privacy Tab */}
            <TabsContent value="Privacy">
               <PrivacyTab />
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="Notifications">
               <NotificationsTab />
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="Security">
               <SecurityTab />
            </TabsContent>

          </Tabs>

          {/* Footer Actions */}
          <div className="pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0 bg-background/80 backdrop-blur-sm z-20 py-4 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10">
             <Button variant="ghost" className="rounded-xl font-bold text-xs text-muted-foreground uppercase tracking-widest px-6 h-11">
                Discard
             </Button>
             <Button className="rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest px-8 h-11 shadow-md hover:translate-y-[-1px] active:scale-95 transition-all">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="space-y-2 group">
      <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1 transition-colors group-focus-within:text-primary">
         {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
            {icon}
          </div>
        )}
        <Input 
          defaultValue={value}
          className={cn(
            "h-11 bg-background border-border rounded-xl focus:ring-1 focus:ring-primary/40 transition-all shadow-sm text-sm",
            icon && "pl-11"
          )}
        />
      </div>
    </div>
  );
}
