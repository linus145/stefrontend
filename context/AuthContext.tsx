'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types/user.types';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Pages where we should NOT redirect to /login on auth failure
const PUBLIC_PATHS = ['/login', '/register', '/'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();
  const hasInitialized = useRef(false);

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile();
      setUser(response.data);
    } catch (error) {
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const resp = await authService.login(email, password);
      setUser(resp.data.user);

      toast.success('Successfully logged in.');
      router.push('/dashboard');
    } catch (error: any) {
      // Re-enabled toast for all errors as per user request
      toast.error('Login Failed', {
        description: error.response?.data?.detail || error.data?.detail || error.data?.message || error.message || 'Invalid credentials.'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (token: string) => {
    setIsLoading(true);
    try {
      const resp = await authService.googleLogin(token);
      setUser(resp.data.user);

      toast.success('Successfully logged in with Google.');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error('Google Login Failed', {
        description: error.response?.data?.detail || error.data?.detail || error.data?.message || error.message || 'Verification failed.'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout request failed natively', e);
    } finally {
      // Clear all state immediately
      setUser(null);
      // Wait for the state to settle before pushing
      setTimeout(() => {
        router.push('/login');
        setIsLoading(false);
        toast.info('Logged out securely.');
      }, 100);
    }
  };

  useEffect(() => {
    // Prevent double initialization in strict mode
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeAuth = async () => {
      try {
        const response = await userService.getProfile();
        setUser(response.data);
      } catch {
        // Profile failed (401). User is not authenticated.
        // Explicitly call logout to clear potentially invalid cookies
        await authService.logout().catch(() => {});
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, googleLogin, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
