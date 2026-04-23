'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

let googleInitialized = false;

export function GoogleLoginButton() {
  const { googleLogin } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    console.log('DEBUG: Google Client ID in Frontend:', clientId);
    
    if (!clientId || clientId.includes('your-google-client-id')) {
      console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined in .env.local');
      setIsInitializing(false);
      return;
    }

    const initializeGoogle = () => {
      if (typeof window !== 'undefined' && (window as any).google) {
        try {
          if (!googleInitialized) {
            (window as any).google.accounts.id.initialize({
              client_id: clientId,
              // This is where Google will POST the credential after login
              login_uri: `${process.env.NEXT_PUBLIC_API_URL}/auth/google-login/`,
              ux_mode: 'redirect', // Switch to redirect mode
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
        } catch (error) {
          console.error('Error initializing Google login:', error);
          setIsInitializing(false);
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
      return () => clearInterval(interval);
    }
  }, [googleLogin]);

  return (
    <div className="w-full transition-all duration-300">
      {isInitializing && (
        <div className="w-full h-[44px] animate-pulse bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      )}
      <div 
        id="google-login-button-container" 
        className={`w-full overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow ${isInitializing ? 'hidden' : 'block'}`}
      ></div>
    </div>
  );
}
