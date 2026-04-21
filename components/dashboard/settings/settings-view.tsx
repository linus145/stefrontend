import React, { useState } from 'react';
import { 
  User, Lock, Bell, Eye, Shield, Camera, 
  Mail, Phone, Save, Trash2, Smartphone, 
  MapPin, Globe, CreditCard, LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

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
      "flex-1 min-h-screen bg-background flex transition-all duration-300 ease-in-out",
      isCollapsed ? "ml-20" : "ml-60"
    )}>
      {/* Settings Navigation */}
      <div className="w-72 border-r border-border p-6 bg-sidebar/40 shrink-0">
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
      <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SettingsTab)} className="w-full">
            {/* Placeholder Content for other tabs with standard Cards */}
            {['Privacy', 'Notifications', 'Security'].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-8 mt-0">
                <div>
                  <h3 className="text-2xl font-semibold text-foreground tracking-tight">{tab} Settings</h3>
                  <p className="text-muted-foreground text-sm font-medium mt-1">Configure how you interact with the STE platform.</p>
                </div>
                <Card className="rounded-2xl border-border bg-card shadow-sm p-12 flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center text-primary mb-6">
                      {menuItems.find(m => m.id === tab)?.icon}
                   </div>
                   <h4 className="text-lg font-bold text-foreground mb-2">{tab} Controls</h4>
                   <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      Advanced {tab.toLowerCase()} features are currently being verified for the unified STE 2.0 release.
                   </p>
                </Card>
              </TabsContent>
            ))}

          </Tabs>

          {/* Footer Actions */}
          <div className="pt-8 border-t border-border flex justify-end gap-3 sticky bottom-0 bg-background/80 backdrop-blur-sm z-20 py-4 -mx-10 px-10">
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
