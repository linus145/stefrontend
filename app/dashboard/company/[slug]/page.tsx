'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, Globe, MapPin, Share2, 
  ExternalLink, Briefcase, Plus, MessageSquare, Heart, 
  CheckCircle2, ShieldCheck, Loader2, Send, Check, Edit3, ArrowLeft,
  Zap, Target, TrendingUp, Sparkles, Image as ImageIcon, Trash2, UploadCloud
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  companyPageService, 
  CompanyPageDetail, 
  CompanyJob, 
  CompanyPost 
} from '@/services/company-page.service';
import { DashboardHeader, DashboardSection } from '@/components/dashboard/dashboard-header';
import { LeftSidebar } from '@/components/dashboard/left-sidebar';
import { MobileBottomNav } from '@/components/dashboard/mobile-bottom-nav';
import { DashboardThemeProvider } from '@/context/DashboardThemeContext';
import { cn } from '@/lib/utils';

type ActiveTab = 'home' | 'about' | 'posts' | 'jobs' | 'people' | 'create-post';

export default function DynamicCompanyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string);

  const [company, setCompany] = useState<CompanyPageDetail | null>(null);
  const [explorePages, setExplorePages] = useState<CompanyPageDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // Left sidebar state
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dashboard-sidebar-collapsed') === 'true';
    }
    return false;
  });

  const handleLeftSidebarCollapse = (collapsed: boolean) => {
    setIsLeftSidebarCollapsed(collapsed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard-sidebar-collapsed', String(collapsed));
    }
  };

  const handleSectionChange = (section: DashboardSection, userId?: string | null) => {
    if (section === 'dashboard') {
      router.push('/dashboard');
    } else if (section === 'settings') {
      router.push('/dashboard/settings');
    } else {
      router.push(`/dashboard?section=${section}${userId ? `&id=${userId}` : ''}`);
    }
  };

  // Post Creation & Media Upload (ImageKit 3)
  const postComposerRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [postContent, setPostContent] = useState('');
  const [postMediaUrl, setPostMediaUrl] = useState('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isPromotingNewPost, setIsPromotingNewPost] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [postsList, setPostsList] = useState<CompanyPost[]>([]);

  const handleHeroPostClick = () => {
    setActiveTab('create-post');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMediaFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }
    setIsUploadingMedia(true);
    try {
      const res = await companyPageService.uploadCompanyPostImage(file);
      if (res?.image_url) {
        setPostMediaUrl(res.image_url);
        toast.success('Image uploaded to company storage (ImageKit) successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const [confirmDeletePostId, setConfirmDeletePostId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  const handleStartEdit = (post: CompanyPost) => {
    setEditingPostId(post.id);
    setEditingContent(post.content);
    setConfirmDeletePostId(null);
  };

  const handleSaveEdit = async (postId: string) => {
    if (!editingContent.trim()) {
      toast.error('Post content cannot be empty.');
      return;
    }
    setIsSavingEdit(true);
    try {
      const updated = await companyPageService.updateCompanyPost(slug, postId, editingContent.trim());
      setPostsList(prev => prev.map(p => p.id === postId ? { ...p, content: updated.content } : p));
      setEditingPostId(null);
      toast.success('Company update edited successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update post.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleExecuteDelete = async (postId: string) => {
    setDeletingPostId(postId);
    try {
      await companyPageService.deleteCompanyPost(slug, postId);
      setPostsList(prev => prev.filter(p => p.id !== postId));
      setConfirmDeletePostId(null);
      if (editingPostId === postId) setEditingPostId(null);
      toast.success('Company update and attached media deleted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete post.');
    } finally {
      setDeletingPostId(null);
    }
  };

  // Selected Post for Promotion / Boosting
  const [promotingPost, setPromotingPost] = useState<CompanyPost | null>(null);
  const [boostObjective, setBoostObjective] = useState<'traffic' | 'awareness' | 'leads'>('traffic');
  const [boostBudget, setBoostBudget] = useState<number>(100);
  const [boostDuration, setBoostDuration] = useState<number>(7);
  const [boostCta, setBoostCta] = useState<string>('Visit website');
  const [isLaunchingBoost, setIsLaunchingBoost] = useState(false);
  const [boostedPostIds, setBoostedPostIds] = useState<Record<string, boolean>>({});

  const handleLaunchBoost = async () => {
    if (!promotingPost) return;
    setIsLaunchingBoost(true);
    try {
      await companyPageService.boostCompanyPost(slug, promotingPost.id);
      setBoostedPostIds(prev => ({ ...prev, [promotingPost.id]: true }));
      setPostsList(prev => prev.map(p => p.id === promotingPost.id ? { ...p, is_promoted: true } : p));
      const excerpt = promotingPost.content.substring(0, 32) + '...';
      setPromotingPost(null);
      toast.success('Campaign launched successfully!', {
        description: `Sponsored update for "${excerpt}" is now live with an estimated reach of ${(boostBudget * boostDuration * 15).toLocaleString('en-IN')} impressions.`
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to launch boost campaign.');
    } finally {
      setIsLaunchingBoost(false);
    }
  };

  useEffect(() => {
    if (!slug) return;
    async function loadData() {
      setLoading(true);
      try {
        const [pageData, exploreData] = await Promise.all([
          companyPageService.getCompanyPage(slug),
          companyPageService.getExploreCompanies().catch(() => []),
        ]);
        setCompany(pageData);
        setFollowing(pageData.is_following);
        setFollowersCount(pageData.followers_count || 0);
        setPostsList(pageData.posts || []);
        setExplorePages(exploreData.filter(p => p.slug !== slug));
      } catch (err: any) {
        console.error('Failed to load company page', err);
        toast.error('Could not load company page');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  const handleFollowToggle = async () => {
    if (!company) return;
    setFollowLoading(true);
    const prevFollowing = following;
    const prevCount = followersCount;
    setFollowing(!prevFollowing);
    setFollowersCount(prevFollowing ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      await companyPageService.toggleFollow(company.company_id);
      toast.success(!prevFollowing ? `Following ${company.company_name}` : `Unfollowed ${company.company_name}`);
    } catch (err: any) {
      setFollowing(prevFollowing);
      setFollowersCount(prevCount);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Page link copied to clipboard!');
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    setIsPosting(true);
    try {
      const newPost = await companyPageService.createCompanyPost(
        slug, 
        postContent.trim(), 
        postMediaUrl.trim() || undefined,
        isPromotingNewPost
      );
      setPostsList([newPost, ...postsList]);
      setPostContent('');
      setPostMediaUrl('');
      setIsPromotingNewPost(false);
      setActiveTab('posts');
      toast.success(isPromotingNewPost ? 'Promoted update published successfully!' : 'Post published successfully to company page & home feed!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish post');
    } finally {
      setIsPosting(false);
    }
  };

  const logo = company ? (company.custom_logo_url || company.logo_url) : '';
  const banner = company ? (company.custom_banner_url || company.banner_url) : '';

  return (
    <DashboardThemeProvider>
      <div className="flex min-h-screen bg-background selection:bg-primary/20">
        {/* Dashboard Header */}
        <DashboardHeader
          activeSection="dashboard"
          onSectionChange={handleSectionChange}
        />

        {/* Dashboard Left Sidebar */}
        <LeftSidebar
          isCollapsed={isLeftSidebarCollapsed}
          onToggle={() => handleLeftSidebarCollapse(!isLeftSidebarCollapsed)}
          activeSection="dashboard"
          onSectionChange={handleSectionChange}
        />

        {/* Main Workspace Area */}
        <main
          className={cn(
            "flex-1 flex flex-col min-w-0 pt-20 lg:pt-16 pb-16 lg:pb-8 transition-all duration-300",
            isLeftSidebarCollapsed ? "lg:pl-20" : "lg:pl-60"
          )}
        >
          <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] bg-card border border-border rounded-lg p-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#0a66c2]" />
                <p className="mt-3 text-xs sm:text-sm text-muted-foreground font-medium">Loading company profile...</p>
              </div>
            ) : !company ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] bg-card border border-border rounded-lg p-8 text-center">
                <div className="p-4 rounded-lg bg-muted/60 mb-3 border border-border">
                  <Building2 className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-foreground">Company Page Not Found</h2>
                <p className="text-xs text-muted-foreground mt-1 max-w-md">
                  The company page you are looking for might have been renamed or is temporarily unavailable.
                </p>
                <div className="mt-5 flex gap-2.5">
                  <Link href="/dashboard/company/create">
                    <Button className="bg-[#0a66c2] text-white rounded-md text-xs h-8">Create a Page</Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" className="rounded-md text-xs h-8">Back to Home</Button>
                  </Link>
                </div>
              </div>
            ) : activeTab === 'create-post' ? (
              <div className="max-w-4xl mx-auto space-y-4 py-2 animate-in fade-in">
                {/* Back to Profile Top Bar */}
                <div className="flex items-center justify-between pb-2 border-b border-border/70">
                  <button
                    type="button"
                    onClick={() => setActiveTab('posts')}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-foreground hover:text-[#0a66c2] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to {company.company_name} Profile</span>
                  </button>
                  <span className="text-xs text-muted-foreground font-medium">
                    Company Post Studio
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left: Studio Editor Form */}
                  <div className="lg:col-span-7 bg-card border border-border rounded-lg p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center border border-border overflow-hidden shrink-0">
                          {logo ? <img src={logo} alt="Company" className="w-full h-full object-cover" /> : <Building2 className="w-5 h-5 text-muted-foreground" />}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                            {company.company_name}
                            <span className="px-1.5 py-0.2 bg-[#0a66c2]/10 text-[#0a66c2] font-semibold rounded text-[10px]">
                              Page Admin
                            </span>
                          </h3>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Globe className="w-3 h-3 text-muted-foreground" /> Anyone • Public Post
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsPromotingNewPost(!isPromotingNewPost)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                          isPromotingNewPost
                            ? 'bg-[#0a66c2] text-white border-[#0a66c2] shadow-xs ring-1 ring-[#0a66c2]'
                            : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        {isPromotingNewPost ? 'Promote Mode Active' : 'Promote Post'}
                      </button>
                    </div>

                    <form onSubmit={handleCreatePost} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">What do you want to talk about?</label>
                        <Textarea
                          ref={postComposerRef}
                          rows={6}
                          autoFocus
                          placeholder={`Share updates, announcements, hiring news, or product milestones for ${company.company_name}...`}
                          value={postContent}
                          onChange={e => setPostContent(e.target.value)}
                          className="bg-background text-sm rounded-md resize-y border-border focus-visible:ring-1 focus-visible:ring-[#0a66c2]"
                        />
                      </div>

                      {/* Topic Hashtags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[11px] text-muted-foreground font-semibold mr-1">Topics:</span>
                        {['#hiring', '#productupdate', '#milestone', '#tech', '#startup', '#growth'].map(tag => (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => setPostContent(prev => prev ? `${prev} ${tag}` : tag)}
                            className="px-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition-colors border border-border/60 cursor-pointer"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>

                      {/* Media Attachment (ImageKit 3 Integrated) */}
                      <div className="space-y-2 pt-2 border-t border-border/60">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-[#0a66c2]" /> Post Image / Media
                          </label>
                          <span className="text-[10px] text-muted-foreground">Stored securely on ImageKit</span>
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                          onChange={handleMediaFileChange}
                          className="hidden"
                        />

                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isUploadingMedia}
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full sm:w-auto text-xs h-9 gap-1.5 border-dashed border-[#0a66c2]/40 hover:border-[#0a66c2] hover:bg-[#0a66c2]/5 cursor-pointer shrink-0"
                          >
                            {isUploadingMedia ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0a66c2]" />
                                Uploading to ImageKit...
                              </>
                            ) : (
                              <>
                                <UploadCloud className="w-3.5 h-3.5 text-[#0a66c2]" />
                                Upload Photo from Device
                              </>
                            )}
                          </Button>

                          <span className="text-[11px] text-muted-foreground font-medium">or URL:</span>

                          <Input
                            type="url"
                            placeholder="https://ik.imagekit.io/..."
                            value={postMediaUrl}
                            onChange={e => setPostMediaUrl(e.target.value)}
                            className="bg-background text-xs rounded-md h-9 flex-1"
                          />
                        </div>

                        {postMediaUrl && (
                          <div className="relative rounded-lg overflow-hidden border border-border/80 bg-black/5 dark:bg-black/20 flex items-center justify-center max-h-[420px] mt-2 group">
                            <img src={postMediaUrl} alt="Post preview" className="w-full h-auto max-h-[420px] object-contain rounded-lg" />
                            <button
                              type="button"
                              onClick={() => setPostMediaUrl('')}
                              className="absolute top-2 right-2 p-1 rounded-full bg-black/75 text-white hover:bg-black text-xs cursor-pointer shadow-md transition-transform hover:scale-110"
                              title="Remove image"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Promoted / Boosting Campaign & Pricing Suite */}
                      {isPromotingNewPost && (
                        <div className="p-4 rounded-lg bg-[#0a66c2]/5 border border-[#0a66c2]/20 space-y-3.5 animate-in fade-in">
                          <div className="flex items-center justify-between border-b border-[#0a66c2]/15 pb-2.5">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-md bg-[#0a66c2] text-white">
                                <Sparkles className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-foreground">Sponsored Campaign & Pricing</p>
                                <p className="text-[11px] text-muted-foreground">Boost impressions across B2linq network decision makers.</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0a66c2] bg-[#0a66c2]/10 px-2 py-0.5 rounded">
                              Active
                            </span>
                          </div>

                          {/* Objective */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                              Campaign Objective
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: 'traffic', label: 'Website Clicks', desc: 'Drive visitors' },
                                { id: 'awareness', label: 'Brand Awareness', desc: 'Maximize views' },
                                { id: 'leads', label: 'Lead Generation', desc: 'Target founders' },
                              ].map(obj => (
                                <button
                                  type="button"
                                  key={obj.id}
                                  onClick={() => setBoostObjective(obj.id as any)}
                                  className={`p-2 rounded-md border text-left transition-all cursor-pointer ${
                                    boostObjective === obj.id
                                      ? 'border-[#0a66c2] bg-[#0a66c2]/10 text-foreground ring-1 ring-[#0a66c2]'
                                      : 'border-border bg-card hover:bg-muted/40 text-muted-foreground'
                                  }`}
                                >
                                  <p className="text-xs font-bold">{obj.label}</p>
                                  <p className="text-[10px] opacity-75">{obj.desc}</p>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Daily Budget & Duration */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                Daily Budget (INR)
                              </label>
                              <div className="grid grid-cols-4 gap-1.5">
                                {[100, 250, 500, 1000].map(amt => (
                                  <button
                                    type="button"
                                    key={amt}
                                    onClick={() => setBoostBudget(amt)}
                                    className={`py-1.5 rounded-md border text-xs font-semibold transition-all cursor-pointer ${
                                      boostBudget === amt
                                        ? 'bg-[#0a66c2] text-white border-[#0a66c2]'
                                        : 'border-border bg-card hover:bg-muted/40 text-foreground'
                                    }`}
                                  >
                                    ₹{amt >= 1000 ? `${amt / 1000}K` : amt}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                Duration (Days)
                              </label>
                              <div className="grid grid-cols-4 gap-1.5">
                                {[3, 7, 14, 30].map(days => (
                                  <button
                                    type="button"
                                    key={days}
                                    onClick={() => setBoostDuration(days)}
                                    className={`py-1.5 rounded-md border text-xs font-semibold transition-all cursor-pointer ${
                                      boostDuration === days
                                        ? 'bg-[#0a66c2] text-white border-[#0a66c2]'
                                        : 'border-border bg-card hover:bg-muted/40 text-foreground'
                                    }`}
                                  >
                                    {days}d
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Estimated Performance & Total Pricing Box */}
                          <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">
                                Estimated Campaign Reach
                              </p>
                              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                                {(boostBudget * boostDuration * 15).toLocaleString('en-IN')} - {(boostBudget * boostDuration * 30).toLocaleString('en-IN')} Impressions
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-muted-foreground">Total Campaign Investment</p>
                              <p className="text-xs font-bold text-foreground">₹{(boostBudget * boostDuration).toLocaleString('en-IN')} (₹{boostBudget}/day)</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="text-[11px] text-muted-foreground">
                          {postContent.length}/2000 characters
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveTab('posts')}
                            className="text-xs rounded-md h-9"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isPosting || !postContent.trim()}
                            className="bg-[#0a66c2] hover:bg-[#084e96] text-white text-xs font-semibold gap-1.5 rounded-md h-9 px-5 shadow-sm"
                          >
                            {isPosting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            {isPromotingNewPost ? 'Publish & Promote' : 'Publish Post'}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Right: Live Preview Card */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#0a66c2]" /> Live Feed Preview
                    </div>

                    <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center border border-border overflow-hidden shrink-0">
                          {logo ? <img src={logo} alt="Company" className="w-full h-full object-cover" /> : <Building2 className="w-4 h-4 text-muted-foreground" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-foreground">{company.company_name}</h4>
                            {isPromotingNewPost && (
                              <span className="text-[9px] font-semibold text-[#0a66c2] bg-[#0a66c2]/10 backdrop-blur-md border border-[#0a66c2]/30 px-1.5 py-0.2 rounded-[2px] leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
                                Promoted
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {isPromotingNewPost ? 'Promoted • ' : ''}{company.tagline || company.industry || 'Company'} • Just now
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line min-h-[48px]">
                        {postContent.trim() || 'Your post text preview will appear here as you type...'}
                      </p>

                      {postMediaUrl ? (
                        <div className="rounded-lg overflow-hidden border border-border/80 bg-black/5 dark:bg-black/20 flex items-center justify-center max-h-[420px]">
                          <img src={postMediaUrl} alt="Preview Attachment" className="w-full h-auto max-h-[420px] object-contain rounded-lg" />
                        </div>
                      ) : null}

                      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground opacity-60">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5" /> Like
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" /> Comment
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-3.5 h-3.5" /> Repost
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Top Breadcrumb / Admin Banner */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Link href="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
                      <ArrowLeft className="w-3.5 h-3.5" /> Home
                    </Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">Company Profile</span>
                  </div>

                  {company.is_owner && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#0a66c2]/10 border border-[#0a66c2]/20 text-[#0a66c2] text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Page Admin View</span>
                      <Link href="/dashboard/company/create" className="ml-1 underline flex items-center gap-1 hover:text-[#084e96]">
                        <Edit3 className="w-3 h-3" /> Edit Page
                      </Link>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Main Profile & Tabs */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* HERO PROFILE CARD */}
                    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                      {/* Cover Banner */}
                      <div className="h-44 sm:h-52 w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
                        {banner ? (
                          <img src={banner} alt={company.company_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            <Building2 className="w-32 h-32 text-white" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      </div>

                      {/* Profile Details Header */}
                      <div className="px-5 pb-5 pt-0 relative">
                        {/* Logo & Actions */}
                        <div className="relative -mt-14 sm:-mt-16 mb-3.5 flex justify-between items-end">
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg border-2 border-card bg-background shadow-md overflow-hidden flex items-center justify-center shrink-0">
                            {logo ? (
                              <img src={logo} alt={company.company_name} className="w-full h-full object-cover" />
                            ) : (
                              <Building2 className="w-10 h-10 text-muted-foreground" />
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleShare}
                              className="rounded-md gap-1.5 text-xs font-medium h-8"
                            >
                              <Share2 className="w-3.5 h-3.5" /> Share
                            </Button>

                            {company.call_to_action_url || company.website ? (
                              <a
                                href={company.call_to_action_url || company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-md gap-1.5 text-xs font-medium text-foreground hover:text-primary h-8"
                                >
                                  <Globe className="w-3.5 h-3.5" />
                                  {company.call_to_action_label || 'Visit website'}
                                </Button>
                              </a>
                            ) : null}

                            {company.is_owner && (
                              <Button
                                size="sm"
                                onClick={handleHeroPostClick}
                                className="bg-[#0a66c2] hover:bg-[#084e96] text-white rounded-md gap-1.5 text-xs font-semibold h-8 shadow-sm"
                              >
                                <Plus className="w-3.5 h-3.5" /> Post
                              </Button>
                            )}

                            <Button
                              onClick={handleFollowToggle}
                              disabled={followLoading}
                              size="sm"
                              className={`rounded-md gap-1.5 text-xs font-semibold h-8 shadow-sm transition-all ${
                                following
                                  ? 'bg-muted text-foreground hover:bg-muted/80 border border-border'
                                  : 'bg-[#0a66c2] hover:bg-[#084e96] text-white'
                              }`}
                            >
                              {following ? (
                                <>
                                  <Check className="w-3.5 h-3.5" /> Following
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" /> Follow
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Company Name & Verification */}
                        <div className="space-y-1 mb-2.5">
                          <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                              {company.company_name}
                            </h1>
                            {company.is_verified && (
                              <span title="Verified Organization">
                                <CheckCircle2 className="w-4 h-4 text-[#0a66c2] fill-current" />
                              </span>
                            )}
                          </div>
                          {company.tagline && (
                            <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-2xl">
                              {company.tagline}
                            </p>
                          )}
                        </div>

                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-2 border-t border-border/50">
                          <span className="font-medium text-foreground">{company.industry || 'Technology'}</span>
                          <span>•</span>
                          <span>{company.location || 'Global Headquarters'}</span>
                          <span>•</span>
                          <span>{company.company_size || '1-10'} employees</span>
                          <span>•</span>
                          <span className="font-semibold text-foreground">
                            {followersCount.toLocaleString()} followers
                          </span>
                          {company.active_jobs_count > 0 && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {company.active_jobs_count} open jobs
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Tab Navigation */}
                      <div className="border-t border-border px-5 flex items-center gap-1 overflow-x-auto no-scrollbar">
                        {(['home', 'about', 'posts', 'jobs', 'people'] as ActiveTab[]).map(tab => {
                          const isActive = activeTab === tab;
                          const labelMap: Record<ActiveTab, string> = {
                            home: 'Home',
                            about: 'About',
                            posts: `Posts (${postsList.length})`,
                            jobs: `Jobs (${company.active_jobs_count || company.jobs?.length || 0})`,
                            people: 'People',
                            'create-post': 'Create Post',
                          };

                          return (
                            <button
                              key={tab}
                              onClick={() => setActiveTab(tab)}
                              className={`py-3 px-3.5 text-xs sm:text-sm font-semibold capitalize transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                                isActive
                                  ? 'border-[#0a66c2] text-[#0a66c2]'
                                  : 'border-transparent text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {labelMap[tab]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tab Contents */}
                    {activeTab === 'home' && (
                      <div className="space-y-4">
                        {/* About Overview */}
                        <div className="bg-card border border-border rounded-lg p-5 space-y-2.5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-foreground">About</h3>
                            <button
                              onClick={() => setActiveTab('about')}
                              className="text-xs font-semibold text-[#0a66c2] hover:underline"
                            >
                              See all details
                            </button>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                            {company.overview || company.description || 'Welcome to our official company profile. Follow us to stay updated with our latest news, open career positions, and insights.'}
                          </p>
                        </div>

                        {/* Recent Jobs */}
                        {company.jobs && company.jobs.length > 0 && (
                          <div className="bg-card border border-border rounded-lg p-5 space-y-3 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-[#0a66c2]" />
                                <h3 className="text-sm font-bold text-foreground">Recently Posted Jobs</h3>
                              </div>
                              <button
                                onClick={() => setActiveTab('jobs')}
                                className="text-xs font-semibold text-[#0a66c2] hover:underline"
                              >
                                View all ({company.jobs.length})
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {company.jobs.slice(0, 4).map(job => (
                                <div
                                  key={job.id}
                                  onClick={() => setActiveTab('jobs')}
                                  className="p-3.5 rounded-md border border-border bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer space-y-1.5 group"
                                >
                                  <h4 className="text-xs font-bold text-foreground group-hover:text-[#0a66c2] transition-colors truncate">
                                    {job.title}
                                  </h4>
                                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3 text-primary/70" />
                                    {job.location || 'Remote'} • {job.work_mode || 'Full-time'}
                                  </p>
                                  <div className="flex items-center justify-between pt-1">
                                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                      {job.salary_min && job.salary_max
                                        ? `${job.currency} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
                                        : 'Competitive'}
                                    </span>
                                    <span className="text-[11px] text-[#0a66c2] font-medium group-hover:underline">View</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recent Posts */}
                        {postsList.length > 0 && (
                          <div className="bg-card border border-border rounded-lg p-5 space-y-3 shadow-sm">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-bold text-foreground">Recent Updates</h3>
                              <button
                                onClick={() => setActiveTab('posts')}
                                className="text-xs font-semibold text-[#0a66c2] hover:underline"
                              >
                                View all posts
                              </button>
                            </div>

                            <div className="space-y-3">
                              {postsList.slice(0, 2).map(post => (
                                <div key={post.id} className="p-3.5 rounded-md border border-border/80 bg-muted/10 space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center border border-border overflow-hidden shrink-0">
                                        {logo ? <img src={logo} alt="Company" className="w-full h-full object-cover" /> : <Building2 className="w-4 h-4 text-muted-foreground" />}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <p className="text-xs font-bold text-foreground">{company.company_name}</p>
                                          {(post.is_promoted || boostedPostIds[post.id]) && (
                                            <span className="text-[10px] font-semibold text-[#0a66c2] bg-[#0a66c2]/10 backdrop-blur-md border border-[#0a66c2]/30 px-1.5 py-0.5 rounded-[2px] leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
                                              Promoted
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">{new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                      </div>
                                    </div>
                                    {company.is_owner && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveTab('posts');
                                          handleStartEdit(post);
                                        }}
                                        className="text-muted-foreground hover:text-[#0a66c2] hover:bg-[#0a66c2]/10 p-1.5 rounded-md cursor-pointer transition-colors"
                                        title="Edit post text"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>

                                  <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">{post.content}</p>

                                  {post.media_url && (
                                    <div className="rounded-lg overflow-hidden border border-border/80 bg-black/5 dark:bg-black/20 flex items-center justify-center">
                                      <img src={post.media_url} alt="Post media" className="w-full h-auto max-h-[550px] object-contain rounded-lg" />
                                    </div>
                                  )}

                                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-4">
                                      <button
                                        onClick={() => toast.success('Liked post!')}
                                        className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
                                      >
                                        <Heart className="w-3.5 h-3.5" /> Like
                                      </button>
                                      <button
                                        onClick={handleShare}
                                        className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
                                      >
                                        <Share2 className="w-3.5 h-3.5" /> Share
                                      </button>
                                    </div>
                                    {company.is_owner && (
                                      <button
                                        onClick={() => {
                                          setActiveTab('posts');
                                          if (!post.is_promoted && !boostedPostIds[post.id]) {
                                            setPromotingPost(post);
                                          }
                                        }}
                                        className={`text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                                          post.is_promoted || boostedPostIds[post.id]
                                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20'
                                            : 'text-[#0a66c2] hover:underline'
                                        }`}
                                      >
                                        {post.is_promoted || boostedPostIds[post.id] ? (
                                          <>
                                            <Sparkles className="w-3 h-3 text-emerald-500" /> Promoted • Active
                                          </>
                                        ) : (
                                          <>
                                            <Zap className="w-3 h-3 text-[#0a66c2]" /> Promote Post
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* About Tab */}
                    {activeTab === 'about' && (
                      <div className="space-y-4">
                        <div className="bg-card border border-border rounded-lg p-5 space-y-5 shadow-sm">
                          <div>
                            <h3 className="text-base font-bold text-foreground mb-2">Overview</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                              {company.overview || company.description || 'No description provided yet.'}
                            </p>
                          </div>

                          <div className="border-t border-border pt-4 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Company Details</h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-xs">
                              <div>
                                <span className="text-muted-foreground block mb-0.5">Website</span>
                                {company.website ? (
                                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-[#0a66c2] font-medium hover:underline flex items-center gap-1 truncate">
                                    {company.website} <ExternalLink className="w-3 h-3 shrink-0" />
                                  </a>
                                ) : (
                                  <span className="text-foreground">Not provided</span>
                                )}
                              </div>

                              <div>
                                <span className="text-muted-foreground block mb-0.5">Industry</span>
                                <span className="text-foreground font-medium">{company.industry || 'Technology'}</span>
                              </div>

                              <div>
                                <span className="text-muted-foreground block mb-0.5">Company size</span>
                                <span className="text-foreground font-medium">{company.company_size || '1-10'} employees</span>
                              </div>

                              <div>
                                <span className="text-muted-foreground block mb-0.5">Headquarters</span>
                                <span className="text-foreground font-medium">{company.location || 'Global'}</span>
                              </div>

                              <div>
                                <span className="text-muted-foreground block mb-0.5">Type</span>
                                <span className="text-foreground font-medium">{company.page_type || 'Privately Held'}</span>
                              </div>

                              <div>
                                <span className="text-muted-foreground block mb-0.5">Founded</span>
                                <span className="text-foreground font-medium">{company.founded_year || 'Recent'}</span>
                              </div>
                            </div>
                          </div>

                          {company.specialties && company.specialties.length > 0 && (
                            <div className="border-t border-border pt-4 space-y-2">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Specialties</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {company.specialties.map((spec, i) => (
                                  <span key={i} className="px-2.5 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium border border-border">
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Posts Tab */}
                    {activeTab === 'posts' && (
                      <div className="space-y-4">
                        {company.is_owner && (
                          <div
                            onClick={() => setActiveTab('create-post')}
                            className="bg-card border border-border rounded-lg p-3.5 shadow-sm space-y-2.5 cursor-pointer hover:border-[#0a66c2]/40 transition-all group"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center border border-border overflow-hidden shrink-0">
                                {logo ? <img src={logo} alt="Company" className="w-full h-full object-cover" /> : <Building2 className="w-4 h-4 text-muted-foreground" />}
                              </div>
                              <div className="flex-1 bg-muted/40 group-hover:bg-muted/70 border border-border rounded-full px-3.5 py-2 text-xs text-muted-foreground transition-colors flex items-center justify-between">
                                <span>Start a post as {company.company_name}...</span>
                                <Button size="sm" className="h-6 px-2.5 bg-[#0a66c2] text-white text-[11px] font-semibold rounded-full gap-1">
                                  <Plus className="w-3 h-3" /> Create Post
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {postsList.length === 0 ? (
                          <div className="bg-card border border-border rounded-lg p-8 text-center space-y-2 shadow-sm">
                            <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-1 opacity-50" />
                            <h4 className="text-xs font-semibold text-foreground">No posts published yet</h4>
                            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                              {company.company_name} hasn't posted any updates yet. Follow this page to get notified when new updates are published.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {postsList.map(post => (
                              <div key={post.id} className="bg-card border border-border rounded-lg p-4 space-y-2.5 shadow-sm">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center border border-border overflow-hidden shrink-0">
                                      {logo ? <img src={logo} alt="Company" className="w-full h-full object-cover" /> : <Building2 className="w-4 h-4 text-muted-foreground" />}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className="text-xs font-bold text-foreground">{company.company_name}</h4>
                                        {(post.is_promoted || boostedPostIds[post.id]) && (
                                          <span className="text-[10px] font-semibold text-[#0a66c2] bg-[#0a66c2]/10 backdrop-blur-md border border-[#0a66c2]/30 px-1.5 py-0.5 rounded-[2px] leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
                                            Promoted
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-muted-foreground">
                                        {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                      </p>
                                    </div>
                                  </div>

                                  {company.is_owner && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleStartEdit(post)}
                                        className={`transition-colors p-1.5 rounded-md cursor-pointer ${
                                          editingPostId === post.id
                                            ? 'text-[#0a66c2] bg-[#0a66c2]/15'
                                            : 'text-muted-foreground hover:text-[#0a66c2] hover:bg-[#0a66c2]/10'
                                        }`}
                                        title="Edit post text"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={deletingPostId === post.id}
                                        onClick={() => setConfirmDeletePostId(confirmDeletePostId === post.id ? null : post.id)}
                                        className={`transition-colors p-1.5 rounded-md cursor-pointer ${
                                          confirmDeletePostId === post.id
                                            ? 'text-red-600 bg-red-500/15'
                                            : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'
                                        }`}
                                        title="Delete update"
                                      >
                                        {deletingPostId === post.id ? (
                                          <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                                        ) : (
                                          <Trash2 className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Inline Delete Confirmation within Post */}
                                {confirmDeletePostId === post.id && (
                                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 space-y-2 animate-in fade-in">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400">
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Permanently delete this update?
                                      </div>
                                      <span className="text-[10px] text-muted-foreground">ImageKit media will also be removed</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                      This action cannot be undone. The post and all its interactions will be permanently removed.
                                    </p>
                                    <div className="flex items-center justify-end gap-2 pt-1">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setConfirmDeletePostId(null)}
                                        className="h-7 text-xs rounded-md"
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        disabled={deletingPostId === post.id}
                                        onClick={() => handleExecuteDelete(post.id)}
                                        className="h-7 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md gap-1.5"
                                      >
                                        {deletingPostId === post.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                        Confirm Delete
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {/* Inline Edit Box */}
                                {editingPostId === post.id ? (
                                  <div className="p-3 rounded-lg border border-[#0a66c2]/40 bg-[#0a66c2]/5 space-y-2.5 animate-in fade-in">
                                    <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                                      <span className="flex items-center gap-1.5 text-[#0a66c2]">
                                        <Edit3 className="w-3.5 h-3.5" /> Edit Update Text
                                      </span>
                                      <span className="text-[10px] text-muted-foreground">Attached media is preserved</span>
                                    </div>
                                    <Textarea
                                      value={editingContent}
                                      onChange={e => setEditingContent(e.target.value)}
                                      rows={4}
                                      className="text-xs bg-background rounded-md focus:border-[#0a66c2]"
                                      placeholder="Edit update text..."
                                    />
                                    <div className="flex items-center justify-end gap-2 pt-1">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditingPostId(null)}
                                        className="h-7 text-xs rounded-md"
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        disabled={isSavingEdit || !editingContent.trim()}
                                        onClick={() => handleSaveEdit(post.id)}
                                        className="h-7 bg-[#0a66c2] hover:bg-[#084e96] text-white text-xs font-semibold rounded-md gap-1.5"
                                      >
                                        {isSavingEdit ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                        Save Changes
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                                    {post.content}
                                  </p>
                                )}

                                {post.media_url && (
                                  <div className="rounded-lg overflow-hidden border border-border/80 bg-black/5 dark:bg-black/20 flex items-center justify-center">
                                    <img src={post.media_url} alt="Post Attachment" className="w-full h-auto max-h-[550px] object-contain rounded-lg" />
                                  </div>
                                )}

                                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                                  <div className="flex items-center gap-4">
                                    <button
                                      onClick={() => toast.success('Liked post!')}
                                      className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
                                    >
                                      <Heart className="w-3.5 h-3.5" /> Like
                                    </button>
                                    <button
                                      onClick={handleShare}
                                      className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
                                    >
                                      <Share2 className="w-3.5 h-3.5" /> Share
                                    </button>
                                  </div>
                                  {company.is_owner && (
                                    <button
                                      onClick={() => {
                                        if (post.is_promoted || boostedPostIds[post.id]) return;
                                        setPromotingPost(promotingPost?.id === post.id ? null : post);
                                      }}
                                      className={`text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                                        post.is_promoted || boostedPostIds[post.id]
                                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20'
                                          : 'text-[#0a66c2] hover:underline'
                                      }`}
                                    >
                                      {post.is_promoted || boostedPostIds[post.id] ? (
                                        <>
                                          <Sparkles className="w-3 h-3 text-emerald-500" /> Promoted • Active
                                        </>
                                      ) : (
                                        <>
                                          <Zap className="w-3 h-3 text-[#0a66c2]" /> {promotingPost?.id === post.id ? 'Close Pricing' : 'Promote Post'}
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>

                                {/* Integrated In-Card Campaign & Pricing Suite */}
                                {promotingPost?.id === post.id && !post.is_promoted && !boostedPostIds[post.id] && (
                                  <div className="mt-3 p-3.5 rounded-lg bg-[#0a66c2]/5 border border-[#0a66c2]/20 space-y-3 animate-in fade-in">
                                    <div className="flex items-center justify-between border-b border-[#0a66c2]/15 pb-2">
                                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                        <Zap className="w-3.5 h-3.5 text-[#0a66c2]" />
                                        <span>Campaign Pricing & Boosting Suite</span>
                                      </div>
                                      <span className="text-[10px] text-[#0a66c2] font-semibold bg-[#0a66c2]/10 px-2 py-0.5 rounded">
                                        In-Feed Promotion
                                      </span>
                                    </div>

                                    {/* Objectives */}
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Goal
                                      </label>
                                      <div className="grid grid-cols-3 gap-1.5">
                                        {[
                                          { id: 'traffic', label: 'Website Clicks' },
                                          { id: 'awareness', label: 'Brand Reach' },
                                          { id: 'leads', label: 'Lead Gen' },
                                        ].map(obj => (
                                          <button
                                            type="button"
                                            key={obj.id}
                                            onClick={() => setBoostObjective(obj.id as any)}
                                            className={`p-1.5 rounded text-center text-xs font-semibold border transition-all cursor-pointer ${
                                              boostObjective === obj.id
                                                ? 'bg-[#0a66c2] text-white border-[#0a66c2]'
                                                : 'bg-card border-border hover:bg-muted/40 text-foreground'
                                            }`}
                                          >
                                            {obj.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Daily Budget & Duration */}
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                          Budget/Day (INR)
                                        </label>
                                        <div className="grid grid-cols-4 gap-1">
                                          {[100, 250, 500, 1000].map(amt => (
                                            <button
                                              type="button"
                                              key={amt}
                                              onClick={() => setBoostBudget(amt)}
                                              className={`py-1 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                                                boostBudget === amt
                                                  ? 'bg-[#0a66c2] text-white border-[#0a66c2]'
                                                  : 'bg-card border-border hover:bg-muted/40 text-foreground'
                                              }`}
                                            >
                                              ₹{amt >= 1000 ? `${amt / 1000}K` : amt}
                                            </button>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                          Duration
                                        </label>
                                        <div className="grid grid-cols-4 gap-1">
                                          {[3, 7, 14, 30].map(days => (
                                            <button
                                              type="button"
                                              key={days}
                                              onClick={() => setBoostDuration(days)}
                                              className={`py-1 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                                                boostDuration === days
                                                  ? 'bg-[#0a66c2] text-white border-[#0a66c2]'
                                                  : 'bg-card border-border hover:bg-muted/40 text-foreground'
                                              }`}
                                            >
                                              {days}d
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Summary Banner */}
                                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] flex items-center justify-between">
                                      <div>
                                        <span className="font-bold text-emerald-800 dark:text-emerald-200">
                                          ~{(boostBudget * boostDuration * 15).toLocaleString('en-IN')} - {(boostBudget * boostDuration * 30).toLocaleString('en-IN')} Impressions
                                        </span>
                                      </div>
                                      <div className="font-bold text-foreground">
                                        Total: ₹{(boostBudget * boostDuration).toLocaleString('en-IN')}
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/60">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPromotingPost(null)}
                                        className="h-7 text-xs rounded-md"
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={handleLaunchBoost}
                                        disabled={isLaunchingBoost}
                                        className="h-7 bg-[#0a66c2] hover:bg-[#084e96] text-white text-xs font-semibold rounded-md gap-1.5"
                                      >
                                        {isLaunchingBoost ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                                        Launch Boost (₹{(boostBudget * boostDuration).toLocaleString('en-IN')})
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Jobs Tab */}
                    {activeTab === 'jobs' && (
                      <div className="space-y-3">
                        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                          <h3 className="text-sm font-bold text-foreground">Open Positions</h3>
                          <p className="text-[11px] text-muted-foreground">Explore active career opportunities at {company.company_name}</p>
                        </div>

                        {!company.jobs || company.jobs.length === 0 ? (
                          <div className="bg-card border border-border rounded-lg p-8 text-center space-y-2 shadow-sm">
                            <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-1 opacity-50" />
                            <h4 className="text-xs font-semibold text-foreground">No active job listings</h4>
                            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                              There are currently no active job postings for {company.company_name}. Check back later or follow the page for new alerts!
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {company.jobs.map(job => (
                              <div
                                key={job.id}
                                className="bg-card border border-border rounded-lg p-4 space-y-2 group shadow-xs"
                              >
                                <div>
                                  <h4 className="text-sm font-bold text-foreground">
                                    {job.title}
                                  </h4>
                                  <p className="text-[11px] text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2">
                                    <span>{company.company_name}</span>
                                    <span>•</span>
                                    <span>{job.location || 'Remote'}</span>
                                    <span>•</span>
                                    <span className="px-1.5 py-0.5 rounded-md bg-muted text-foreground text-[10px] font-semibold border border-border">
                                      {job.work_mode || 'Full-time'}
                                    </span>
                                  </p>
                                </div>

                                {job.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                    {job.description}
                                  </p>
                                )}

                                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
                                  <div className="flex flex-wrap items-center gap-1">
                                    {job.skills && job.skills.slice(0, 4).map((skill, i) => (
                                      <span key={i} className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[10px] font-medium border border-border">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                                    {job.salary_min && job.salary_max
                                      ? `${job.currency} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
                                      : 'Competitive'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* People Tab */}
                    {activeTab === 'people' && (
                      <div className="bg-card border border-border rounded-lg p-5 space-y-4 shadow-sm">
                        <div>
                          <h3 className="text-sm font-bold text-foreground">People & Organization</h3>
                          <p className="text-xs text-muted-foreground">Team members and leadership working at {company.company_name}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3.5 rounded-lg border border-border bg-muted/20 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center border border-border font-bold text-foreground text-xs">
                              HQ
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-foreground">{company.company_name} Team</h4>
                              <p className="text-[11px] text-muted-foreground">{company.company_size || '1-10'} Members</p>
                              <p className="text-[10px] text-muted-foreground">{company.location || 'Global'}</p>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-lg border border-border bg-muted/20 flex items-center justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-foreground">Grow with our team</h4>
                              <p className="text-[11px] text-muted-foreground">Check open positions to collaborate with us</p>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => setActiveTab('jobs')} className="text-xs rounded-md h-7">
                              View Jobs
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Sidebar */}
                  <div className="lg:col-span-4 space-y-4">
                    {/* Quick Highlights */}
                    <div className="bg-card border border-border rounded-lg p-4 space-y-2.5 shadow-sm">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Company Highlights
                      </h4>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                          <span className="text-muted-foreground">Network Followers</span>
                          <span className="font-semibold text-foreground">{followersCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                          <span className="text-muted-foreground">Industry Domain</span>
                          <span className="font-semibold text-foreground">{company.industry || 'Technology'}</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                          <span className="text-muted-foreground">Company Size</span>
                          <span className="font-semibold text-foreground">{company.company_size || '1-10'} Employees</span>
                        </div>
                        {company.website && (
                          <div className="flex items-center justify-between py-1.5">
                            <span className="text-muted-foreground">Official Website</span>
                            <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-[#0a66c2] font-semibold hover:underline truncate max-w-[150px]">
                              {company.website.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Similar Pages */}
                    {explorePages.length > 0 && (
                      <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Pages people also view
                          </h4>
                          <Link href="/dashboard/company/create" className="text-[11px] font-semibold text-[#0a66c2] hover:underline">
                            Create Page
                          </Link>
                        </div>

                        <div className="space-y-2.5">
                          {explorePages.slice(0, 5).map(item => {
                            const itemLogo = item.custom_logo_url || item.logo_url;
                            return (
                              <div key={item.id} className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-border/50 last:border-0 last:pb-0">
                                <Link href={`/dashboard/company/${item.slug}`} className="flex items-center gap-2 min-w-0 group flex-1">
                                  <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center border border-border overflow-hidden shrink-0">
                                    {itemLogo ? <img src={itemLogo} alt={item.company_name} className="w-full h-full object-cover" /> : <Building2 className="w-4 h-4 text-muted-foreground" />}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-foreground group-hover:text-[#0a66c2] transition-colors truncate">
                                      {item.company_name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground truncate">{item.industry || 'Technology'}</p>
                                  </div>
                                </Link>
                                <Link href={`/dashboard/company/${item.slug}`}>
                                  <Button size="sm" variant="outline" className="rounded-md h-6 px-2.5 text-[10px] font-medium shrink-0">
                                    View
                                  </Button>
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          activeSection="dashboard"
          onSectionChange={handleSectionChange}
        />
      </div>
    </DashboardThemeProvider>
  );
}
