'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getOrCreateGuestUser, type GuestUser } from '@/lib/guest-auth';
import { isGuestMode } from '@/lib/mvp-config';

interface GuestAuthContextType {
  user: GuestUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
}

const GuestAuthContext = createContext<GuestAuthContextType>({
  user: null,
  isLoaded: false,
  isSignedIn: false,
});

/**
 * Guest Auth Provider - MVP Test Mode
 *
 * Provides a simplified authentication context that mimics Clerk's API
 * but uses guest user stored in localStorage
 */
export function GuestAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GuestUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isGuestMode()) {
      setIsLoaded(true);
      return;
    }

    // Initialize guest user
    const guestUser = getOrCreateGuestUser();
    setUser(guestUser);
    setIsLoaded(true);
  }, []);

  return (
    <GuestAuthContext.Provider
      value={{
        user,
        isLoaded,
        isSignedIn: true, // MVP模式下始终视为已登录
      }}
    >
      {children}
    </GuestAuthContext.Provider>
  );
}

/**
 * Hook to access guest auth context
 * Mimics Clerk's useUser() API for compatibility
 */
export function useGuestAuth() {
  return useContext(GuestAuthContext);
}

/**
 * Compatibility hook that works like Clerk's useUser()
 * Can be used as a drop-in replacement
 */
export function useUser() {
  const context = useContext(GuestAuthContext);

  if (!isGuestMode()) {
    // In production mode, this would use real Clerk
    return {
      user: null,
      isLoaded: false,
      isSignedIn: false,
    };
  }

  return {
    user: context.user ? {
      id: context.user.id,
      emailAddresses: context.user.email ? [{ emailAddress: context.user.email }] : [],
      fullName: context.user.fullName,
      imageUrl: context.user.imageUrl,
      primaryEmailAddress: context.user.email ? { emailAddress: context.user.email } : null,
    } : null,
    isLoaded: context.isLoaded,
    isSignedIn: context.isSignedIn,
  };
}

/**
 * Dummy UserButton component for MVP mode
 * Shows guest user info instead of Clerk's UserButton
 */
export function GuestUserButton() {
  const { user } = useGuestAuth();

  if (!isGuestMode() || !user) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-vintage-100 dark:bg-vintage-900 border border-vintage-300 dark:border-vintage-700">
      <div className="w-8 h-8 rounded-full bg-vintage-500 flex items-center justify-center text-white font-semibold">
        {user.fullName?.[0] || 'G'}
      </div>
      <div className="hidden sm:block">
        <p className="text-sm font-medium text-vintage-900 dark:text-vintage-100">
          {user.fullName}
        </p>
        <p className="text-xs text-vintage-600 dark:text-vintage-400">
          游客模式
        </p>
      </div>
    </div>
  );
}
