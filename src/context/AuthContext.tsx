'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Attempt to silently refresh token on load
    const initAuth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/refresh`, {
          method: 'POST',
          credentials: 'include'
        });
        
        if (response.ok) {
          const { accessToken } = await response.json();
          (window as any).__accessToken = accessToken;
          await fetchUserProfile();
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to initialize auth', error);
        setIsLoading(false);
      }
    };

    // Listen for unauthorized events to clear state
    const handleUnauthorized = () => {
      setUser(null);
      router.push('/login');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    initAuth();

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [router]);

  const fetchUserProfile = async () => {
    try {
      // Assuming a /profile/me endpoint exists (we'll build it next)
      const data = await apiFetch('/profile/me');
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch user profile', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (accessToken: string) => {
    (window as any).__accessToken = accessToken;
    setIsLoading(true);
    await fetchUserProfile();
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      (window as any).__accessToken = null;
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
