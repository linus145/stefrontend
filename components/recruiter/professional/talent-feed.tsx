import { User } from '@/types/user.types';
import { Mail, Briefcase, User as UserIcon, MessageSquare, Loader2, Users, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface TalentFeedProps {
  isLoading: boolean;
  paginatedUsers: User[];
  pipelineMap: Record<string, any>;
  totalItems: number;
  startIndex: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  saveToPipelineMutation: any;
  setSelectedUser: (user: User) => void;
  setSendEmail: (val: boolean) => void;
  selectedUsers: User[];
  toggleUserSelection: (user: User) => void;
}

export function TalentFeed({
  isLoading, paginatedUsers, pipelineMap,
  totalItems, startIndex, itemsPerPage, currentPage, totalPages,
  handlePageChange, saveToPipelineMutation, setSelectedUser, setSendEmail,
  selectedUsers, toggleUserSelection
}: TalentFeedProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (paginatedUsers.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 rounded-sm bg-muted/20 border border-dashed border-border/50 flex items-center justify-center mx-auto mb-6">
          <Users className="w-8 h-8 text-muted-foreground opacity-30" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No talents found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your search query or filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {paginatedUsers.map((user) => (
          <div
            key={user.id}
            className="bg-card border border-border rounded-sm p-4 hover:border-blue-500/30 transition-colors group flex flex-nowrap items-center gap-4 lg:gap-6"
          >
            <div className="flex items-center pr-2">
              <input 
                type="checkbox" 
                checked={selectedUsers.some(u => u.id === user.id)}
                onChange={() => toggleUserSelection(user)}
                className="w-4 h-4 rounded-sm border-border text-blue-500 focus:ring-blue-500/50 cursor-pointer appearance-none border-2 checked:bg-blue-500 checked:border-blue-500 transition-all flex items-center justify-center relative
                  after:content-[''] after:absolute after:opacity-0 checked:after:opacity-100 after:w-1.5 after:h-2.5 after:border-r-2 after:border-b-2 after:border-white after:rotate-45 after:-mt-0.5"
              />
            </div>
            {/* Profile Image & Basic Info */}
            <div className="flex items-center gap-4 flex-[1.5] min-w-0">
              <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/10">
                {user.profile?.profile_image_url ? (
                  <img src={user.profile.profile_image_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <UserIcon className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-bold text-foreground truncate group-hover:text-blue-600 transition-colors">
                  {user.first_name} {user.last_name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>

            {/* Role & Position */}
            <div className="flex-[2] flex flex-nowrap items-center gap-4 sm:gap-6 min-w-0">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Position</span>
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 truncate">
                  <Briefcase className="w-3.5 h-3.5 text-blue-500/70 shrink-0" />
                  <span className="truncate">{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'Member'}</span>
                </span>
              </div>
              <div className="flex flex-col gap-1 flex-[1.5] min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Headline</span>
                <span className="text-xs font-medium text-muted-foreground truncate line-clamp-1">
                  {user.profile?.headline || "Professional registered on the Startup Ecosystem"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 ml-auto pl-4 lg:pl-6 border-l border-border/50 justify-end">
              {pipelineMap[user.id] ? (
                <div className="relative group/btn flex">
                  <button
                    disabled
                    className="p-2 rounded-full text-blue-600 bg-blue-50 dark:bg-blue-900/20 cursor-default border border-transparent flex items-center justify-center"
                  >
                    <BookmarkCheck className="w-4 h-4" />
                  </button>
                  <span className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-semibold px-2.5 py-1 rounded-sm whitespace-nowrap pointer-events-none z-10 shadow-sm">
                    Saved in Pipeline
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-foreground"></div>
                  </span>
                </div>
              ) : (
                <div className="relative group/btn flex">
                  <button
                    onClick={() => saveToPipelineMutation.mutate(user.id)}
                    disabled={saveToPipelineMutation.isPending && saveToPipelineMutation.variables === user.id}
                    className="p-2 rounded-full text-muted-foreground hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 border border-transparent flex items-center justify-center"
                  >
                    {saveToPipelineMutation.isPending && saveToPipelineMutation.variables === user.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    ) : (
                      <BookmarkPlus className="w-4 h-4" />
                    )}
                  </button>
                  <span className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-semibold px-2.5 py-1 rounded-sm whitespace-nowrap pointer-events-none z-10 shadow-sm">
                    Save to Pipeline
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-foreground"></div>
                  </span>
                </div>
              )}
              <div className="relative group/btn flex">
                <button
                  onClick={() => { setSelectedUser(user); setSendEmail(true); }}
                  className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-transparent"
                >
                  <Mail className="w-4 h-4" />
                </button>
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-semibold px-2.5 py-1 rounded-sm whitespace-nowrap pointer-events-none z-10 shadow-sm">
                  Send Email
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-foreground"></div>
                </span>
              </div>
              <div className="relative group/btn flex">
                <button
                  onClick={() => { setSelectedUser(user); setSendEmail(false); }}
                  className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-transparent"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover/btn:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-semibold px-2.5 py-1 rounded-sm whitespace-nowrap pointer-events-none z-10 shadow-sm">
                  Send Message
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-foreground"></div>
                </span>
              </div>
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
                className="w-8 h-8 rounded-sm text-xs font-bold bg-blue-500 text-white shadow-md shadow-blue-500/20 disabled:opacity-50"
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
                      ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
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
  );
}
