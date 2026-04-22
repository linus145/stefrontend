'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { userService } from '@/services/user.service';
import { toast } from 'sonner';
import { 
  Loader2, Save, ArrowLeft, User as UserIcon, 
  MapPin, Globe, Shield, ImageIcon 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { User } from '@/types/user.types';
import { ImageKitProvider, IKUpload } from 'imagekitio-next';
import { postService } from '@/services/post.service';
import { getOptimizedImage } from '@/lib/imagekit';

interface ProfileEditFormProps {
  initialUser: User;
}

export function ProfileEditForm({ initialUser }: ProfileEditFormProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    first_name: initialUser.first_name || '',
    last_name: initialUser.last_name || '',
    email: initialUser.email || '',
    phone_number: (initialUser.phone_number || '').replace(/^\+91/, ''),
    headline: initialUser.profile?.headline || '',
    bio: initialUser.profile?.bio || '',
    location: initialUser.profile?.location || '',
    profile_image_url: initialUser.profile?.profile_image_url || '',
    banner_image_url: initialUser.profile?.banner_image_url || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Email is read-only, but logic included for consistency
    if (name === 'email') return;
    
    if (name === 'phone_number') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: digits }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const payload = {
        ...formData,
        phone_number: formData.phone_number ? `+91${formData.phone_number}` : null
      };
      await userService.updateProfile(payload);
      toast.success('Profile updated successfully');
      router.push('/dashboard');
      router.refresh(); // Ensure the layout/other components get fresh data
    } catch (error: any) {
      toast.error('Update failed', {
        description: error.response?.data?.message || 'Please check your inputs and try again.'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-2 group w-fit"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">Edit Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your identity and digital presence across the STE platform.</p>
        </div>
        <Button 
           onClick={handleSubmit} 
           disabled={isUpdating}
            className="bg-primary text-primary-foreground hover:opacity-90 px-6 sm:px-8 h-11 rounded-md font-bold text-xs shadow-lg shadow-primary/20 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <UserIcon className="w-4 h-4 text-primary" />
            <h2 className="text-[13px] font-bold uppercase tracking-widest text-foreground opacity-80">Identity</h2>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide ml-1">First Name</label>
                <Input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="h-11 bg-muted/30 border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 rounded-md px-4 text-sm transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Last Name</label>
                <Input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="h-11 bg-muted/30 border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 rounded-md px-4 text-sm transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Primary Email</label>
              <Input
                name="email"
                value={formData.email}
                readOnly
                className="h-11 bg-muted/20 border-border/50 text-muted-foreground/70 rounded-md px-4 text-sm cursor-not-allowed border-dashed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Headline</label>
                <Input
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  placeholder="e.g. Founder & CEO | AI Engineer"
                  className="h-11 bg-muted/30 border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 rounded-md px-4 text-sm transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Mobile Number</label>
                <div className="relative">
                   <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-2 border-r border-border/50 select-none">
                      <span className="text-[13px] font-bold text-primary">+91</span>
                   </div>
                   <Input
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="00000 00000"
                    className="h-11 bg-muted/30 border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 rounded-md pl-16 pr-4 text-sm font-medium tracking-wide transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Narrative */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Shield className="w-4 h-4 text-primary opacity-70" />
            <h2 className="text-[13px] font-bold uppercase tracking-widest text-foreground opacity-80">Professional Narrative</h2>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide ml-1">About</label>
              <Textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Describe your professional journey and mission..."
                className="min-h-[160px] bg-muted/30 border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 rounded-md p-4 text-[13px] leading-relaxed resize-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Metadata */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Globe className="w-4 h-4 text-primary opacity-50" />
            <h2 className="text-[13px] font-bold uppercase tracking-widest text-foreground opacity-80">Additional Information</h2>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide ml-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                    className="h-11 bg-muted/30 border-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 rounded-md pl-10 pr-4 text-sm transition-all"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <ImageIcon className="w-5 h-5 text-primary opacity-70" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1">Visual Identity Management</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        To maintain a seamless experience, profile photos and banner images are now managed directly from your profile page. 
                        Simply click the camera icon on your profile header to update your visual assets.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-4 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground px-8 h-12 rounded-md font-bold text-xs transition-all active:scale-95 w-full sm:w-auto"
          >
            Discard Changes
          </Button>
          <Button
            type="submit"
            disabled={isUpdating}
            className="bg-primary text-primary-foreground hover:opacity-90 px-10 h-12 rounded-md font-bold text-[13px] shadow-xl shadow-primary/20 transition-all flex items-center gap-2 justify-center w-full sm:w-auto"
          >
            {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
            Update Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
