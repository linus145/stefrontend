'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { jobsService } from '@/services/jobs.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Users, Sparkles, SlidersHorizontal, MessageSquare } from 'lucide-react';
import { User } from '@/types/user.types';
import { TalentAISearchPanel } from '../Aiscreening/talent-ai-search-panel';

import { CandidatesFilterSidebar } from './candidates-filter-sidebar';
import { ContactModal } from './contact-modal';
import { BulkContactModal } from './bulk-contact-modal';
import { TalentFeed } from './talent-feed';
import { TalentPipeline } from './talent-pipeline';

export function CandidatesTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [spotlights, setSpotlights] = useState<string[]>(['Open to work']);

  const [titleInput, setTitleInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [message, setMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [isBulkContactModalOpen, setIsBulkContactModalOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'talents' | 'pipeline' | 'settings'>('talents');
  const [isAISearchOpen, setIsAISearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ['all-registered-users'],
    queryFn: () => userService.listUsers(),
  });

  const { data: pipelineResponse, refetch: refetchPipeline } = useQuery({
    queryKey: ['talent-pipeline'],
    queryFn: () => jobsService.getPipelineTalents(),
  });

  // Map talent ID to pipeline entry for quick lookup
  const pipelineMap = Array.isArray(pipelineResponse?.data)
    ? pipelineResponse.data.reduce((acc: any, entry: any) => {
      acc[entry.talent.id] = entry;
      return acc;
    }, {})
    : {};

  const contactMutation = useMutation({
    mutationFn: (data: { target_user_id: string; message: string; send_email: boolean }) =>
      userService.contactUser(data),
    onSuccess: () => {
      toast.success('Message sent successfully!');
      setSelectedUser(null);
      setMessage('');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send message.');
    },
  });

  const bulkContactMutation = useMutation({
    mutationFn: (data: { target_user_ids: string[]; message: string }) =>
      userService.bulkContactUsers(data),
    onSuccess: () => {
      toast.success('Bulk messages sent successfully!');
      setSelectedUsers([]);
      setMessage('');
      setIsBulkContactModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send bulk messages.');
    },
  });

  const saveToPipelineMutation = useMutation({
    mutationFn: (talentId: string) => jobsService.saveToPipeline(talentId),
    onSuccess: () => {
      toast.success('Talent saved to pipeline!');
      refetchPipeline();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Already in pipeline or failed to save.');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      jobsService.updatePipelineStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated!');
      refetchPipeline();
    },
  });

  const users = Array.isArray(usersResponse?.data) ? usersResponse.data : [];

  const filteredUsers = users.filter(user => {
    if (pipelineMap[user.id]) return false;
    const matchesSearch = `${user.first_name} ${user.last_name} ${user.email} ${user.profile?.headline || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatch = jobTitles.length > 0 ? jobTitles.some(t => user.role?.toLowerCase().includes(t.toLowerCase()) || user.profile?.headline?.toLowerCase().includes(t.toLowerCase())) : true;
    const locationMatch = locations.length > 0 ? locations.some(l => user.profile?.location?.toLowerCase().includes(l.toLowerCase())) : true;
    const skillsMatch = skills.length > 0 ? skills.some(s => (`${user.profile?.headline || ''} ${JSON.stringify((user.profile as any)?.skills || '')}`.toLowerCase().includes(s.toLowerCase()))) : true;

    return matchesSearch && roleMatch && locationMatch && skillsMatch;
  });

  const unsaveFromPipelineMutation = useMutation({
    mutationFn: (pipelineId: string) => jobsService.removeFromPipeline(pipelineId),
    onSuccess: () => {
      toast.success('Removed from pipeline');
      refetchPipeline();
    },
  });

  // Pagination Logic
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContact = () => {
    if (!selectedUser || !message.trim()) return;
    contactMutation.mutate({
      target_user_id: selectedUser.id,
      message,
      send_email: sendEmail
    });
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleBulkContact = () => {
    if (selectedUsers.length === 0 || !message.trim()) return;
    bulkContactMutation.mutate({
      target_user_ids: selectedUsers.map(u => u.id),
      message
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <CandidatesFilterSidebar
        isOpen={isFilterOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        jobTitles={jobTitles}
        setJobTitles={setJobTitles}
        locations={locations}
        setLocations={setLocations}
        skills={skills}
        setSkills={setSkills}
        spotlights={spotlights}
        titleInput={titleInput}
        setTitleInput={setTitleInput}
        locationInput={locationInput}
        setLocationInput={setLocationInput}
        skillInput={skillInput}
        setSkillInput={setSkillInput}
        setCurrentPage={setCurrentPage}
      />

      {/* RIGHT MAIN AREA */}
      <div className={cn(
        "flex-1 p-4 lg:p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 transition-all duration-500 min-w-0 lg:ml-0",
        isAISearchOpen ? "mr-0" : ""
      )}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-2.5 border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 rounded-sm transition-colors text-blue-600 group"
              title="Toggle Filters"
            >
              <SlidersHorizontal className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/5 border border-blue-500/10 rounded-sm">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-foreground">{totalItems} <span className="text-muted-foreground font-medium">Talents</span></span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            {selectedUsers.length > 0 && (
              <button
                onClick={() => { setMessage(''); setIsBulkContactModalOpen(true); }}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-sky-500/90 hover:bg-sky-500 backdrop-blur-md border border-white/20 dark:border-sky-400/20 text-white rounded-sm text-sm font-semibold transition-all shadow-[0_8px_30px_-4px_rgba(14,165,233,0.3)] hover:shadow-[0_8px_30px_-4px_rgba(14,165,233,0.5)] active:scale-95 group"
              >
                <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Bulk Message ({selectedUsers.length})
              </button>
            )}
            <button
              onClick={() => setIsAISearchOpen(true)}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600/80 hover:bg-blue-600 backdrop-blur-md border border-white/20 dark:border-blue-400/20 text-white rounded-sm text-sm font-semibold transition-all shadow-[0_8px_30px_-4px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_30px_-4px_rgba(59,130,246,0.5)] active:scale-95 group"
            >
              <Sparkles className="w-4 h-4 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
              AI Talent Search
            </button>
          </div>
        </div>

        {/* Dynamic Sub-Tabs */}
        <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto scrollbar-none">
          {(['talents', 'pipeline', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={cn(
                "px-6 py-3 text-sm font-medium capitalize transition-all relative whitespace-nowrap",
                activeSubTab === tab
                  ? "text-blue-500"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
              {activeSubTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 animate-in fade-in slide-in-from-bottom-1 duration-300" />
              )}
            </button>
          ))}
        </div>

        {/* Dynamic Content based on activeSubTab */}
        {activeSubTab === 'talents' ? (
          <TalentFeed
            isLoading={isLoading}
            paginatedUsers={paginatedUsers}
            pipelineMap={pipelineMap}
            totalItems={totalItems}
            startIndex={startIndex}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            saveToPipelineMutation={saveToPipelineMutation}
            setSelectedUser={setSelectedUser}
            setSendEmail={setSendEmail}
            selectedUsers={selectedUsers}
            toggleUserSelection={toggleUserSelection}
          />
        ) : activeSubTab === 'pipeline' ? (
          <div className="space-y-6">
            <TalentPipeline
              pipelineResponse={pipelineResponse}
              updateStatusMutation={updateStatusMutation}
              unsaveFromPipelineMutation={unsaveFromPipelineMutation}
              setSelectedUser={setSelectedUser}
              setSendEmail={setSendEmail}
              selectedUsers={selectedUsers}
              toggleUserSelection={toggleUserSelection}
              setSelectedUsers={setSelectedUsers}
              onOpenBulkContact={() => { setMessage(''); setIsBulkContactModalOpen(true); }}
            />
          </div>
        ) : (
          <div className="text-center py-24 bg-muted/5 rounded-sm border border-dashed border-border">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Talent Settings</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">Configure your talent sourcing preferences and automation rules.</p>
          </div>
        )}
      </div>

      {/* AI Talent Search Sidebar */}
      <TalentAISearchPanel
        isOpen={isAISearchOpen}
        onClose={() => setIsAISearchOpen(false)}
      />

      {/* Contact Modal */}
      {selectedUser && (
        <ContactModal
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          message={message}
          setMessage={setMessage}
          sendEmail={sendEmail}
          setSendEmail={setSendEmail}
          handleContact={handleContact}
          isPending={contactMutation.isPending}
        />
      )}

      {/* Bulk Contact Modal */}
      {isBulkContactModalOpen && selectedUsers.length > 0 && (
        <BulkContactModal
          selectedUsers={selectedUsers}
          setSelectedUsers={(users) => {
            setSelectedUsers(users);
            if (users.length === 0) setIsBulkContactModalOpen(false);
          }}
          message={message}
          setMessage={setMessage}
          handleBulkContact={handleBulkContact}
          isPending={bulkContactMutation.isPending}
        />
      )}
    </div>
  );
}
