import React from 'react';
import { X, Mail, Globe, ExternalLink, Copy, Check, Link as LinkIcon } from 'lucide-react';
import { User } from '@/types/user.types';
import { toast } from 'sonner';

interface HeroContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  profileDisplayLink: string;
  profileUrl: string;
  websitesList: string[];
  linkedinUrl?: string;
}

export function HeroContactModal({
  isOpen,
  onClose,
  user,
  profileDisplayLink,
  profileUrl,
  websitesList,
  linkedinUrl
}: HeroContactModalProps) {
  const [copiedLink, setCopiedLink] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyProfileLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`https://${profileDisplayLink}`);
      setCopiedLink(true);
      toast.success('Profile link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-card border border-border rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            {user.first_name} {user.last_name}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
          <h3 className="text-sm font-semibold text-foreground tracking-tight">Contact Info</h3>

          {/* Profile Link (LinkedIn Style) */}
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-sm bg-muted/60 flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground border border-border/50">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground">Your Profile</p>
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#0a66c2] hover:underline break-all block mt-0.5 font-medium"
              >
                {profileDisplayLink}
              </a>
            </div>
            <button
              type="button"
              onClick={handleCopyProfileLink}
              title="Copy Link"
              className="p-1.5 rounded-[2px] border border-border hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer mt-0.5 shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Email */}
          {user.email && (
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-sm bg-muted/60 flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground border border-border/50">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground">Email</p>
                <a
                  href={`mailto:${user.email}`}
                  className="text-xs text-[#0a66c2] hover:underline break-all block mt-0.5 font-medium"
                >
                  {user.email}
                </a>
              </div>
            </div>
          )}

          {/* Websites (Only shown if filled by user) */}
          {websitesList.length > 0 && (
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-sm bg-muted/60 flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground border border-border/50">
                <Globe className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-xs font-semibold text-foreground">
                  {websitesList.length > 1 ? 'Websites' : 'Website'}
                </p>
                {websitesList.map((web, idx) => (
                  <a
                    key={idx}
                    href={web.startsWith('http') ? web : `https://${web}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#0a66c2] hover:underline break-all flex items-center gap-1 font-medium"
                  >
                    <span>{web}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* LinkedIn URL */}
          {linkedinUrl && (
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-sm bg-muted/60 flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground border border-border/50">
                <ExternalLink className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground">LinkedIn</p>
                <a
                  href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#0a66c2] hover:underline break-all flex items-center gap-1 mt-0.5 font-medium"
                >
                  <span>{linkedinUrl}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-muted/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-[2px] text-xs font-bold bg-[#0a66c2] text-white hover:bg-[#084e96] transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
