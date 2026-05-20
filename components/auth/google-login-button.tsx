'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

let googleInitialized = false;

export function GoogleLoginButton() {
  const { googleLogin } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    console.log('DEBUG: Google Client ID in Frontend:', clientId);
    
    // Safety check: if no valid Google client ID, go straight to a gorgeous fallback button
    if (!clientId || clientId.includes('your-google-client-id')) {
      console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined or is placeholder');
      setIsInitializing(false);
      setUseFallback(true);
      return;
    }

    // Set a maximum timeout of 1.5 seconds for the Google script to load,
    // otherwise gracefully degrade to the beautiful fallback button to prevent infinite spinners.
    const fallbackTimer = setTimeout(() => {
      setIsInitializing(false);
      setUseFallback(true);
    }, 1500);

    const initializeGoogle = () => {
      if (typeof window !== 'undefined' && (window as any).google) {
        try {
          clearTimeout(fallbackTimer);
          if (!googleInitialized) {
            (window as any).google.accounts.id.initialize({
              client_id: clientId,
              login_uri: `${process.env.NEXT_PUBLIC_API_URL}/auth/google-login/`,
              ux_mode: 'redirect',
              auto_select: false,
            });
            googleInitialized = true;
          }

          (window as any).google.accounts.id.renderButton(
            document.getElementById('google-login-button-container'),
            { 
              theme: 'outline', 
              size: 'large', 
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'center'
            }
          );
          
          setIsInitializing(false);
          setUseFallback(false);
        } catch (error) {
          console.error('Error initializing Google login:', error);
          setIsInitializing(false);
          setUseFallback(true);
        }
      }
    };

    // If script is already loaded
    if ((window as any).google) {
      initializeGoogle();
    } else {
      const interval = setInterval(() => {
        if ((window as any).google) {
          clearInterval(interval);
          initializeGoogle();
        }
      }, 100);
      return () => {
        clearInterval(interval);
        clearTimeout(fallbackTimer);
      };
    }
  }, [googleLogin]);

  const handleManualGoogleClick = () => {
    toast.info("Google Authentication is not configured in this demo workspace.");
  };

  return (
    <div className="w-full transition-all duration-300">
      {isInitializing ? (
        <div className="w-full h-[44px] animate-pulse bg-slate-50 dark:bg-[#151624] rounded-lg border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-[#5e3be1] rounded-full animate-spin"></div>
        </div>
      ) : useFallback ? (
        <button
          type="button"
          onClick={handleManualGoogleClick}
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
      ) : (
        <div 
          id="google-login-button-container" 
          className="w-full overflow-hidden rounded-lg border border-slate-200/80 dark:border-slate-800/80 h-[44px] flex items-center justify-center [&>div]:w-full [&_iframe]:w-full"
        ></div>
      )}
    </div>
  );
}
