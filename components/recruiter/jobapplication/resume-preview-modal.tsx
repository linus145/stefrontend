'use client';

import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Download, FileText, Loader2, User as UserIcon, AlertCircle } from 'lucide-react';
import { JobApplication } from '@/types/jobs.types';

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: JobApplication;
}

export function ResumePreviewModal({ isOpen, onClose, app }: ResumePreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset loading states when url or open status changes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [isOpen, app.resume_url]);

  if (!isOpen || !app.resume_url) return null;

  // Normalize preview URL for services like Google Drive
  const getEmbedUrl = (rawUrl: string) => {
    if (!rawUrl) return '';
    try {
      if (rawUrl.includes('drive.google.com/file/d/')) {
        return rawUrl.replace(/\/view(\?.*)?$/, '/preview');
      }
      return rawUrl;
    } catch {
      return rawUrl;
    }
  };

  const embedUrl = getEmbedUrl(app.resume_url);
  const applicantName = `${app.applicant?.first_name || ''} ${app.applicant?.last_name || ''}`.trim() || 'Candidate';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-modal-title"
    >
      <div
        className="bg-card border border-border w-full max-w-5xl h-[88vh] max-h-[920px] rounded-[4px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-[4px] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              {app.applicant?.profile_image_url ? (
                <img
                  src={app.applicant.profile_image_url}
                  alt={applicantName}
                  className="w-full h-full rounded-[4px] object-cover"
                />
              ) : (
                <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 id="resume-modal-title" className="text-sm font-bold text-foreground truncate">
                  {applicantName}'s Resume
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <FileText className="w-3 h-3" /> PDF / Document
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{app.applicant?.email}</p>
            </div>
          </div>

          {/* Action buttons & Close 'X' symbol */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={app.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/80 rounded-[4px] border border-border transition-colors shadow-sm"
              title="Open in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in Tab</span>
            </a>

            <a
              href={app.resume_url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/80 rounded-[4px] border border-border transition-colors shadow-sm"
              title="Download Resume"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>

            <div className="w-px h-5 bg-border mx-1" />

            {/* X Symbol Close Button */}
            <button
              onClick={onClose}
              data-agent="resume-modal-close"
              aria-label="Close Resume Preview"
              className="w-8 h-8 rounded-[4px] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 active:scale-95 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500/40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Content Body */}
        <div className="relative flex-1 w-full h-full bg-muted/10 overflow-hidden">
          {/* Loading Spinner Indicator */}
          {isLoading && !hasError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/90 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
              <p className="text-xs font-medium text-muted-foreground">Loading applicant resume preview...</p>
            </div>
          )}

          {/* Fallback if embedding is blocked or fails */}
          {hasError ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-background">
              <div className="w-14 h-14 rounded-[4px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h4 className="text-base font-semibold text-foreground mb-1">Resume Preview Unavailable Inline</h4>
              <p className="text-xs text-muted-foreground max-w-md mb-6 leading-relaxed">
                The document host restricts embedding inside frames or requires direct browser viewing.
              </p>
              <a
                href={app.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-[4px] shadow-sm transition-all"
              >
                <ExternalLink className="w-4 h-4" /> Open Resume Directly
              </a>
            </div>
          ) : (
            <iframe
              src={embedUrl}
              title={`${applicantName} Resume`}
              className="w-full h-full border-0 bg-white"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-border bg-card flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-2">
            <span>Applied for: <strong className="text-foreground">{app.job_title || 'Position'}</strong></span>
            {app.ai_score !== null && app.ai_score !== undefined && (
              <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">
                AI Fit Score: {app.ai_score}%
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1 text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground rounded-[4px] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
