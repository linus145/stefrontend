'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Users, Mail, Search, MessageSquare, Send, Loader2, User as UserIcon, X, Phone,
  Briefcase, MoreVertical
} from 'lucide-react';
import { User } from '@/types/user.types';

interface CandidatesTabProps {
  isCollapsed: boolean;
}

export function CandidatesTab({ isCollapsed }: CandidatesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ['all-registered-users'],
    queryFn: () => userService.listUsers(),
  });

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

  const users = Array.isArray(usersResponse?.data) ? usersResponse.data : [];
  
  const filteredUsers = users.filter(user => 
    `${user.first_name} ${user.last_name} ${user.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className={cn(
      "flex-1 p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700",
      isCollapsed ? "lg:ml-20" : "lg:ml-64"
    )}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Talent Pool</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Browse and connect with registered talent on the platform
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/5 border border-teal-500/10 rounded-sm">
           <Users className="w-4 h-4 text-teal-500" />
           <span className="text-sm font-semibold text-foreground">{totalItems} <span className="text-muted-foreground font-medium">Talents</span></span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, email, or keywords..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="w-full rounded-sm bg-muted/20 border border-border text-foreground pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none transition-all shadow-sm"
        />
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : paginatedUsers.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-sm bg-muted/20 border border-dashed border-border/50 flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-muted-foreground opacity-30" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No talents found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-3">
            {paginatedUsers.map((user) => (
              <div
                key={user.id}
                className="bg-card border border-border rounded-sm p-4 hover:border-teal-500/20 hover:shadow-lg hover:shadow-teal-500/5 transition-all group flex flex-col md:flex-row md:items-center gap-6"
              >
                {/* Profile Image & Basic Info */}
                <div className="flex items-center gap-4 min-w-[280px]">
                  <div className="w-14 h-14 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0 border border-teal-500/10 group-hover:scale-105 transition-transform">
                    {user.profile?.profile_image_url ? (
                      <img src={user.profile.profile_image_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <UserIcon className="w-6 h-6 text-teal-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-bold text-foreground truncate group-hover:text-teal-500 transition-colors">
                      {user.first_name} {user.last_name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                       <Mail className="w-3 h-3" />
                       <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                </div>

                {/* Role & Position */}
                <div className="flex-1 flex flex-wrap items-center gap-8">
                   <div className="flex flex-col gap-1 min-w-[120px]">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Position</span>
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                         <Briefcase className="w-3.5 h-3.5 text-teal-500/70" />
                         {user.role}
                      </span>
                   </div>
                   <div className="flex flex-col gap-1 max-w-sm">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Headline</span>
                      <span className="text-xs font-medium text-muted-foreground truncate italic">
                         Professional registered on the Startup Ecosystem
                      </span>
                   </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 ml-auto pt-4 md:pt-0 border-t md:border-t-0 border-border/50 md:pl-6">
                  <button
                    onClick={() => { setSelectedUser(user); setSendEmail(true); }}
                    className="p-2.5 rounded-sm bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 transition-all active:scale-95 border border-teal-500/20"
                    title="Send Email"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setSelectedUser(user); setSendEmail(false); }}
                    className="p-2.5 rounded-sm bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 transition-all active:scale-95 border border-teal-500/20"
                    title="Send Message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground">
              Showing <span className="text-foreground">{totalItems > 0 ? startIndex + 1 : 0}</span> to <span className="text-foreground">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of <span className="text-foreground">{totalItems}</span> talents
            </p>
            
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-3 py-1.5 rounded-sm border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {totalPages <= 1 ? (
                  <button
                    disabled
                    className="w-8 h-8 rounded-sm text-xs font-bold bg-teal-500 text-white shadow-md shadow-teal-500/20 disabled:opacity-50"
                  >
                    1
                  </button>
                ) : (
                  Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={cn(
                        "w-8 h-8 rounded-sm text-xs font-bold transition-all",
                        currentPage === page
                          ? "bg-teal-500 text-white shadow-md shadow-teal-500/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border"
                      )}
                    >
                      {page}
                    </button>
                  ))
                )}
              </div>

              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-3 py-1.5 rounded-sm border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[4px] animate-in fade-in duration-300">
          <div className="bg-card border border-border w-full max-w-lg rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20 ring-4 ring-teal-500/5">
                   <UserIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground tracking-tight">Connect with {selectedUser.first_name}</h2>
                  <p className="text-[10px] text-teal-600 dark:text-teal-400 uppercase tracking-[0.15em] font-bold mt-0.5">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-px bg-border/50 mx-6" />

            <div className="p-6 pt-5 space-y-6">
              {/* Message Input */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                   <MessageSquare className="w-3 h-3" /> Professional Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Hi ${selectedUser.first_name}, I'd like to discuss a potential opportunity...`}
                  className="w-full min-h-[160px] rounded-md bg-muted/30 border border-border p-5 text-sm text-foreground focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/30 outline-none resize-none transition-all placeholder:text-muted-foreground/40 font-medium leading-relaxed"
                />
              </div>

              {/* Notification Checkbox */}
              <div 
                className="flex items-center gap-3 p-4 rounded-md bg-teal-500/5 border border-teal-500/10 group cursor-pointer hover:bg-teal-500/[0.08] transition-colors" 
                onClick={() => setSendEmail(!sendEmail)}
              >
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="peer w-5 h-5 rounded-sm border-border text-teal-500 focus:ring-teal-500/50 bg-background cursor-pointer appearance-none border-2 checked:bg-teal-500 checked:border-teal-500 transition-all"
                  />
                  <div className="absolute left-0 top-0 w-5 h-5 flex items-center justify-center pointer-events-none text-white opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all">
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path d="M5 13l4 4L19 7" />
                     </svg>
                  </div>
                </div>
                <label htmlFor="sendEmail" className="text-[13px] font-semibold text-foreground/70 group-hover:text-foreground cursor-pointer flex items-center gap-2 select-none transition-colors">
                  <Mail className="w-4 h-4 text-teal-600/70 dark:text-teal-400/70" /> Send automated email notification
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-2 flex justify-end items-center gap-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                disabled={!message.trim() || contactMutation.isPending}
                onClick={handleContact}
                className="group relative inline-flex items-center gap-2.5 px-8 py-3 rounded-md bg-teal-500 text-white text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-[0_8px_20px_-6px_rgba(20,184,166,0.3)] overflow-hidden"
              >
                {contactMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" /> 
                    <span>Send Outreach</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
