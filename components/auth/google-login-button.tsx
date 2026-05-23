'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

let googleInitialized = false;

export function GoogleLoginButton() {
  const { googleLogin } = useAuth();
  const [isInitializing, setIsInitializing] = useState(false);

  const handleGoogleClick = () => {
    if (typeof window !== 'undefined' && (window as any).google) {
      try {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (clientId && !clientId.includes('your-google-client-id')) {
          if (!googleInitialized) {
            (window as any).google.accounts.id.initialize({
              client_id: clientId,
              callback: (response: any) => {
                if (response.credential) {
                  googleLogin(response.credential);
                }
              },
              auto_select: false,
            });
            googleInitialized = true;
          }
          (window as any).google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              toast.info("Google sign-in prompt opened. Please sign in via the Google popup overlay.");
            }
          });
          return;
        }
      } catch (err) {
        console.error('Google programmatic login error:', err);
      }
    }
    toast.info("Google Authentication is not fully configured for this local domain.");
  };

  return (
    <div className="w-full transition-all duration-300">
      <button
        type="button"
        onClick={handleGoogleClick}
        className="flex items-center justify-center gap-2.5 border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 h-[44px] rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#121320] transition-all duration-300 w-full cursor-pointer"
      >
        {/* High-fidelity Google G Vector */}
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 15.01.75 12 .75 7.37.75 3.39 3.41 1.48 7.31l3.86 3C6.27 7.58 8.87 5.04 12 5.04z" />
          <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.6-.2-2.38H12v4.51h6.44c-.28 1.46-1.1 2.69-2.34 3.52l3.63 2.82c2.13-1.97 3.76-4.87 3.76-8.47z" />
          <path fill="#FBBC05" d="M5.34 14.73A6.983 6.983 0 014.92 12c0-.96.16-1.88.42-2.73L1.48 6.27A11.95 11.95 0 000 12c0 2.06.52 4 1.48 5.73l3.86-3z" />
          <path fill="#34A853" d="M12 23.25c3.24 0 5.97-1.07 7.96-2.92l-3.63-2.82c-1.01.68-2.3 1.09-4.33 1.09-3.13 0-5.73-2.54-6.66-5.27l-3.86 3c1.91 3.9 5.89 6.56 10.52 6.56z" />
        </svg>
        <span>Google</span>
      </button>
    </div>
  );
}
